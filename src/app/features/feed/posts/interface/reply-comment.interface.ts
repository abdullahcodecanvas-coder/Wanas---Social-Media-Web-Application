export interface ReplyComment {
  _id: string;
  content: string;
  image: string;
  commentCreator: {
    _id: string;
    name: string;
    username: string;
    photo: string;
  };
  post: string;
  parentComment: string | null;
  likes: any[];
  createdAt: string;
  repliesCount: number;
}