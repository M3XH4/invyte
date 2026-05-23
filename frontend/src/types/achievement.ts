export type Achievement = {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  unlocked: boolean;
  colors: [string, string];
  iconName: 'trophy' | 'star' | 'zap' | 'target' | 'crown' | 'award' | 'calendar' | 'users';
};
