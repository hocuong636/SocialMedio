# API Reference: Comments & Reactions

## 📌 Base URL
```
http://localhost:3000
```

---

## 💬 COMMENTS API

### 1. Create Comment
**POST** `/comments`

**Request:**
```json
{
  "post": "66abc123def456ghi789jkl0",
  "content": "Great post!",
  "parentComment": null
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bình luận được tạo thành công",
  "data": {
    "_id": "66abc456def789ghi012jkl3",
    "post": "66abc123def456ghi789jkl0",
    "author": {
      "_id": "66abc789def012ghi345jkl6",
      "username": "john_doe",
      "fullName": "John Doe",
      "avatarUrl": "..."
    },
    "content": "Great post!",
    "parentComment": null,
    "isDeleted": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 2. Get Comments by Post
**GET** `/comments/post/:postId?page=1&limit=10`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "66abc456def789ghi012jkl3",
      "post": "66abc123def456ghi789jkl0",
      "author": {...},
      "content": "Great post!",
      "parentComment": null,
      "isDeleted": false,
      "repliesCount": 2,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

### 3. Get Replies (Nested Comments)
**GET** `/comments/:commentId/replies?page=1&limit=5`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "66abc789def012ghi345jkl6",
      "post": "66abc123def456ghi789jkl0",
      "author": {...},
      "content": "I agree!",
      "parentComment": "66abc456def789ghi012jkl3",
      "isDeleted": false,
      "createdAt": "2024-01-15T11:00:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 2,
    "pages": 1
  }
}
```

---

### 4. Update Comment
**PATCH** `/comments/:commentId`

**Request:**
```json
{
  "content": "Great post! (Updated)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bình luận được cập nhật thành công",
  "data": {
    "_id": "66abc456def789ghi012jkl3",
    "content": "Great post! (Updated)",
    ...
  }
}
```

---

### 5. Delete Comment
**DELETE** `/comments/:commentId`

**Response:**
```json
{
  "success": true,
  "message": "Bình luận được xóa thành công"
}
```

---

## 😀 REACTIONS API

### 1. Add or Update Reaction
**POST** `/reactions`

**Request:**
```json
{
  "post": "66abc123def456ghi789jkl0",
  "type": "like"
}
```

**Type Options:**
- `like`
- `haha`
- `love`
- `wow`
- `sad`
- `angry`

**Response (Create):**
```json
{
  "success": true,
  "message": "Reaction được tạo thành công",
  "data": {
    "_id": "66abc789def012ghi345jkl6",
    "user": {
      "_id": "66abc789def012ghi345jkl6",
      "username": "john_doe",
      "fullName": "John Doe",
      "avatarUrl": "..."
    },
    "post": "66abc123def456ghi789jkl0",
    "type": "like",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response (Delete - if same type clicked):**
```json
{
  "success": true,
  "message": "Reaction được gỡ bỏ thành công",
  "data": null
}
```

---

### 2. Get Reactions by Post
**GET** `/reactions/post/:postId?page=1&limit=20`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "66abc789def012ghi345jkl6",
      "user": {...},
      "post": "66abc123def456ghi789jkl0",
      "type": "like",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

### 3. Get Reaction Summary
**GET** `/reactions/:postId/summary`

**Response:**
```json
{
  "success": true,
  "data": {
    "like": 45,
    "haha": 12,
    "love": 23,
    "wow": 5,
    "sad": 2,
    "angry": 1,
    "userReaction": "like"
  }
}
```

---

### 4. Delete Reaction
**DELETE** `/reactions/:reactionId`

**Response:**
```json
{
  "success": true,
  "message": "Reaction được xóa thành công"
}
```

---

## 🔐 Authentication

All endpoints require authentication header:
```
Cookie: connect.sid=<session_id>
```

Or if using JWT:
```
Authorization: Bearer <token>
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Post ID và comment content là bắt buộc"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Bài viết không tồn tại"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Bạn không có quyền cập nhật bình luận này"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Lỗi server khi tạo bình luận",
  "error": "..."
}
```

---

## 🧪 cURL Examples

### Create Comment
```bash
curl -X POST http://localhost:3000/comments \
  -H "Content-Type: application/json" \
  -d '{
    "post": "66abc123def456ghi789jkl0",
    "content": "Great post!"
  }' \
  -b "connect.sid=<session_id>"
```

### Get Comments
```bash
curl http://localhost:3000/comments/post/66abc123def456ghi789jkl0?page=1&limit=10 \
  -b "connect.sid=<session_id>"
```

### Add Reaction
```bash
curl -X POST http://localhost:3000/reactions \
  -H "Content-Type: application/json" \
  -d '{
    "post": "66abc123def456ghi789jkl0",
    "type": "like"
  }' \
  -b "connect.sid=<session_id>"
```

### Get Reaction Summary
```bash
curl http://localhost:3000/reactions/66abc123def456ghi789jkl0/summary \
  -b "connect.sid=<session_id>"
```

---

## 📊 Summary

| Operation | Method | Endpoint | Auth Required |
|-----------|--------|----------|----------------|
| Create comment | POST | `/comments` | ✅ |
| Get comments | GET | `/comments/post/:postId` | ✅ |
| Get replies | GET | `/comments/:commentId/replies` | ✅ |
| Update comment | PATCH | `/comments/:commentId` | ✅ |
| Delete comment | DELETE | `/comments/:commentId` | ✅ |
| Add/Update reaction | POST | `/reactions` | ✅ |
| Get reactions | GET | `/reactions/post/:postId` | ✅ |
| Get summary | GET | `/reactions/:postId/summary` | ✅ |
| Delete reaction | DELETE | `/reactions/:reactionId` | ✅ |
