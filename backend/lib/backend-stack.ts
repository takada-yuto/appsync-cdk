import * as cdk from "aws-cdk-lib"
import {
  AppsyncFunction,
  MappingTemplate,
  Resolver,
} from "aws-cdk-lib/aws-appsync"
import { Platform } from "aws-cdk-lib/aws-ecr-assets"
import { Runtime } from "aws-cdk-lib/aws-lambda"
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import { Bucket, HttpMethods } from "aws-cdk-lib/aws-s3"
import { Construct } from "constructs"
import path = require("path")

export class AppsyncPlaygroundBackendStack extends cdk.Stack {
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
    const iamRoleForLambda = new cdk.aws_iam.Role(this, "iamRoleForLambda", {
      assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
    })

    resource.grantPut(iamRoleForLambda)
    resource.grantRead(iamRoleForLambda)

    // DynamoDB
    const todoTable = new cdk.aws_dynamodb.Table(this, "AppsyncTodoTable", {
      billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: "id",
        type: cdk.aws_dynamodb.AttributeType.STRING,
      },
    })

    //   // User Pool
    //   const userPool = new cdk.aws_cognito.UserPool(this, "userpool", {
    //     userPoolName: "sample-user-pool",
    //     selfSignUpEnabled: true,
    //     signInAliases: {
    //       email: true,
    //     },
    //     accountRecovery: cdk.aws_cognito.AccountRecovery.EMAIL_ONLY,
    //   })

    //   const provider = new UserPoolIdentityProviderGoogle(this, "Google", {
    //     userPool,
    //     clientId: process.env.GOOGLE_CLIENT_ID!,
    //     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,

    //     // Email scope is required, because the default is 'profile' and that doesn't allow Cognito
    //     // to fetch the user's email from his Google account after the user does an SSO with Google
    //     scopes: ["email"],

    //     // Map fields from the user's Google profile to Cognito user fields, when the user is auto-provisioned
    //     attributeMapping: {
    //         email: ProviderAttribute.GOOGLE_EMAIL,
    //     },
    // });

    //   // User Pool Client
    //   const client = new UserPoolClient(this, "UserPoolClient", {
    //     userPool,
    //     generateSecret: true,
    //     supportedIdentityProviders: [UserPoolClientIdentityProvider.GOOGLE],
    //     oAuth: {
    //         callbackUrls: ['https://d3ndgd8yatluy8.cloudfront.net'],
    //     },
    //   });

    //   client.node.addDependency(provider)

    // // ユーザープールの作成
    // const userPool = new cdk.aws_cognito.UserPool(this, "MyUserPool", {
    //   signInAliases: {
    //     email: true,
    //   },
    //   selfSignUpEnabled: true,
    //   passwordPolicy: {
    //     minLength: 8,
    //     requireLowercase: true,
    //     requireUppercase: true,
    //     requireDigits: true,
    //   },
    //   mfa: cdk.aws_cognito.Mfa.OPTIONAL,
    //   mfaSecondFactor: {
    //     sms: true,
    //     otp: true,
    //   },
    // })

    // // Google フェデレーテッドアイデンティティプロバイダーの作成
    // // Secrets Managerにシークレットを作成
    // const googleClientSecret = new cdk.aws_secretsmanager.Secret(
    //   this,
    //   "GenerateSecretString",
    //   {
    //     generateSecretString: {
    //       secretStringTemplate: JSON.stringify({
    //         clientSecretValue: process.env.GOOGLE_CLIENT_SECRET ?? "",
    //       }),
    //       generateStringKey: "password",
    //     },
    //   }
    // )

    // const secret = cdk.aws_secretsmanager.Secret.fromSecretAttributes(
    //   this,
    //   "CognitoClientSecret",
    //   {
    //     secretCompleteArn: googleClientSecret.secretArn,
    //   }
    // ).secretValue

    // const googleProvider = new cdk.aws_cognito.UserPoolIdentityProviderGoogle(
    //   this,
    //   "Google",
    //   {
    //     userPool,
    //     clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    //     clientSecretValue: secret,
    //     // @ts-ignore
    //     authorizeScopes: ["email"],
    //   }
    // )

    // // ユーザープールクライアントの作成
    // const userPoolClient = userPool.addClient("MyUserPoolClient", {
    //   oAuth: {
    //     flows: {
    //       authorizationCodeGrant: true,
    //     },
    //     scopes: [
    //       OAuthScope.PHONE,
    //       OAuthScope.EMAIL,
    //       OAuthScope.OPENID,
    //       OAuthScope.PROFILE,
    //     ],
    //     callbackUrls: [
    //       "https://d3ndgd8yatluy8.cloudfront.net/api/auth/callback/cognito",
    //     ],
    //   },
    //   generateSecret: true,
    // })

    // // フェデレーテッドアイデンティティプロバイダーの接続
    // userPoolClient.node.addDependency(googleProvider)

    // // ドメインの作成
    // new cdk.aws_cognito.UserPoolDomain(this, "CognitoDomain", {
    //   userPool: userPool,
    //   cognitoDomain: {
    //     domainPrefix: "appsync-playground",
    //   },
    // })

    // AppSync
    const appsyncPlaygroundApi = new cdk.aws_appsync.GraphqlApi(
      this,
      "AppsyncPlaygrondApi",
      {
        name: "AppsyncPlayground-api",
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

    const createUploadPresignedUrlLambda =
      new cdk.aws_lambda_nodejs.NodejsFunction(
        this,
        "CreateUploadPresignedUrlLambda",
        {
          entry: path.join(__dirname, "../lambda/create-put-presigned-url.ts"),
          handler: "handler",
          runtime: Runtime.NODEJS_16_X,
          role: iamRoleForLambda,
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
          role: iamRoleForLambda,
          environment: {
            REGION: this.region,
            BUCKET: resource.bucketName,
            EXPIRES_IN: "3600",
          },
        }
      )

    // DataSource
    const getTodosDataSource = appsyncPlaygroundApi.addLambdaDataSource(
      "getTodosDataSource",
      getTodosLambda
    )

    const addTodoDataSource = appsyncPlaygroundApi.addLambdaDataSource(
      "addTodoDataSource",
      addTodoLambda
    )

    const toggleTodoDataSource = appsyncPlaygroundApi.addLambdaDataSource(
      "toggleTodoDataSource",
      toggleTodoLambda
    )

    const deleteTodoDataSource = appsyncPlaygroundApi.addLambdaDataSource(
      "deleteTodoDataSource",
      deleteTodoLambda
    )

    const createUploadPresignedUrlDataSource =
      appsyncPlaygroundApi.addLambdaDataSource(
        "createUploadPresignedUrlLambda",
        createUploadPresignedUrlLambda
      )

    const createUploadPresignedUrlFunction = new AppsyncFunction(
      this,
      "createUploadPresignedUrlFunction",
      {
        api: appsyncPlaygroundApi,
        dataSource: createUploadPresignedUrlDataSource,
        name: "CreateUploadPresignedUrlFunction",
        requestMappingTemplate: MappingTemplate.lambdaRequest(),
        responseMappingTemplate: MappingTemplate.lambdaResult(),
      }
    )

    const createDownloadPresignedUrlDataSource =
      appsyncPlaygroundApi.addLambdaDataSource(
        "createDownloadPresignedUrlLambda",
        createDownloadPresignedUrlLambda
      )

    const createDownloadPresignedUrlFunction = new AppsyncFunction(
      this,
      "createDownloadPresignedUrlFunction",
      {
        api: appsyncPlaygroundApi,
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

    toggleTodoDataSource.createResolver("MutationToggleTodoResolver", {
      typeName: "Mutation",
      fieldName: "toggleTodo",
    })

    deleteTodoDataSource.createResolver("MutationDeleteTodoResolver", {
      typeName: "Mutation",
      fieldName: "deleteTodo",
    })

    new Resolver(this, "CreateUploadPresignedUrlResolver", {
      api: appsyncPlaygroundApi,
      typeName: "Mutation",
      fieldName: "createUploadPresignedUrl",
      pipelineConfig: [createUploadPresignedUrlFunction],
      requestMappingTemplate: MappingTemplate.fromString("$util.toJson({})"),
      responseMappingTemplate: MappingTemplate.fromString(
        "$util.toJson($ctx.prev.result)"
      ),
    })

    new Resolver(this, "CreateDownloadPresignedUrlResolver", {
      api: appsyncPlaygroundApi,
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
