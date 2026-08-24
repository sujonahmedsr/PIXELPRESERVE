import { Metadata } from "next"; // আপনার আসল কম্পোনেন্টটি এখানে ইম্পোর্ট করবেন
import Task_manager from "../components/Task_manager";

export const metadata: Metadata = {
  title: "PIXELPRESERVE | TASKS MANAGER & WORKFLOW COMMAND CENTER",
  description:
    "A focused command center and task board for managing developer projects, deadlines, and daily workflow.",
  keywords: [
    "Task manager",
    "Developer workflow",
    "Freelance project tracker",
    "Command center",
  ],
};

export default function TasksPage() {
  return <Task_manager />;
}
