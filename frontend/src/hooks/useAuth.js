import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { authApi } from "../api/authApi";
import { setUser, clearUser, setLoading } from "../store/authSlice";

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  // Check if user is authenticated on mount
  const { isLoading: isCheckingAuth } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const userData = await authApi.getMe();
        dispatch(setUser(userData));
        return userData;
      } catch {
        dispatch(clearUser());
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Listen for unauthorized events
  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch(clearUser());
      queryClient.clear();
      navigate("/login");
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [dispatch, navigate, queryClient]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      dispatch(setUser(data.user));
      navigate("/dashboard");
    },
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (data) => {
      dispatch(setUser(data.user));
      navigate("/dashboard");
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      dispatch(clearUser());
      queryClient.clear();
      navigate("/login");
    },
  });

  return {
    user,
    isAuthenticated,
    loading: loading || isCheckingAuth,
    login: loginMutation.mutateAsync,
    signup: signupMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    loginError: loginMutation.error,
    signupError: signupMutation.error,
    isLoggingIn: loginMutation.isPending,
    isSigningUp: signupMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
