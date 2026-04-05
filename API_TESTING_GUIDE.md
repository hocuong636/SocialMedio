# Hướng dẫn Kiểm thử API Dự án Social Media bằng Postman

Tài liệu này cung cấp hướng dẫn chi tiết cách kiểm thử toàn bộ các API đã có trong hệ thống bằng công cụ **Postman**.

---

## 1. Chuẩn bị Môi trường

1. **Khởi động Cơ sở dữ liệu:**
   Đảm bảo MongoDB Replica Set đã hoạt động để cung cấp các tính năng như Tracsactions (vì route register đang dùng `session.startTransaction()`).
   Connection String mặc định của app: `mongodb://localhost:27017/SocialMedia?directConnection=true`

2. **Chạy Server:**
   Mở terminal tại thư mục gốc của dự án, cài đặt thư viện và chạy ứng dụng:
   ```bash
   npm install
   npm start
   ```
   *Mặc định, server sẽ chạy ở: `http://localhost:3000`*

3. **Cấu hình Base URL:**
   Tất cả các endpoint API trong hướng dẫn này sẽ bắt đầu với:
   **`http://localhost:3000/api/v1`**

---

## 2. Cách xác thực (Authentication) trong Postman

Hệ thống cung cấp cơ chế Check Login qua 2 phương thức: **Cookies** hoặc **Bearer Token**.

- **Cách dùng tiện nhất (Dùng Cookie của Postman):** 
  Khi bạn gọi API Login (`POST /api/v1/auth/login`) thành công, máy chủ sẽ trả về cookie có tên `TOKEN_SOCIAL_MEDIA`. Postman sẽ **tự động lưu cookie** này và đính kèm vào các yêu cầu tiếp theo (giống hệt cách trình duyệt hoạt động). Bạn không cần gán Header thủ công!
  
- **Cách thủ công (Bearer Token):** 
  Sau khi gọi API Login, response trả về chính là mã JWT. Bạn sao chép chuỗi này, chuyển tới API cần gọi, vào tab **Authorization**, chọn Type là **Bearer Token** và dán token vào.

---

## 3. Danh sách các API chi tiết

*Ghi chú: [Auth] là các API yêu cầu phải đăng nhập thành công từ trước.*

### 🛠️ Nhóm: Auth (`/auth`)

#### 1. Đăng ký tài khoản mới
- **Method:** `POST`
- **URL:** `/auth/register`
- **Body** (raw -> JSON):
  ```json
  {
      "username": "testuser",
      "password": "Password123@",
      "email": "test@gmail.com"
  }
  ```
  *(Lưu ý: Mật khẩu yêu cầu phải có ít nhất 8 ký tự, gồm 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt).*

#### 2. Đăng nhập
- **Method:** `POST`
- **URL:** `/auth/login`
- **Body** (raw -> JSON):
  ```json
  {
      "username": "testuser",
      "password": "Password123@"
  }
  ```

#### 3. Lấy thông tin user đăng nhập hiện tại [Auth]
- **Method:** `GET`
- **URL:** `/auth/me`

#### 4. Đổi mật khẩu [Auth]
- **Method:** `POST`
- **URL:** `/auth/changepassword`
- **Body** (raw -> JSON):
  ```json
  {
      "oldpassword": "Password123@",
      "newpassword": "NewPassword123@"
  }
  ```

#### 5. Đăng xuất [Auth]
- **Method:** `POST`
- **URL:** `/auth/logout`

---

### 👤 Nhóm: Users (`/users`)

#### 6. Lấy thông tin đầy đủ của bản thân (Profile) [Auth]
- **Method:** `GET`
- **URL:** `/users/profile`

#### 7. Lấy thông tin một User bất kỳ qua username [Auth]
- **Method:** `GET`
- **URL:** `/users/by-username/:username` *(thay `:username` bằng tên tài khoản, VD: `/users/by-username/testuser`)*

#### 8. Cập nhật thông tin User cơ bản (Tên, Tiểu sử) [Auth]
- **Method:** `PUT`
- **URL:** `/users/info`
- **Body** (raw -> JSON):
  ```json
  {
      "fullName": "Nguyen Van A",
      "bio": "Bio ngan gon cua toi"
  }
  ```

#### 9. Cập nhật thông tin Profile mở rộng [Auth]
- **Method:** `PUT`
- **URL:** `/users/profile`
- **Body** (raw -> JSON):
  ```json
  {
      "phone": "0123456789",
      "dateOfBirth": "1999-01-01",
      "gender": "male",
      "address": "Hà Nội",
      "website": "https://vidu.com"
  }
  ```
  *(Note: gender chỉ chấp nhận `male`, `female`, `other`, hoặc `""`)*

---

### 📝 Nhóm: Posts (`/posts`)

#### 10. Lấy danh sách bài viết (New Feed) [Auth]
- **Method:** `GET`
- **URL:** `/posts?page=1&limit=10`

#### 11. Tạo bài viết mới [Auth]
- **Method:** `POST`
- **URL:** `/posts`
- **Body** (raw -> JSON):
  ```json
  {
      "content": "Nội dung bài viết mới",
      "visibility": "public",
      "images": ["/uploads/image1.jpg", "/uploads/image2.jpg"]
  }
  ```
  *(visibility có thể nhận `public`, `friends`, `private`)*

#### 12. Lấy chi tiết một bài viết [Auth]
- **Method:** `GET`
- **URL:** `/posts/:id` *(thay `:id` bằng Object ID của bài viết)*
  
#### 13. Lấy toàn bộ bài viết của 1 User bất kỳ [Auth]
- **Method:** `GET`
- **URL:** `/posts/user/:userId?page=1&limit=10`

#### 14. Chỉnh sửa bài viết [Auth]
- **Method:** `PUT`
- **URL:** `/posts/:id`
- **Body** (raw -> JSON):
  ```json
  {
      "content": "Nội dung đã được thay đổi",
      "visibility": "friends"
  }
  ```

#### 15. Xóa bài viết (Soft delete) [Auth]
- **Method:** `DELETE`
- **URL:** `/posts/:id`

---

### 💾 Nhóm: Saved Posts (Lưu bài viết) (`/saved-posts`)

#### 16. Lấy danh sách bài đã lưu [Auth]
- **Method:** `GET`
- **URL:** `/saved-posts?page=1&limit=10`

#### 17. Lưu một bài viết [Auth]
- **Method:** `POST`
- **URL:** `/saved-posts`
- **Body** (raw -> JSON):
  ```json
  {
      "postId": "660c123abc456..." 
  }
  ```

#### 18. Hủy lưu bài viết [Auth]
- **Method:** `DELETE`
- **URL:** `/saved-posts/:postId`

---

### 👥 Nhóm: Theo dõi - Follows (`/follows`)

#### 19. Kiểm tra xem mình có đang follow User này không? [Auth]
- **Method:** `GET`
- **URL:** `/follows/check/:userId`

#### 20. Theo dõi (Follow) một User [Auth]
- **Method:** `POST`
- **URL:** `/follows/:userId`

#### 21. Bỏ theo dõi (Unfollow) một User [Auth]
- **Method:** `DELETE`
- **URL:** `/follows/:userId`

#### 22. Lấy người MÌNH đang theo dõi (Following) [Auth]
- **Method:** `GET`
- **URL:** `/follows/following`

#### 23. Lấy người ĐANG theo dõi MÌNH (Followers) [Auth]
- **Method:** `GET`
- **URL:** `/follows/followers`

#### 24. Lấy Following/Followers của một tài khoản BẤT KỲ [Auth]
- **Method:** `GET`
- **URL:** `/follows/:userId/following`
- **Method:** `GET`
- **URL:** `/follows/:userId/followers`

---

### 🖼️ Nhóm: Upload File (`/upload`)

*(Lưu ý bắt buộc: Ở Postman, với các API này trong phần **Body** bạn chọn **form-data** thay vì **raw**)*

#### 25. Upload Avatar (Ảnh Đại Diện) [Auth]
- **Method:** `POST`
- **URL:** `/upload/avatar`
- **Body** (form-data):
  - Key: `avatar` *(Chuyển type từ Text sang File)*
  - Value: *(Chọn file ảnh từ máy)*

#### 26. Upload Cover (Ảnh Bìa) [Auth]
- **Method:** `POST`
- **URL:** `/upload/cover`
- **Body** (form-data):
  - Key: `cover` *(Type: File)*
  - Value: *(Chọn file ảnh)*

#### 27. Upload Image cho Bài Viết [Auth]
- **Method:** `POST`
- **URL:** `/upload/image`
- **Body** (form-data):
  - Key: `image` *(Type: File)*
  - Value: *(Chọn file ảnh)*

*(Sau khi gọi API Upload của Bài Viết thành công, máy chủ trả về dạng `/uploads/hinhanh.jpg`. Bạn sử dụng URL này để đặt vào mảng `images` khi gọi API tạo `POST` trong mục Nhóm Posts).*

---

### 💬 Nhóm: Comments (`/comments`)

#### 28. Thêm bình luận mới [Auth]
- **Method:** `POST`
- **URL:** `/comments`
- **Body** (raw -> JSON):
  ```json
  {
      "post": "660c123abc456...",
      "content": "Bài viết hay quá!",
      "parentComment": null
  }
  ```
  *(Lưu ý: Nếu comment là dạng trả lời cho 1 comment khác, hãy truyền ID của comment cha vào trường `parentComment`)*

#### 29. Lấy danh sách bình luận của bài viết [Auth]
- **Method:** `GET`
- **URL:** `/comments/post/:postId?page=1&limit=10`

#### 30. Lấy danh sách câu trả lời của 1 bình luận (Replies) [Auth]
- **Method:** `GET`
- **URL:** `/comments/:commentId/replies?page=1&limit=5`

#### 31. Chỉnh sửa bình luận [Auth]
- **Method:** `PATCH`
- **URL:** `/comments/:commentId`
- **Body** (raw -> JSON):
  ```json
  {
      "content": "Nội dung bình luận đã thay đổi"
  }
  ```

#### 32. Xóa bình luận [Auth]
- **Method:** `DELETE`
- **URL:** `/comments/:commentId`

---

### ❤️ Nhóm: Reactions (Cảm xúc) (`/reactions`)

#### 33. Thả hoặc Đổi Cảm xúc cho bài viết [Auth]
- **Method:** `POST`
- **URL:** `/reactions`
- **Body** (raw -> JSON):
  ```json
  {
      "post": "660c123abc456...",
      "type": "like"
  }
  ```
  *(Lưu ý: Trường `type` chỉ nhận 1 trong 6 cảm xúc sau: `"like"`, `"haha"`, `"love"`, `"wow"`, `"sad"`, `"angry"`)*

#### 34. Lấy danh sách User đã thả cảm xúc vào xem chi tiết [Auth]
- **Method:** `GET`
- **URL:** `/reactions/post/:postId?page=1&limit=20`

#### 35. Xem Thống kê Cảm xúc của bài viết [Auth]
- **Method:** `GET`
- **URL:** `/reactions/:postId/summary`
- **Ví dụ mục đích:** Bạn sẽ nhận được tổng số lượng từng loại cảm xúc (có bao nhiêu like, bao nhiêu haha...) kèm theo cảm xúc hiện tại mà CHÍNH BẠN đang thả cho bài viết này.

#### 36. Xóa Cảm xúc (Bỏ Like/Haha/...) [Auth]
- **Method:** `DELETE`
- **URL:** `/reactions/:reactionId`
