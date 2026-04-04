var express = require('express');
var router = express.Router();

//1. Import Model Post
const postModel = require('../schemas/posts');
//2. Định nghĩa Route tạo bài viết mới
route.post('/',async (req,res)=> {
    try{
        const{author,content,image,visibility} = req.body;
        if (!author || !content){
            return res.status(400).json({massge:'Thiếu thông tin người hoặc nội dung'});  
        } 
const newPost = new postModel({
    author,
    content,
    image,
    visibility
});
const savedPost = await newPost.save();
res.status(201).json({
    massage:'Đăng bài viết thành công',
    data: SavedPost
});
}catch (error){
    res.status(500).json({messgae:"Lỗi server:" + error.message});
}
});
module.exports = router;