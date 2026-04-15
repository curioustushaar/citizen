import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getUsers, createUser, updateUser, deleteUser, getMe, updateProfile } from '../controllers/userController';
import { verifyAuth, requireRole } from '../middleware/auth';

const router = Router();

// Multer Storage for Avatars
const avatarsDir = path.join(process.cwd(), 'uploads', 'avatars');
if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarsDir),
  filename: (req: any, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user.userId}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.use(verifyAuth);

// All regular users
router.get('/me', getMe);
router.patch('/profile', updateProfile);

router.post('/avatar', upload.single('avatar'), async (req: any, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    res.json({ success: true, avatarUrl });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin only
router.use(requireRole('SUPER_ADMIN'));

router.get('/', getUsers);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
