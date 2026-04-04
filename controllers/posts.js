const postModel = require('../schemas/posts');
const reactionModel = require('../schemas/reactions');
const savedPostModel = require('../schemas/savedPosts');

module.exports = {
    // 1. Lấy danh sách bài viết (GET) có phân trang
    getPosts: async (req, res) => {
        try {
            // Lấy tham số page và limit từ Frontend (mặc định page 1, 20 bài)
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;

            // Tìm tất cả bài viết chưa bị xoá (isDeleted: false)
            const posts = await postModel.find({ isDeleted: false })
                .populate('author', 'username avatarUrl fullName') // Lấy thông tin user
                .sort({ createdAt: -1 }) // Bài mới đăng xếp lên đầu
                .skip(skip)
                .limit(limit);

            const userId = req.user._id;
            const postIds = posts.map(p => p._id);

            // Kiểm tra xem User này đã tim hoặc save bài nào trong list chưa
            const userReactions = await reactionModel.find({ user: userId, post: { $in: postIds } });
            const userSavedPosts = await savedPostModel.find({ user: userId, post: { $in: postIds } });

            const likedPostIds = userReactions.map(r => r.post.toString());
            const savedPostIds = userSavedPosts.map(s => s.post.toString());

            const postsWithFlags = posts.map(post => {
                const postObj = post.toObject();
                postObj.isLiked = likedPostIds.includes(postObj._id.toString());
                postObj.isSaved = savedPostIds.includes(postObj._id.toString());
                return postObj;
            });

            // Đếm tổng số lượng bài viết để Frontend làm nút "Load More"
            const totalPosts = await postModel.countDocuments({ isDeleted: false });

            res.status(200).json({
                success: true,
                count: postsWithFlags.length,
                total: totalPosts,
                page: page,
                totalPages: Math.ceil(totalPosts / limit),
                data: postsWithFlags
            });
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi Server: " + error.message });
        }
    },

    // 2. Tạo bài viết mới (POST)
    createPost: async (req, res) => {
        try {
            const { content, images, visibility } = req.body;
            
            // Lấy thẳng ID của người dùng đang đăng nhập từ Token, KHÔNG lấy từ Body để bảo mật!
            const author = req.user._id;

            if (!content) {
                return res.status(400).json({ success: false, message: 'Nội dung bài viết không được để trống' });
            }

            const newPost = new postModel({
                author: author,
                content: content,
                images: images || [], // Trong schema là mảng images
                visibility: visibility || "public"
            });

            const savedPost = await newPost.save();

            // Populate thông tin người đang đăng bài để trả về giao diện mượt mà
            await savedPost.populate('author', 'username avatarUrl fullName');

            res.status(201).json({
                success: true,
                message: 'Đăng bài viết thành công',
                data: savedPost
            });
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi Server: " + error.message });
        }
    },

    // 3. Lấy danh sách bài viết của 1 User cụ thể (GET)
    getUserPosts: async (req, res) => {
        try {
            const userId = req.params.userId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;

            const posts = await postModel.find({ author: userId, isDeleted: false })
                .populate('author', 'username avatarUrl fullName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const requesterId = req.user._id;
            const postIds = posts.map(p => p._id);

            const userReactions = await reactionModel.find({ user: requesterId, post: { $in: postIds } });
            const userSavedPosts = await savedPostModel.find({ user: requesterId, post: { $in: postIds } });

            const likedPostIds = userReactions.map(r => r.post.toString());
            const savedPostIds = userSavedPosts.map(s => s.post.toString());

            const postsWithFlags = posts.map(post => {
                const postObj = post.toObject();
                postObj.isLiked = likedPostIds.includes(postObj._id.toString());
                postObj.isSaved = savedPostIds.includes(postObj._id.toString());
                return postObj;
            });

            const totalPosts = await postModel.countDocuments({ author: userId, isDeleted: false });

            res.status(200).json({
                success: true,
                count: postsWithFlags.length,
                total: totalPosts,
                page: page,
                totalPages: Math.ceil(totalPosts / limit),
                data: postsWithFlags
            });
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi Server: " + error.message });
        }
    }
};
