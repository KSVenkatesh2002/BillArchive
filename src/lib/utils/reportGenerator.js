export function generateReportText(params) {
  const {
    taskList,
    excludedTaskIds,
    includeHours,
    includeHistory,
    includeClickUp,
    includeTotals,
    selectedProject,
    startDate,
    endDate
  } = params;

  let title = 'SUMMARY REPORT';
  if (selectedProject && selectedProject !== 'all') {
    title = `PROJECT REPORT: ${selectedProject.toUpperCase()}`;
  } else if (startDate || endDate) {
    title = `CUSTOM RANGE REPORT (${startDate || 'Start'} to ${endDate || 'End'})`;
  } else {
    title = 'TIMELINE SUMMARY REPORT';
  }

  let totalAllocated = 0;
  let totalBilled = 0;
  let totalActual = 0;

  let textBuffer = `=========================================\n`;
  textBuffer += `${title}\n`;
  textBuffer += `Generated: ${new Date().toLocaleDateString()}\n`;
  textBuffer += `=========================================\n\n`;

  if (!taskList) {
    return { textBuffer, count: 0 };
  }

  const filteredEntries = taskList.filter(e => !excludedTaskIds.has(e.uniqueId));

  if (filteredEntries.length === 0) {
    textBuffer += `No work log entries recorded for this timeline/project selection.\n`;
  } else {
    filteredEntries.forEach((entry, index) => {
      totalAllocated += entry.allocated || 0;
      totalBilled += entry.billed || 0;
      totalActual += entry.actual || 0;

      textBuffer += `${index + 1}. [${entry.project}] ${entry.taskName}`;
      if (includeClickUp && entry.nickName) {
        textBuffer += ` (${entry.nickName})`;
      }
      textBuffer += `\n`;

      textBuffer += `   Status: ${entry.status} | Work Date: ${new Date(entry.workDate).toLocaleDateString()}\n`;

      if (entry.note) {
        textBuffer += `   Note: ${entry.note}\n`;
      }

      if (includeClickUp && entry.clickupId) {
        textBuffer += `   ClickUp Link/ID: ${entry.clickupId}\n`;
      }

      if (includeHours) {
        textBuffer += `   Hours (This Date Log) -> Billed: ${entry.billed || 0}h | Actual: ${entry.actual || 0}h | Alloc: ${entry.allocated || 0}h\n`;
      }

      if (includeHistory && entry.statusHistory && entry.statusHistory.length > 0) {
        const historyTrail = entry.statusHistory.map(h => h.status).join(' -> ');
        textBuffer += `   Status Progression: ${historyTrail}\n`;
      }

      textBuffer += `-----------------------------------------\n`;
    });
  }

  if (includeTotals) {
    textBuffer += `\nTOTAL SUMMARY:\n`;
    textBuffer += `Total Log Entries: ${filteredEntries.length}\n`;
    if (includeHours) {
      textBuffer += `Total Allocated Hours: ${totalAllocated.toFixed(2)} hrs\n`;
      textBuffer += `Total Billed Hours: ${totalBilled.toFixed(2)} hrs\n`;
      textBuffer += `Total Actual Hours: ${totalActual.toFixed(2)} hrs\n`;
      textBuffer += `Efficiency Variance: ${(totalBilled - totalActual).toFixed(2)} hrs\n`;
    }
    textBuffer += `=========================================\n`;
  }

  return { textBuffer, count: filteredEntries.length };
}
