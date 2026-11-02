 
export interface NotificationItem {
  id: string;
  actorName: string;
  actorPhoto: string | null;
  text: string;
  createdAt: string;
  isRead: boolean;
}