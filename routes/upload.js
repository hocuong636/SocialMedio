var express = require('express');
var router = express.Router();
let userModel = require('../schemas/users');
let { CheckLogin } = require('../utils/authHandler');
let { uploadImage } = require('../utils/uploadHandler');

// Upload avatar
router.post('/avatar', CheckLogin, uploadImage.single('avatar'), async function (req, res, next) {
    try {
        if (!req.file) {
            return res.status(400).send({ message: "Vui long chon file anh" });
        }
        let avatarUrl = `/uploads/${req.file.filename}`;
        let user = await userModel.findByIdAndUpdate(
            req.user._id,
            { avatarUrl: avatarUrl },
            { new: true }
        ).select('-password -forgotPasswordToken -forgotPasswordTokenExp -loginCount -lockTime')
         .populate('role');

        res.status(200).send(user);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Upload cover
router.post('/cover', CheckLogin, uploadImage.single('cover'), async function (req, res, next) {
    try {
        if (!req.file) {
            return res.status(400).send({ message: "Vui long chon file anh" });
        }
        let coverUrl = `/uploads/${req.file.filename}`;
        let user = await userModel.findByIdAndUpdate(
            req.user._id,
            { coverUrl: coverUrl },
            { new: true }
        ).select('-password -forgotPasswordToken -forgotPasswordTokenExp -loginCount -lockTime')
         .populate('role');

        res.status(200).send(user);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

//1. Import Handler ở untils
const  {uploadImage} = require('.../untils/uploadHandler');
//2. Tạo route Post/api/v1/upload/image
router.post('/image',uploadImage.single('image'),(req, res)=>{
    try{
        if (!req.file){
            return res.status(400).json({ status:400,massage:"Chưa chọn file ảnh"
    });
}
 const filename = req.file.filename;
 res.status(200).json({
    status:200,
    massage:"Upload thành công",
    imageUrl:`/uploads/${filename}`
 });
}catch(error){
    res.status(500).json({status:500,massage: error.massage});
}
});
module.exports = router;