import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type Activity = { _id?: string; type: string; minutes: number; points: number };
type ActivityResponse = { activities: Activity[] };

export default function Activities() {
  return (
    <CapabilityCard<ActivityResponse>
      title="Activities"
      description="Track student activity minutes and points."
      path="/api/activities"
      getData={getJson<ActivityResponse>}
      emptyMessage="No activities yet."
      isEmpty={({ activities }) => activities.length === 0}
      renderData={({ activities }) => (
        <ul>{activities.map((activity, index) => (
          <li key={activity._id ?? index}>{activity.type}: {activity.minutes} minutes, {activity.points} points</li>
        ))}</ul>
      )}
    />
  );
}
