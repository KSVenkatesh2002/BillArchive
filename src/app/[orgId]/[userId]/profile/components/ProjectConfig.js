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

function SortableProjectItem({ id, project, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
          className="text-zinc-600 hover:text-zinc-400 cursor-grab"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <span className="text-xs font-semibold text-zinc-300">{project}</span>
      </div>
      <button
        type="button"
        onClick={() => onRemove(project)}
        className="text-zinc-600 hover:text-rose-400 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function ProjectConfig({ initialDynamicFields }) {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (initialDynamicFields) {
      const projectField = initialDynamicFields.find(
        (f) => f.name === "project",
      );
      if (projectField && projectField.options) {
        setProjects(projectField.options);
      }
    }
  }, [initialDynamicFields]);

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
      setProjects((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    const val = newProject.trim();
    if (!val) return;
    if (projects.includes(val)) {
      setError("Project already exists in the list.");
      return;
    }
    setProjects([...projects, val]);
    setNewProject("");
    setError("");
    setSuccess("");
  };

  const handleRemoveProject = (projectToRemove) => {
    setProjects(projects.filter((p) => p !== projectToRemove));
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Fetch latest config to avoid overwriting other fields
      const getRes = await fetch("/api/organization/config");
      const data = await getRes.json();
      if (!data.success) throw new Error("Failed to fetch org config");

      let currentFields = data.organization.dynamicFields || [];
      const projectFieldIndex = currentFields.findIndex(
        (f) => f.name === "project",
      );

      if (projectFieldIndex >= 0) {
        currentFields[projectFieldIndex].options = projects;
      } else {
        currentFields.push({
          name: "project",
          label: "Project",
          type: "dropdown",
          options: projects,
          isRequired: true,
          displayLocation: "table",
        });
      }

      const postRes = await fetch("/api/organization/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dynamicFields: currentFields,
          enabledFields: data.organization.enabledFields,
        }),
      });

      const postData = await postRes.json();
      if (!postData.success)
        throw new Error(postData.error || "Failed to save projects");

      setSuccess("Project list updated successfully.");
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
          <Settings className="w-4 h-4 text-emerald-500" />
          <span>Project Configuration</span>
        </h3>
        <p className="text-[10.5px] text-zinc-405 mt-1">
          Manage the global list of projects available to all organization
          members and drag to reorder.
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

        <form onSubmit={handleAddProject} className="flex gap-2">
          <input
            type="text"
            placeholder="New Project Name..."
            value={newProject}
            onChange={(e) => setNewProject(e.target.value)}
            className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!newProject.trim()}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </form>

        <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
          {projects.length === 0 ? (
            <div className="text-center py-6 text-zinc-555 text-xs">
              No projects configured.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={projects}
                strategy={verticalListSortingStrategy}
              >
                {projects.map((project) => (
                  <SortableProjectItem
                    key={project}
                    id={project}
                    project={project}
                    onRemove={handleRemoveProject}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Project List & Order"
          )}
        </button>
      </div>
    </SectionCard>
  );
}
