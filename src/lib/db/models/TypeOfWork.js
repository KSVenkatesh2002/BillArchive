import mongoose from 'mongoose';

const TypeOfWorkSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, lowercase: true }
});

export default mongoose.models.TypeOfWork || mongoose.model('TypeOfWork', TypeOfWorkSchema);
