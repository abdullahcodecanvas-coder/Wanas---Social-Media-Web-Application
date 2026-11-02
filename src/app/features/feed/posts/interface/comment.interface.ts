
interface Comment {
  _id: string;
  content: string;
  image: string;
  commentCreator: CommentCreator;
  post: string;
  parentComment: null;
  likes: any[];
  createdAt: string;
  repliesCount: number;
}

interface CommentCreator {
  _id: string;
  name: string;
  username: string;
  photo: string;
}