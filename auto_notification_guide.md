# Hướng dẫn Xây dựng Hệ thống Auto-Notification (Cập nhật theo thực tế)

Dựa trên cấu trúc Backend hiện tại của dự án của bạn (sử dụng Express, Mongoose, file `bin/www`, và các Schema đã tồn tại), dưới đây là các bước **CHÍNH XÁC** bạn cần làm tiếp theo để tính năng tự động thông báo hoạt động bằng Mongoose Middleware.

---

## BƯỚC 1: Cấu hình Socket.io ở Backend (`bin/www`)

Hiện tại file `bin/www` của bạn đã khởi tạo `socket.io` nhưng chưa cấu hình phòng (room) và biến toàn cục cho các Mongoose Models gọi tới. Hãy mở `bin/www` và sửa lại đoạn Socket.io như sau:

```javascript
/**
 * Socket.IO setup
 */
var { Server } = require('socket.io');
var io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 1. Lưu io vào global để các file Mongoose Schema có thể gọi được!
global.io = io; 
app.set('io', io); // Giữ cái này cho các controller đang dùng

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // 2. Chờ frontend bắn lên id của user đăng nhập để cho vào đúng "phòng"
  socket.on('join_own_room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});
```

---

## BƯỚC 2: Thêm Trigger tự động vào schema Reaction (`schemas/reactions.js`)

Mỗi khi có người *"react"* bài viết, ta sẽ sinh ra Notification. Mở file `schemas/reactions.js`, thêm logic Hook `post('save')` trước dòng `module.exports`:

```javascript
// Thêm import này ở đầu file, ngay dưới require("mongoose")
const Notification = require("./notifications");
const Post = require("./posts");

// ... (phần định nghĩa schema giữ nguyên)

// Thêm logic tự động gửi thông báo:
reactionSchema.post('save', async function (doc, next) {
  try {
    // 1. Tìm lấy bài viết để biết ai là tác giả bài viết
    const post = await Post.findById(doc.post);
    
    // 2. Không tự thông báo nếu tự react bài của chính mình
    if (post && post.author.toString() !== doc.user.toString()) {
      
      const newNotif = await Notification.create({
        recipient: post.author,
        sender: doc.user,
        type: 'reaction',
        content: `Ai đó vừa react bài viết của bạn.`, // Bạn có thể lấy user name để cho vào chuỗi này
        refModel: 'post',
        refId: doc.post
      });

      // 3. Đang có io global thì bắn sự kiện thẳng về phía frontend của tác giả
      if (global.io) {
        global.io.to(post.author.toString()).emit('new_notification', newNotif);
      }
    }
    next();
  } catch (error) {
    console.error("Lỗi khi tự tạo thông báo reaction:", error);
    next(error);
  }
});

module.exports = mongoose.model("reaction", reactionSchema);
```

---

## BƯỚC 3: Thêm Trigger tương tự vào schema Comment (`schemas/comments.js`)

Thêm đoạn Hook này vào trước dòng `module.exports` trong file `schemas/comments.js`:

```javascript
const Notification = require("./notifications");
const Post = require("./posts");

// ... (phần schema giữ nguyên)

commentSchema.post('save', async function (doc, next) {
  try {
    const post = await Post.findById(doc.post);
    
    // Nếu không phải tự comment bài mình
    if (post && post.author.toString() !== doc.author.toString()) {
      const newNotif = await Notification.create({
        recipient: post.author,
        sender: doc.author,
        type: 'comment',
        content: 'Ai đó vừa bình luận bài viết của bạn.',
        refModel: 'comment',
        refId: doc._id
      });

      if (global.io) {
        global.io.to(post.author.toString()).emit('new_notification', newNotif);
      }
    }
    next();
  } catch (error) {
    console.error("Lỗi khi tạo thông báo comment:", error);
    next(error);
  }
});

module.exports = mongoose.model("comment", commentSchema);
```

---

## BƯỚC 4: Thêm Trigger cho chức năng Follow (`schemas/follows.js`)

Thêm Hook này vào trước dòng `module.exports` trong file `schemas/follows.js`:

```javascript
const Notification = require("./notifications");

// ... (phần schema giữ nguyên)

followSchema.post('save', async function (doc, next) {
  try {
    const newNotif = await Notification.create({
      recipient: doc.following,
      sender: doc.follower,
      type: 'follow',
      content: 'Một người dùng vừa theo dõi bạn.',
      refModel: 'user',
      refId: doc.follower
    });

    if (global.io) {
      global.io.to(doc.following.toString()).emit('new_notification', newNotif);
    }
    next();
  } catch (error) {
    console.error("Lỗi khi tạo thông báo follow:", error);
    next(error);
  }
});

module.exports = mongoose.model("follow", followSchema);
```

---

## BƯỚC 5: Tạo Notification Controller để dùng cho API lấy danh sách

Để hiển thị thông báo ra trang web hoặc khi vừa tải lại trang, bạn làm 1 file controller tên là `controllers/notifications.js` với API Lấy danh sách (GET) và API Đánh dấu Đã đọc (PATCH).

```javascript
// file: controllers/notifications.js
const Notification = require("../schemas/notifications");

module.exports = {
  // 1. Lấy danh sách thông báo của user (Dùng kèm token Auth)
  getAllNotifications: async (req, res) => {
    try {
      // Giả sử req.user._id là mã user được bóc ra từ JWT token
      const userId = req.user._id; 
      
      const notifications = await Notification.find({ recipient: userId })
        .populate('sender', 'username avatarUrl') // Kéo luôn Hình đại diện & tên của thằng Sender
        .sort({ createdAt: -1 }) // Thằng nào mới nhất cho lên đầu!
        .limit(20);
        
      res.status(200).json({ success: true, count: notifications.length, data: notifications });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 2. Chuyển Notification sang trạng thái "Đã Xem"
  markAsRead: async (req, res) => {
    try {
      const notifId = req.params.id; // Lấy ID của thông báo trên thanh URL
      const notif = await Notification.findByIdAndUpdate(
        notifId, 
        { isRead: true },
        { new: true }
      );
      res.status(200).json({ success: true, data: notif });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
```

Nhớ dẫn đường cho controller này trong file `routes/notifications.js` và `app.js` nha.

---

## BƯỚC 6: Xử lý thao tác Click chuột (Frontend React)

Rất hên là bạn đã lưu 2 biến `refModel` và `refId` vào Notifications (vừa có Loại, vừa có ID).
Trên Frontend React, sử dụng `useNavigate` cực kỳ dễ:

```tsx
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function NotificationItem({ notif }) {
  const navigate = useNavigate();

  const handleNotificationClick = async () => {
    // 1. Gọi API đánh dấu "đã đọc" để tắt màu xanh hoặc đốm đỏ ở chuông
    await axios.patch(`/api/v1/notifications/${notif._id}/read`);
    
    // 2. Luân chuyển tự động dựa trên từ khóa `refModel`
    switch (notif.refModel) {
      case "post":
        // vd: Mở thẳng bài viết đó
        navigate(`/post/${notif.refId}`);
        break;

      case "user":
        // vd: Mở trang cá nhân user vừa Follow mình (refId lúc này là ID của họ)
        navigate(`/profile/${notif.refId}`);
        break;

      case "message":
        // vd: Vút sang box Messenger
        navigate(`/messages/${notif.refId}`); 
        break;

      case "comment":
         // Có thể sang trực tiếp bài Post của comment đó
         navigate(`/post/${notif.refId}`);
         break;
         
      default:
        console.log("Không có đường dẫn rõ ràng.");
        break;
    }
  };

  return (
    <div 
      onClick={handleNotificationClick} 
      className={`p-4 cursor-pointer hover:bg-gray-100 ${notif.isRead ? '' : 'bg-blue-50 font-bold'}`}
    >
      {/* Bởi vì ở backend mình đã populate('sender'), nên chấm đc luôn lấy Avatar */}
      <img src={notif.sender.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full" />
      <div>
         <p>{notif.content}</p>
         <small className="text-gray-400">Vừa xong</small>
      </div>
    </div>
  );
}
```

## TỔNG KẾT

Bạn nhận thấy ưu điểm không? Chúng ta **không cần phải đụng vào file Controller API tạo bài hay tạo Comment** nào cả. 
Với kiến trúc `Mongoose post('save')`, cứ hễ có tính năng nào gọi `.save()` nó sẽ ngay lập tức tự sinh Notification và đẩy sự kiện xuống Frontend bằng biến `global.io`!

Bạn có thể chỉnh sửa lại file `auto_notification_guide.md` để tham khảo khi đang code trên máy tính.
