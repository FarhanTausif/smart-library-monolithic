import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true, unique: true },
  copies: { type: Number, required: true, min: 1 },
  available_copies: { type: Number, required: true, min: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

bookSchema.pre('save',  function (next)  {
  this.updated_at = Date.now();
  next();
});

export default mongoose.model('Book', bookSchema);