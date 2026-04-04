var express = require('express');
var router = express.Router();

//1. Import Handler ở utils
const { uploadImage } = require('../utils/uploadHandler');
//2. Tạo route Post/api/v1/upload/image
router.post('/image', uploadImage.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 400,
                message: "Chưa chọn file ảnh"
            });
        }
        const filename = req.file.filename;
        res.status(200).json({
            status: 200,
            message: "Upload thành công",
            imageUrl: `/uploads/${filename}`
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
});
module.exports = router;