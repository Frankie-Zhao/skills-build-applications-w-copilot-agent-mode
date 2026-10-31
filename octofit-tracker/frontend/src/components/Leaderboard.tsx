import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };

export default function Leaderboard() {
  return (
    <CapabilityCard<LeaderboardResponse>
      title="Leaderboard"
      description="Compare team point totals."
      path="/api/leaderboard"
      getData={getJson<LeaderboardResponse>}
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
