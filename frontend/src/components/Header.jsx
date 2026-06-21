import { useAuth } from "../hooks/useAuth";

export default function Header() {
  const { user, logout, isLoggingOut } = useAuth();

  return (
    <header
      className="relative border-b border-gray-200 bg-cover bg-center shadow-sm h-30"
      style={{
        backgroundImage: "url('/axalin_consultancy_cover.jpg')",
        backgroundPosition: "30% 20%",
      }}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content - relative to appear above the overlay */}
      <div className="relative mx-auto flex max-w-7xl items-start px-6 py-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Axalin Task Management Solutions
          </h1>
          <p className="text-xs text-gray-200">
            One stop solution for your task management needs
          </p>
          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm font-medium text-white">
              {user?.username || "User"}
            </span>
            <button
              onClick={logout}
              disabled={isLoggingOut}
              className="rounded-md bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30 disabled:opacity-50"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
