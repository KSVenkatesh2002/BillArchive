import mongoose from 'mongoose';

const SourceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, lowercase: true }
});

export default mongoose.models.Source || mongoose.model('Source', SourceSchema);
