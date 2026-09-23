"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       DOM ELEMENTS
    ========================================= */

    const form =
        document.getElementById("todo-form");

    const input =
        document.getElementById("todo-input");

    const todoList =
        document.getElementById("todo-list");

    const emptyMessage =
        document.getElementById("empty-message");

    const filters =
        document.querySelector(".filters");

    const clearCompleted =
        document.getElementById("clear-completed");

    const totalCount =
        document.getElementById("total-count");

    const activeCount =
        document.getElementById("active-count");

    const completedCount =
        document.getElementById("completed-count");


    /* =========================================
       APPLICATION STATE
    ========================================= */

    let tasks =
        JSON.parse(
            localStorage.getItem("tasks")
        ) || [];


    let currentFilter = "all";


    /* =========================================
       SAVE DATA
    ========================================= */

    function saveTasks() {

        localStorage.setItem(
            "tasks",
            JSON.stringify(tasks)
        );

    }


    /* =========================================
       CREATE TASK
    ========================================= */

    function addTask(text) {

        const task = {

            id:
                Date.now(),

            text:
                text,

            completed:
                false

        };


        tasks.push(task);

        saveTasks();

        renderTasks();

    }


    /* =========================================
       DELETE TASK
    ========================================= */

    function deleteTask(id) {

        tasks =
            tasks.filter(
                task => task.id !== id
            );

        saveTasks();

        renderTasks();

    }


    /* =========================================
       TOGGLE TASK
    ========================================= */

    function toggleTask(id) {

        tasks =
            tasks.map(task => {

                if (task.id === id) {

                    return {
                        ...task,
                        completed:
                            !task.completed
                    };

                }

                return task;

            });


        saveTasks();

        renderTasks();

    }


    /* =========================================
       UPDATE TASK
    ========================================= */

    function updateTask(id, newText) {

        const cleanText =
            newText.trim();


        if (!cleanText) {

            renderTasks();

            return;

        }


        tasks =
            tasks.map(task => {

                if (task.id === id) {

                    return {
                        ...task,
                        text: cleanText
                    };

                }

                return task;

            });


        saveTasks();

        renderTasks();

    }


    /* =========================================
       FILTER TASKS
    ========================================= */

    function getFilteredTasks() {

        if (currentFilter === "active") {

            return tasks.filter(
                task => !task.completed
            );

        }


        if (currentFilter === "completed") {

            return tasks.filter(
                task => task.completed
            );

        }


        return tasks;

    }


    /* =========================================
       RENDER TASKS
    ========================================= */

    function renderTasks() {

        todoList.innerHTML = "";


        const filteredTasks =
            getFilteredTasks();


        filteredTasks.forEach(task => {

            const li =
                document.createElement("li");

            li.className =
                "todo-item";

            li.dataset.id =
                task.id;


            if (task.completed) {

                li.classList.add(
                    "completed"
                );

            }


            li.innerHTML = `

                <input
                    type="checkbox"
                    class="task-checkbox"
                    ${task.completed ? "checked" : ""}
                    aria-label="Mark task as completed"
                >

                <span class="task-text">
                    ${escapeHTML(task.text)}
                </span>

                <button
                    type="button"
                    class="action-btn edit-btn"
                    data-action="edit"
                    aria-label="Edit task">
                    Edit
                </button>

                <button
                    type="button"
                    class="action-btn delete-btn"
                    data-action="delete"
                    aria-label="Delete task">
                    Delete
                </button>

            `;


            todoList.appendChild(li);

        });


        updateStatistics();


        emptyMessage.hidden =
            filteredTasks.length !== 0;

    }


    /* =========================================
       UPDATE STATISTICS
    ========================================= */

    function updateStatistics() {

        const completed =
            tasks.filter(
                task => task.completed
            ).length;


        const active =
            tasks.length - completed;


        totalCount.textContent =
            tasks.length;

        activeCount.textContent =
            active;

        completedCount.textContent =
            completed;

    }


    /* =========================================
       EVENT: ADD TASK
    ========================================= */

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const text =
                input.value.trim();


            if (!text) {

                input.focus();

                return;

            }


            addTask(text);

            input.value = "";

            input.focus();

        }
    );


    /* =========================================
       EVENT DELEGATION
    ========================================= */

    todoList.addEventListener(
        "click",
        event => {

            const item =
                event.target.closest(
                    ".todo-item"
                );


            if (!item) {
                return;
            }


            const id =
                Number(item.dataset.id);


            const action =
                event.target.dataset.action;


            /* Delete */

            if (action === "delete") {

                deleteTask(id);

            }


            /* Edit */

            if (action === "edit") {

                startEditing(item, id);

            }

        }
    );


    /* =========================================
       CHECKBOX EVENT
    ========================================= */

    todoList.addEventListener(
        "change",
        event => {

            if (
                !event.target.classList.contains(
                    "task-checkbox"
                )
            ) {
                return;
            }


            const item =
                event.target.closest(
                    ".todo-item"
                );


            const id =
                Number(item.dataset.id);


            toggleTask(id);

        }
    );


    /* =========================================
       EDIT TASK
    ========================================= */

    function startEditing(item, id) {

        const task =
            tasks.find(
                task => task.id === id
            );


        if (!task) {
            return;
        }


        item.innerHTML = `

            <input
                type="text"
                class="task-edit"
                value="${escapeHTML(task.text)}"
                aria-label="Edit task"
            >

            <button
                type="button"
                class="action-btn edit-btn"
                data-action="save">
                Save
            </button>

            <button
                type="button"
                class="action-btn delete-btn"
                data-action="cancel">
                Cancel
            </button>

        `;


        const editInput =
            item.querySelector(
                ".task-edit"
            );


        editInput.focus();


        editInput.select();

    }


    /* =========================================
       SAVE / CANCEL EDIT
    ========================================= */

    todoList.addEventListener(
        "click",
        event => {

            const action =
                event.target.dataset.action;


            if (
                action !== "save" &&
                action !== "cancel"
            ) {
                return;
            }


            const item =
                event.target.closest(
                    ".todo-item"
                );


            const id =
                Number(item.dataset.id);


            if (action === "save") {

                const editInput =
                    item.querySelector(
                        ".task-edit"
                    );


                updateTask(
                    id,
                    editInput.value
                );

            }


            if (action === "cancel") {

                renderTasks();

            }

        }
    );


    /* =========================================
       FILTER EVENTS
    ========================================= */

    filters.addEventListener(
        "click",
        event => {

            if (
                !event.target.classList.contains(
                    "filter-btn"
                )
            ) {
                return;
            }


            currentFilter =
                event.target.dataset.filter;


            document
                .querySelectorAll(".filter-btn")
                .forEach(button => {

                    button.classList.remove(
                        "active"
                    );

                });


            event.target.classList.add(
                "active"
            );


            renderTasks();

        }
    );


    /* =========================================
       CLEAR COMPLETED
    ========================================= */

    clearCompleted.addEventListener(
        "click",
        () => {

            tasks =
                tasks.filter(
                    task => !task.completed
                );


            saveTasks();

            renderTasks();

        }
    );


    /* =========================================
       ESCAPE HTML
       Prevents HTML injection
    ========================================= */

    function escapeHTML(value) {

        const div =
            document.createElement("div");

        div.textContent =
            value;

        return div.innerHTML;

    }


    /* =========================================
       INITIAL RENDER
    ========================================= */

    renderTasks();

});
