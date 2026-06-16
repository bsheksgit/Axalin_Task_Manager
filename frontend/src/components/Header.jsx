import { useAuth } from "../hooks/useAuth";

export default function Header() {
  const { user, logout, isLoggingOut } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-indigo-700">
            Axalin Task Management Solutions
          </h1>
          <p className="text-xs text-gray-500">
            One stop solution for your task management needs
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">
            {user?.username || "User"}
          </span>
          <button
            onClick={logout}
            disabled={isLoggingOut}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </header>
  );
}
