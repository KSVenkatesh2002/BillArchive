import test from 'node:test';
import assert from 'node:assert/strict';

const getStatusColorClass = (status, statusColors = {}) => {
  if (statusColors && statusColors[status]) return `${statusColors[status]} text-white border-transparent`;
  const s = (status || "").toLowerCase();
  if (statusColors && statusColors[s]) return `${statusColors[s]} text-white border-transparent`;
  if (s === "complete" || s === "completed" || s === "qa complete")
    return "bg-emerald-500/10 text-emerald-450 border-emerald-500/30";
  if (s === "inprocess" || s === "dev")
    return "bg-orange-500/10 text-orange-400 border-orange-500/30";
  return "bg-zinc-900 text-zinc-300 border-zinc-800";
};

test('Custom status color lookup prioritizes configured statusColors map', () => {
  const customColors = {
    'custom_review': 'bg-purple-500',
    'inprocess': 'bg-cyan-500'
  };

  assert.equal(getStatusColorClass('custom_review', customColors), 'bg-purple-500 text-white border-transparent');
  assert.equal(getStatusColorClass('inprocess', customColors), 'bg-cyan-500 text-white border-transparent');
});

test('Status color lookup falls back to default styles when no custom map is provided', () => {
  assert.equal(getStatusColorClass('completed', {}), 'bg-emerald-500/10 text-emerald-450 border-emerald-500/30');
});
