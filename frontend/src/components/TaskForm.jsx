import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeTaskForm } from "../store/taskSlice";
import { useTasks } from "../hooks/useTasks";

export default function TaskForm() {
  const dispatch = useDispatch();
  const { isFormOpen, isEditing, selectedTask } = useSelector(
    (state) => state.tasks,
  );
  const { createTask, updateTask, tasks, isCreating, isUpdating } = useTasks();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditing && selectedTask) {
      setTitle(selectedTask.title);
      setDescription(selectedTask.description || "");
      setStatus(selectedTask.status);
    } else {
      setTitle("");
      setDescription("");
      setStatus("pending");
    }
    setError("");
  }, [isEditing, selectedTask, isFormOpen]);

  if (!isFormOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    try {
      if (isEditing && selectedTask) {
        await updateTask({
          id: selectedTask.id,
          data: {
            title: title.trim(),
            description: description.trim() || null,
            status,
          },
        });
      } else {
        await createTask({
          title: title.trim(),
          description: description.trim() || null,
        });
      }
      dispatch(closeTaskForm());
    } catch (err) {
      setError(
        err.response?.data?.detail || "An error occurred. Please try again.",
      );
    }
  };

  // Available tasks for dependency selection (exclude current task)
  const availableTasks = tasks.filter(
    (t) => !isEditing || t.id !== selectedTask?.id,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            onClick={() => dispatch(closeTaskForm())}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Enter task title"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Enter task description (optional)"
            />
          </div>

          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => dispatch(closeTaskForm())}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isCreating || isUpdating
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
