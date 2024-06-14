import * as cdk from "aws-cdk-lib"
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import { Construct } from "constructs"
import path = require("path")
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // DynamoDB
    const todoTable = new cdk.aws_dynamodb.Table(this, "TodoTable", {
      billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: "id",
        type: cdk.aws_dynamodb.AttributeType.STRING,
      },
    })

    // AppSync
    const todoApi = new cdk.aws_appsync.GraphqlApi(this, "TodoGraphqlApi", {
      name: "todo-graphql-api",
      schema: cdk.aws_appsync.SchemaFile.fromAsset("graphql/schema.graphql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: cdk.aws_appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        },
      },
    })

    // Lambda function
    const commonLambdaNodeJsProps: Omit<
      cdk.aws_lambda_nodejs.NodejsFunctionProps,
      "entry"
    > = {
      handler: "handler",
      environment: {
        TODO_TABLE: todoTable.tableName,
      },
    }
    const getTodosLambda = new NodejsFunction(this, "getTodosHandler", {
      entry: path.join(__dirname, "../lambda/getTodos.ts"),
      ...commonLambdaNodeJsProps,
    })

    todoTable.grantReadData(getTodosLambda)

    const addTodoLambda = new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      "addTodoHandler",
      {
        entry: path.join(__dirname, "../lambda/addTodo.ts"),
        ...commonLambdaNodeJsProps,
      }
    )

    todoTable.grantReadWriteData(addTodoLambda)

    const toggleTodoLambda = new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      "toggleTodoHandler",
      {
        entry: path.join(__dirname, "../lambda/toggleTodo.ts"),
        ...commonLambdaNodeJsProps,
      }
    )

    todoTable.grantReadWriteData(toggleTodoLambda)

    const deleteTodoLambda = new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      "deleteTodoHandler",
      {
        entry: path.join(__dirname, "../lambda/deleteTodo.ts"),
        ...commonLambdaNodeJsProps,
      }
    )

    todoTable.grantReadWriteData(deleteTodoLambda)

    // DataSource
    const getTodosDataSource = todoApi.addLambdaDataSource(
      "getTodosDataSource",
      getTodosLambda
    )

    const addTodoDataSource = todoApi.addLambdaDataSource(
      "addTodoDataSource",
      addTodoLambda
    )

    const toggleTodoDataSource = todoApi.addLambdaDataSource(
      "toggleTodoDataSource",
      toggleTodoLambda
    )

    const deleteTodoDataSource = todoApi.addLambdaDataSource(
      "deleteTodoDataSource",
      deleteTodoLambda
    )

    // Resolver
    getTodosDataSource.createResolver("QueryGetTodosResolver", {
      typeName: "Query",
      fieldName: "getTodos",
    })

    addTodoDataSource.createResolver("MutationAddTodoResolver", {
      typeName: "Mutation",
      fieldName: "addTodo",
    })

    toggleTodoDataSource.createResolver("MutationToggleTodoResolver", {
      typeName: "Mutation",
      fieldName: "toggleTodo",
    })

    deleteTodoDataSource.createResolver("MutationDeleteTodoResolver", {
      typeName: "Mutation",
      fieldName: "deleteTodo",
    })
  }
}
