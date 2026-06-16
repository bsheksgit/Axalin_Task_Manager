import { useState } from "react";
import { useTasks } from "../hooks/useTasks";

const statusConfig = {
  pending: { label: "Pending", class: "text-amber-600 bg-amber-50" },
  in_progress: { label: "In Progress", class: "text-blue-600 bg-blue-50" },
  completed: { label: "Completed", class: "text-emerald-600 bg-emerald-50" },
  blocked: { label: "Blocked", class: "text-rose-600 bg-rose-50" },
};

export default function DependencyList() {
  const { dependencies, tasks, addDependency, removeDependency, isLoading } =
    useTasks();
  const [selectedTask, setSelectedTask] = useState("");
  const [selectedDep, setSelectedDep] = useState("");
  const [error, setError] = useState("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  const handleAddDependency = async () => {
    if (!selectedTask || !selectedDep) {
      setError("Please select both a task and a dependency");
      return;
    }
    if (selectedTask === selectedDep) {
      setError("A task cannot depend on itself");
      return;
    }
    try {
      setError("");
      await addDependency({
        taskId: selectedTask,
        dependsOnTaskId: selectedDep,
      });
      setSelectedTask("");
      setSelectedDep("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add dependency");
    }
  };

  const handleRemoveDependency = async (taskId, dependencyId) => {
    try {
      await removeDependency({ taskId, dependencyId });
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to remove dependency");
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Task Dependencies
      </h2>

      {/* Add Dependency Form */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-medium text-gray-700">
          Add Dependency
        </h3>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Task
            </label>
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select a task...</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center pb-2 text-gray-400 text-lg">
            ← depends on
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Depends On
            </label>
            <select
              value={selectedDep}
              onChange={(e) => setSelectedDep(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select a dependency...</option>
              {tasks
                .filter((t) => t.id !== selectedTask)
                .map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
            </select>
          </div>
          <button
            onClick={handleAddDependency}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Add
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {/* Dependencies Table */}
      {dependencies.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No dependencies defined</p>
          <p className="mt-1 text-sm text-gray-400">
            Use the form above to add task dependencies
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Task
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Task Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Depends On
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Dependency Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {dependencies.map((dep) => {
                const taskStatus =
                  statusConfig[dep.task_status] || statusConfig.pending;
                const depStatus =
                  statusConfig[dep.depends_on_task_status] ||
                  statusConfig.pending;
                return (
                  <tr key={dep.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                      {dep.task_title}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${taskStatus.class}`}
                      >
                        {taskStatus.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                      {dep.depends_on_task_title}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${depStatus.class}`}
                      >
                        {depStatus.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        onClick={() =>
                          handleRemoveDependency(dep.task_id, dep.id)
                        }
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
