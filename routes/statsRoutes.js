import express from 'express';
import {
  getPopularBooks,
  getActiveUsers,
  getOverviewStats,
} from '../controllers/statsController.js';

const router = express.Router();

router.get('/books/popular', getPopularBooks);
router.get('/users/active', getActiveUsers);
router.get('/overview', getOverviewStats);

export default router;