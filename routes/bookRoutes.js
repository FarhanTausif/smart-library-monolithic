import express from 'express';
import {
  addBook,
  getBook,
  searchBooks,
  updateBook,
  deleteBook,
} from '../controllers/bookController.js';

const router = express.Router();

router.post('/', addBook);
router.get('/', searchBooks);
router.get('/:id', getBook);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);

export default router;