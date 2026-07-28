const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // 1. Seed Roles (UUID PK + unique code)
  const [superAdminRole] = await knex('roles').insert({
    code: 'superAdmin', name: 'Super Admin', description: 'Global system administrator'
  }).onConflict('code').merge().returning('*');

  const [adminRole] = await knex('roles').insert({
    code: 'admin', name: 'Organization Admin', description: 'Organization administrator'
  }).onConflict('code').merge().returning('*');

  const [userRole] = await knex('roles').insert({
    code: 'user', name: 'Standard User', description: 'Standard team member'
  }).onConflict('code').merge().returning('*');

  const superAdminRoleId = superAdminRole?.id || (await knex('roles').where({ code: 'superAdmin' }).first()).id;
  const adminRoleId = adminRole?.id || (await knex('roles').where({ code: 'admin' }).first()).id;
  const userRoleId = userRole?.id || (await knex('roles').where({ code: 'user' }).first()).id;

  // 2. Seed 2 Organizations (UUID PK + unique slug)
  const [dialedinOrg] = await knex('organizations').insert({
    slug: 'dialedin', name: 'DialedIn Corp'
  }).onConflict('slug').merge().returning('*');

  const [acmeOrg] = await knex('organizations').insert({
    slug: 'acme', name: 'Acme Enterprises'
  }).onConflict('slug').merge().returning('*');

  const dialedinId = dialedinOrg?.id || (await knex('organizations').where({ slug: 'dialedin' }).first()).id;
  const acmeId = acmeOrg?.id || (await knex('organizations').where({ slug: 'acme' }).first()).id;

  // 3. Seed Organization Statuses for dialedin
  const dialedinStatuses = [
    { organization_id: dialedinId, name: 'inprocess', label: 'In Process', color: 'orange', display_order: 1, is_default: true },
    { organization_id: dialedinId, name: 'dev', label: 'In Development', color: 'blue', display_order: 2, is_default: false },
    { organization_id: dialedinId, name: 'ready_for_qa', label: 'Ready for QA', color: 'amber', display_order: 3, is_default: false },
    { organization_id: dialedinId, name: 'qa_complete', label: 'QA Complete', color: 'emerald', display_order: 4, is_default: false },
    { organization_id: dialedinId, name: 'complete', label: 'Completed', color: 'green', display_order: 5, is_default: false },
    { organization_id: dialedinId, name: 'need_approval', label: 'Needs Approval', color: 'rose', display_order: 6, is_default: false }
  ];

  for (const s of dialedinStatuses) {
    await knex('organization_statuses').insert(s).onConflict(['organization_id', 'name']).ignore();
  }

  // 4. Seed Organization Statuses for acme
  const acmeStatuses = [
    { organization_id: acmeId, name: 'backlog', label: 'Backlog', color: 'zinc', display_order: 1, is_default: true },
    { organization_id: acmeId, name: 'in_progress', label: 'In Progress', color: 'orange', display_order: 2, is_default: false },
    { organization_id: acmeId, name: 'done', label: 'Done', color: 'green', display_order: 3, is_default: false }
  ];

  for (const s of acmeStatuses) {
    await knex('organization_statuses').insert(s).onConflict(['organization_id', 'name']).ignore();
  }

  // 5. Password hashing
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123', salt);

  // 6. Seed Admin Users for Both Orgs
  await knex('users').insert([
    { username: 'admin', name: 'DialedIn Admin', email: 'admin@dialedin.com', password_hash: passwordHash, role_id: superAdminRoleId, organization_id: dialedinId },
    { username: 'acme_admin', name: 'Acme Admin', email: 'admin@acme.com', password_hash: passwordHash, role_id: adminRoleId, organization_id: acmeId }
  ]).onConflict('username').ignore();

  // 7. Seed 2 Regular Users for 'dialedin'
  const [johnDev] = await knex('users').insert({
    username: 'john_dev',
    name: 'John Developer',
    email: 'john@dialedin.com',
    password_hash: passwordHash,
    role_id: userRoleId,
    organization_id: dialedinId
  }).onConflict('username').merge().returning('*');

  const [sarahQa] = await knex('users').insert({
    username: 'sarah_qa',
    name: 'Sarah QA Engineer',
    email: 'sarah@dialedin.com',
    password_hash: passwordHash,
    role_id: userRoleId,
    organization_id: dialedinId
  }).onConflict('username').merge().returning('*');

  const johnId = johnDev?.id || (await knex('users').where({ username: 'john_dev' }).first()).id;
  const sarahId = sarahQa?.id || (await knex('users').where({ username: 'sarah_qa' }).first()).id;

  // 8. Seed 5 Projects for John & Sarah
  const johnProjects = ['Web Portal', 'Mobile App', 'API Integration', 'Payment Engine', 'Analytics Dashboard'];
  const sarahProjects = ['QA Automation', 'Web Portal', 'Security Audit', 'Performance Testing', 'Release Candidate'];

  for (const pName of johnProjects) {
    await knex('user_projects').insert({ user_id: johnId, organization_id: dialedinId, name: pName }).onConflict(['organization_id', 'name']).ignore();
  }
  for (const pName of sarahProjects) {
    await knex('user_projects').insert({ user_id: sarahId, organization_id: dialedinId, name: pName }).onConflict(['organization_id', 'name']).ignore();
  }

  // Helper for billing hours between 0.16 and 1.5
  const randomHours = () => Number((Math.random() * (1.5 - 0.16) + 0.16).toFixed(2));

  // 9. Generate Tasks and Time Entries for the past 15 days, 5 tasks per day
  const now = new Date();
  
  const tasksToInsert = [];
  const timeEntriesToInsert = [];
  const docLinksToInsert = [];
  
  let taskCounter = 1;
  const clickupPrefixes = ['CU-89', 'CU-44', 'CU-77', 'CU-12', 'CU-99'];
  
  // Create a pool of "multi-day" tasks to simulate tasks repeating across multiple days
  const multiDayTasks = [];
  
  for (let i = 0; i < 5; i++) {
    multiDayTasks.push({
      id: knex.raw('gen_random_uuid()'), // we will let knex handle returning the actual IDs
      name: `Long Running Feature ${i + 1}`,
      nick_name: `FEAT-${i + 1}`,
      clickup_id: `CU-LONG-${i}`,
      status: 'inprocess',
      project: johnProjects[i % johnProjects.length],
      user_id: johnId,
      organization_id: dialedinId,
    });
  }

  // Insert the multi-day tasks first so we can use their IDs
  const insertedMultiDayTasks = await knex('tasks').insert(multiDayTasks).returning('*');

  // Loop through past 15 days
  for (let dayOffset = 15; dayOffset >= 0; dayOffset--) {
    const workDate = new Date(now);
    workDate.setDate(workDate.getDate() - dayOffset);
    
    // Pick 2 random multi-day tasks to work on today
    const selectedMultiDay = [
      insertedMultiDayTasks[dayOffset % 5],
      insertedMultiDayTasks[(dayOffset + 1) % 5]
    ];
    
    // Add time entries for the multi-day tasks
    for (const t of selectedMultiDay) {
      timeEntriesToInsert.push({
        task_id: t.id,
        date: workDate,
        allocated_hours: 4.0,
        billed_hours: randomHours(),
        actual_hours: randomHours() + 0.5,
        note: `Continued work on day offset ${dayOffset}`,
        logged_by: 'john_dev'
      });
    }

    // Create 3 new daily discrete tasks (so we have 5 total per day)
    const dailyTasks = [];
    for (let i = 0; i < 3; i++) {
      dailyTasks.push({
        name: `Daily Task ${taskCounter}`,
        nick_name: `TSK-${taskCounter}`,
        clickup_id: `${clickupPrefixes[i]}-${taskCounter}`,
        status: dialedinStatuses[Math.floor(Math.random() * dialedinStatuses.length)].name,
        work_date: workDate,
        project: johnProjects[i % johnProjects.length],
        user_id: johnId, // focus on one user
        organization_id: dialedinId,
        allocated_hours: 4.0,
        billed_hours: randomHours(),
        actual_hours: randomHours()
      });
      taskCounter++;
    }
    
    const insertedDaily = await knex('tasks').insert(dailyTasks).returning('*');
    
    for (const t of insertedDaily) {
      timeEntriesToInsert.push({
        task_id: t.id,
        date: workDate,
        allocated_hours: t.allocated_hours,
        billed_hours: t.billed_hours,
        actual_hours: t.actual_hours,
        note: `Completed daily task`,
        logged_by: 'john_dev'
      });
      
      // Random doc link
      if (Math.random() > 0.5) {
        docLinksToInsert.push({
          task_id: t.id,
          label: 'Task Spec',
          url: 'https://docs.example.com'
        });
      }
    }
  }

  // Insert all time entries in chunks
  const chunkSize = 30;
  for (let i = 0; i < timeEntriesToInsert.length; i += chunkSize) {
    await knex('time_entries').insert(timeEntriesToInsert.slice(i, i + chunkSize));
  }

  // Insert doc links
  for (let i = 0; i < docLinksToInsert.length; i += chunkSize) {
    await knex('task_doc_links').insert(docLinksToInsert.slice(i, i + chunkSize));
  }

  // Default Settings
  await knex('settings').insert({
    key: 'statuses',
    value: JSON.stringify(['inprocess', 'dev', 'ready_for_qa', 'qa_complete', 'complete', 'need_approval'])
  }).onConflict('key').merge();
};
