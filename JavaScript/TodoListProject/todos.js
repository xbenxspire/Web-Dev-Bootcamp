document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const newTodoInput = document.getElementById('new-todo');
    const todoList = document.getElementById('todo-list');

    // Initial todos
    const todos = ['Collect Chicken Eggs', 'Clean Litter Box'];

    // Function to render todos
    function renderTodos() {
        todoList.innerHTML = '';
        todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            li.innerHTML = `
                <span>${todo}</span>
                <button class="delete-btn" data-index="${index}">Delete</button>
            `;
            todoList.appendChild(li);
        });
    }

    // Add new todo
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTodo = newTodoInput.value.trim();
        if (newTodo) {
            todos.push(newTodo);
            newTodoInput.value = '';
            renderTodos();
        }
    });

    // Delete todo
    todoList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const index = parseInt(e.target.getAttribute('data-index'));
            todos.splice(index, 1);
            renderTodos();
        }
    });

    // Initial render
    renderTodos();
});
