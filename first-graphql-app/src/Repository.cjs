const { Client } = require('pg');

const client = new Client({
    user: 'nikodem',
    host: 'localhost',
    database: 'ztw_ex_7',
    port: 5432, 
});

client.connect();

async function createUser(name, email, login) {
    const query = 'INSERT INTO "User" (name, email, login) VALUES ($1, $2, $3) RETURNING id';
    const result = await client.query(query, [name, email, login]);
    return result.rows[0].id;
}
  
async function updateUser(id, name, email, login) {
    const query = 'UPDATE "User" SET name = $1, email = $2, login = $3 WHERE id = $4';
    await client.query(query, [name, email, login, id]);
    return id;
}
  
async function deleteUser(id) {
    const query = 'DELETE FROM "User" WHERE id = $1';
    await client.query(query, [id]);
    return id;
}

async function createTodoItem(title, completed, userID) {
    const query = 'INSERT INTO ToDoItem (title, completed, user_id) VALUES ($1, $2, $3) RETURNING id';
    const result = await client.query(query, [title, completed, userID]);
    return result.rows[0].id;
}
  
async function updateTodoItem(id, title, completed, userID) {
    const query = 'UPDATE ToDoItem SET title = $1, completed = $2, user_id = $3 WHERE id = $4';
    await client.query(query, [title, completed, userID, id]);
    return id;
}
  
async function deleteTodoItem(id) {
    const query = 'DELETE FROM ToDoItem WHERE id = $1';
    await client.query(query, [id]);
    return id;
}

async function getUsers() {
    const query = `
        SELECT u.*, t.*
        FROM "User" u
        LEFT JOIN ToDoItem t ON u.id = t.user_id
    `;
    const result = await client.query(query);

    // Group todos by user ID
    const todosByUser = result.rows.reduce((acc, row) => {
        const userID = row.id;
        if (!acc[userID]) {
            acc[userID] = {
                id: row.id,
                name: row.name,
                email: row.email,
                login: row.login,
                todos: []
            };
        }
        if (row.todo_id) {
            acc[userID].todos.push({
                id: row.todo_id,
                title: row.title,
                completed: row.completed
            });
        }
        return acc;
    }, {});

    return Object.values(todosByUser);
}
  
async function getUserById(id) {
    const query = `
        SELECT u.*, t.*
        FROM "User" u
        LEFT JOIN ToDoItem t ON u.id = t.user_id
        WHERE u.id = $1
    `;
    const result = await client.query(query, [id]);

    const todosByUser = result.rows.reduce((acc, row) => {
        const userID = row.id;
        if (!acc[userID]) {
            acc[userID] = {
                id: row.id,
                name: row.name,
                email: row.email,
                login: row.login,
                todos: []
            };
        }
        if (row.todo_id) {
            acc[userID].todos.push({
                id: row.todo_id,
                title: row.title,
                completed: row.completed
            });
        }
        return acc;
    }, {});

    const userWithTodos = Object.values(todosByUser)[0];
    return userWithTodos ? userWithTodos : null; 
}

  
async function getTodos() {
    const query = 'SELECT * FROM ToDoItem';
    const result = await client.query(query);
    return result.rows.map(row => ({
        id: row.id,
        title: row.title,
        completed: row.completed,
        userID: row.user_id 
    }));
}
  
async function getTodoById(id) {
    const query = 'SELECT * FROM ToDoItem WHERE id = $1';
    const result = await client.query(query, [id]);
    const row = result.rows[0];
    if (!row) {
        return null; 
    }
    return {
        id: row.id,
        title: row.title,
        completed: row.completed,
        userID: row.user_id 
    };
}

async function getTodoByUserId(id) {
    const query = 'SELECT * FROM ToDoItem WHERE user_id = $1';
    const result = await client.query(query, [id]);
    if (!result.rows || result.rows.length === 0) {
        return null; 
    }
    return result.rows.map(row => ({
        id: row.id,
        title: row.title,
        completed: row.completed,
        userID: row.user_id 
    }));
}


async function getUserByTodoId(id) {
    const query = `
        SELECT u.*, t.*
        FROM "User" u
        LEFT JOIN ToDoItem t ON u.id = t.user_id
        WHERE u.id = $1
    `;
    const result = await client.query(query, [id]);

    const todosByUser = result.rows.reduce((acc, row) => {
        const userID = row.id;
        if (!acc[userID]) {
            acc[userID] = {
                id: row.id,
                name: row.name || '', // Return an empty string if name is null
                email: row.email,
                login: row.login,
                todos: []
            };
        }
        if (row.todo_id) {
            acc[userID].todos.push({
                id: row.todo_id,
                title: row.title,
                completed: row.completed
            });
        }
        return acc;
    }, {});

    const userWithTodos = Object.values(todosByUser)[0];
    return userWithTodos ? userWithTodos : null; 
}


module.exports = {
    createUser,
    updateUser,
    deleteUser,
    createTodoItem,
    updateTodoItem,
    deleteTodoItem,
    getUsers,
    getUserById,
    getTodos,
    getTodoById,
    getTodoByUserId,
    getUserByTodoId
};