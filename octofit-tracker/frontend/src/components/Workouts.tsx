import { CapabilityCard } from './CapabilityCard.js';

type Workout = { _id?: string; title: string; focus?: string; minutes?: number; difficulty?: string; reason?: string };
type WorkoutResponse = { suggestions: Workout[] };

export default function Workouts() {
  return (
    <CapabilityCard<WorkoutResponse>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      path="/api/workouts/suggestions/mona%40example.com"
      emptyMessage="No workout suggestions yet."
      isEmpty={({ suggestions }) => suggestions.length === 0}
      renderData={({ suggestions }) => (
        <ul>{suggestions.map((workout, index) => (
          <li key={workout._id ?? index}>
            <strong>{workout.title}</strong>
            {workout.focus ? ` — ${workout.focus}` : ''}
            {workout.minutes !== undefined ? `, ${workout.minutes} minutes` : ''}
            {workout.difficulty ? ` (${workout.difficulty})` : ''}
            {workout.reason ? <p>{workout.reason}</p> : null}
          </li>
        ))}</ul>
      )}
    />
  );
}
