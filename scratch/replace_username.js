const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  for (const { search, replace } of replacements) {
    // Escape string for regex or just use simple string replace
    content = content.split(search).join(replace);
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

const basePath = '/home/dialedin/project/vercel/bill/src/app';

// 1. Sitemap
replaceInFile(path.join(basePath, 'sitemap/page.js'), [
  { search: 'currentUser.username', replace: 'currentUser.email' }
]);

// 2. Profile Page
replaceInFile(path.join(basePath, '[orgId]/[userId]/profile/page.js'), [
  { search: 'auth.user.username !== userId', replace: 'auth.user.id !== userId' },
  { search: '${auth.user.username}/profile', replace: '${auth.user.id}/profile' }
]);

// 3. App Page
replaceInFile(path.join(basePath, '[orgId]/[userId]/page.js'), [
  { search: 'user.username !== userId', replace: 'user.id !== userId' },
  { search: '${user.username}`', replace: '${user.id}`' }
]);

// 4. Project Page
replaceInFile(path.join(basePath, '[orgId]/[userId]/project/[name]/page.js'), [
  { search: 'user.username !== userId', replace: 'user.id !== userId' },
  { search: '${user.username}/project/${name}`', replace: '${user.id}/project/${name}`' }
]);

// 5. Landing Page
replaceInFile(path.join(basePath, 'page.js'), [
  { search: 'currentUser.username.toLowerCase()', replace: 'currentUser.email.toLowerCase()' }
]);

// 6. Tasks API
replaceInFile(path.join(basePath, 'api/tasks/route.js'), [
  { search: 'user.username', replace: 'user.email' }
]);

// 7. Task Create
if (fs.existsSync(path.join(basePath, 'task-create/page.js'))) {
  replaceInFile(path.join(basePath, 'task-create/page.js'), [
    { search: 'data.user.username', replace: 'data.user.id' }
  ]);
}

// 8. Task ID API
replaceInFile(path.join(basePath, 'api/tasks/[id]/route.js'), [
  { search: 'user.username', replace: 'user.email' }
]);

// 9. User Prefs API
replaceInFile(path.join(basePath, 'api/user/preferences/route.js'), [
  { search: 'authUser.username', replace: 'authUser.email' },
  { search: 'findUserByUsername', replace: 'findUserByEmail' }
]);

// 10. Org Config API
replaceInFile(path.join(basePath, 'api/organization/config/route.js'), [
  { search: 'authUser.username', replace: 'authUser.email' },
  { search: 'findUserByUsername', replace: 'findUserByEmail' }
]);

// 11. Profile API
replaceInFile(path.join(basePath, 'api/auth/profile/route.js'), [
  { search: 'updatedUser.username', replace: 'updatedUser.email' }
]);

// 12. Me API
replaceInFile(path.join(basePath, 'api/auth/me/route.js'), [
  { search: 'user.username', replace: 'user.email' },
  { search: 'findUserByUsername', replace: 'findUserByEmail' },
  { search: 'username: dbUser.username', replace: 'email: dbUser.email' }
]);

console.log('All done!');
