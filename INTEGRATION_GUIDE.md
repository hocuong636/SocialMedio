# Hướng Dẫn Tích Hợp Comment & Reaction vào PostCard

## 📍 Integrate vào PostCard.tsx

### Bước 1: Import Components & Services

```typescript
// Thêm vào imports
import { useState, useEffect } from 'react'
import ReactionPicker from './ReactionPicker'
import CommentSection from './CommentSection'
import { reactionService } from '../../services/reactionService'
import type { Comment, User } from '../../types'
```

### Bước 2: Update Component Props

```typescript
interface PostCardProps {
  post: Post
  onDelete?: (id: string) => void
  currentUser?: User  // Thêm dòng này
  currentUserId?: string
}
```

### Bước 3: Thay Thế Like Button (dòng ~100-120)

**Bây giờ:**
```typescript
const handleLike = () => {
  setLiked((v) => !v)
  setLikeCount((c) => (liked ? c - 1 : c + 1))
}

<button
  onClick={handleLike}
  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
    liked
      ? 'text-red-500 bg-red-50'
      : 'text-gray-500 hover:bg-gray-50 hover:text-red-400'
  }`}
>
  <Heart size={17} fill={liked ? 'currentColor' : 'none'} />
  <span>{likeCount}</span>
</button>
```

**Thay bằng:**
```typescript
const [reactionSummary, setReactionSummary] = useState({
  like: 0,
  haha: 0,
  love: 0,
  wow: 0,
  sad: 0,
  angry: 0,
  userReaction: null,
})
const [loadingSummary, setLoadingSummary] = useState(false)

// Load reaction summary khi mount
useEffect(() => {
  loadReactionSummary()
}, [post._id])

const loadReactionSummary = async () => {
  try {
    setLoadingSummary(true)
    const response = await reactionService.getReactionSummary(post._id)
    if (response.success) {
      setReactionSummary(response.data)
    }
  } catch (error) {
    console.error('Error loading reactions:', error)
  } finally {
    setLoadingSummary(false)
  }
}

const handleReactionChange = (reaction) => {
  // Update the summary with new reaction
  loadReactionSummary()
}

// UI code:
<div className="flex items-center gap-2 px-3 py-2 text-sm">
  {/* Reaction Picker */}
  <ReactionPicker
    postId={post._id}
    userReaction={reactionSummary.userReaction}
    onReactionChange={handleReactionChange}
    isLoading={loadingSummary}
  />

  {/* Total reactions (hover to see summary) */}
  <span className="text-gray-600 font-semibold">
    {/* Sum all reactions */}
    {Object.entries(reactionSummary).reduce(
      (sum, [key, val]) => sum + (typeof val === 'number' ? val : 0),
      0,
    )}
  </span>
</div>
```

### Bước 4: Update Comment Button Area (dòng ~130-140)

**Bây giờ:**
```typescript
<button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
  <MessageCircle size={17} />
  <span>{post.commentsCount}</span>
</button>
```

**Thay bằng:**
```typescript
// Có thể làm interactive sau
<button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
  <MessageCircle size={17} />
  <span>{post.commentsCount}</span>
</button>
```

### Bước 5: Thêm Comment Section

**Ở cuối PostCard component, trước closing tags, thêm:**

```typescript
{/* Comment Section Modal hoặc Expandable */}
{/* Option 1: Show comment section directly */}
<CommentSection
  postId={post._id}
  currentUser={currentUser}
  commentsCount={post.commentsCount}
/>

{/* Option 2: Hidden by default, expandable trên click comment button */}
const [showComments, setShowComments] = useState(false)

{showComments && (
  <CommentSection
    postId={post._id}
    currentUser={currentUser}
    commentsCount={post.commentsCount}
  />
)}
```

---

## 🎨 Full Updated PostCard Example Structure

```typescript
export default function PostCard({ 
  post, 
  onDelete, 
  currentUser,  // ← New
  currentUserId 
}: PostCardProps) {
  // ─── Existing state ───
  const [showMenu, setShowMenu] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  
  // ─── Reaction state ───
  const [reactionSummary, setReactionSummary] = useState({...})
  const [loadingSummary, setLoadingSummary] = useState(false)
  
  // ─── Comment state ───
  const [showComments, setShowComments] = useState(false)
  
  // ─── Effects ───
  useEffect(() => {
    loadReactionSummary()
  }, [post._id])
  
  // ─── Handlers ───
  const loadReactionSummary = async () => {...}
  const handleReactionChange = () => {...}
  
  return (
    <>
      <article className="...">
        {/* Header */}
        {/* Content */}
        {/* Images */}
        
        {/* ─── UPDATED Actions ─── */}
        <div className="flex items-center gap-1 px-3 py-2 border-t border-gray-50">
          <ReactionPicker {...props} />
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className="..."
          >
            <MessageCircle />
            <span>{post.commentsCount}</span>
          </button>
          
          <SaveButton />
        </div>
        
        {/* ─── NEW: Comment Section ─── */}
        {showComments && (
          <div className="px-4 pt-4 border-t border-gray-100">
            <CommentSection {...props} />
          </div>
        )}
      </article>
      
      {/* Delete Modal */}
    </>
  )
}
```

---

## 🔗 API Routes File (app.js)

Đảm bảo đã mount routes:

```javascript
// routes
const commentRoutes = require('./routes/comments');
const reactionRoutes = require('./routes/reactions');

// Mount routes
app.use('/comments', commentRoutes);
app.use('/reactions', reactionRoutes);
```

---

## ✅ Testing Checklist

### Frontend:
- [ ] ReactionPicker renders and opens on click
- [ ] Can select different reaction types
- [ ] Icon fills when reaction selected
- [ ] Can change reaction type
- [ ] Can remove reaction (click same type)
- [ ] CommentComposer shows when focused
- [ ] Can type comment
- [ ] Character counter works
- [ ] Submit button disabled when empty
- [ ] Comment appears after submit
- [ ] Can edit own comment
- [ ] Can delete own comment
- [ ] Can reply to comment
- [ ] Replies show nested/indented
- [ ] CommentSection pagination works
- [ ] Load more replies button works

### Backend:
- [ ] POST /comments - create works
- [ ] GET /comments/post/:id - list works with pagination
- [ ] PATCH /comments/:id - update own comment works
- [ ] DELETE /comments/:id - soft delete works
- [ ] GET /comments/:id/replies - get replies
- [ ] POST /reactions - add reaction works
- [ ] POST /reactions - update reaction works
- [ ] DELETE /reactions/:id - remove reaction works
- [ ] GET /reactions/:postId/summary - stats work
- [ ] post.commentsCount updates correctly
- [ ] post.reactionsCount updates correctly
- [ ] Unique constraint (1 user, 1 reaction per post)

---

## 🚀 Deployment Notes

1. **Database**: Ensure MongoDB indexes are created
   ```bash
   # Run manually if needed
   db.reactions.createIndex({ "user": 1, "post": 1 }, { unique: true })
   ```

2. **Environment**: No new env vars needed

3. **Authentication**: Ensure authHandler middleware is working

4. **CORS**: If frontend & backend separate, enable CORS for new routes

---

## 📝 Optional Enhancements

1. **Emoji Reactions**: Expand beyond predefined set
2. **@Mentions**: Tag users in comments
3. **Rich Editor**: Support markdown/formatting
4. **Image Upload**: Attach images to comments
5. **Reactions Modal**: Show who reacted (like Facebook)
6. **Comment Threading**: More than 2 levels
7. **Real-time**: WebSocket updates
8. **Notifications**: When someone comments/reacts on your post
9. **Report/Flag**: Block spam comments
10. **Comment Approval**: Moderator review before posting
