"use client";

import { useState, useEffect } from "react";
import { Settings, Plus, X, RefreshCw, GripVertical } from "lucide-react";
import SectionCard from "@/components/SectionCard";
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
import { apiClient } from "@/lib/apiClient";

function SortableStatusItem({ id, status, onRemove, onRename }) {
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
      className="p-2.5 bg-black border border-zinc-800 rounded-xl flex justify-between items-center group mb-2 z-10 relative"
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        {isEditing ? (
          <input
            autoFocus
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="text-xs font-semibold text-zinc-150 bg-zinc-950 border border-emerald-500/50 px-2 py-0.5 rounded-md focus:outline-none focus:border-emerald-500 w-48"
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className="text-xs font-semibold text-zinc-300 cursor-text hover:text-zinc-100 transition"
            title="Click to edit"
          >
            {status}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => onRemove(status)}
        className="text-zinc-600 hover:text-rose-400 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function StatusConfig({ initialStatuses, orgId }) {
  const [statuses, setStatuses] = useState([]);
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (initialStatuses && Array.isArray(initialStatuses)) {
      setStatuses(initialStatuses);
    }
  }, [initialStatuses]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
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

  const handleAddStatus = (e) => {
    e.preventDefault();
    const name = newStatus.trim();
    if (!name) return;

    if (statuses.some((s) => s.toLowerCase() === name.toLowerCase())) {
      setError("Status option already exists.");
      return;
    }

    setStatuses([...statuses, name]);
    setNewStatus("");
    setError("");
    setSuccess("");
  };

  const handleRemoveStatus = (statusToRemove) => {
    setStatuses(statuses.filter((s) => s !== statusToRemove));
    setError("");
    setSuccess("");
  };

  const handleRenameStatus = (oldName, newName) => {
    const updated = statuses.map((s) => (s === oldName ? newName : s));
    setStatuses(updated);
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await apiClient.updateStatuses(statuses, orgId);
      if (!res.success)
        throw new Error(res.error || "Failed to update statuses");
      setSuccess("Statuses updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard>
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-zinc-800 flex items-center gap-2">
          <Settings className="w-4 h-4 text-orange-500" />
          <span>Status Configuration</span>
        </h3>
        <p className="text-[10.5px] text-zinc-405 mt-1">
          Manage the global list of statuses and drag them to set their display
          order.
        </p>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-955/20 border border-rose-900/30 rounded-xl text-rose-350 text-xs">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-955/20 border border-emerald-900/30 rounded-xl text-emerald-350 text-xs">
            {success}
          </div>
        )}

        <form onSubmit={handleAddStatus} className="flex gap-2">
          <input
            type="text"
            placeholder="new_status_name..."
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            disabled={!newStatus.trim()}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </form>

        <div className="max-h-80 overflow-y-auto pr-1">
          {statuses.length === 0 ? (
            <div className="text-center py-6 text-zinc-555 text-xs">
              No statuses configured.
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
                {statuses.map((status) => (
                  <SortableStatusItem
                    key={status}
                    id={status}
                    status={status}
                    onRemove={handleRemoveStatus}
                    onRename={handleRenameStatus}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-lg shadow-orange-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Status Order & List"
          )}
        </button>
      </div>
    </SectionCard>
  );
}
