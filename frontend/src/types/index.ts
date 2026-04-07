// ─── Core Entity Types ────────────────────────────────────────────────────────

export interface Role {
  _id: string
  name: string
  description: string
}

export interface User {
  _id: string
  username: string
  email: string
  fullName: string
  bio: string
  avatarUrl: string
  coverUrl: string
  status: boolean
  role: Role
  loginCount: number
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  _id: string
  user: User
  phone: string
  dateOfBirth: string | null
  gender: 'male' | 'female' | 'other' | ''
  address: string
  website: string
  createdAt: string
  updatedAt: string
}

export interface Post {
  _id: string
  author: User
  content: string
  images: string[]
  visibility: 'public' | 'friends' | 'private'
  reactionsCount: number
  commentsCount: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface Comment {
  _id: string
  post: string
  author: User
  content: string
  parentComment: string | null
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface Reaction {
  _id: string
  user: User
  post: string
  type: 'like' | 'haha' | 'love' | 'wow' | 'sad' | 'angry'
  createdAt: string
}

export interface Follow {
  _id: string
  follower: User
  following: User
  createdAt: string
}

export interface Notification {
  _id: string
  recipient: string
  sender: User
  type: 'reaction' | 'comment' | 'follow' | 'message' | 'post' | 'report_resolved'
  content: string
  refModel: 'post' | 'comment' | 'user' | 'message' | null
  refId: string | null
  isRead: boolean
  createdAt: string
}

export interface Conversation {
  _id: string
  participants: User[]
  lastMessage: Message | null
  createdAt: string
  updatedAt: string
}

export interface Message {
  _id: string
  conversation: string
  from: User
  messageContent: {
    type: 'text' | 'image' | 'file'
    text: string
  }
  createdAt: string
}

export interface SavedPost {
  _id: string
  user: string
  post: Post
  createdAt: string
}

export interface ViewHistory {
  _id: string
  user: string
  post: Post
  createdAt: string
  updatedAt: string
}

export interface Report {
  _id: string
  reporter: User
  targetType: 'post' | 'comment' | 'user'
  targetId: string
  reason: string
  status: 'pending' | 'resolved' | 'rejected'
  createdAt: string
  updatedAt: string
}

// ─── API Response Shapes ──────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  total: number
}
