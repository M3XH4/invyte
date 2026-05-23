import type { ProfileStats } from '@/api/profileApi';
import type { Achievement } from '@/types/achievement';

const percentValue = (value?: string) => Number(String(value ?? '0').replace('%', '')) || 0;

export function buildAchievements(stats?: ProfileStats | null): Achievement[] {
  const eventsHosted = stats?.events_hosted ?? 0;
  const guestsInvited = stats?.guests_invited ?? 0;
  const upcomingEvents = stats?.upcoming_events ?? 0;
  const attendanceRate = percentValue(stats?.attendance_rate);

  return [
    {
      id: 'first-event',
      iconName: 'calendar',
      title: 'First Launch',
      description: 'Create your first event',
      progress: Math.min(eventsHosted, 1),
      target: 1,
      unlocked: eventsHosted >= 1,
      colors: ['#60a5fa', '#2563eb'],
    },
    {
      id: 'event-master',
      iconName: 'trophy',
      title: 'Event Master',
      description: 'Create 10 events',
      progress: Math.min(eventsHosted, 10),
      target: 10,
      unlocked: eventsHosted >= 10,
      colors: ['#facc15', '#f97316'],
    },
    {
      id: 'people-magnet',
      iconName: 'users',
      title: 'People Magnet',
      description: 'Invite 100 guests',
      progress: Math.min(guestsInvited, 100),
      target: 100,
      unlocked: guestsInvited >= 100,
      colors: ['#f472b6', '#e11d48'],
    },
    {
      id: 'high-energy-host',
      iconName: 'zap',
      title: 'High Energy Host',
      description: 'Reach a 90% attendance rate',
      progress: Math.min(attendanceRate, 90),
      target: 90,
      unlocked: attendanceRate >= 90,
      colors: ['#f87171', '#f97316'],
    },
    {
      id: 'busy-planner',
      iconName: 'target',
      title: 'Busy Planner',
      description: 'Have 3 upcoming events',
      progress: Math.min(upcomingEvents, 3),
      target: 3,
      unlocked: upcomingEvents >= 3,
      colors: ['#4ade80', '#16a34a'],
    },
    {
      id: 'community-builder',
      iconName: 'crown',
      title: 'Community Builder',
      description: 'Invite 500 total guests',
      progress: Math.min(guestsInvited, 500),
      target: 500,
      unlocked: guestsInvited >= 500,
      colors: ['#c084fc', '#ec4899'],
    },
  ];
}
