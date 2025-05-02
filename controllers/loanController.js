import Loan from '../models/Loan.js';
import Book from '../models/Book.js';
import moment from 'moment';

export const issueBook = async (req, res) => {
  try {
    const { user_id, book_id, due_date } = req.body;
    const book = await Book.findById(book_id);
    if (!book || book.available_copies < 1) {
      return res.status(400).json({ error: `Book with id ${book_id} not available` });
    }
    const loan = new Loan({
      user_id,
      book_id,
      due_date,
    });
    book.available_copies -= 1;
    await book.save();
    await loan.save();
    res.status(201).json(loan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const returnBook = async (req, res) => {
  try {
    const { loan_id } = req.body;
    const loan = await Loan.findById(loan_id);
    if (!loan || loan.status === 'RETURNED') {
      return res.status(400).json({ error: 'Invalid loan or already returned' });
    }
    loan.status = 'RETURNED';
    loan.return_date = Date.now();
    const book = await Book.findById(loan.book_id);
    book.available_copies += 1;
    await book.save();
    await loan.save();
    res.json(loan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getUserLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ user_id: req.params.user_id })
      .populate('book_id', 'title author');
    // res.json(loans);

    // Transform the Mongoose documents into the desired format
    const transformedLoans = loans.map(loan => {
      // Mongoose documents have a .toObject() method to get a plain JS object
      const loanObject = loan.toObject();

      return {
        // Rename _id to id (will be the ObjectId string)
        id: loanObject._id,

        // Create the nested 'book' object
        book: loanObject.book_id ? { // Check if book_id was populated successfully
          // Rename the populated book's _id to id (will be the ObjectId string)
          id: loanObject.book_id._id,
          title: loanObject.book_id.title,
          author: loanObject.book_id.author // Include the author field
        } : null, // Handle cases where book_id might not be populated

        // Include and format date fields to ISO 8601 strings
        // .toISOString() is a standard JavaScript Date method
        issue_date: loanObject.issue_date ? loanObject.issue_date.toISOString() : null,
        due_date: loanObject.due_date ? loanObject.due_date.toISOString() : null,
        // Include return_date if it exists in your Loan schema
        return_date: loanObject.return_date ? loanObject.return_date.toISOString() : null,

        // Include the status field
        status: loanObject.status,

        // Fields like user_id, extensions_count, __v are excluded by not including them here
      };
    });

    res.json(transformedLoans); // Send the transformed array

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getOverdueLoans = async (req, res) => {
  try {
    // Find loans that are active and whose due_date is in the past
    const loans = await Loan.find({
      status: 'ACTIVE',
      due_date: { $lt: new Date() }, // $lt means "less than"
    })
      // Populate the 'user_id' field, selecting only 'name' and 'email'
      // Mongoose will replace user_id with the user document
      .populate('user_id', 'name email')
      // Populate the 'book_id' field, selecting only 'title' and 'author'
      // Mongoose will replace book_id with the book document
      .populate('book_id', 'title author');

    // Map the retrieved loan documents to the desired response format
    const overdueLoans = loans.map((loan) => {
      // Calculate the number of days overdue
      const daysOverdue = moment().diff(moment(loan.due_date), 'days');

      // Construct the response object for each loan
      return {
        id: loan._id, // Use the document's _id as the loan ID
        user: {
          id: loan.user_id ? loan.user_id._id : null, // Use the populated user document's _id
          name: loan.user_id ? loan.user_id.name : null, // Use the populated user document's name
          email: loan.user_id ? loan.user_id.email : null, // Use the populated user document's email
        },
        book: {
          id: loan.book_id ? loan.book_id._id : null, // Use the populated book document's _id
          title: loan.book_id ? loan.book_id.title : null, // Use the populated book document's title
          author: loan.book_id ? loan.book_id.author : null, // Use the populated book document's author
        },
        issue_date: loan.issue_date ? loan.issue_date.toISOString() : null, // Format issue_date as ISO string
        due_date: loan.due_date ? loan.due_date.toISOString() : null, // Format due_date as ISO string
        days_overdue: daysOverdue, // Include the calculated days overdue
      };
    });

    // Send the formatted list of overdue loans as a JSON response
    res.json(overdueLoans);

  } catch (error) {
    // Handle any errors that occur during the process
    console.error('Error fetching overdue loans:', error); // Log the error for debugging
    res.status(500).json({ error: error.message }); // Return a 500 status for server errors
  }
};

export const extendLoan = async (req, res) => {
  try {
    const { extension_days } = req.body;

    // Validate extension_days is a positive number
    if (typeof extension_days !== 'number' || extension_days <= 0) {
        return res.status(400).json({ error: 'Invalid extension_days provided.' });
    }

    // Find the loan by ID
    const loan = await Loan.findById(req.params.id); // Populate if needed for user_id/book_id, though the schema likely stores IDs directly

    // Check if the loan exists or is already returned
    if (!loan || loan.status === 'RETURNED') {
      return res.status(400).json({ error: 'Invalid loan or already returned' });
    }

    // Check if the maximum number of extensions has been reached
    if (loan.extensions_count >= 3) {
      return res.status(400).json({ error: 'Maximum extensions reached' });
    }

    // Store the original due date before modification
    const original_due_date = loan.due_date;

    // Calculate the new due date by adding extension_days
    loan.due_date = moment(loan.due_date).add(extension_days, 'days').toDate();

    // Increment the extensions count
    loan.extensions_count += 1;

    // Save the updated loan document
    await loan.save();

    // Construct the response object in the desired format
    const response = {
      id: loan._id, // Use Mongoose's _id for the document ID
      user_id: loan.user_id, // Assuming user_id is stored directly on the loan
      book_id: loan.book_id, // Assuming book_id is stored directly on the loan
      issue_date: loan.issue_date.toISOString(), // Convert Date object to ISO string
      original_due_date: original_due_date.toISOString(), // Convert Date object to ISO string
      extended_due_date: loan.due_date.toISOString(), // Convert Date object to ISO string
      status: loan.status, // Get the current status (should be 'ACTIVE')
      extensions_count: loan.extensions_count, // Get the updated extensions count
    };

    // Send the formatted JSON response
    res.json(response);

  } catch (error) {
    // Handle any errors that occur during the process
    console.error('Error extending loan:', error); // Log the error for debugging
    res.status(500).json({ error: error.message }); // Return a 500 status for server errors
  }
};