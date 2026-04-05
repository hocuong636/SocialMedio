# Hướng Dẫn Triển Khai Comment & Reaction

## 📋 Tổng Quan
- **Comment**: Bình luận trên bài viết với hỗ trợ nested comments (bình luận con)
- **Reaction**: Phản ứng cảm xúc (Like, Haha, Love, Wow, Sad, Angry)

---

## 🔧 PHẦN BACKEND

### 1. **Xây Dựng Routes Comment** 
**File**: `routes/comments.js`

Cần implement các API endpoints:
- ✅ `POST /comments` - Tạo bình luận
- ✅ `GET /comments/post/:postId` - Lấy danh sách bình luận của 1 bài
- ✅ `PATCH /comments/:id` - Cập nhật bình luận
- ✅ `DELETE /comments/:id` - Xóa bình luận
- ✅ `GET /comments/:id/replies` - Lấy bình luận con

### 2. **Xây Dựng Routes Reaction**
**File**: `routes/reactions.js`

Cần implement các API endpoints:
- ✅ `POST /reactions` - Thêm/cập nhật reaction
- ✅ `GET /reactions/post/:postId` - Lấy reactions của 1 bài viết
- ✅ `DELETE /reactions/:id` - Xóa reaction
- ✅ `GET /posts/:postId/reactions/summary` - Thống kê reactions

### 3. **Xây Dựng Controllers**
**File mới**: `controllers/comments.js`

Các hàm cần implement:
```javascript
- createComment(req, res)
- getCommentsByPost(req, res)
- updateComment(req, res)
- deleteComment(req, res)
- getReplies(req, res)
```

**File mới**: `controllers/reactions.js`

Các hàm cần implement:
```javascript
- addOrUpdateReaction(req, res)
- getReactionsByPost(req, res)
- deleteReaction(req, res)
- getReactionSummary(req, res)
```

### 4. **Xử Lý Validation**
**File**: `utils/validator.js` - Thêm các validate functions

```javascript
- validateCommentContent(content)
- validateReactionType(type)
```

---

## 🎨 PHẦN FRONTEND

### 1. **Tạo Services**

**File mới**: `frontend/src/services/commentService.ts`
```typescript
- getCommentsByPost(postId: string, page?: number)
- createComment(postId: string, content: string, parentCommentId?: string)
- updateComment(commentId: string, content: string)
- deleteComment(commentId: string)
- getReplies(commentId: string)
```

**File mới**: `frontend/src/services/reactionService.ts`
```typescript
- addOrUpdateReaction(postId: string, type: string)
- getReactionsByPost(postId: string)
- deleteReaction(postId: string)
- getReactionSummary(postId: string)
```

### 2. **Tạo Components**

**File mới**: `frontend/src/components/post/CommentSection.tsx`
- Hiển thị danh sách bình luận
- Phân trang comments
- Nested comments support

**File mới**: `frontend/src/components/post/CommentCard.tsx`
- Hiển thị một bình luận
- Hỗ trợ xóa/sửa bình luận của chính user
- Action: reply, load replies

**File mới**: `frontend/src/components/post/CommentComposer.tsx`
- Input để viết bình luận mới
- Support mention user (optional)
- Character counter (optional - max 500 ký tự)

**File mới**: `frontend/src/components/post/ReactionPicker.tsx`
- Dropdown hiển thị các loại reaction
- Icons cho mỗi type (Like, Haha, Love, Wow, Sad, Angry)
- Click để add/update reaction

**File nâng cấp**: `frontend/src/components/post/PostCard.tsx`
- Thay thế button like hiện tại bằng ReactionPicker
- Thêm CommentSection component
- Hiển thị reaction summary (e.g., "❤️ 234 người thích")

### 3. **Update Types**
**File**: `frontend/src/types/index.ts`

Thêm nếu chưa có:
```typescript
export interface CommentDetail extends Comment {
  repliesCount?: number
  replies?: CommentDetail[]
}

export interface ReactionSummary {
  like: number
  haha: number
  love: number
  wow: number
  sad: number
  angry: number
  userReaction?: string // type reaction của current user
}
```

---

## 🔄 FLOW DIAGRAM

### Comment Flow:
```
User viết comment 
  → CommentComposer validate
  → POST /comments (backend)
  → Comment schema save
  → Return comment data
  → Render CommentCard
  → Nếu là reply: parent comment update repliesCount
  → Notification gửi tới author bài viết
```

### Reaction Flow:
```
User click Reaction button
  → ReactionPicker hiển thị options
  → User chọn type (like, haha, etc.)
  → POST /reactions (backend)
  → Reaction schema:
    - Nếu user đã có reaction: UPDATE
    - Nếu chưa có: CREATE
  → Post.reactionsCount update
  → Render updated UI
  → Notification gửi tới author bài viết
```

---

## 📝 DATA FLOW & BUSINESS LOGIC

### Comment:
- ✅ Max 1 level nested comments (reply on comment, pero walang reply sa reply)
  **OR** Support multi-level (recursive)
- ✅ Soft delete - `isDeleted: true`
- ✅ Validate content length (1-500 characters)
- ✅ Auto-update post.commentsCount
- ✅ Can edit own comment (15 mins window optional)
- ✅ Show "Edited" badge if updated
- ✅ Sort: newest first (createdAt desc)

### Reaction:
- ✅ One user = One reaction per post (unique constraint)
- ✅ Change reaction: Update type (không cần delete + create)
- ✅ Remove reaction = DELETE
- ✅ Auto-update post.reactionsCount
- ✅ Show reaction summary on hover/click (e.g., "❤️ 234 haha 56")
- ✅ Show user's current reaction type with filled icon

---

## 🔐 Authorization & Security

### Comments:
- ✅ Only post owner hoặc comment author có thể delete
- ✅ Only comment author có thể edit
- ✅ Validate postId exists
- ✅ Validate parentCommentId exists (nếu có)

### Reactions:
- ✅ Only reaction owner có thể delete
- ✅ Validate postId exists
- ✅ Validate reaction type (enum check)
- ✅ Prevent duplicate reactions (unique index)

---

## 🧪 Testing Checklist

### Backend:
- [ ] Create comment with valid data
- [ ] Create nested comment (reply)
- [ ] Get comments by post (with pagination)
- [ ] Update own comment
- [ ] Delete own comment
- [ ] Cannot update/delete others' comments
- [ ] Add reaction
- [ ] Update reaction type
- [ ] Delete reaction
- [ ] One user one reaction per post (unique constraint)
- [ ] Post reactionsCount & commentsCount updated correctly
- [ ] Soft delete comments (isDeleted = true)

### Frontend:
- [ ] CommentComposer renders correctly
- [ ] Can submit comment
- [ ] Comment appears in list immediately
- [ ] Can reply to comment
- [ ] Nested comments display correctly
- [ ] Can edit/delete own comments
- [ ] ReactionPicker opens on click
- [ ] Can select reaction type
- [ ] Reaction icon updates (filled/unfilled)
- [ ] Reaction summary shows correct counts
- [ ] Can change reaction type
- [ ] Can remove reaction
- [ ] Comment & reaction count updates in real-time

---

## 📊 Implementation Order (Recommended)

1. ✅ Backend API - Comments (CRUD)
2. ✅ Backend API - Reactions (CRUD)
3. ✅ Frontend Services (commentService, reactionService)
4. ✅ Frontend Components (ReactionPicker, CommentComposer)
5. ✅ Frontend Components (CommentCard, CommentSection)
6. ✅ Integrated PostCard with Comment & Reaction
7. ✅ Testing & bug fixes
8. ✅ Notifications integration (optional)

---

## 🎯 IMPLEMENTATION DETAILS

### Key Points:
1. **Pagination**: Comments nên paginate (10-20 items per page)
2. **Real-time**: Nếu có WebSocket - broadcast comment/reaction updates
3. **Accessibility**: Icon + label, proper ARIA attributes
4. **Performance**: Lazy load nested comments
5. **UX**: Show loading state, error messages, success feedback

### Optional Features:
- Emoji reactions support
- Mention users in comments
- Comment threads collapse/expand
- Comment likes/useful votes
- Comment moderation (admin)
- Rich text editor (markdown)
