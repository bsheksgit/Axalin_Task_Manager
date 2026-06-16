import { useDispatch, useSelector } from "react-redux";
import { setActiveTab } from "../store/taskSlice";

export default function Sidebar() {
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.tasks.activeTab);

  const tabs = [
    { id: "tasks", label: "Tasks", icon: "📋" },
    { id: "relationships", label: "Relationships", icon: "🔗" },
  ];

  return (
    <aside className="w-56 border-r border-gray-200 bg-white">
      <nav className="p-4">
        <ul className="space-y-1">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => dispatch(setActiveTab(tab.id))}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
