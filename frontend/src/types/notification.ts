export type Notification = {
  id: string;
  title: string;
  message: string;
  type?: string;
  is_read?: boolean;
  unread?: boolean;
  data?: Record<string, unknown>;
  read_at?: string | null;
  created_at?: string;
};
