// Task Tracker Application
class TaskTracker {
  constructor() {
    this.taskInput = document.getElementById('taskInput');
    this.addTaskBtn = document.getElementById('addTaskBtn');
    this.taskList = document.getElementById('taskList');
    this.emptyMessage = document.getElementById('emptyMessage');
    
    this.setupEventListeners();
    this.loadTasks();
  }

  setupEventListeners() {
    // Add task button click
    this.addTaskBtn.addEventListener('click', () => this.addTask());
    
    // Enter key in input
    this.taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.addTask();
      }
    });
  }

  // Add a new task via API
  async addTask() {
    const title = this.taskInput.value.trim();
    
    if (!title) {
      alert('Please enter a task title');
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const task = await response.json();
      this.taskInput.value = '';
      this.loadTasks();
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task: ' + error.message);
    }
  }

  // Load all tasks via API
  async loadTasks() {
    try {
      const response = await fetch('/api/tasks');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const tasks = await response.json();
      this.renderTasks(tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      this.taskList.innerHTML = '<li>Error loading tasks</li>';
    }
  }

  // Render tasks to DOM (safe from XSS)
  renderTasks(tasks) {
    this.taskList.innerHTML = '';
    
    if (tasks.length === 0) {
      this.emptyMessage.style.display = 'block';
      return;
    }

    this.emptyMessage.style.display = 'none';

    tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'completed' : ''}`;
      
      // Create checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'task-checkbox';
      checkbox.checked = task.completed;
      checkbox.addEventListener('change', () => this.toggleTask(task.id));
      
      // Create task text (safe DOM update)
      const span = document.createElement('span');
      span.className = 'task-text';
      span.textContent = task.title;
      
      // Create delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
      
      // Append elements
      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(deleteBtn);
      this.taskList.appendChild(li);
    });
  }

  // Toggle task completion status
  async toggleTask(taskId) {
    try {
      const taskItem = document.querySelector(`.task-item`);
      const isCurrentlyCompleted = taskItem.classList.contains('completed');
      
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed: !isCurrentlyCompleted })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      this.loadTasks();
    } catch (error) {
      console.error('Error toggling task:', error);
      alert('Failed to update task: ' + error.message);
      this.loadTasks();
    }
  }

  // Delete a task
  async deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      this.loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task: ' + error.message);
    }
  }
}

// Initialize Task Tracker when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new TaskTracker();
});
