import * as cdk from "aws-cdk-lib"
import {
  AppsyncFunction,
  MappingTemplate,
  Resolver,
} from "aws-cdk-lib/aws-appsync"
import { Runtime } from "aws-cdk-lib/aws-lambda"
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import { Bucket, HttpMethods } from "aws-cdk-lib/aws-s3"
import { Construct } from "constructs"
import path = require("path")
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AppsyncTodoBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // S3
    const resource = new Bucket(this, "AudFileBucket", {
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      cors: [
        {
          allowedHeaders: ["*"],
          allowedMethods: [HttpMethods.GET, HttpMethods.PUT],
          allowedOrigins: ["*"],
        },
      ],
    })

    // IAM
    // オブジェクトを書き込むLambda
    const iamRoleForLambdaPut = new cdk.aws_iam.Role(
      this,
      "iamRoleForLambdaPut",
      {
        assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole"
          ),
        ],
      }
    )

    resource.grantPut(iamRoleForLambdaPut)
    resource.grantRead(iamRoleForLambdaPut)

    // DynamoDB
    const todoTable = new cdk.aws_dynamodb.Table(this, "AppsyncTodoTable", {
      billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: "id",
        type: cdk.aws_dynamodb.AttributeType.STRING,
      },
    })

    // AppSync
    const todoApi = new cdk.aws_appsync.GraphqlApi(
      this,
      "AppsyncTodoGraphqlApi",
      {
        name: "AppsyncTodo-graphql-api",
        schema: cdk.aws_appsync.SchemaFile.fromAsset("graphql/schema.graphql"),
        authorizationConfig: {
          defaultAuthorization: {
            authorizationType: cdk.aws_appsync.AuthorizationType.API_KEY,
            apiKeyConfig: {
              expires: cdk.Expiration.after(cdk.Duration.days(365)),
            },
          },
        },
      }
    )

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

    // const lambdaLayer = new LayerVersion(this, "lambdaPythonLayer", {
    //   code: cdk.aws_lambda.Code.fromAsset(
    //     path.join(__dirname, "../lambda/python/layer"),
    //     {
    //       bundling: {
    //         image: cdk.aws_lambda.Runtime.PYTHON_3_10.bundlingImage,
    //         command: [
    //           "bash",
    //           "-c",
    //           "pip install -r requirements.txt -t /asset-output && cp -au . /asset-output",
    //         ],
    //       },
    //     }
    //   ),
    //   compatibleArchitectures: [
    //     cdk.aws_lambda.Architecture.X86_64,
    //     cdk.aws_lambda.Architecture.ARM_64,
    //   ],
    // })

    const audToTxtLambda = new cdk.aws_lambda.DockerImageFunction(
      this,
      "AudToTxt",
      {
        code: cdk.aws_lambda.DockerImageCode.fromImageAsset("."),
        timeout: cdk.Duration.minutes(3),
        role: iamRoleForLambdaPut,
      }
    )

    // const audToTxtLambda = new cdk.aws_lambda.Function(this, "AudToTxt", {
    //   runtime: cdk.aws_lambda.Runtime.PYTHON_3_10,
    //   handler: "audToTxt.handler",
    //   code: cdk.aws_lambda.Code.fromAsset(
    //     path.join(__dirname, "../lambda/python/function")
    //   ),
    //   layers: [lambdaLayer],
    //   timeout: cdk.Duration.minutes(3),
    //   role: iamRoleForLambdaPut,
    // })

    const createUploadPresignedUrlLambda =
      new cdk.aws_lambda_nodejs.NodejsFunction(
        this,
        "CreateUploadPresignedUrlLambda",
        {
          entry: path.join(__dirname, "../lambda/create-put-presigned-url.ts"),
          handler: "handler",
          runtime: Runtime.NODEJS_16_X,
          role: iamRoleForLambdaPut,
          environment: {
            REGION: this.region,
            BUCKET: resource.bucketName,
            EXPIRES_IN: "3600",
          },
        }
      )

    const createDownloadPresignedUrlLambda =
      new cdk.aws_lambda_nodejs.NodejsFunction(
        this,
        "CreateDownloadPresignedUrlLambda",
        {
          entry: path.join(__dirname, "../lambda/create-get-presigned-url.ts"),
          handler: "handler",
          runtime: Runtime.NODEJS_16_X,
          role: iamRoleForLambdaPut,
          environment: {
            REGION: this.region,
            BUCKET: resource.bucketName,
            EXPIRES_IN: "3600",
          },
        }
      )

    // DataSource
    const getTodosDataSource = todoApi.addLambdaDataSource(
      "getTodosDataSource",
      getTodosLambda
    )

    const addTodoDataSource = todoApi.addLambdaDataSource(
      "addTodoDataSource",
      addTodoLambda
    )

    const audToTxtSource = todoApi.addLambdaDataSource(
      "audToTxtSource",
      audToTxtLambda
    )

    const toggleTodoDataSource = todoApi.addLambdaDataSource(
      "toggleTodoDataSource",
      toggleTodoLambda
    )

    const deleteTodoDataSource = todoApi.addLambdaDataSource(
      "deleteTodoDataSource",
      deleteTodoLambda
    )

    const createUploadPresignedUrlDataSource = todoApi.addLambdaDataSource(
      "createUploadPresignedUrlLambda",
      createUploadPresignedUrlLambda
    )

    const createUploadPresignedUrlFunction = new AppsyncFunction(
      this,
      "createUploadPresignedUrlFunction",
      {
        api: todoApi,
        dataSource: createUploadPresignedUrlDataSource,
        name: "CreateUploadPresignedUrlFunction",
        requestMappingTemplate: MappingTemplate.lambdaRequest(),
        responseMappingTemplate: MappingTemplate.lambdaResult(),
      }
    )

    const createDownloadPresignedUrlDataSource = todoApi.addLambdaDataSource(
      "createDownloadPresignedUrlLambda",
      createDownloadPresignedUrlLambda
    )

    const createDownloadPresignedUrlFunction = new AppsyncFunction(
      this,
      "createDownloadPresignedUrlFunction",
      {
        api: todoApi,
        dataSource: createDownloadPresignedUrlDataSource,
        name: "CreateDownloadPresignedUrlFunction",
        requestMappingTemplate: MappingTemplate.lambdaRequest(),
        responseMappingTemplate: MappingTemplate.lambdaResult(),
      }
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

    audToTxtSource.createResolver("MutationAudToTxtResolver", {
      typeName: "Mutation",
      fieldName: "audToTxt",
    })

    toggleTodoDataSource.createResolver("MutationToggleTodoResolver", {
      typeName: "Mutation",
      fieldName: "toggleTodo",
    })

    deleteTodoDataSource.createResolver("MutationDeleteTodoResolver", {
      typeName: "Mutation",
      fieldName: "deleteTodo",
    })

    new Resolver(this, "CreateUploadPresignedUrlResolver", {
      api: todoApi,
      typeName: "Mutation",
      fieldName: "createUploadPresignedUrl",
      pipelineConfig: [createUploadPresignedUrlFunction],
      requestMappingTemplate: MappingTemplate.fromString("$util.toJson({})"),
      responseMappingTemplate: MappingTemplate.fromString(
        "$util.toJson($ctx.prev.result)"
      ),
    })

    new Resolver(this, "CreateDownloadPresignedUrlResolver", {
      api: todoApi,
      typeName: "Mutation",
      fieldName: "createDownloadPresignedUrl",
      pipelineConfig: [createDownloadPresignedUrlFunction],
      requestMappingTemplate: MappingTemplate.fromString("$util.toJson({})"),
      responseMappingTemplate: MappingTemplate.fromString(
        "$util.toJson($ctx.prev.result)"
      ),
    })
  }
}
