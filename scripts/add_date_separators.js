const fs = require('fs');

const helper = `
const getRelativeTimeGroup = (dateString) => {
  if (!dateString) return 'Older';
  const date = new Date(dateString);
  const now = new Date();
  
  const msDiff = now - date;
  const daysDiff = Math.floor(msDiff / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0 && date.getDate() === now.getDate()) return 'Today';
  if (daysDiff <= 1) return 'Yesterday';
  if (daysDiff <= 7) return 'This Week';
  if (daysDiff <= 14) return 'Last Week';
  
  if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
    return 'This Month';
  }
  
  const lastMonth = new Date(now);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  if (date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear()) {
    return 'Last Month';
  }
  
  return 'Older';
};
`;

function processTable() {
  let content = fs.readFileSync('src/components/TaskTable.js', 'utf8');
  
  if (!content.includes('import React')) {
    content = content.replace("import { useState", "import React, { useState");
  }

  if (!content.includes('getRelativeTimeGroup')) {
    content = content.replace('export default function TaskTable', helper + '\nexport default function TaskTable');
  }

  const loopStart = `{tasks.map((task) => {`;
  const loopReplace = `{tasks.map((task, index) => {
                const currentGroup = getRelativeTimeGroup(task.createdAt);
                const prevGroup = index > 0 ? getRelativeTimeGroup(tasks[index - 1].createdAt) : null;
                const showSeparator = currentGroup !== prevGroup;`;
                
  content = content.replace(loopStart, loopReplace);

  const trStart = `<tr key={task._id}`;
  const trReplace = `<React.Fragment key={task._id}>
                    {showSeparator && (
                      <tr className="bg-black">
                        <td colSpan={6 + customCols.length} className="py-2.5 px-4 text-xs font-black tracking-widest uppercase text-orange-500 border-y border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-transparent">
                          {currentGroup}
                        </td>
                      </tr>
                    )}
                    <tr`;
                    
  content = content.replace(trStart, trReplace);
  
  // Need to close the fragment!
  content = content.replace(/<\/tr>\s*\}\)\}/g, "</tr>\n                  </React.Fragment>\n                );\n              })}");

  fs.writeFileSync('src/components/TaskTable.js', content);
}

function processCards() {
  let content = fs.readFileSync('src/components/TaskCards.js', 'utf8');
  
  if (!content.includes('import React')) {
    content = content.replace("import { useState", "import React, { useState");
  }

  if (!content.includes('getRelativeTimeGroup')) {
    content = content.replace('export default function TaskCards', helper + '\nexport default function TaskCards');
  }

  const loopStart = `{tasks.map((task) => {`;
  const loopReplace = `{tasks.map((task, index) => {
            const currentGroup = getRelativeTimeGroup(task.createdAt);
            const prevGroup = index > 0 ? getRelativeTimeGroup(tasks[index - 1].createdAt) : null;
            const showSeparator = currentGroup !== prevGroup;`;
                
  content = content.replace(loopStart, loopReplace);

  const divStart = `<div\n                key={task._id}`;
  const divReplace = `<React.Fragment key={task._id}>
                {showSeparator && (
                  <div className="col-span-full py-2 mt-2 mb-1 flex items-center gap-4">
                    <div className="text-xs font-black tracking-widest uppercase text-orange-500">{currentGroup}</div>
                    <div className="flex-1 h-px bg-gradient-to-r from-orange-500/20 to-transparent"></div>
                  </div>
                )}
                <div`;
                    
  content = content.replace(divStart, divReplace);
  
  // Need to close the fragment!
  content = content.replace(/<\/div>\s*\)\s*\}\)\}/g, "</div>\n            </React.Fragment>\n          );\n          })}");

  fs.writeFileSync('src/components/TaskCards.js', content);
}

processTable();
processCards();
console.log('Successfully injected grouping headers into Table and Grid views.');
