import { useSelector } from "react-redux";
import Layout from "../components/Layout";
import TaskList from "../components/TaskList";
import DependencyList from "../components/DependencyList";
import TaskForm from "../components/TaskForm";

export default function DashboardPage() {
  const activeTab = useSelector((state) => state.tasks.activeTab);

  return (
    <Layout>
      {activeTab === "tasks" ? <TaskList /> : <DependencyList />}
      <TaskForm />
    </Layout>
  );
}
