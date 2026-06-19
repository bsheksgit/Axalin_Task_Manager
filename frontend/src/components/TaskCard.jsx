import { useState } from "react";
import { useDispatch } from "react-redux";
import { openTaskForm } from "../store/taskSlice";
import { useTasks } from "../hooks/useTasks";
import ConfirmModal from "./ConfirmModal";

const statusConfig = {
  pending: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  in_progress: {
    label: "In Progress",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-400",
  },
  completed: {
    label: "Completed",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-400",
  },
  blocked: {
    label: "Blocked",
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-400",
  },
};

export default function TaskCard({ task }) {
  const dispatch = useDispatch();
  const { updateTask, deleteTask, isUpdating } = useTasks();
  const config = statusConfig[task.status] || statusConfig.pending;

  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    mode: "confirm",
    title: "",
    message: "",
    onConfirm: null,
  });

  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  const handleStatusToggle = async () => {
    if (task.status === "completed") {
      await updateTask({ id: task.id, data: { status: "pending" } });
    } else {
      await updateTask({ id: task.id, data: { status: "completed" } });
    }
  };

  const handleDelete = () => {
    setModal({
      isOpen: true,
      mode: "confirm",
      title: "Delete Task",
      message: `Delete task "${task.title}"?`,
      onConfirm: async () => {
        try {
          await deleteTask(task.id);
          closeModal();
        } catch (err) {
          setModal({
            isOpen: true,
            mode: "alert",
            title: "Error",
            message: err.response?.data?.detail || "Failed to delete task",
            onConfirm: null,
          });
        }
      },
    });
  };

  return (
    <>
      <ConfirmModal
        isOpen={modal.isOpen}
        mode={modal.mode}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onCancel={closeModal}
        confirmText="Delete"
      />
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className={`text-sm font-semibold text-gray-900 truncate ${
                  task.status === "completed"
                    ? "line-through text-gray-400"
                    : ""
                }`}
              >
                {task.title}
              </h3>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
                ></span>
                {config.label}
              </span>
            </div>
            {task.description && (
              <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                {task.description}
              </p>
            )}
            {task.dependencies && task.dependencies.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {task.dependencies.map((dep) => (
                  <span
                    key={dep.id}
                    className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs ${
                      dep.depends_on_task_status === "completed"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    ← {dep.depends_on_task_title || "Unknown"}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleStatusToggle}
              disabled={isUpdating}
              className={`rounded p-1.5 text-xs font-medium transition-colors ${
                task.status === "completed"
                  ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              }`}
              title={
                task.status === "completed"
                  ? "Mark as pending"
                  : "Mark as completed"
              }
            >
              {task.status === "completed" ? "↩" : "✓"}
            </button>
            <button
              onClick={() => dispatch(openTaskForm(task))}
              className="rounded p-1.5 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              title="Edit task"
            >
              ✎
            </button>
            <button
              onClick={handleDelete}
              className="rounded p-1.5 text-xs text-gray-400 hover:bg-red-50 hover:text-red-500"
              title="Delete task"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
