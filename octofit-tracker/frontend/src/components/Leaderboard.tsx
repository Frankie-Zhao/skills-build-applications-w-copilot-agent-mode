import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };

export default function Leaderboard() {
  return (
    <CapabilityCard<LeaderboardResponse>
      title="Leaderboard"
      description="Compare team point totals."
      path="/api/leaderboard"
      emptyMessage="No leaderboard rankings yet."
      isEmpty={({ leaderboard }) => leaderboard.length === 0}
      renderData={({ leaderboard }) => (
        <ol>{leaderboard.map((entry) => (
          <li key={entry.rank}>{entry.teamName}: {entry.totalPoints} points</li>
        ))}</ol>
      )}
    />
  );
}
