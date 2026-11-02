export interface CommentItem {
  _id: string;
  content?: string;
  image?: string;
  commentCreator: { _id: string; name: string; username: string; photo: string };
  likes: string[];
  repliesCount: number;
  createdAt: string;
}
