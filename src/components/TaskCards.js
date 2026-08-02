"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Pin,
  ExternalLink,
  Folder,
  Copy,
  Clock,
  Edit2,
  Trash2,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";

const getRelativeTimeGroup = (dateString) => {
  if (!dateString) return "Older";
  const date = new Date(dateString);
  const now = new Date();

  // Check Today
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return "Today";
  }

  // Check Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getWeekRange = (dateString) => {
  if (!dateString) return null;
  const d = new Date(dateString);
  const day = d.getDay();

  const start = new Date(d);
  start.setDate(d.getDate() - day);

  const end = new Date(d);
  end.setDate(d.getDate() + (6 - day));

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return `${formatDate(start)} - ${formatDate(end)}`;
};

export default function TaskCards({
  loading,
  tasks,
  handleQuickStatusChange,
  setActiveHistoryTask,
  handleCopyProjectDetails,
  openEditModal,
  deleteTask,
  dynamicFields = [],
}) {
  const params = useParams();
  const userId = params?.userId || "admin";
  const orgId = params?.orgId;
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    apiClient
      .getStatuses()
      .then((data) => {
        if (data.success) {
          setStatuses(data.statuses || []);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const activeStatuses =
    statuses.length > 0
      ? statuses
      : [
          "inprocess",
          "dev",
          "ready for qa",
          "qa complete",
          "ready for code review",
          "code review complete",
          "complete",
          "need approval",
        ];

  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "complete" || s === "qa complete")
      return "bg-emerald-500/10 text-emerald-450 border-emerald-500/30";
    if (s === "inprocess" || s === "dev")
      return "bg-orange-500/10 text-orange-400 border-orange-500/30";
    if (s === "ready for qa" || s === "ready for code review")
      return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    if (s === "need approval")
      return "bg-rose-500/10 text-rose-400 border-rose-500/30";
    return "bg-zinc-900 text-zinc-300 border-zinc-800";
  };

  const dateTotals = {};
  const weekTotals = {};

  tasks.forEach((t) => {
    const dateStr = t.workDate || t.createdAt;
    const dateGrp = getRelativeTimeGroup(dateStr);
    const weekGrp = getWeekRange(dateStr);

    if (!dateTotals[dateGrp])
      dateTotals[dateGrp] = { alloc: 0, bill: 0, act: 0 };
    if (weekGrp && !weekTotals[weekGrp])
      weekTotals[weekGrp] = { alloc: 0, bill: 0, act: 0 };

    dateTotals[dateGrp].alloc += Number(t.bill?.allocatedHours || 0);
    dateTotals[dateGrp].bill += Number(t.bill?.billedHours || 0);
    dateTotals[dateGrp].act += Number(t.bill?.actualHours || 0);

    if (weekGrp) {
      weekTotals[weekGrp].alloc += Number(t.bill?.allocatedHours || 0);
      weekTotals[weekGrp].bill += Number(t.bill?.billedHours || 0);
      weekTotals[weekGrp].act += Number(t.bill?.actualHours || 0);
    }
  });

  return (
    <div className="w-full">
      {loading ? (
        <div className="py-20 text-center text-zinc-500 bg-[#0b0b0b] rounded-2xl border border-zinc-800/80 shadow-2xl">
          <div className="animate-spin inline-block w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mb-3"></div>
          <p className="text-sm font-medium">Loading task data...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-20 text-center text-zinc-400 bg-[#0b0b0b] rounded-2xl border border-zinc-800/80 shadow-2xl">
          <Pin className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
          <p className="text-zinc-500 text-sm mb-4">
            No tasks match your current filters.
          </p>
          <p className="text-xs text-zinc-600">
            Try adjusting your filters or click &quot;New Task&quot; to create
            one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task, index) => {
            const taskDate = task.workDate || task.createdAt;
            const currentGroup = getRelativeTimeGroup(taskDate);
            const currentWeek = getWeekRange(taskDate);

            const prevTask = index > 0 ? tasks[index - 1] : null;
            const prevDate = prevTask
              ? prevTask.workDate || prevTask.createdAt
              : null;
            const prevGroup = prevDate ? getRelativeTimeGroup(prevDate) : null;
            const prevWeek = prevDate ? getWeekRange(prevDate) : null;

            const showWeek = currentWeek && currentWeek !== prevWeek;
            const showSeparator = currentGroup !== prevGroup;
            const statusColor = getStatusColor(task.status);

            const hasClickup = !!task.clickupId;
            let clickupLabel = "";
            let clickupUrl = "";
            if (hasClickup) {
              const idStr = task.clickupId.trim();
              clickupLabel = idStr.includes("/")
                ? idStr.split("/").filter(Boolean).pop()
                : idStr;
              clickupUrl = idStr.startsWith("http")
                ? idStr
                : `https://app.clickup.com/t/${idStr}`;
            }

            return (
              <React.Fragment key={task._id}>
                {showWeek && (
                  <div className="col-span-full mt-4 mb-2">
                    <h3 className="text-sm font-bold uppercase text-zinc-300 bg-zinc-900/80 p-2 rounded-lg border border-zinc-800 flex items-center gap-4">
                      <span>Week of {currentWeek}</span>
                      <span className="font-mono font-normal text-[10px] text-zinc-400">
                        Alloc: {weekTotals[currentWeek].alloc.toFixed(2)}h |
                        Bill: {weekTotals[currentWeek].bill.toFixed(2)}h | Act:{" "}
                        {weekTotals[currentWeek].act.toFixed(2)}h
                      </span>
                    </h3>
                  </div>
                )}
                {showSeparator && (
                  <div className="col-span-full mt-4 mb-2">
                    <h3 className="text-sm font-black tracking-widest uppercase text-orange-500 border-b border-orange-500/20 pb-2 flex items-center gap-4">
                      <span>{currentGroup}</span>
                      <span className="font-mono font-normal text-[10px] text-zinc-400">
                        Alloc: {dateTotals[currentGroup].alloc.toFixed(2)}h |
                        Bill: {dateTotals[currentGroup].bill.toFixed(2)}h | Act:{" "}
                        {dateTotals[currentGroup].act.toFixed(2)}h
                      </span>
                    </h3>
                  </div>
                )}
                <div className="bg-[#0b0b0b] rounded-2xl border border-zinc-800 hover:border-zinc-700/80 shadow-lg p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-orange-950/10 hover:shadow-xl group relative overflow-hidden">
                  {/* Accent glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div>
                    {/* Task Header info */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-bold text-zinc-150 text-base leading-snug group-hover:text-orange-450 transition-colors duration-200 truncate"
                          title={task.name}
                        >
                          <Link
                            href={`/${orgId}/${userId}/${task._originalId || task._id}`}
                          >
                            {task.name}
                          </Link>
                        </h3>
                        <div className="text-[11px] text-zinc-500 font-mono mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span>
                            Nick:{" "}
                            <strong className="text-zinc-300">
                              {task.nickName || "N/A"}
                            </strong>
                          </span>
                          {task.user && (
                            <span className="text-[10px] bg-zinc-900/80 px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-800/40">
                              by {task.user}
                            </span>
                          )}
                        </div>
                      </div>

                      {hasClickup && (
                        <a
                          href={clickupUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-black px-2 py-1 rounded-lg border border-orange-500/20 transition flex items-center gap-1 shrink-0"
                          title={`Open ClickUp: ${clickupLabel}`}
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{clickupLabel}</span>
                        </a>
                      )}
                    </div>

                    {/* Project Tag */}
                    <div className="flex items-center gap-2 mb-4">
                      <Link
                        href={`/${orgId}/${userId}/project/${encodeURIComponent(task.project)}`}
                        className="text-xs font-semibold text-zinc-350 bg-zinc-950 hover:bg-zinc-900 hover:text-white px-2.5 py-1.5 rounded-lg border border-zinc-800/80 transition-colors inline-flex items-center gap-1.5 max-w-full truncate"
                        title={`View tasks for project "${task.project}"`}
                      >
                        <Folder className="w-3.5 h-3.5 text-zinc-450 shrink-0" />
                        <span className="truncate">{task.project}</span>
                      </Link>

                      {handleCopyProjectDetails && (
                        <button
                          onClick={() => handleCopyProjectDetails(task.project)}
                          title={`Copy all details for project "${task.project}" as text`}
                          className="opacity-0 group-hover:opacity-100 text-[10px] bg-zinc-950 hover:bg-orange-655 text-zinc-400 hover:text-white p-1.5 rounded-lg border border-zinc-800/80 transition"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Metadata and Hours breakdown */}
                    <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-900 mb-4 space-y-3">
                      <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                        <span>Hours Metrics</span>
                        <span className="text-zinc-650">
                          (Alloc / Bill / Act)
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center font-mono">
                        <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800">
                          <div className="text-[10px] text-zinc-500">
                            Allocated
                          </div>
                          <div className="text-orange-400 font-bold text-xs mt-0.5">
                            {task.bill?.allocatedHours || 0}h
                          </div>
                        </div>
                        <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800">
                          <div className="text-[10px] text-zinc-500">
                            Billed
                          </div>
                          <div className="text-amber-400 font-bold text-xs mt-0.5">
                            {task.bill?.billedHours || 0}h
                          </div>
                        </div>
                        <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800">
                          <div className="text-[10px] text-zinc-500">
                            Actual
                          </div>
                          <div className="text-yellow-500 font-bold text-xs mt-0.5">
                            {task.bill?.actualHours || 0}h
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tags & History bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {dynamicFields
                          .filter(
                            (f) =>
                              f.name !== "project" &&
                              (!f.displayLocation ||
                                f.displayLocation === "card" ||
                                f.displayLocation === "both" ||
                                f.displayLocation === "both_and_filter"),
                          )
                          .map((col) => {
                            const val =
                              task.dynamicValues?.[col.name] ?? task[col.name];
                            if (val === undefined || val === null || val === "")
                              return null;
                            const displayVal =
                              typeof val === "boolean"
                                ? val
                                  ? "Yes"
                                  : "No"
                                : String(val);
                            return (
                              <span
                                key={col.name}
                                className="inline-block px-2.5 py-0.5 rounded-md font-bold text-[9px] uppercase bg-zinc-900 text-zinc-350 border border-zinc-800"
                              >
                                {col.label}: {displayVal}
                              </span>
                            );
                          })}
                      </div>

                      <button
                        onClick={() => setActiveHistoryTask(task)}
                        className="bg-zinc-950 hover:bg-zinc-900 text-zinc-350 border border-zinc-800 px-2.5 py-1 rounded-lg text-[10px] font-mono transition flex items-center gap-1.5"
                        title="Click to view full status progression audit log"
                      >
                        <Clock className="w-3 h-3 text-zinc-400" />
                        <span>
                          {task.statusHistory?.length || 1} change
                          {(task.statusHistory?.length || 1) > 1 ? "s" : ""}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Footer Controls (Status Select & Actions) */}
                  <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-3 mt-auto">
                    <div className="flex-1 min-w-0">
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleQuickStatusChange(task._id, e.target.value)
                        }
                        className={`w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${statusColor} bg-black`}
                      >
                        {activeStatuses.map((s) => (
                          <option
                            key={s}
                            value={s}
                            className="bg-black text-zinc-200"
                          >
                            {s.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => openEditModal(task)}
                        className="bg-zinc-955 hover:bg-zinc-900 text-zinc-350 hover:text-white p-2 rounded-lg border border-zinc-800 transition-colors"
                        title="Edit task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteTask(task._id)}
                        className="bg-zinc-955 hover:bg-rose-955/40 text-zinc-400 hover:text-rose-350 p-2 rounded-lg border border-zinc-800 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
