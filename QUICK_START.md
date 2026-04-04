# Quick Start & Tips

## 🚀 Implementation Quick Start

### Phase 1: Backend Setup (30 mins)
1. ✅ Routes defined (`routes/comments.js`, `routes/reactions.js`)
2. ✅ Controllers created (`controllers/comments.js`, `controllers/reactions.js`)
3. ✅ Validators added (`utils/validator.js`)
4. ✅ Mount routes in `app.js`:
   ```javascript
   const commentRoutes = require('./routes/comments');
   const reactionRoutes = require('./routes/reactions');
   app.use('/comments', commentRoutes);
   app.use('/reactions', reactionRoutes);
   ```

5. **Test with cURL or Postman:**
   ```bash
   # Create comment
   curl -X POST http://localhost:3000/comments \
     -H "Content-Type: application/json" \
     -d '{"post":"xxx","content":"Test"}'
   ```

### Phase 2: Frontend Setup (1-2 hours)
1. ✅ Services created (`services/commentService.ts`, `services/reactionService.ts`)
2. ✅ Components created (ReactionPicker, CommentComposer, CommentCard, CommentSection)
3. ✅ Integrate into `components/post/PostCard.tsx`

### Phase 3: Testing & Polish (1 hour)
1. Test all CRUD operations
2. Test edge cases (unauthorized deletes, duplicate reactions, etc.)
3. Styling adjustments
4. Performance optimization

---

## 🎨 UI Component Hierarchy

```
PostCard
├── Post Header
├── Post Content
├── Post Images
└── Post Actions
    ├── ReactionPicker
    │   └── Dropdown Menu (6 reactions)
    ├── Message Button (Comment Count)
    └── Bookmark Button
    
    [Below] CommentSection (Expandable)
    ├── Comment Composer
    └── Comments List
        ├── CommentCard
        │   ├── Author Info
        │   ├── Comment Text (+ Edit mode)
        │   ├── Timestamps
        │   ├── Actions (Edit, Delete, Reply)
        │   └── Reply Composer (nested mode)
        └── Reply CommentCard
            └── (nested level 1)
```

---

## 🔑 Key Implementation Points

### 1. ReactionPicker
- **State**: `userReaction`, `showPicker`, `loading`
- **Behavior**: 
  - Click emoji to add/update/remove reaction
  - Only 1 reaction per user per post
  - Show filled icon if user already reacted
  - Dropdown auto-closes after selection

### 2. CommentComposer
- **Features**:
  - Character limit: 500
  - Visual feedback: character counter + progress bar
  - Disabled submit when empty or exceeds limit
  - Trim whitespace automatically
  - Support top-level and nested comments

### 3. CommentCard
- **Features**:
  - Show author, timestamp, content
  - Edit button (only for author) - inline editing
  - Delete button (author or post owner)
  - Reply button - shows nested composer
  - Show reply count with "load more" functionality
  - Nested level styling (indentation/border)

### 4. CommentSection
- **Features**:
  - Pagination: 10 comments per page
  - Load nested replies on demand
  - Real-time updates after create/update/delete
  - Expandable/collapsible replies
  - Empty state message

---

## 🛡️ Security Best Practices

### Backend
- ✅ **Auth check**: All routes require `authHandler` middleware
- ✅ **Authorization**: 
  - Only comment author can edit/delete own comments
  - Post owner can delete any comment on their post
  - Only reaction owner can delete their reaction
- ✅ **Input validation**: All inputs validated in controllers
- ✅ **Unique constraint**: User can have only 1 reaction per post (DB index)
- ✅ **Soft delete**: Comments not permanently deleted, just marked as deleted

### Frontend
- ✅ **Optimistic updates**: Show changes immediately
- ✅ **Error handling**: Show error messages to user
- ✅ **Loading states**: Disable buttons during API calls
- ✅ **CSRF protection**: Cookies automatically sent with API calls

---

## 🐛 Common Issues & Solutions

### Issue: Comment not appearing after submit
**Solution**: 
- Check if API returns success=true
- Check if component updates state correctly after API call
- Check browser console for errors

### Issue: Reaction not toggling off
**Solution**:
- Verify API returns null when same reaction type clicked
- Check if frontend properly handles null response

### Issue: Cannot delete comment (403 error)
**Solution**:
- Verify userId in session
- Check if trying to delete someone else's comment (only author or post owner can)
- Verify authHandler is working

### Issue: Multiple reactions showing on same post
**Solution**:
- Check DB unique index: `db.reactions.getIndexes()`
- Create if needed: `db.reactions.createIndex({ "user": 1, "post": 1 }, { unique: true })`

### Issue: Slow loading when many comments
**Solution**:
- Implement pagination (already done - 10 per page)
- Lazy load replies on demand (already done)
- Add database indexes: `db.comments.createIndex({ "post": 1, "isDeleted": 1 })`

---

## 📈 Performance Tips

1. **Database Indexes:**
   ```javascript
   // Add these indexes for better query performance
   db.comments.createIndex({ "post": 1, "isDeleted": 1, "createdAt": -1 })
   db.comments.createIndex({ "parentComment": 1 })
   db.reactions.createIndex({ "post": 1 })
   db.reactions.createIndex({ "user": 1, "post": 1 }, { unique: true })
   ```

2. **API Optimization:**
   - Only populate author info (don't populate entire user object)
   - Use pagination (10-20 items per page)
   - Lazy load nested replies on demand
   - Cache reaction summaries (optional - use Redis)

3. **Frontend Optimization:**
   - Use React.memo for CommentCard if rendering many comments
   - Debounce character counter
   - Virtual scrolling for very long comment lists (optional)

---

## 🧩 Component Props & Interface

### ReactionPicker
```typescript
interface ReactionPickerProps {
  postId: string
  onReactionChange?: (reaction: Reaction | null) => void
  userReaction?: string | null // 'like' | 'haha' | 'love' | 'wow' | 'sad' | 'angry'
  isLoading?: boolean
}
```

### CommentComposer
```typescript
interface CommentComposerProps {
  postId: string
  currentUser?: User
  parentCommentId?: string // For replies
  parentCommentAuthor?: string
  onCommentCreated?: (comment: Comment) => void
  onCancel?: () => void
  isReply?: boolean
}
```

### CommentCard
```typescript
interface CommentCardProps {
  comment: Comment
  postId: string
  currentUser?: User
  onCommentDeleted?: (commentId: string) => void
  onCommentUpdated?: (comment: Comment) => void
  onReplyAdded?: (reply: Comment) => void
  repliesCount?: number
  onLoadReplies?: () => void
  level?: number // 0 for top-level, 1+ for nested
}
```

### CommentSection
```typescript
interface CommentSectionProps {
  postId: string
  currentUser?: User
  commentsCount?: number
}
```

---

## 📝 Styling Guidelines

### Colors
- Primary action: `text-blue-500`, `bg-blue-500`
- Hover state: `hover:bg-gray-100`
- Danger: `text-red-600`, `bg-red-50`
- Disabled: `bg-gray-300`, `text-gray-500`

### Spacing
- Card padding: `p-4`
- Avatar margin: `gap-3`
- Nested indentation: `ml-8`
- Section padding: `py-3`

### Typography
- Headers: `font-bold text-sm text-gray-900`
- Secondary: `text-xs text-gray-500`
- User name: `font-semibold text-sm`

---

## 🎯 Next Steps After Implementation

1. ✅ Add real-time updates with WebSocket (for live comments/reactions)
2. ✅ Add notifications when someone comments/reacts on your post
3. ✅ Add comment moderation/report feature
4. ✅ Add @mentions support in comments
5. ✅ Add "who reacted" modal showing list of users
6. ✅ Add rich text editor for comments (markdown, emoji)
7. ✅ Add comment sorting options (newest, oldest, top)
8. ✅ Add comment search/filter
9. ✅ Add user badges/roles display in comments
10. ✅ Add reactions counter with hover breakdown

---

## 🔗 File Reference

| File | Purpose |
|------|---------|
| `routes/comments.js` | Comment API routes |
| `routes/reactions.js` | Reaction API routes |
| `controllers/comments.js` | Comment business logic |
| `controllers/reactions.js` | Reaction business logic |
| `utils/validator.js` | Input validation |
| `services/commentService.ts` | Frontend comment API client |
| `services/reactionService.ts` | Frontend reaction API client |
| `components/post/ReactionPicker.tsx` | Reaction selector component |
| `components/post/CommentComposer.tsx` | Comment input component |
| `components/post/CommentCard.tsx` | Single comment display |
| `components/post/CommentSection.tsx` | Comments list container |
| `components/post/PostCard.tsx` | Updated to use above |

---

## 💡 Pro Tips

1. **Test deletion carefully**: Remember comments use soft delete (isDeleted=true), not hard delete
2. **Unique reactions**: The DB enforces that a user can only have 1 reaction per post
3. **Pagination**: Default 10 comments/page, 5 replies/page - adjust based on your needs
4. **Error handling**: Always wrap API calls in try-catch and show user-friendly messages
5. **Optimistic updates**: Show comment immediately, then sync with server
6. **Loading states**: Always disable buttons during loading to prevent duplicate submissions
7. **Character limit**: Comments capped at 500 characters to prevent spam
8. **Timestamps**: Use the `timeAgo()` helper for relative timestamps (5m ago, etc.)
9. **Authorization**: Double-check on backend that users can only delete/edit their own content
10. **Performance**: Consider caching reaction summaries for popular posts

---

## 📞 Troubleshooting Help

If you get stuck, check:
1. Browser console for JavaScript errors
2. Network tab to see API responses
3. Server logs for backend errors
4. Database collections to verify data is being saved
5. Middleware - ensure authHandler is applied to all routes
6. Session - confirm user is logged in (authHandler requires req.session.userId)

```javascript
// Quick debug: Add this to see request/session info
router.use((req, res, next) => {
  console.log('User ID:', req.session?.userId);
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  next();
});
```
