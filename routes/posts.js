var express = require('express');
var router = express.Router();
let { CheckLogin } = require('../utils/authHandler'); 
const postController = require('../controllers/posts');

// 1. Lấy danh sách Feed bảng tin bài viết
router.get('/', CheckLogin, postController.getPosts);

// 2. Lấy danh sách bài viết của 1 người
router.get('/user/:userId', CheckLogin, postController.getUserPosts);

// 3. Tạo bài viết
router.post('/', CheckLogin, postController.createPost);

module.exports = router;