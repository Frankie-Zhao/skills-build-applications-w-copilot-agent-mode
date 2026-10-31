import { Activity, Team, User, Workout } from '../models/index.js';
import mongoose from 'mongoose';

export async function listActivities() {
  return Activity.find().lean();
}

function clientError(message: string, status = 400) {
  return Object.assign(new Error(message), { status });
}

function requestObject(input: unknown): Record<string, unknown> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw clientError('Request body must be an object');
  }
  return input as Record<string, unknown>;
}

function requiredText(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw clientError(`${field} is required`);
  }
  return value.trim();
}

function requiredObjectId(value: unknown, field: string): string {
  if (typeof value !== 'string' || !mongoose.isValidObjectId(value)) {
    throw clientError(`${field} must be a valid ID`);
  }
  return value;
}

export async function createActivity(input: unknown) {
  const body = requestObject(input);
  const userId = requiredObjectId(body.userId, 'userId');
  const teamId = requiredObjectId(body.teamId, 'teamId');
  const type = requiredText(body.type, 'type');
  if (typeof body.minutes !== 'number' || !Number.isFinite(body.minutes) || body.minutes < 1) {
    throw clientError('minutes must be a positive number');
  }

  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user) throw clientError('User not found', 404);
  if (!team) throw clientError('Team not found', 404);

  return Activity.create({
    user: user._id,
    team: team._id,
    type,
    minutes: body.minutes,
    points: body.minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const body = requestObject(input);
  const name = requiredText(body.name, 'name');
  const mascot = requiredText(body.mascot, 'mascot');
  const membersInput = body.members ?? [];
  if (!Array.isArray(membersInput)) throw clientError('members must be an array');
  const members = [...new Set(membersInput.map((member) => requiredObjectId(member, 'member')))];
  if (members.length > 0) {
    const existingMembers = await User.countDocuments({ _id: { $in: members } });
    if (existingMembers !== members.length) throw clientError('All team members must be existing users');
  }
  return Team.create({ name, mascot, members });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().select('name').lean(),
    Activity.aggregate<{ _id: mongoose.Types.ObjectId; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map<string, number>();
  for (const total of totals) pointsByTeam.set(total._id.toString(), total.totalPoints);

  return teams
    .map((team) => ({
      teamName: team.name,
      totalPoints: pointsByTeam.get(team._id.toString()) ?? 0,
    }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

const activityFocus: Record<string, string> = {
  cycle: 'endurance',
  run: 'endurance',
  strength: 'strength',
  walk: 'endurance',
};

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) throw clientError('User not found', 404);

  const recentActivities = await Activity.find({ user: user._id })
    .sort({ occurredAt: -1 })
    .limit(10)
    .select('type')
    .lean();
  const recentTypes = [...new Set(recentActivities.map(({ type }) => type.toLowerCase()))];
  const goal = user.fitnessGoal.toLowerCase();
  const activityFocuses = [...new Set(recentTypes.map((type) => activityFocus[type] ?? type))];
  const workouts = await Workout.find().lean();

  return workouts
    .map((workout) => {
      const focus = workout.focus.toLowerCase();
      const matchesGoal = focus === goal;
      const matchingActivity = recentTypes.find((type, index) => focus === type || focus === activityFocus[type] || focus === activityFocuses[index]);
      const matchesActivity = matchingActivity !== undefined;
      const reason = matchesGoal
        ? `Recommended to support your ${user.fitnessGoal} fitness goal.`
        : matchesActivity
          ? `Recommended based on your recent ${matchingActivity} activity.`
          : `Recommended to complement your ${user.fitnessGoal} fitness goal.`;
      return { workout, reason, score: matchesGoal ? 0 : matchesActivity ? 1 : 2 };
    })
    .sort((left, right) => left.score - right.score || left.workout.title.localeCompare(right.workout.title))
    .map(({ workout, reason }) => ({ ...workout, reason }));
}

export { User };
