import multer from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * File Upload Middleware (Multer)
 * Used for KYC document uploads (ID proof, address proof, shop photo)
 */

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'kyc');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage config: save files to disk with unique names
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `kyc-${uniqueSuffix}${ext}`);
    },
});

// File filter: allow only images and PDFs
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, PNG, and PDF files are allowed'));
    }
};

// Max 5MB per file, up to 3 files (id_proof, address_proof, shop_photo)
export const kycUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
    { name: 'id_proof', maxCount: 1 },
    { name: 'address_proof', maxCount: 1 },
    { name: 'shop_photo', maxCount: 1 },
]);

// Generic single file upload (for reviews, profile pics, etc.)
export const singleUpload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => {
            const dir = path.join(process.cwd(), 'uploads', 'general');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (_req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, `upload-${Date.now()}${ext}`);
        },
    }),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
}).single('file');
