import Book from '../models/Book.js';

export const addBook = async (req, res) => {
  try {
    const { title, author, isbn, copies } = req.body;
    const book = new Book({
      title,
      author,
      isbn,
      copies,
      available_copies: copies,
    });
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const searchBooks = async (req, res) => {
  try {
    const { search } = req.query;
    const books = await Book.find({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ],
    });
    res.json(books);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateBook = async (req, res) => {
  try {
    const { title, author, isbn, copies, available_copies } = req.body;
    // Ensure that the number of copies is not less than available copies
    if (copies !== undefined && available_copies !== undefined && copies < available_copies) {
      return res.status(400).json({ error: 'Total copies cannot be less than available copies.' });
    }
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author, isbn, copies, available_copies, updated_at: Date.now() },
      { new: true }
    );
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};