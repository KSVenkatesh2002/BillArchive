require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI;

// Schemas for Seeding
const OrganizationSchema = new mongoose.Schema({
  _id: String,
  name: String,
  slug: String,
  dynamicFields: Array,
  enabledFields: Object,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  name: String,
  role: String,
  organization: { type: mongoose.Schema.Types.Mixed, ref: 'Organization' },
  projects: [String],
  createdAt: { type: Date, default: Date.now }
});

const SettingSchema = new mongoose.Schema({ key: String, value: mongoose.Schema.Types.Mixed });

const TaskSchema = new mongoose.Schema({
  name: String,
  nickName: String,
  clickupId: String,
  status: String,
  statusHistory: Array,
  bill: {
    allocatedHours: Number,
    billedHours: Number,
    actualHours: Number
  },
  project: String,
  source: { type: mongoose.Schema.Types.ObjectId, ref: 'Source' },
  typeOfWork: { type: mongoose.Schema.Types.ObjectId, ref: 'TypeOfWork' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: String,
  user: String,
  organization: { type: mongoose.Schema.Types.Mixed, ref: 'Organization' },
  dynamicValues: Object,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Organization = mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);

async function seedDatabase() {
  if (!uri) {
    console.error('MONGODB_URI is missing in .env.local');
    process.exit(1);
  }

  console.log('Connecting to live MongoDB database for seeding...');
  await mongoose.connect(uri);
  console.log('Connected!');

  // 1. Seed Default Organization
  let org = await Organization.findOne({ $or: [{ _id: 'dialedin' }, { slug: 'dialedin' }] });
  if (!org) {
    org = await Organization.create({
      _id: 'dialedin',
      name: 'DialedIn',
      slug: 'dialedin',
      dynamicFields: [
        { name: 'source', label: 'Source', type: 'dropdown', options: ['dialedin', 'fluent', 'upwork', 'direct'], defaultValue: 'dialedin' },
        { name: 'typeOfWork', label: 'Type Of Work', type: 'dropdown', options: ['dev', 'qa', 'design', 'management'], defaultValue: 'dev' },
        { name: 'project', label: 'Project', type: 'dropdown', options: ['BillArchive', 'Infrastructure', 'Marketing'], defaultValue: 'BillArchive' }
      ],
      enabledFields: {
        allocatedHours: true,
        billedHours: true,
        actualHours: true,
        source: true,
        typeOfWork: true,
        project: true,
        clickupId: true
      }
    });
    console.log('[SEED] Organization created:', org.name);
  } else {
    console.log('[SEED] Organization already exists:', org.name);
  }

  // 2. Seed Default Admin User
  let adminUser = await User.findOne({ username: 'admin' });
  if (!adminUser) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    adminUser = await User.create({
      username: 'admin',
      password: hashedPassword,
      name: 'System Admin',
      role: 'admin',
      organization: org._id,
      projects: ['BillArchive', 'Infrastructure']
    });
    console.log('[SEED] Admin user created (username: admin / pass: admin123)');
  } else {
    console.log('[SEED] Admin user already exists');
  }

  // 3. Seed Default Employee User
  let devUser = await User.findOne({ username: 'employee' });
  if (!devUser) {
    const hashedPassword = await bcrypt.hash('user123', 10);
    devUser = await User.create({
      username: 'employee',
      password: hashedPassword,
      name: 'Jane Developer',
      role: 'user',
      organization: org._id,
      projects: ['BillArchive']
    });
    console.log('[SEED] Employee user created (username: employee / pass: user123)');
  }

  // 4. Removed legacy Sources & Work Types seed logic since they are dynamic configuration fields now

  // 5. Seed Statuses
  await Setting.findOneAndUpdate(
    { key: 'statuses' },
    {
      value: [
        'inprocess',
        'dev',
        'ready for qa',
        'qa complete',
        'ready for code review',
        'code review complete',
        'complete',
        'need approval'
      ]
    },
    { upsert: true }
  );
  console.log('[SEED] Statuses configured');

  // 6. Seed Initial Sample Tasks if none exist
  const existingTasksCount = await Task.countDocuments({ organization: org._id });
  if (existingTasksCount === 0) {
    await Task.create([
      {
        name: 'Implement Redux Store Architecture',
        nickName: 'redux-setup',
        status: 'complete',
        statusHistory: [{ status: 'complete', timestamp: new Date().toISOString(), changedBy: adminUser.name }],
        bill: { allocatedHours: 12, billedHours: 10, actualHours: 9.5 },
        project: 'BillArchive',
        userId: adminUser._id,
        username: adminUser.username,
        user: adminUser.name,
        organization: org._id,
        dynamicValues: { source: 'dialedin', typeOfWork: 'dev', project: 'BillArchive' }
      },
      {
        name: 'Configure Dynamic Field Metadata',
        nickName: 'dynamic-fields',
        status: 'dev',
        statusHistory: [{ status: 'dev', timestamp: new Date().toISOString(), changedBy: devUser.name }],
        bill: { allocatedHours: 8, billedHours: 6, actualHours: 7.0 },
        project: 'BillArchive',
        userId: devUser._id,
        username: devUser.username,
        user: devUser.name,
        organization: org._id,
        dynamicValues: { source: 'dialedin', typeOfWork: 'dev', project: 'BillArchive' }
      }
    ]);
    console.log('[SEED] Sample tasks seeded successfully');
  }

  console.log('[COMPLETE] Database seeding completed!');
  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error('[SEED ERROR]', err);
  process.exit(1);
});
