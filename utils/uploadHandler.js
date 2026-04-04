let multer = require('multer');
let path = require('path');

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        let ext = path.extname(file.originalname);
        let newFileName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
        cb(null, newFileName);
    }
});

// Lọc định dạng được phép upload
// Hình ảnh
let filterImage = function (req, file, cb) {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error("File không đúng định dạng ảnh (jpg, png, webp,...)"));
    }
};

// Excel, PDF, Word
let filterDocument = function (req, file, cb) {
    const allowedTypes = [
        // PDF
        'application/pdf',
        // Word
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        // Excel
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("File không đúng định dạng tài liệu (PDF, Word, Excel)"));
    }
};

module.exports = {
    // Avatar
    uploadImage: multer({
        storage: storage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: filterImage
    }),

    // Gửi tài liệu trong Chat
    uploadDocument: multer({
        storage: storage,
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: filterDocument
    }),
};
