"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "../layout";
import { Plus, GripVertical } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableStatusItem({ id, status, index, onRemove, onRenam, isLast }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(status);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    if (editValue.trim() && editValue.trim() !== status) {
      onRename(status, editValue.trim());
    } else {
      setEditValue(status);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(status);
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        (isLast ? "" : "border-b border-zinc-800 ") +
        "flex items-center justify-between py-2 bg-black hover:border-zinc-700  transition group z-10 relative"
      }
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-zinc-500 font-mono w-5">
          {(index + 1).toString().padStart(2, "0")}
        </span>

        {isEditing ? (
          <input
            autoFocus
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="text-xs font-bold text-zinc-150 uppercase tracking-wide bg-zinc-950 border border-orange-500/50 px-3 py-1 rounded-lg focus:outline-none focus:border-orange-500 w-48"
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className="text-xs font-bold text-zinc-150 uppercase tracking-wide bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-lg cursor-text hover:border-zinc-600 transition"
            title="Click to edit"
          >
            {status}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onRemove(status)}
          className="h-8 w-8 rounded-lg bg-rose-955/20 hover:bg-rose-900/30 border border-rose-900/30 text-rose-455 hover:text-rose-350 transition flex items-center justify-center text-[10px] font-bold"
          title="Delete Status"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function StatusesTab() {
  const { adminData, fetchAdminData } = useAdmin();

  const [statuses, setStatuses] = useState([]);
  const [newStatusName, setNewStatusName] = useState("");
  const [savingStatuses, setSavingStatuses] = useState(false);
  const [statusesSuccess, setStatusesSuccess] = useState("");
  const [statusesError, setStatusesError] = useState("");

  // Initialize state when adminData changes
  useEffect(() => {
    if (adminData?.statuses) {
      setStatuses(adminData.statuses);
    }
  }, [adminData]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setStatuses((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const removeStatus = (statusName) => {
    setStatuses(statuses.filter((s) => s !== statusName));
  };

  const renameStatus = (oldName, newName) => {
    const updated = statuses.map((s) => (s === oldName ? newName : s));
    setStatuses(updated);
  };

  const addStatus = () => {
    const name = newStatusName.trim();
    if (!name) return;

    if (statuses.some((s) => s.toLowerCase() === name.toLowerCase())) {
      setStatusesError("Status option already exists.");
      return;
    }
    setStatusesError("");
    setStatuses([...statuses, name]);
    setNewStatusName("");
  };

  const saveStatuses = async () => {
    setSavingStatuses(true);
    setStatusesSuccess("");
    setStatusesError("");
    try {
      const res = await apiClient.updateStatuses(statuses);
      if (res.success) {
        setStatusesSuccess("Task status configuration saved successfully!");
        setStatuses(res.statuses || []);
        fetchAdminData();
      } else {
        setStatusesError(res.error || "Failed to save status configuration.");
      }
    } catch (err) {
      setStatusesError("An error occurred while saving statuses.");
    } finally {
      setSavingStatuses(false);
    }
  };

  if (!adminData) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 space-y-6 shadow-2xl">
        <div>
          <h3 className="text-sm font-bold text-white">
            System Task Statuses Config
          </h3>
          <p className="text-[11px] text-zinc-450 mt-1 leading-relaxed">
            Reorder, add, or delete the status options for the dashboard tasks.
            These updates will reflect across all user accounts in real time.
          </p>
        </div>

        {statusesError && (
          <div className="p-3 bg-red-955/20 border border-red-900/30 rounded-xl text-red-300 text-xs">
            {statusesError}
          </div>
        )}

        {statusesSuccess && (
          <div className="p-3 bg-emerald-955/20 border border-emerald-900/30 rounded-xl text-emerald-350 text-xs">
            {statusesSuccess}
          </div>
        )}

        <div>
          {statuses.length === 0 ? (
            <div className="text-center py-6 text-zinc-500 text-xs">
              No status configurations found.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={statuses}
                strategy={verticalListSortingStrategy}
              >
                {statuses.map((status, index) => (
                  <SortableStatusItem
                    key={status}
                    id={status}
                    status={status}
                    index={index}
                    onRemove={removeStatus}
                    onRename={renameStatus}
                    isLast={index === statuses.length - 1}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={saveStatuses}
            disabled={savingStatuses}
            className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-lg shadow-orange-600/20 flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>{savingStatuses ? "Saving..." : "Save Status Changes"}</span>
          </button>
          <button
            onClick={() => setStatuses([...(adminData?.statuses || [])])}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs px-4 py-2.5 rounded-xl transition"
          >
            Discard Unsaved Changes
          </button>
        </div>
      </div>

      {/* Add Status Form */}
      <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800/80 space-y-4 h-fit shadow-2xl">
        <div className="border-b border-zinc-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Plus className="w-4.5 h-4.5 text-orange-450" />
            <span>Add New Status Option</span>
          </h3>
          <p className="text-[10px] text-zinc-450 mt-0.5">
            Append a new task status choice
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            addStatus();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-[11px] font-semibold text-zinc-405 mb-1">
              Status Name
            </label>
            <input
              type="text"
              placeholder="e.g. Ready for Deployment"
              value={newStatusName}
              onChange={(e) => setNewStatusName(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs py-3 rounded-xl border border-zinc-800 transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add to List</span>
          </button>
        </form>
      </div>
    </div>
  );
}
