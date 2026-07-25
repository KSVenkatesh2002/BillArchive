import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  projects: [{ type: String }],
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
