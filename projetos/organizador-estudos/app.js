const STORAGE_KEY = "iure-study-planner-v1";
const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#task-list");
const count = document.querySelector("#task-count");
const emptyState = document.querySelector("#empty-state");
const filterButtons = [...document.querySelectorAll("[data-filter]")];

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter(task => typeof task.text === "string" && typeof task.done === "boolean") : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks() {
  const visibleTasks = tasks.filter(task => {
    if (currentFilter === "pending") return !task.done;
    if (currentFilter === "done") return task.done;
    return true;
  });
  const pending = tasks.filter(task => !task.done).length;
  count.textContent = `${pending} ${pending === 1 ? "tarefa pendente" : "tarefas pendentes"}`;
  list.replaceChildren();
  emptyState.hidden = visibleTasks.length > 0;

  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = `task-item${task.done ? " done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", `Marcar como ${task.done ? "pendente" : "concluída"}: ${task.text}`);
    checkbox.addEventListener("change", () => updateTask(task.id, { done: checkbox.checked }));

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const remove = document.createElement("button");
    remove.className = "remove-button";
    remove.type = "button";
    remove.textContent = "Remover";
    remove.setAttribute("aria-label", `Remover tarefa: ${task.text}`);
    remove.addEventListener("click", () => {
      tasks = tasks.filter(entry => entry.id !== task.id);
      saveTasks();
      renderTasks();
    });

    item.append(checkbox, text, remove);
    list.append(item);
  });
}

function updateTask(id, changes) {
  tasks = tasks.map(task => task.id === id ? { ...task, ...changes } : task);
  saveTasks();
  renderTasks();
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  tasks.unshift({ id: crypto.randomUUID(), text, done: false });
  saveTasks();
  input.value = "";
  input.focus();
  renderTasks();
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach(filter => {
      const active = filter === button;
      filter.classList.toggle("active", active);
      filter.setAttribute("aria-pressed", String(active));
    });
    renderTasks();
  });
});

renderTasks();
