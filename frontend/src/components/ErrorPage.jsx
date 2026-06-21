import { Link } from "react-router-dom";

const errorConfig = {
  404: {
    title: "404",
    subtitle: "Page not found",
    message: "The page you're looking for doesn't exist or has been moved.",
    icon: "🔍",
  },
  403: {
    title: "403",
    subtitle: "Access denied",
    message: "You don't have permission to access this page.",
    icon: "🔒",
  },
  500: {
    title: "500",
    subtitle: "Something went wrong",
    message: "An unexpected error occurred. Please try again later.",
    icon: "⚠️",
  },
  generic: {
    title: "Oops!",
    subtitle: "An error occurred",
    message: "Something went wrong. Please try refreshing the page.",
    icon: "❗",
  },
};

export default function ErrorPage({ code = "generic", onRetry }) {
  const config = errorConfig[code] || errorConfig.generic;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-4 text-6xl">{config.icon}</div>
        <h1 className="text-5xl font-bold text-gray-900">{config.title}</h1>
        <p className="mt-2 text-lg font-medium text-gray-600">
          {config.subtitle}
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
          {config.message}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Go to Dashboard
          </Link>
          {onRetry && (
            <button
              onClick={onRetry}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Try Again
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
}
