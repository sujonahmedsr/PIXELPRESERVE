"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type TaskStatus = "todo" | "progress" | "done";
type TaskPriority = "low" | "medium" | "high";
type TaskFilter = "all" | TaskStatus;
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
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<TaskFilter>("all");
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
  const visibleTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesFilter = filter === "all" || task.status === filter;
      const matchesQuery =
        !normalizedQuery ||
        [task.title, task.project, task.client].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        );
      return matchesFilter && matchesQuery;
    });
  }, [filter, query, tasks]);

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

  function removeTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function formatDueDate(value: string) {
    if (!value) return "No deadline";
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(`${value}T00:00:00`));
  }

  return (
    <main className="min-h-screen bg-[#f4f6f1] px-4 py-4 text-[#18231f] sm:px-6 lg:px-10 lg:py-6">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between rounded-2xl bg-[#18231f] px-5 py-4 text-white shadow-[0_18px_50px_rgba(24,35,31,.14)] sm:px-7">
          <a className="flex items-center gap-3 text-lg font-medium" href="/">
            <span className="grid size-9 place-items-center rounded-xl bg-[#157c62] text-white">
              ✦
            </span>{" "}
            PixelPreserve
          </a>
          <a
            className="text-sm font-medium text-[#d8f36a] transition hover:text-white"
            href="/"
          >
            Back to toolkit <span aria-hidden="true">-&gt;</span>
          </a>
        </header>

        <section className="flex flex-col justify-between gap-6 px-1 py-8 sm:px-3 lg:flex-row lg:items-end lg:py-10">
          <div>
            <p className="font-mono text-xs font-semibold tracking-[.2em] text-[#16866b]">
              OPERATIONS / AUG 21, 2026
            </p>
            <h1 className="mt-4 max-w-3xl text-[40px] font-semibold leading-[1.04] tracking-[-1.8px] sm:text-5xl lg:text-[60px]">
              Your work, in <span className="text-[#df795f]">motion.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#687770]">
              A focused command center for the projects, deadlines, and details
              that move your studio forward.
            </p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(230px,25%)_minmax(0,75%)] lg:items-start">
          <aside className="grid gap-4 lg:sticky lg:top-6">
            <section className="rounded-2xl bg-[#18231f] p-5 text-white shadow-[0_16px_40px_rgba(24,35,31,.12)] sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs tracking-[.16em] text-[#d8f36a]">
                    DELIVERY HEALTH
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold">
                    Overall progress
                  </h2>
                </div>
                <strong className="text-3xl font-semibold text-[#d8f36a]">
                  {progress}%
                </strong>
              </div>
              <div
                className="mt-7 h-2 overflow-hidden rounded-full bg-white/15"
                role="progressbar"
                aria-label="Overall task progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <div
                  className="h-full rounded-full bg-[#d8f36a] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-4 text-sm text-white/60">
                {tasks.filter((task) => task.status === "done").length} of{" "}
                {tasks.length} tasks complete
              </p>
            </section>
            <section className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#dbe2d9] bg-[#dbe2d9]">
              {[
                { label: "All tasks", value: tasks.length },
                {
                  label: "In progress",
                  value: tasks.filter((task) => task.status === "progress")
                    .length,
                },
                {
                  label: "Completed",
                  value: tasks.filter((task) => task.status === "done").length,
                },
                { label: "Overdue", value: overdue },
              ].map((metric) => (
                <article className="bg-white p-4" key={metric.label}>
                  <p className="text-sm text-[#687770]">{metric.label}</p>
                  <strong
                    className={`mt-2 block text-3xl font-semibold ${metric.label === "Overdue" && metric.value ? "text-[#c65e45]" : ""}`}
                  >
                    {metric.value}
                  </strong>
                </article>
              ))}
            </section>
          </aside>

          <section
            aria-labelledby="task-board-title"
            className="min-w-0 rounded-2xl border border-[#dbe2d9] bg-white p-4 shadow-[0_14px_40px_rgba(24,35,31,.06)] sm:p-6 lg:p-7"
          >
            <div className="flex flex-col justify-between gap-5 border-b border-[#e4e9e2] pb-6 lg:flex-row lg:items-end">
              <div>
                <p className="font-mono text-xs font-semibold tracking-[.16em] text-[#16866b]">
                  LIVE BOARD
                </p>
                <h2
                  id="task-board-title"
                  className="mt-2 text-3xl font-semibold"
                >
                  Task board
                </h2>
                <p className="mt-2 text-base text-[#687770]">
                  Everything moving through delivery, at a glance.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#cbd7cc] bg-[#f8faf7] px-3 text-sm text-[#687770] shadow-[0_4px_12px_rgba(24,35,31,.04)] transition focus-within:border-[#16866b] focus-within:ring-2 focus-within:ring-[#16866b]/20 lg:min-w-64">
                  <span aria-hidden="true" className="text-base">
                    ⌕
                  </span>
                  <span className="sr-only">Search tasks</span>
                  <input
                    id="task-search"
                    className="w-full bg-transparent py-2.5 text-[#18231f] outline-none placeholder:text-[#9aa8a2]"
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search tasks"
                    value={query}
                  />
                </label>
                <label className="sr-only" htmlFor="task-filter">
                  Sort tasks by status
                </label>
                <select
                  id="task-filter"
                  className="rounded-xl border border-[#cbd7cc] bg-[#f8faf7] px-3 py-2.5 text-sm font-semibold text-[#18231f] shadow-[0_4px_12px_rgba(24,35,31,.04)] outline-none focus:border-[#16866b] focus:ring-2 focus:ring-[#16866b]/20"
                  onChange={(event) =>
                    setFilter(event.target.value as TaskFilter)
                  }
                  value={filter}
                >
                  <option value="all">All statuses</option>
                  <option value="todo">To do</option>
                  <option value="progress">In progress</option>
                  <option value="done">Complete</option>
                </select>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16866b] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(22,134,107,.18)] transition hover:-translate-y-0.5 hover:bg-[#106b56]"
                  onClick={() => setIsAdding(true)}
                  type="button"
                >
                  <span className="text-lg leading-none" aria-hidden="true">
                    +
                  </span>
                  Add task
                </button>
              </div>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {(["todo", "progress", "done"] as TaskStatus[]).map((status) => (
                <section
                  className="min-w-0 rounded-xl bg-[#f1f4ee] p-3.5"
                  key={status}
                  aria-labelledby={`column-${status}`}
                >
                  <div className="flex items-center justify-between border-b border-[#dfe7dc] pb-3">
                    <h3
                      id={`column-${status}`}
                      className="text-lg font-semibold"
                    >
                      {statusLabels[status]}
                    </h3>
                    <span className="grid size-7 place-items-center rounded-lg bg-white font-mono text-xs font-semibold text-[#687770]">
                      {tasks.filter((task) => task.status === status).length}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-3">
                    {visibleTasks
                      .filter((task) => task.status === status)
                      .map((task) => (
                        <article
                          className="rounded-xl border border-[#dbe2d9] bg-white p-4 shadow-[0_5px_15px_rgba(24,35,31,.04)]"
                          key={task.id}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="text-base font-semibold leading-6">
                              {task.title}
                            </h4>
                            <span
                              className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${task.priority === "high" ? "bg-[#fff0eb] text-[#c65e45]" : task.priority === "medium" ? "bg-[#fff7d7] text-[#8d6c13]" : "bg-[#e7f4ef] text-[#157c62]"}`}
                            >
                              {task.priority}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-5 text-[#687770]">
                            {task.project} <span aria-hidden="true">/</span>{" "}
                            {task.client}
                          </p>
                          <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#edf1ed] pt-3 text-sm text-[#687770]">
                            <span
                              className={
                                task.status !== "done" &&
                                task.due &&
                                new Date(task.due) < new Date("2026-08-21")
                                  ? "font-semibold text-[#c65e45]"
                                  : ""
                              }
                            >
                              {formatDueDate(task.due)}
                            </span>
                            <div className="flex items-center gap-3">
                              <button
                                aria-label={`Delete ${task.title}`}
                                className="grid size-8 place-items-center rounded-lg text-lg text-[#9aa8a2] transition hover:bg-[#fff0eb] hover:text-[#c65e45]"
                                onClick={() => removeTask(task.id)}
                                title="Delete task"
                                type="button"
                              >
                                x
                              </button>
                              <button
                                className="rounded-lg px-2 py-1 font-semibold text-[#16866b] transition hover:bg-[#e7f4ef]"
                                onClick={() => cycleStatus(task.id)}
                                type="button"
                              >
                                Next -&gt;
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    {!visibleTasks.some((task) => task.status === status) ? (
                      <p className="rounded-lg border border-dashed border-[#cbd7cc] px-3 py-7 text-center text-sm text-[#85918c]">
                        No tasks here.
                      </p>
                    ) : null}
                  </div>
                </section>
              ))}
            </div>
            {!visibleTasks.length ? (
              <div className="mt-4 rounded-xl border border-dashed border-[#cbd7cc] bg-[#f8faf7] p-8 text-center text-base text-[#687770]">
                No tasks match this view.
              </div>
            ) : null}
          </section>
        </div>

        {isAdding ? (
          <div
            className="fixed inset-0 z-10 grid place-items-center overflow-y-auto bg-[#18231f]/60 p-4 sm:p-6"
            role="presentation"
          >
            <form
              aria-labelledby="new-task-title"
              className="my-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
              onSubmit={addTask}
            >
              <div className="flex items-start justify-between gap-5 border-b border-[#e4e9e2] pb-5">
                <div>
                  <p className="font-mono text-xs font-semibold tracking-[.16em] text-[#16866b]">
                    NEW WORK ITEM
                  </p>
                  <h2
                    id="new-task-title"
                    className="mt-2 text-4xl font-semibold"
                  >
                    Add a task
                  </h2>
                </div>
                <button
                  aria-label="Close add task dialog"
                  className="grid size-10 place-items-center rounded-xl bg-[#f1f4ee] text-2xl text-[#687770] transition hover:bg-[#e7eee7]"
                  onClick={() => setIsAdding(false)}
                  type="button"
                >
                  x
                </button>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["title", "Task title"],
                    ["project", "Project"],
                    ["client", "Client"],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    className={`grid gap-2 text-base font-semibold ${key === "title" ? "sm:col-span-2" : ""}`}
                    key={key}
                  >
                    {label}
                    <input
                      className="rounded-xl border border-[#cbd7cc] px-3 py-3 text-base font-normal outline-none focus:border-[#16866b] focus:ring-2 focus:ring-[#16866b]/20"
                      value={draft[key]}
                      onChange={(event) =>
                        setDraft({ ...draft, [key]: event.target.value })
                      }
                      required={key === "title"}
                    />
                  </label>
                ))}
                <label className="grid gap-2 text-base font-semibold">
                  Deadline
                  <input
                    className="rounded-xl border border-[#cbd7cc] px-3 py-3 text-base font-normal outline-none focus:border-[#16866b]"
                    type="date"
                    value={draft.due}
                    onChange={(event) =>
                      setDraft({ ...draft, due: event.target.value })
                    }
                  />
                </label>
                <label className="grid gap-2 text-base font-semibold">
                  Priority
                  <select
                    className="rounded-xl border border-[#cbd7cc] bg-white px-3 py-3 text-base font-normal outline-none focus:border-[#16866b]"
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
                className="mt-7 w-full rounded-xl bg-[#16866b] px-4 py-3.5 text-base font-semibold text-white transition hover:bg-[#106b56]"
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
