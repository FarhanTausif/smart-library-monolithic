import mongoose from 'mongoose';

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI).then(
    () => console.log("MongoDB connected")).catch((e) => console.log("Error Connecting MongoDB!", e));
};

export default connectDB;