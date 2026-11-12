const siteHeader = document.querySelector('.site-header');
const hero = document.querySelector('.hero');
const themeToggle = document.querySelector('#theme-toggle');
const themeToggleIcon = themeToggle.querySelector('.theme-toggle-icon');
const backToTop = document.querySelector('#back-to-top');
const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
const savedTheme = localStorage.getItem('studysphere-theme');

function applyTheme(isDark) {
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  themeToggle.setAttribute('aria-checked', String(isDark));
  themeToggle.title = isDark ? 'Use light color theme' : 'Use dark color theme';
  themeToggleIcon.innerHTML = isDark ? '&#9788;' : '&#9790;';
}

applyTheme(savedTheme ? savedTheme === 'dark' : colorScheme.matches);

themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.dataset.theme !== 'dark';
  localStorage.setItem('studysphere-theme', isDark ? 'dark' : 'light');
  applyTheme(isDark);
});

colorScheme.addEventListener('change', (event) => {
  if (!localStorage.getItem('studysphere-theme')) applyTheme(event.matches);
});

function updateScrollControls() {
  const pastHero = window.scrollY > hero.offsetTop + hero.offsetHeight - window.innerHeight * 0.25;
  siteHeader.classList.toggle('is-scrolled', window.scrollY > 24);
  backToTop.classList.toggle('is-visible', pastHero);
}

window.addEventListener('scroll', updateScrollControls, { passive: true });
window.addEventListener('resize', updateScrollControls);
updateScrollControls();

const submissionForm = document.querySelector('#submission-form');
const studyText = document.querySelector('#study-text');
const characterCount = document.querySelector('#character-count');
const submissionStatus = document.querySelector('#submission-status');

studyText.addEventListener('input', () => {
  characterCount.textContent = `${studyText.value.length} / 500`;
});

submissionForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = studyText.value.trim();

  if (!text) {
    submissionStatus.textContent = 'Write a priority before submitting.';
    submissionStatus.className = 'submission-status error';
    studyText.focus();
    return;
  }

  const submissions = JSON.parse(localStorage.getItem('studysphere-submissions') || '[]');
  submissions.push({ text, submittedAt: new Date().toISOString() });
  localStorage.setItem('studysphere-submissions', JSON.stringify(submissions));
  submissionStatus.textContent = 'Priority saved. You can come back to it whenever you are ready.';
  submissionStatus.className = 'submission-status success';
  submissionForm.reset();
  characterCount.textContent = '0 / 500';
});

function initTaskTracker() {
  const taskForm = document.getElementById('task-form');
  const taskInput = document.getElementById('task-input');
  const taskList = document.getElementById('task-list');
  const taskMessage = document.getElementById('task-message');
  const apiUrl = '/api/tasks';

  function showTaskMessage(message) {
    taskMessage.textContent = message;
  }

  async function loadTasks() {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Unable to load tasks.');

      const tasks = await response.json();
      displayTasks(tasks);
    } catch (error) {
      showTaskMessage(error.message);
    }
  }

  function displayTasks(tasks) {
    taskList.replaceChildren();

    if (tasks.length === 0) {
      const emptyItem = document.createElement('li');
      emptyItem.textContent = 'No tasks have been added.';
      taskList.appendChild(emptyItem);
      return;
    }

    tasks.forEach((task) => {
      const listItem = document.createElement('li');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.setAttribute('aria-label', `Mark ${task.title} as complete`);
      checkbox.addEventListener('change', () => updateTask(task.id, checkbox.checked));

      const taskText = document.createElement('span');
      taskText.textContent = task.title;
      if (task.completed) taskText.classList.add('is-complete');

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.textContent = 'Delete';
      deleteButton.setAttribute('aria-label', `Delete ${task.title}`);
      deleteButton.addEventListener('click', () => deleteTask(task.id));

      listItem.append(checkbox, taskText, deleteButton);
      taskList.appendChild(listItem);
    });
  }

  taskForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = taskInput.value.trim();

    if (!title) {
      showTaskMessage('Please enter a task.');
      taskInput.focus();
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Unable to add task.');
      }

      taskInput.value = '';
      showTaskMessage('Task added successfully.');
      await loadTasks();
    } catch (error) {
      showTaskMessage(error.message);
    }
  });

  async function updateTask(id, completed) {
    try {
      const response = await fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Unable to update task.');
      }

      showTaskMessage('Task updated successfully.');
      await loadTasks();
    } catch (error) {
      showTaskMessage(error.message);
      await loadTasks();
    }
  }

  async function deleteTask(id) {
    try {
      const response = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Unable to delete task.');
      }

      showTaskMessage('Task deleted successfully.');
      await loadTasks();
    } catch (error) {
      showTaskMessage(error.message);
    }
  }

  loadTasks();
}

if (document.getElementById('task-tracker')) {
  initTaskTracker();
}
