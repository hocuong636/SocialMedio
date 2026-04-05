var express = require('express');
var router = express.Router();

//1. Import Model Post
const postModel = require('../schemas/posts');
//2. Định nghĩa Route tạo bài viết mới
router.post('/',async (req,res)=> {
    try{
        const { author, content, image, visibility } = req.body;
        if (!author || !content){
            return res.status(400).json({message:'Thiếu thông tin người hoặc nội dung'});  
        } 
        const newPost = new postModel({
            author,
            content,
            image,
            visibility
        });
        const savedPost = await newPost.save();
        res.status(201).json({
            message: 'Đăng bài viết thành công',
            data: savedPost
        });
    } catch (error){
        res.status(500).json({message: "Lỗi server: " + error.message});
    }
});
module.exports = router;