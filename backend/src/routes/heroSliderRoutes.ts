import express from 'express';
import { authenticateToken as auth, authorizeRoles } from '../middleware/auth';
import { UserRole } from '../models/User';
import { uploadHeroSliderImage } from '../utils/fileUpload';
import {
  createHeroSlider,
  deleteHeroSlider,
  getAllHeroSliders,
  getPublicHeroSliders,
  updateHeroSlider,
} from '../controllers/heroSliderController';

const router = express.Router();

router.get('/public', getPublicHeroSliders);
router.get('/', auth, authorizeRoles(UserRole.ADMIN), getAllHeroSliders);
router.post('/', auth, authorizeRoles(UserRole.ADMIN), uploadHeroSliderImage.single('image'), createHeroSlider);
router.put('/:heroSliderId', auth, authorizeRoles(UserRole.ADMIN), uploadHeroSliderImage.single('image'), updateHeroSlider);
router.delete('/:heroSliderId', auth, authorizeRoles(UserRole.ADMIN), deleteHeroSlider);

export default router;
