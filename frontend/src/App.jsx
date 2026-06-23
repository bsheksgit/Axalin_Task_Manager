import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider, useSelector, useDispatch } from "react-redux";
import { store } from "./store";
import { clearGlobalError } from "./store/errorSlice";
import SignupLoginPage from "./pages/SignupLoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Snackbar from "./components/Snackbar";
import ErrorBoundary from "./components/ErrorBoundary";
import ErrorPage from "./components/ErrorPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const dispatch = useDispatch();
  const { hasError, code, message } = useSelector((state) => state.error);

  const handleRetry = () => {
    dispatch(clearGlobalError());
  };

  if (hasError) {
    return <ErrorPage code={code} message={message} onRetry={handleRetry} />;
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Snackbar />
        <Routes>
          <Route path="/login" element={<SignupLoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<ErrorPage code="404" />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
