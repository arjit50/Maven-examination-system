const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});


const checkFileType = (file, cb) => {
    const filetypes = /pdf|doc|docx|mp4|m4v/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Only PDFs, Docs, and Videos are allowed!');
    }
};


const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, 
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
});

module.exports = upload;

