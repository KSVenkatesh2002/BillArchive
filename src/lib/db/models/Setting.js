import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  list: [{ type: String }]
});

export default mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
