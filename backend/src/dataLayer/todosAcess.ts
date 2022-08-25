import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { S3 } from 'aws-sdk'

// const XAWS = AWSXRay.captureAWS(AWS)

// const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
  constructor(
      private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
      private readonly s3Client: S3 = new AWS.S3({ signatureVersion: 'v4' }),
      private readonly todoTable = process.env.TODOS_TABLE,
      private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET) {
  }

  async getAllTodos(userId: string): Promise<TodoItem[]> {
      console.log("Getting all todo items...");

      const params = {
          TableName: this.todoTable,
          KeyConditionExpression: "#userId = :userId",
          ExpressionAttributeNames: {
              "#userId": "userId"
          },
          ExpressionAttributeValues: {
              ":userId": userId
          }
      };

      const result = await this.docClient.query(params).promise();
      console.log(result);
      const items = result.Items;

      return items as TodoItem[];
  }

  async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
      console.log("Creating your todo...");

      const params = {
          TableName: this.todoTable,
          Item: todoItem,
      };

      const result = await this.docClient.put(params).promise();
      console.log(result);

      return todoItem as TodoItem;
  }

  async updateTodoItem(todoUpdate: TodoUpdate, todoId: string, userId: string): Promise<TodoUpdate> {
      console.log("Updating your todo item...");

      const params = {
          TableName: this.todoTable,
          Key: {
              "userId": userId,
              "todoId": todoId
          },
          UpdateExpression: "set %l = :L, %m = :M, %n = :N",
          ExpressionAttributeNames: {
              "%l": "name",
              "%m": "dueDate",
              "%n": "done"
          },
          ExpressionAttributeValues: {
              ":L": todoUpdate['name'],
              ":M": todoUpdate['dueDate'],
              ":N": todoUpdate['done']
          },
          ReturnValues: "ALL_NEW"
      };

      const result = await this.docClient.update(params).promise();
      console.log(result);
      const attributes = result.Attributes;

      return attributes as TodoUpdate;
  }

  async deleteTodoItem(todoId: string, userId: string): Promise<string> {
      console.log("Deleting todo item...");

      const params = {
          TableName: this.todoTable,
          Key: {
              "userId": userId,
              "todoId": todoId
          },
      };

      const result = await this.docClient.delete(params).promise();
      console.log(result);
      console.log("Todo deleted.");
      

      return "" as string;
  }

  async generateUploadUrl(todoId: string): Promise<string> {
      console.log("Generating upload Url...");

      const uploadUrl = this.s3Client.getSignedUrl('putObject', {
          Bucket: this.bucketName,
          Key: todoId,
          Expires: 1000,
      });
      console.log(uploadUrl);

      return uploadUrl as string;
  }
}