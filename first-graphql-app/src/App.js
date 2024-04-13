import { createServer } from 'node:http'
import { createSchema, createYoga } from 'graphql-yoga'
import { readFileSync } from 'node:fs';
import { gql } from 'graphql-tag';
import axios from 'axios';

const typeDefs = readFileSync('./src/schema.graphql', 'utf8');

async function getRestUsersList(){
    try {
        // console.log("getting users");
        const users = await axios.get("https://jsonplaceholder.typicode.com/users")
        // console.log(users.data[0]);
        return users.data.map(({ id, name, email, username }) => ({
            id: id,
            name: name,
            email: email,
            login: username,
        }))
    } catch (error) {
        throw error
    }
}

async function getRestUserById(id) {
    try {
        // console.log("getting user with id"+id)
        const user = await axios.get("https://jsonplaceholder.typicode.com/users/" + id);
        // console.log(user.data);
        return {
            id: user.data.id,
            name: user.data.name,
            email: user.data.email,
            login: user.data.username
        }
    } catch (error) {
        throw error
    }
}

async function getRestTodosList() {
    try {
        // console.log("getting todos list");
        const todos = await axios.get("https://jsonplaceholder.typicode.com/todos");
        // console.log(todos.data[0]);
        return todos.data.map(
            ({id, title, completed, userId}) => ({
                id: id,
                title: title,
                completed: completed,
                userID: userId
            })
        )
    } catch (error) {
        throw  error
    }
}

async function getRestTodoById(id) {
    try {
        // console.log("getting todo with id "+id);
        const todo = await axios.get("https://jsonplaceholder.typicode.com/todos/" + id);
        // console.log(todo.data);
        return {
            id: todo.data.id,
            title: todo.data.title,
            completed: todo.data.completed,
            userID: todo.data.userId
        }
    } catch(error) {
        throw error
    }
}

const yoga = createYoga({
  schema: createSchema({
    typeDefs: gql(typeDefs),
    resolvers: {
    Query: {
        demo: () => 'Witaj, GraphQL działa!',
        users: async () => getRestUsersList(), 
        todos: async () => getRestTodosList(),
        todo: async (parent, args, context, info) => getRestTodoById(args.id),
        user: async (parent, args, context, info) => getRestUserById(args.id),
    },
    User: {
        todos: async (parent, args, context, info) => {
            return (await getRestTodosList()).filter(t => t.userID == parent.id);
        } 
    },
    ToDoItem:{
        user: async (parent, args, context, info) => {
            return await getRestUserById(parent.userID);
        }
    }, 
    }
  })
})

const server = createServer(yoga)

server.listen(4000, () => {
  console.info('Server is running on http://localhost:4000/graphql')
})