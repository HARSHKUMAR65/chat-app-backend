import multer from "multer";
import fs from "fs";

const blogFolder = './public/images';
if (!fs.existsSync(blogFolder)) {
    fs.mkdirSync(blogFolder, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, blogFolder); 
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname;
        req.imageName = uniqueName; 
        cb(null, uniqueName);
    },
});

export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
});
