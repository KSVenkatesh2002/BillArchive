import test from 'node:test';
import assert from 'node:assert/strict';

// Helper simulation of auth sanitizer and role authorization checks
function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, token_secret, ...safeUser } = user;
  return safeUser;
}

function hasPermission(userRole, requiredRole) {
  const roleHierarchy = {
    superadmin: 3,
    admin: 2,
    member: 1,
  };
  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 1;
  return userLevel >= requiredLevel;
}

test('sanitizeUser strips sensitive fields like password_hash', () => {
  const rawUser = {
    id: 'usr-123',
    email: 'test@example.com',
    password_hash: '$2a$10$abcdefghijklmnopqrstuv',
    token_secret: 'secret123',
    role: 'admin',
  };

  const cleanUser = sanitizeUser(rawUser);

  assert.equal(cleanUser.id, 'usr-123');
  assert.equal(cleanUser.email, 'test@example.com');
  assert.equal(cleanUser.role, 'admin');
  assert.equal('password_hash' in cleanUser, false);
  assert.equal('token_secret' in cleanUser, false);
});

test('hasPermission enforces role hierarchy correctly', () => {
  assert.equal(hasPermission('superadmin', 'admin'), true);
  assert.equal(hasPermission('admin', 'admin'), true);
  assert.equal(hasPermission('member', 'admin'), false);
  assert.equal(hasPermission('member', 'member'), true);
});
