import { useDispatch } from "react-redux";
import { openTaskForm } from "../store/taskSlice";
import { useTasks } from "../hooks/useTasks";
import TaskCard from "./TaskCard";

export default function TaskList() {
  const dispatch = useDispatch();
  const { tasks, isLoading, isError, error, refetchTasks } = useTasks();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700">
          Error loading tasks: {error?.message || "Unknown error"}
        </p>
        <button
          onClick={refetchTasks}
          className="mt-3 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Tasks ({tasks.length})
        </h2>
        <button
          onClick={() => dispatch(openTaskForm())}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + New Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No tasks yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Create your first task to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
