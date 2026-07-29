import knex from 'knex';
import knexConfig from '../../../knexfile';

let dbInstance = null;

function getKnex() {
  if (!dbInstance) {
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
      throw new Error('[PostgreSQL Error] DATABASE_URL is not set in process.env. Please configure your Supabase connection URI in .env.local');
    }
    dbInstance = knex(knexConfig);
  }
  return dbInstance;
}

const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export const pgAdapter = {
  async connect() {
    const db = getKnex();
    await db.raw('SELECT 1');
  },

  async findUserByUsername(username) {
    const db = getKnex();
    const user = await db('users as u')
      .leftJoin('roles as r', 'u.role_id', 'r.id')
      .leftJoin('organizations as o', 'u.organization_id', 'o.id')
      .select('u.*', 'r.code as role_code', 'r.name as role_name', 'o.slug as org_slug', 'o.name as org_name')
      .where('u.username', username)
      .first();

    if (!user) return null;

    const userPref = await db('user_preferences').where({ user_id: user.id }).first();
    const userProjects = await db('user_projects').where({ user_id: user.id }).select('name');
    const org = user.organization_id ? await this.findOrganizationById(user.organization_id) : null;

    return {
      _id: user.id,
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      password: user.password_hash,
      role: user.role_code || 'user',
      organization: org,
      orgId: user.org_slug || 'dialedin',
      preferences: {
        ...(userPref?.preferences || {}),
        project: userPref?.default_project || 'General'
      },
      projects: userProjects.map(p => p.name)
    };
  },

  async findUsers() {
    const db = getKnex();
    const users = await db('users as u')
      .leftJoin('roles as r', 'u.role_id', 'r.id')
      .leftJoin('organizations as o', 'u.organization_id', 'o.id')
      .select('u.*', 'r.code as role_code', 'o.slug as org_slug');

    return users.map(u => ({
      _id: u.id,
      id: u.id,
      username: u.username,
      name: u.name,
      email: u.email,
      role: u.role_code,
      organization: u.org_slug || u.organization_id
    }));
  },

  async createUser(userDoc) {
    const db = getKnex();

    // Resolve role ID
    let roleId = null;
    if (userDoc.role) {
      const r = await db('roles').where({ code: userDoc.role }).first();
      roleId = r?.id;
    }

    // Resolve Org ID
    let orgId = null;
    const targetOrgSlug = typeof userDoc.organization === 'object' ? userDoc.organization?.slug || userDoc.organization?.id : (userDoc.organization || 'dialedin');
    const org = await db('organizations').where(isUUID(targetOrgSlug) ? { id: targetOrgSlug } : { slug: targetOrgSlug }).first();
    orgId = org?.id;

    const [user] = await db('users').insert({
      username: userDoc.username,
      name: userDoc.name,
      email: userDoc.email,
      password_hash: userDoc.password,
      role_id: roleId,
      organization_id: orgId
    }).returning('*');

    if (userDoc.preferences) {
      await db('user_preferences').insert({
        user_id: user.id,
        default_project: userDoc.preferences.project || 'General',
        preferences: JSON.stringify(userDoc.preferences)
      });
    }

    return this.findUserByUsername(user.username);
  },

  async updateUser(id, updateDoc) {
    const db = getKnex();
    const updateData = {};
    if (updateDoc.name) updateData.name = updateDoc.name;
    if (updateDoc.email) updateData.email = updateDoc.email;
    if (updateDoc.password) updateData.password_hash = updateDoc.password;
    if (updateDoc.role) {
      const r = await db('roles').where({ code: updateDoc.role }).first();
      if (r) updateData.role_id = r.id;
    }

    if (Object.keys(updateData).length > 0) {
      await db('users').where({ id }).update(updateData);
    }

    if (updateDoc.preferences) {
      await db('user_preferences')
        .insert({
          user_id: id,
          default_project: updateDoc.preferences.project || 'General',
          preferences: JSON.stringify(updateDoc.preferences)
        })
        .onConflict('user_id')
        .merge({
          default_project: updateDoc.preferences.project || 'General',
          preferences: JSON.stringify(updateDoc.preferences)
        });
    }

    const user = await db('users').where({ id }).first();
    return this.findUserByUsername(user.username);
  },

  async findTasks(query = {}, options = {}) {
    const db = getKnex();
    let q = db('tasks as t')
      .leftJoin('users as u', 't.user_id', 'u.id')
      .leftJoin('organizations as o', 't.organization_id', 'o.id')
      .select('t.*', 'u.username as author_username', 'u.name as author_name', 'o.slug as org_slug');

    if (query.id) {
      q = q.where('t.id', query.id);
    }

    if (query.userId) {
      q = q.where('t.user_id', query.userId);
    }

    if (query.organizationId || query.orgId) {
      const orgQuery = query.organizationId || query.orgId;
      q = q.where(builder => {
      if (isUUID(orgQuery)) {
        builder.where('t.organization_id', orgQuery);
      } else {
        builder.where('o.slug', orgQuery);
      }
      });
    }

    if (query.project && query.project !== 'all') {
      q = q.where('t.project', query.project);
    }

    if (query.createdAt) {
      if (query.createdAt.$gte) q = q.where('t.created_at', '>=', query.createdAt.$gte);
      if (query.createdAt.$lte) q = q.where('t.created_at', '<=', query.createdAt.$lte);
    }

    const dynamicKeys = Object.keys(query).filter(k => k.startsWith('dynamicValues.'));
    for (const key of dynamicKeys) {
      const fieldName = key.split('.')[1];
      const val = query[key];
      q = q.whereExists(function() {
        this.select('id')
          .from('task_custom_values as cv')
          .whereRaw('cv.task_id = t.id')
          .where('cv.field_name', fieldName)
          .where('cv.field_value', 'ilike', `%${val}%`);
      });
    }

    q = q.orderBy('t.work_date', 'desc');

    if (options.limit) q = q.limit(options.limit);
    if (options.skip) q = q.offset(options.skip);

    const taskRows = await q;
    const taskIds = taskRows.map(t => t.id);

    let customVals = [];
    let docLinks = [];
    let timeEntries = [];
    let statusHist = [];

    if (taskIds.length > 0) {
      customVals = await db('task_custom_values').whereIn('task_id', taskIds);
      docLinks = await db('task_doc_links').whereIn('task_id', taskIds);
      timeEntries = await db('time_entries').whereIn('task_id', taskIds).orderBy('date', 'desc');
      statusHist = await db('status_history').whereIn('task_id', taskIds).orderBy('timestamp', 'asc');
    }

    const tasks = taskRows.map(t => {
      const cVals = customVals.filter(cv => cv.task_id === t.id);
      const dLinks = docLinks.filter(dl => dl.task_id === t.id);
      const tEntries = timeEntries.filter(te => te.task_id === t.id);
      const sHist = statusHist.filter(sh => sh.task_id === t.id);

      const dynamicValues = {};
      cVals.forEach(cv => {
        dynamicValues[cv.field_name] = cv.field_value;
      });

      return {
        _id: t.id,
        id: t.id,
        name: t.name,
        nickName: t.nick_name || '',
        clickupId: t.clickup_id || '',
        status: t.status,
        workDate: t.work_date,
        project: t.project || 'General',
        userId: t.user_id,
        username: t.author_username || '',
        user: t.author_name || '',
        organization: t.org_slug || t.organization_id,
        dynamicValues,
        docLinks: dLinks.map(dl => ({ _id: dl.id, label: dl.label, url: dl.url })),
        timeEntries: tEntries.map(te => ({
          _id: te.id,
          date: te.date,
          allocatedHours: Number(te.allocated_hours || 0),
          billedHours: Number(te.billed_hours || 0),
          actualHours: Number(te.actual_hours || 0),
          note: te.note || '',
          loggedBy: te.logged_by || ''
        })),
        statusHistory: sHist.map(sh => ({
          status: sh.status,
          timestamp: sh.timestamp,
          changedBy: sh.changed_by
        })),
        bill: {
          allocatedHours: Number(t.allocated_hours || 0),
          billedHours: Number(t.billed_hours || 0),
          actualHours: Number(t.actual_hours || 0)
        },
        createdAt: t.created_at,
        updatedAt: t.updated_at
      };
    });

    const totalAllocated = tasks.reduce((sum, t) => sum + (t.bill.allocatedHours || 0), 0);
    const totalBilled = tasks.reduce((sum, t) => sum + (t.bill.billedHours || 0), 0);
    const totalActual = tasks.reduce((sum, t) => sum + (t.bill.actualHours || 0), 0);

    return {
      tasks,
      hasMore: false,
      metrics: {
        totalAllocated,
        totalBilled,
        totalActual,
        variance: totalBilled - totalActual
      }
    };
  },

  async findTaskById(id) {
    const res = await this.findTasks({ id });
    return res.tasks?.[0] || null;
  },

  async createTask(taskDoc) {
    const db = getKnex();

    // Resolve Org ID
    const targetOrgSlug = taskDoc.organization || 'dialedin';
    const org = await db('organizations').where(isUUID(targetOrgSlug) ? { id: targetOrgSlug } : { slug: targetOrgSlug }).first();
    const orgId = org?.id;

    const [newTask] = await db('tasks').insert({
      name: taskDoc.name,
      nick_name: taskDoc.nickName || '',
      clickup_id: taskDoc.clickupId || '',
      status: taskDoc.status || 'inprocess',
      work_date: taskDoc.workDate || new Date(),
      project: taskDoc.project || 'General',
      user_id: taskDoc.userId,
      organization_id: orgId,
      allocated_hours: taskDoc.bill?.allocatedHours || 0,
      billed_hours: taskDoc.bill?.billedHours || 0,
      actual_hours: taskDoc.bill?.actualHours || 0
    }).returning('*');

    if (taskDoc.dynamicValues && Object.keys(taskDoc.dynamicValues).length > 0) {
      const cvInserts = Object.entries(taskDoc.dynamicValues).map(([k, v]) => ({
        task_id: newTask.id,
        field_name: k,
        field_value: String(v || '')
      }));
      await db('task_custom_values').insert(cvInserts);
    }

    if (taskDoc.docLinks && taskDoc.docLinks.length > 0) {
      const dlInserts = taskDoc.docLinks.map(dl => ({
        task_id: newTask.id,
        label: dl.label,
        url: dl.url
      }));
      await db('task_doc_links').insert(dlInserts);
    }

    if (taskDoc.timeEntries && taskDoc.timeEntries.length > 0) {
      const teInserts = taskDoc.timeEntries.map(te => ({
        task_id: newTask.id,
        date: te.date || new Date(),
        allocated_hours: te.allocatedHours || 0,
        billed_hours: te.billedHours || 0,
        actual_hours: te.actualHours || 0,
        note: te.note || '',
        logged_by: te.loggedBy || ''
      }));
      await db('time_entries').insert(teInserts);
    }

    await db('status_history').insert({
      task_id: newTask.id,
      status: newTask.status,
      changed_by: taskDoc.user || taskDoc.username || 'User'
    });

    return this.findTaskById(newTask.id);
  },

  async updateTask(id, updateDoc) {
    const db = getKnex();

    if (updateDoc.$set) {
      const s = updateDoc.$set;
      const tUpdate = {};
      if (s.name) tUpdate.name = s.name;
      if (s.nickName !== undefined) tUpdate.nick_name = s.nickName;
      if (s.clickupId !== undefined) tUpdate.clickup_id = s.clickupId;
      if (s.status) tUpdate.status = s.status;
      if (s.workDate) tUpdate.work_date = s.workDate;
      if (s.project) tUpdate.project = s.project;
      if (s.bill) {
        tUpdate.allocated_hours = s.bill.allocatedHours || 0;
        tUpdate.billed_hours = s.bill.billedHours || 0;
        tUpdate.actual_hours = s.bill.actualHours || 0;
      }
      if (s.updatedAt) tUpdate.updated_at = s.updatedAt;

      if (Object.keys(tUpdate).length > 0) {
        await db('tasks').where({ id }).update(tUpdate);
      }

      if (s.dynamicValues) {
        for (const [k, v] of Object.entries(s.dynamicValues)) {
          await db('task_custom_values')
            .insert({ task_id: id, field_name: k, field_value: String(v || '') })
            .onConflict(['task_id', 'field_name'])
            .merge({ field_value: String(v || '') });
        }
      }

      if (s.docLinks) {
        await db('task_doc_links').where({ task_id: id }).del();
        if (s.docLinks.length > 0) {
          await db('task_doc_links').insert(s.docLinks.map(dl => ({ task_id: id, label: dl.label, url: dl.url })));
        }
      }

      if (s.timeEntries) {
        await db('time_entries').where({ task_id: id }).del();
        const teInserts = s.timeEntries.map(te => ({
          task_id: id,
          date: te.date || new Date(),
          allocated_hours: te.allocatedHours || 0,
          billed_hours: te.billedHours || 0,
          actual_hours: te.actualHours || 0,
          note: te.note || '',
          logged_by: te.loggedBy || ''
        }));
        if (teInserts.length > 0) {
          await db('time_entries').insert(teInserts);
        }
      }
    }

    if (updateDoc.$push?.statusHistory) {
      const sh = updateDoc.$push.statusHistory;
      await db('status_history').insert({
        task_id: id,
        status: sh.status,
        changed_by: sh.changedBy || 'User'
      });
    }

    return this.findTaskById(id);
  },

  async deleteTask(id) {
    const db = getKnex();
    await db('tasks').where({ id }).del();
    return true;
  },

  async getStatuses(orgSlug = 'dialedin') {
    const db = getKnex();
    const org = await db('organizations').where(isUUID(orgSlug) ? { id: orgSlug } : { slug: orgSlug }).first();
    const orgId = org?.id;

    if (!orgId) return ['inprocess', 'dev', 'ready_for_qa', 'qa_complete', 'complete', 'need_approval'];

    const rows = await db('organization_statuses')
      .where({ organization_id: orgId })
      .orderBy('display_order', 'asc');
    
    if (rows.length === 0) {
      return ['inprocess', 'dev', 'ready_for_qa', 'qa_complete', 'complete', 'need_approval'];
    }
    return rows.map(r => r.name);
  },

  async saveStatuses(list, orgSlug = 'dialedin') {
    const db = getKnex();
    const org = await db('organizations').where(isUUID(orgSlug) ? { id: orgSlug } : { slug: orgSlug }).first();
    const orgId = org?.id;

    if (!orgId) return list;

    await db('organization_statuses').where({ organization_id: orgId }).del();
    for (let i = 0; i < list.length; i++) {
      const name = list[i];
      await db('organization_statuses').insert({
        organization_id: orgId,
        name: name,
        label: name.replace(/_/g, ' ').toUpperCase(),
        display_order: i + 1
      });
    }
    return list;
  },

  async getUserProjects(userId) {
    const db = getKnex();
    const rows = await db('user_projects').where({ user_id: userId }).select('name');
    return rows.map(r => r.name);
  },

  async addUserProject(userId, projectName) {
    const db = getKnex();
    const user = await db('users').where({ id: userId }).first();
    const orgId = user?.organization_id;

    if (orgId) {
      await db('user_projects')
        .insert({ user_id: userId, organization_id: orgId, name: projectName })
        .onConflict(['organization_id', 'name'])
        .ignore();
    }

    return this.getUserProjects(userId);
  },

  async findOrganizationById(idOrSlug) {
    const db = getKnex();
    const org = await db('organizations').where(isUUID(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug }).first();
    if (!org) return null;

    const fields = await db('organization_fields').where({ organization_id: org.id });
    const fieldIds = fields.map(f => f.id);
    const options = fieldIds.length > 0 ? await db('organization_field_options').whereIn('field_id', fieldIds).orderBy('display_order', 'asc') : [];

    return {
      _id: org.id,
      id: org.id,
      slug: org.slug,
      name: org.name,
      enabledFields: typeof org.enabled_fields === 'string' ? JSON.parse(org.enabled_fields) : (org.enabled_fields || {}),
      dynamicFields: fields.map(f => {
        const fOptions = options.filter(o => o.field_id === f.id).map(o => o.option_value);
        return {
          name: f.name,
          label: f.label,
          type: f.type,
          options: fOptions,
          defaultValue: f.default_value,
          isRequired: f.is_required
        };
      })
    };
  },

  async findOrganizationBySlug(slug) {
    return this.findOrganizationById(slug);
  },

  async createOrganization(orgDoc) {
    const db = getKnex();
    const [org] = await db('organizations').insert({
      slug: orgDoc.slug || orgDoc.id,
      name: orgDoc.name
    }).onConflict('slug').ignore().returning('*');

    return this.findOrganizationById(org?.id || orgDoc.slug);
  },

  async updateOrganizationConfig(idOrSlug, dynamicFields, enabledFields) {
    const db = getKnex();
    const org = await db('organizations').where(isUUID(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug }).first();
    if (!org) return null;

    if (enabledFields !== undefined) {
      await db('organizations')
        .where({ id: org.id })
        .update({
          enabled_fields: typeof enabledFields === 'object' ? JSON.stringify(enabledFields) : enabledFields,
          updated_at: new Date()
        });
    }

    if (dynamicFields && Array.isArray(dynamicFields)) {
      for (const f of dynamicFields) {
        const [field] = await db('organization_fields')
          .insert({
            organization_id: org.id,
            name: f.name,
            label: f.label || f.name,
            type: f.type || 'text',
            default_value: f.defaultValue || '',
            is_required: !!f.isRequired
          })
          .onConflict(['organization_id', 'name'])
          .merge({
            label: f.label || f.name,
            type: f.type || 'text',
            default_value: f.defaultValue || '',
            is_required: !!f.isRequired
          })
          .returning('*');

        if (f.options && Array.isArray(f.options) && field) {
          await db('organization_field_options').where({ field_id: field.id }).del();
          const optionInserts = f.options.map((opt, idx) => ({
            field_id: field.id,
            option_label: String(opt),
            option_value: String(opt),
            display_order: idx + 1
          }));
          if (optionInserts.length > 0) {
            await db('organization_field_options').insert(optionInserts);
          }
        }
      }
    }
    return this.findOrganizationById(org.id);
  },

  async getOrganizations() {
    const db = getKnex();
    const orgs = await db('organizations').select('*');
    return orgs.map(o => ({ _id: o.id, id: o.id, slug: o.slug, name: o.name }));
  },

  async findBills() {
    return [];
  },

  async createBill(billDoc) {
    return { _id: 'stub', ...billDoc };
  }
};

