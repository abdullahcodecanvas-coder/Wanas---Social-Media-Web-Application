
interface GetAllPost {
  _id: string;
  image: string;
  privacy: string;
  user: User;
  likes: any[];
  createdAt: string;
  commentsCount: number;
  topComment: null;
  sharesCount: number;
  likesCount: number;
  isShare: boolean;
  id: string;
  bookmarked: boolean;
  body:string;
   isLiked?: boolean;



  sharedPost?: {
    _id: string;
    body?: string;
    image?: string;
    privacy: string;
    createdAt: string;
    user: {
      _id: string;
      name: string;
      username: string;
      photo?: string;
    };
  } | null;
}

interface User {
  _id: string;
  name: string;
  username: string;
  photo: string;
}