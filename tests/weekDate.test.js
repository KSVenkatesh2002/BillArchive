import test from 'node:test';
import assert from 'node:assert/strict';

// Helper functions for week calculations
const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  const parts = String(dateStr).split('T')[0].split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

const formatLocalDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const calculateWeekBadge = (currentWeekStart) => {
  if (!currentWeekStart) return 'Current Week';
  const d = parseLocalDate(currentWeekStart);
  const cwsTime = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0).getTime();

  const now = new Date();
  const todaySun = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay(), 0, 0, 0).getTime();
  const diffDays = Math.round((cwsTime - todaySun) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Current Week';
  if (diffDays < 0) return 'Previous Week';
  return 'Next Week';
};

test('Week date parsing handles YYYY-MM-DD strings without timezone shift', () => {
  const parsed = parseLocalDate('2026-03-01');
  assert.equal(parsed.getFullYear(), 2026);
  assert.equal(parsed.getMonth(), 2); // March is 0-indexed month 2
  assert.equal(parsed.getDate(), 1);
  assert.equal(formatLocalDate(parsed), '2026-03-01');
});

test('Sunday to Saturday week boundary calculation', () => {
  const sunday = parseLocalDate('2026-03-01'); // Sunday
  assert.equal(sunday.getDay(), 0);

  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  assert.equal(saturday.getDay(), 6); // Saturday
  assert.equal(formatLocalDate(saturday), '2026-03-07');
});

test('Week badge identifies Current Week accurately', () => {
  const today = new Date();
  const todaySun = new Date(today);
  todaySun.setDate(today.getDate() - today.getDay());
  const sunStr = formatLocalDate(todaySun);

  assert.equal(calculateWeekBadge(sunStr), 'Current Week');
});

test('Week badge identifies Previous Week and Next Week accurately', () => {
  const today = new Date();
  const prevSun = new Date(today);
  prevSun.setDate(today.getDate() - today.getDay() - 7);
  
  const nextSun = new Date(today);
  nextSun.setDate(today.getDate() - today.getDay() + 7);

  assert.equal(calculateWeekBadge(formatLocalDate(prevSun)), 'Previous Week');
  assert.equal(calculateWeekBadge(formatLocalDate(nextSun)), 'Next Week');
});
