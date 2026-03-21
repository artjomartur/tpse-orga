"use client";

import { useEffect, useState } from "react";
import { Check, Trash2 } from "lucide-react";

type Todo = { id: string; title: string; done: boolean };

export default function HiwiTodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");

  const loadTodos = () => {
    fetch("/api/hiwi/todos")
      .then((res) => res.json())
      .then((data) => setTodos(data.todos || []));
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await fetch("/api/hiwi/todos", { method: "POST", body: JSON.stringify({ title: newTitle }) });
    setNewTitle("");
    loadTodos();
  };

  const handleToggle = async (id: string, done: boolean) => {
    await fetch(`/api/hiwi/todos/${id}`, { method: "PUT", body: JSON.stringify({ done: !done }) });
    loadTodos();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Wirklich löschen?")) return;
    await fetch(`/api/hiwi/todos/${id}`, { method: "DELETE" });
    loadTodos();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Meine ToDos (Hiwi)</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Verwalte deine Aufgaben rund um die Hiwi-Tätigkeit.</p>
      </div>

      <form onSubmit={handleCreate} className="flex gap-3 my-6">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Neue Aufgabe..."
          className="flex-1 rounded-xl border border-slate-200/60 p-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-900/50 dark:border-slate-800/60 dark:text-slate-100"
        />
        <button type="submit" className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-blue-700">Hinzufügen</button>
      </form>

      <div className="space-y-3">
        {todos.map((todo) => (
          <div key={todo.id} className="group flex items-center justify-between p-4 rounded-xl border border-slate-200/60 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900/50 dark:border-slate-800/60">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleToggle(todo.id, todo.done)}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  todo.done ? "bg-green-500 border-green-500 text-white" : "border-slate-300 dark:border-slate-600"
                }`}
              >
                {todo.done && <Check className="h-4 w-4" />}
              </button>
              <span className={`text-base font-medium ${todo.done ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-slate-100"}`}>
                {todo.title}
              </span>
            </div>
            <button onClick={() => handleDelete(todo.id)} className="text-slate-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
        {todos.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">Keine ToDos vorhanden.</p>}
      </div>
    </div>
  );
}
