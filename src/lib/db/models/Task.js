import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nickName: { type: String, default: '' },
  clickupId: { type: String, default: '' },
  status: { type: String, required: true },
  statusHistory: [
    {
      status: { type: String },
      timestamp: { type: String },
      changedBy: { type: String }
    }
  ],
  workDate: { type: Date, default: Date.now },
  timeEntries: [
    {
      date: { type: Date, default: Date.now },
      allocatedHours: { type: Number, default: 0 },
      billedHours: { type: Number, default: 0 },
      actualHours: { type: Number, default: 0 },
      note: { type: String, default: '' },
      loggedBy: { type: String, default: '' }
    }
  ],
  bill: {
    allocatedHours: { type: Number, default: 0 },
    billedHours: { type: Number, default: 0 },
    actualHours: { type: Number, default: 0 }
  },
  project: { type: String, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organization: { type: mongoose.Schema.Types.Mixed, ref: 'Organization' },
  dynamicValues: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
