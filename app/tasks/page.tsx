"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type TaskStatus = "todo" | "progress" | "done";
type TaskPriority = "low" | "medium" | "high";
type Task = {
  id: string;
  title: string;
  project: string;
  client: string;
  due: string;
  priority: TaskPriority;
  status: TaskStatus;
};

const starterTasks: Task[] = [
  {
    id: "1",
    title: "Homepage responsive polish",
    project: "Northstar Store",
    client: "Rafiq & Co.",
    due: "2026-08-25",
    priority: "high",
    status: "progress",
  },
  {
    id: "2",
    title: "Checkout API error states",
    project: "Northstar Store",
    client: "Rafiq & Co.",
    due: "2026-08-29",
    priority: "medium",
    status: "todo",
  },
  {
    id: "3",
    title: "SEO metadata handoff",
    project: "Atlas Content",
    client: "Maya Studio",
    due: "2026-08-22",
    priority: "high",
    status: "done",
  },
];

const statusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  progress: "In progress",
  done: "Complete",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(starterTasks);
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    project: "",
    client: "",
    due: "",
    priority: "medium" as TaskPriority,
  });

  useEffect(() => {
    const saved = window.localStorage.getItem("pixel-preserve-tasks");
    if (saved) setTasks(JSON.parse(saved) as Task[]);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("pixel-preserve-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const progress = useMemo(
    () =>
      tasks.length
        ? Math.round(
            (tasks.filter((task) => task.status === "done").length /
              tasks.length) *
              100,
          )
        : 0,
    [tasks],
  );
  const overdue = tasks.filter(
    (task) =>
      task.status !== "done" &&
      task.due &&
      new Date(task.due) < new Date("2026-08-21"),
  ).length;

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim()) return;
    setTasks((current) => [
      ...current,
      { ...draft, id: crypto.randomUUID(), status: "todo" },
    ]);
    setDraft({
      title: "",
      project: "",
      client: "",
      due: "",
      priority: "medium",
    });
    setIsAdding(false);
  }

  function cycleStatus(id: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              status:
                task.status === "todo"
                  ? "progress"
                  : task.status === "progress"
                    ? "done"
                    : "todo",
            }
          : task,
      ),
    );
  }

  return (
    <main className="min-h-screen bg-[#f7faf7] px-6 py-7 text-[#17201e] md:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between border-b border-[#dce5df] pb-7">
          <a className="flex items-center gap-3 text-lg font-medium" href="/">
            <span className="grid size-9 place-items-center rounded-xl bg-[#157c62] text-white">
              ✦
            </span>{" "}
            PixelPreserve
          </a>
          <a className="text-base font-medium text-[#157c62]" href="/">
            Back to toolkit ↗
          </a>
        </header>
        <section className="py-20">
          <p className="font-mono text-xs tracking-[.16em] text-[#157c62]">
            PROJECT CONTROL ROOM
          </p>
          <div className="mt-4 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <h1 className="max-w-3xl text-[40px] font-medium leading-[1.08] tracking-tight">
                Keep the work{" "}
                <em className="font-serif font-medium text-[#df795f]">
                  moving.
                </em>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#71807b]">
                Client projects, deadlines and delivery momentum in one calm
                workspace.
              </p>
            </div>
            <button
              className="rounded-lg bg-[#17201e] px-5 py-3 text-base font-medium text-white transition hover:bg-[#157c62]"
              onClick={() => setIsAdding(true)}
              type="button"
            >
              + Add task
            </button>
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-4">
          {[
            { label: "All tasks", value: tasks.length },
            {
              label: "In progress",
              value: tasks.filter((task) => task.status === "progress").length,
            },
            {
              label: "Completed",
              value: tasks.filter((task) => task.status === "done").length,
            },
            { label: "Overdue", value: overdue },
          ].map((metric) => (
            <article
              className="rounded-2xl border border-[#dce5df] bg-white p-5"
              key={metric.label}
            >
              <p className="text-base text-[#71807b]">{metric.label}</p>
              <strong className="mt-3 block text-[40px] font-medium">
                {metric.value}
              </strong>
            </article>
          ))}
        </section>
        <section className="mt-5 rounded-2xl border border-[#dce5df] bg-white p-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-mono text-xs tracking-[.16em] text-[#157c62]">
                DELIVERY HEALTH
              </p>
              <h2 className="mt-2 text-[40px] font-medium">Overall progress</h2>
            </div>
            <strong className="text-3xl text-[#157c62]">{progress}%</strong>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#e8f0eb]">
            <div
              className="h-full rounded-full bg-[#157c62] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>
        <section className="mt-12">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[40px] font-medium">Task board</h2>
            <span className="font-mono text-xs text-[#71807b]">
              SAVED LOCALLY
            </span>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {(["todo", "progress", "done"] as TaskStatus[]).map((status) => (
              <div className="rounded-2xl bg-[#edf4ef] p-4" key={status}>
                <div className="flex items-center justify-between">
                  <h3 className="text-[40px] font-medium">
                    {statusLabels[status]}
                  </h3>
                  <span className="rounded-full bg-white px-3 py-1 font-mono text-xs">
                    {tasks.filter((task) => task.status === status).length}
                  </span>
                </div>
                <div className="mt-4 grid gap-3">
                  {tasks
                    .filter((task) => task.status === status)
                    .map((task) => (
                      <article
                        className="rounded-xl border border-[#dce5df] bg-white p-4"
                        key={task.id}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-base font-medium">
                            {task.title}
                          </h4>
                          <span
                            className={`text-base font-medium uppercase ${task.priority === "high" ? "text-[#df795f]" : "text-[#157c62]"}`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-[#71807b]">
                          {task.project} · {task.client}
                        </p>
                        <div className="mt-4 flex items-center justify-between border-t border-[#edf1ed] pt-3 text-sm text-[#71807b]">
                          <span>{task.due || "No deadline"}</span>
                          <button
                            className="text-base font-medium text-[#157c62]"
                            onClick={() => cycleStatus(task.id)}
                            type="button"
                          >
                            Next status ↗
                          </button>
                        </div>
                      </article>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>
        {isAdding ? (
          <div className="fixed inset-0 z-10 grid place-items-center bg-[#17201e]/30 p-5">
            <form
              className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-2xl"
              onSubmit={addTask}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-[40px] font-medium">New task</h2>
                <button
                  className="text-2xl"
                  onClick={() => setIsAdding(false)}
                  type="button"
                >
                  ×
                </button>
              </div>
              <div className="mt-6 grid gap-4">
                {(
                  [
                    ["title", "Task title"],
                    ["project", "Project"],
                    ["client", "Client"],
                  ] as const
                ).map(([key, label]) => (
                  <label className="grid gap-2 text-base font-medium" key={key}>
                    {label}
                    <input
                      className="rounded-lg border border-[#dce5df] px-3 py-3 font-normal outline-none focus:border-[#157c62]"
                      value={draft[key]}
                      onChange={(event) =>
                        setDraft({ ...draft, [key]: event.target.value })
                      }
                      required={key === "title"}
                    />
                  </label>
                ))}
                <label className="grid gap-2 text-base font-medium">
                  Deadline
                  <input
                    className="rounded-lg border border-[#dce5df] px-3 py-3 font-normal"
                    type="date"
                    value={draft.due}
                    onChange={(event) =>
                      setDraft({ ...draft, due: event.target.value })
                    }
                  />
                </label>
                <label className="grid gap-2 text-base font-medium">
                  Priority
                  <select
                    className="rounded-lg border border-[#dce5df] px-3 py-3 font-normal"
                    value={draft.priority}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        priority: event.target.value as TaskPriority,
                      })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
              </div>
              <button
                className="mt-6 w-full rounded-lg bg-[#157c62] px-4 py-3 text-base font-medium text-white"
                type="submit"
              >
                Create task
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </main>
  );
}
