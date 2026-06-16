import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApi } from "../api/taskApi";

export function useTasks() {
  const queryClient = useQueryClient();

  // Get all tasks
  const tasksQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: taskApi.getTasks,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Get all dependencies
  const dependenciesQuery = useQuery({
    queryKey: ["dependencies"],
    queryFn: taskApi.getAllDependencies,
    staleTime: 30 * 1000,
  });

  // Create task
  const createTaskMutation = useMutation({
    mutationFn: taskApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Update task
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => taskApi.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dependencies"] });
    },
  });

  // Delete task
  const deleteTaskMutation = useMutation({
    mutationFn: taskApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dependencies"] });
    },
  });

  // Add dependency
  const addDependencyMutation = useMutation({
    mutationFn: ({ taskId, dependsOnTaskId }) =>
      taskApi.addDependency(taskId, dependsOnTaskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dependencies"] });
    },
  });

  // Remove dependency
  const removeDependencyMutation = useMutation({
    mutationFn: ({ taskId, dependencyId }) =>
      taskApi.removeDependency(taskId, dependencyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dependencies"] });
    },
  });

  return {
    // Queries
    tasks: tasksQuery.data?.tasks || [],
    totalTasks: tasksQuery.data?.total || 0,
    dependencies: dependenciesQuery.data?.dependencies || [],
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    error: tasksQuery.error,
    refetchTasks: tasksQuery.refetch,

    // Mutations
    createTask: createTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
    addDependency: addDependencyMutation.mutateAsync,
    removeDependency: removeDependencyMutation.mutateAsync,

    // Mutation states
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    createError: createTaskMutation.error,
    updateError: updateTaskMutation.error,
    deleteError: deleteTaskMutation.error,
  };
}
