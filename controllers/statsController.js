import Loan from '../models/Loan.js';
import User from '../models/User.js';
import Book from '../models/Book.js';

export const getPopularBooks = async (req, res) => {
  try {
    const popularBooks = await Loan.aggregate([
      { $group: { _id: '$book_id', borrow_count: { $sum: 1 } } },
      { $sort: { borrow_count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'book',
        },
      },
      { $unwind: '$book' },
      {
        $project: {
          book_id: '$_id',
          title: '$book.title',
          author: '$book.author',
          borrow_count: 1,
        },
      },
    ]);
    res.json(popularBooks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getActiveUsers = async (req, res) => {
  try {
    const activeUsers = await Loan.aggregate([
      { $group: { _id: '$user_id', books_borrowed: { $sum: 1 } } },
      { $sort: { books_borrowed: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          user_id: '$_id',
          name: '$user.name',
          books_borrowed: 1,
        },
      },
    ]);
    res.json(activeUsers);
  } catch (error) {
    res.status(400).json({error: error.message});
  }
};

export const getOverviewStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalUsers = await User.countDocuments();
    const booksBorrowed = await Loan.countDocuments({ status: 'ACTIVE' });
    const overdueLoans = await Loan.countDocuments({
      status: 'ACTIVE',
      due_date: { $lt: new Date() },
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const loansToday = await Loan.countDocuments({
      issue_date: { $gte: today },
    });
    const returnsToday = await Loan.countDocuments({
      return_date: { $gte: today },
    });
    const booksAvailable = await Book.aggregate([
      { $group: { _id: null, total: { $sum: '$available_copies' } } },
    ]);

    res.json({
      total_books: totalBooks,
      total_users: totalUsers,
      books_available: booksAvailable[0]?.total || 0,
      books_borrowed: booksBorrowed,
      overdue_loans: overdueLoans,
      loans_today: loansToday,
      returns_today: returnsToday,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};