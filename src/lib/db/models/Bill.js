import mongoose from 'mongoose';

const BillSchema = new mongoose.Schema({
  title: { type: String, required: true },
  clientName: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
  date: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Bill || mongoose.model('Bill', BillSchema);
