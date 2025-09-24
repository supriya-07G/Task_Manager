
// State
const state = {
  tasks: [],
  filter: "all",
  search: ""
};
// DOM elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const countPending = document.getElementById('count-pending');
const countCompleted = document.getElementById('count-completed');
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('theme-toggle');
const progressBar = document.getElementById('progress-bar');
const clearCompletedBtn = document.getElementById('clear-completed');
// Load theme
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️ Light Mode";
}
// Theme toggle
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const darkMode = document.body.classList.contains('dark');
  themeToggle.textContent = darkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
  localStorage.setItem("theme", darkMode ? "dark" : "light");
});

// Load tasks from LocalStorage
function loadTasks() {
  const data = localStorage.getItem('tasks');
  state.tasks = data ? JSON.parse(data) : [];
}
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(state.tasks));
}
// Add task
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  const newTask = { id: Date.now(), text, completed: false };
  state.tasks.push(newTask);
  saveTasks();

  taskInput.value = '';
  render();
});
// Search
searchInput.addEventListener('input', (e) => {
  state.search = e.target.value.toLowerCase();
  render();
});
// Filters
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.filter-btn.active')?.classList.remove('active');
    btn.classList.add('active');
    state.filter = btn.dataset.filter;
    render();
  });
});
// Clear Completed
clearCompletedBtn.addEventListener('click', () => {
  state.tasks = state.tasks.filter(t => !t.completed);
  saveTasks();
  render();
});

// Render
function render() {
  taskList.innerHTML = '';

  let tasksToShow = state.tasks.filter(task => {
    if (state.filter === "pending" && task.completed) return false;
    if (state.filter === "completed" && !task.completed) return false;
    if (state.search && !task.text.toLowerCase().includes(state.search)) return false;
    return true;
  });

  tasksToShow.forEach((task) => {
    const li = document.createElement('li');
    li.className = 'task-item';

    const leftDiv = document.createElement('div');
    leftDiv.className = 'task-left';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'toggle-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => {
      updateTask(task.id, { completed: checkbox.checked });
    });

    const textDiv = document.createElement('div');
    textDiv.className = 'task-text';
    textDiv.textContent = task.text;
    if (task.completed) textDiv.classList.add('task-completed');

    textDiv.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        finishEdit(textDiv, task.id);
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit(textDiv, task.text);
      }
    });

    leftDiv.appendChild(checkbox);
    leftDiv.appendChild(textDiv);

    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => startEdit(textDiv, task.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => removeTask(task.id));

    li.appendChild(leftDiv);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    taskList.appendChild(li);
  });

  // counts
  const pending = state.tasks.filter((t) => !t.completed).length;
  const completed = state.tasks.filter((t) => t.completed).length;
  countPending.textContent = pending;
  countCompleted.textContent = completed;

  // progress bar
  const total = state.tasks.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  progressBar.style.width = percent + "%";

  saveTasks();
}

/* ---------- Edit helpers ---------- */
let currentlyEditing = null;

function startEdit(textDiv, id) {
  if (currentlyEditing) return;
  currentlyEditing = { el: textDiv, id };
  textDiv.contentEditable = 'true';
  textDiv.focus();
  document.execCommand('selectAll', false, null);
  document.getSelection().collapseToEnd();
}
function finishEdit(textDiv, id) {
  const newText = textDiv.textContent.trim();
  if (!newText) {
    removeTask(id);
  } else {
    updateTask(id, { text: newText });
    textDiv.contentEditable = 'false';
    currentlyEditing = null;
  }
}
function cancelEdit(textDiv, original) {
  textDiv.textContent = original;
  textDiv.contentEditable = 'false';
  currentlyEditing = null;
}

/* ---------- Task operations ---------- */
function updateTask(id, updates) {
  const task = state.tasks.find((t) => t.id === id);
  if (task) {
    Object.assign(task, updates);
    saveTasks();
    render();
  }
}
function removeTask(id) {
  state.tasks = state.tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

/* ---------- Init ---------- */
loadTasks();
render();

