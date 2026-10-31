import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type Team = { _id?: string; name: string; mascot?: string; members: string[] };
type TeamResponse = { teams: Team[] };

export default function Teams() {
  return (
    <CapabilityCard<TeamResponse>
      title="Teams"
      description="Manage teams and members."
      path="/api/teams"
      getData={getJson<TeamResponse>}
      emptyMessage="No teams yet."
      isEmpty={({ teams }) => teams.length === 0}
      renderData={({ teams }) => (
        <ul>{teams.map((team, index) => (
          <li key={team._id ?? index}>{team.name}{team.mascot ? ` (${team.mascot})` : ''} — {team.members.length} members</li>
        ))}</ul>
      )}
    />
  );
}
