import { TodosAccess } from '../dataLayer/todosAcess'
// import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import {parseUserId} from "../auth/utils";
const uuidv4 = require('uuid/v4');

// TODO: Implement businessLogic
const toDoAccess = new TodosAccess();



export async function getAllTodos(jwtToken: string): Promise<TodoItem[]> {
    const userId = parseUserId(jwtToken);
    return toDoAccess.getAllTodos(userId);
}

export function createTodoItem(createTodoRequest: CreateTodoRequest, jwtToken: string): Promise<TodoItem> {
    const userId = parseUserId(jwtToken);
    const todoId =  uuidv4();
    const s3Bucket = process.env.ATTACHMENT_S3_BUCKET;
    
    return toDoAccess.createTodoItem({
        userId: userId,
        todoId: todoId,
        attachmentUrl:  `https://${s3Bucket}.s3.amazonaws.com/${todoId}`, 
        createdAt: new Date().getTime().toString(),
        done: false,
        ...createTodoRequest,
    });
}

export function updateTodoItem(updateTodoRequest: UpdateTodoRequest, todoId: string, jwtToken: string): Promise<TodoUpdate> {
    const userId = parseUserId(jwtToken);
    return toDoAccess.updateTodoItem(updateTodoRequest, todoId, userId);
}

export function deleteTodoItem(todoId: string, jwtToken: string): Promise<string> {
    const userId = parseUserId(jwtToken);
    return toDoAccess.deleteTodoItem(todoId, userId);
}

export function generateUploadUrl(todoId: string): Promise<string> {
    return toDoAccess.generateUploadUrl(todoId);
}