var express = require('express');
var router = express.Router();

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