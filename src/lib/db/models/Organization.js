import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  dynamicFields: [
    {
      name: { type: String, required: true }, // e.g. "source", "typeOfWork"
      label: { type: String, required: true },
      type: { type: String, enum: ['dropdown', 'selector', 'text', 'toggle'], required: true },
      options: [{ type: String }],
      defaultValue: { type: mongoose.Schema.Types.Mixed }
    }
  ],
  enabledFields: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);
