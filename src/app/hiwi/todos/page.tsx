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
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold dark:text-gray-100">Meine ToDos (Hiwi)</h1>
      <p className="text-gray-600 dark:text-gray-400">Verwalte deine Aufgaben rund um die Hiwi-Tätigkeit.</p>

      <form onSubmit={handleCreate} className="flex gap-2 my-4">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Neue Aufgabe..."
          className="flex-1 rounded-md border p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Hinzufügen</button>
      </form>

      <div className="space-y-2">
        {todos.map((todo) => (
          <div key={todo.id} className="flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleToggle(todo.id, todo.done)}
                className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                  todo.done ? "bg-green-500 border-green-500 text-white" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {todo.done && <Check className="h-4 w-4" />}
              </button>
              <span className={`text-sm ${todo.done ? "line-through text-gray-500 dark:text-gray-500" : "text-gray-900 dark:text-gray-100"}`}>
                {todo.title}
              </span>
            </div>
            <button onClick={() => handleDelete(todo.id)} className="text-red-500 hover:text-red-700 p-1">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {todos.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">Keine ToDos vorhanden.</p>}
      </div>
    </div>
  );
}
