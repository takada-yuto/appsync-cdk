import * as cdk from 'aws-cdk-lib';
import {
  AppsyncFunction,
  AuthorizationType,
  GraphqlApi,
  MappingTemplate,
  Resolver,
  SchemaFile,
} from 'aws-cdk-lib/aws-appsync';
import {
  CloudFrontWebDistribution,
  OriginAccessIdentity,
} from 'aws-cdk-lib/aws-cloudfront';
import { OAuthScope, UserPool } from 'aws-cdk-lib/aws-cognito';
import { AnyPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { BlockPublicAccess, Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import path = require('path');

export class AppsyncPlaygroundBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const appsyncPlaygroundFrontendBucket = new Bucket(
      this,
      'AppsyncPlaygroundFrontendBucket',
      {
        websiteIndexDocument: 'index.html',
        publicReadAccess: true,
        autoDeleteObjects: true,
        blockPublicAccess: BlockPublicAccess.BLOCK_ACLS,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );

    // バケットへのアクセスを許可するIAMポリシーを作成します。
    const policyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['s3:GetObject'],
      principals: [new AnyPrincipal()],
      resources: [appsyncPlaygroundFrontendBucket.arnForObjects('*')],
    });

    // 作成したポリシーをバケットに適用します。
    appsyncPlaygroundFrontendBucket.addToResourcePolicy(policyStatement);

    const appsyncPlaygroundOAI = new OriginAccessIdentity(
      this,
      'AppsyncPlaygroundOAI'
    );

    appsyncPlaygroundFrontendBucket.grantRead(appsyncPlaygroundOAI);

    const distribution = new CloudFrontWebDistribution(
      this,
      'AppsyncPlaygroundWebDestribution',
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: appsyncPlaygroundFrontendBucket,
              originAccessIdentity: appsyncPlaygroundOAI,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
      }
    );

    new cdk.aws_s3_deployment.BucketDeployment(
      this,
      'AppsyncPlaygroundBucketDeployment',
      {
        sources: [
          cdk.aws_s3_deployment.Source.asset(
            path.resolve(__dirname, '../../frontend/out')
          ),
        ],
        destinationBucket: appsyncPlaygroundFrontendBucket,
        distribution: distribution,
        distributionPaths: ['/*'],
      }
    );

    new cdk.CfnOutput(this, 'AppsyncPlaygroundWebDestributionName', {
      value: distribution.distributionDomainName,
    });

    // CognitoのUserPoolを作成します。
    // selfSignUpEnabledをtrueに設定することで、ユーザーが自己登録できるようになります。
    // autoVerifyは、ユーザー登録時にEメールアドレスを自動で確認するかどうかを設定します。
    const userPool = new UserPool(this, `AppsyncPlaygroundUserPool`, {
      selfSignUpEnabled: true,
      autoVerify: { email: false },
    });

    userPool.addDomain('appsync-playground-domain', {
      cognitoDomain: {
        domainPrefix: 'appsync-authentication',
      },
    });

    // UserPoolクライアントを作成し、OAuth設定を行います。
    // ログインとログアウト時のURLを指定します。
    const userPoolClient = userPool.addClient(
      `AppsyncPlaygroundUserPoolClient`,
      {
        oAuth: {
          flows: {
            authorizationCodeGrant: true,
          },
          scopes: [OAuthScope.OPENID],
          callbackUrls: [
            `http://localhost:3000`,
            `https://${distribution.distributionDomainName}`,
          ],
          logoutUrls: [
            `http://localhost:3000`,
            `https://${distribution.distributionDomainName}`,
          ],
        },
      }
    );

    // S3
    const resource = new Bucket(this, 'AudFileBucket', {
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [HttpMethods.GET, HttpMethods.PUT],
          allowedOrigins: ['*'],
        },
      ],
    });

    // IAM
    // オブジェクトを書き込むLambda
    const iamRoleForLambda = new cdk.aws_iam.Role(this, 'iamRoleForLambda', {
      assumedBy: new cdk.aws_iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaBasicExecutionRole'
        ),
      ],
    });

    resource.grantPut(iamRoleForLambda);
    resource.grantRead(iamRoleForLambda);

    // DynamoDB
    const todoTable = new cdk.aws_dynamodb.Table(this, 'AppsyncTodoTable', {
      billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: 'id',
        type: cdk.aws_dynamodb.AttributeType.STRING,
      },
    });

    // AppSync
    const appsyncPlaygroundApi = new GraphqlApi(this, 'AppsyncPlaygrondApi', {
      name: 'AppsyncPlayground-api',
      schema: SchemaFile.fromAsset('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.USER_POOL,
          userPoolConfig: { userPool },
        },
      },
    });

    // Lambda function
    const commonLambdaNodeJsProps: Omit<
      cdk.aws_lambda_nodejs.NodejsFunctionProps,
      'entry'
    > = {
      handler: 'handler',
      environment: {
        TODO_TABLE: todoTable.tableName,
      },
    };
    const getTodosLambda = new NodejsFunction(this, 'getTodosHandler', {
      entry: path.join(__dirname, '../lambda/getTodos.ts'),
      ...commonLambdaNodeJsProps,
    });

    todoTable.grantReadData(getTodosLambda);

    const addTodoLambda = new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      'addTodoHandler',
      {
        entry: path.join(__dirname, '../lambda/addTodo.ts'),
        ...commonLambdaNodeJsProps,
      }
    );

    todoTable.grantReadWriteData(addTodoLambda);

    const toggleTodoLambda = new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      'toggleTodoHandler',
      {
        entry: path.join(__dirname, '../lambda/toggleTodo.ts'),
        ...commonLambdaNodeJsProps,
      }
    );

    todoTable.grantReadWriteData(toggleTodoLambda);

    const deleteTodoLambda = new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      'deleteTodoHandler',
      {
        entry: path.join(__dirname, '../lambda/deleteTodo.ts'),
        ...commonLambdaNodeJsProps,
      }
    );

    todoTable.grantReadWriteData(deleteTodoLambda);

    const createUploadPresignedUrlLambda =
      new cdk.aws_lambda_nodejs.NodejsFunction(
        this,
        'CreateUploadPresignedUrlLambda',
        {
          entry: path.join(__dirname, '../lambda/create-put-presigned-url.ts'),
          handler: 'handler',
          runtime: Runtime.NODEJS_16_X,
          role: iamRoleForLambda,
          environment: {
            REGION: this.region,
            BUCKET: resource.bucketName,
            EXPIRES_IN: '3600',
          },
        }
      );

    const createDownloadPresignedUrlLambda =
      new cdk.aws_lambda_nodejs.NodejsFunction(
        this,
        'CreateDownloadPresignedUrlLambda',
        {
          entry: path.join(__dirname, '../lambda/create-get-presigned-url.ts'),
          handler: 'handler',
          runtime: Runtime.NODEJS_16_X,
          role: iamRoleForLambda,
          environment: {
            REGION: this.region,
            BUCKET: resource.bucketName,
            EXPIRES_IN: '3600',
          },
        }
      );

    // DataSource
    const getTodosDataSource = appsyncPlaygroundApi.addLambdaDataSource(
      'getTodosDataSource',
      getTodosLambda
    );

    const addTodoDataSource = appsyncPlaygroundApi.addLambdaDataSource(
      'addTodoDataSource',
      addTodoLambda
    );

    const toggleTodoDataSource = appsyncPlaygroundApi.addLambdaDataSource(
      'toggleTodoDataSource',
      toggleTodoLambda
    );

    const deleteTodoDataSource = appsyncPlaygroundApi.addLambdaDataSource(
      'deleteTodoDataSource',
      deleteTodoLambda
    );

    const createUploadPresignedUrlDataSource =
      appsyncPlaygroundApi.addLambdaDataSource(
        'createUploadPresignedUrlLambda',
        createUploadPresignedUrlLambda
      );

    const createUploadPresignedUrlFunction = new AppsyncFunction(
      this,
      'createUploadPresignedUrlFunction',
      {
        api: appsyncPlaygroundApi,
        dataSource: createUploadPresignedUrlDataSource,
        name: 'CreateUploadPresignedUrlFunction',
        requestMappingTemplate: MappingTemplate.lambdaRequest(),
        responseMappingTemplate: MappingTemplate.lambdaResult(),
      }
    );

    const createDownloadPresignedUrlDataSource =
      appsyncPlaygroundApi.addLambdaDataSource(
        'createDownloadPresignedUrlLambda',
        createDownloadPresignedUrlLambda
      );

    const createDownloadPresignedUrlFunction = new AppsyncFunction(
      this,
      'createDownloadPresignedUrlFunction',
      {
        api: appsyncPlaygroundApi,
        dataSource: createDownloadPresignedUrlDataSource,
        name: 'CreateDownloadPresignedUrlFunction',
        requestMappingTemplate: MappingTemplate.lambdaRequest(),
        responseMappingTemplate: MappingTemplate.lambdaResult(),
      }
    );
    // Resolver
    getTodosDataSource.createResolver('QueryGetTodosResolver', {
      typeName: 'Query',
      fieldName: 'getTodos',
    });

    addTodoDataSource.createResolver('MutationAddTodoResolver', {
      typeName: 'Mutation',
      fieldName: 'addTodo',
    });

    toggleTodoDataSource.createResolver('MutationToggleTodoResolver', {
      typeName: 'Mutation',
      fieldName: 'toggleTodo',
    });

    deleteTodoDataSource.createResolver('MutationDeleteTodoResolver', {
      typeName: 'Mutation',
      fieldName: 'deleteTodo',
    });

    new Resolver(this, 'CreateUploadPresignedUrlResolver', {
      api: appsyncPlaygroundApi,
      typeName: 'Mutation',
      fieldName: 'createUploadPresignedUrl',
      pipelineConfig: [createUploadPresignedUrlFunction],
      requestMappingTemplate: MappingTemplate.fromString('$util.toJson({})'),
      responseMappingTemplate: MappingTemplate.fromString(
        '$util.toJson($ctx.prev.result)'
      ),
    });

    new Resolver(this, 'CreateDownloadPresignedUrlResolver', {
      api: appsyncPlaygroundApi,
      typeName: 'Mutation',
      fieldName: 'createDownloadPresignedUrl',
      pipelineConfig: [createDownloadPresignedUrlFunction],
      requestMappingTemplate: MappingTemplate.fromString('$util.toJson({})'),
      responseMappingTemplate: MappingTemplate.fromString(
        '$util.toJson($ctx.prev.result)'
      ),
    });

    // APP Runner使いたい

    // CloudFormationの出力として各リソースの情報を指定します。
    // これにより、デプロイ後にこれらの情報を簡単に取得できます。
    new cdk.CfnOutput(this, 'BucketName', {
      value: appsyncPlaygroundFrontendBucket.bucketName,
    });
    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolWebClientId', {
      value: userPoolClient.userPoolClientId,
    });
    new cdk.CfnOutput(this, 'CloudFrontURL', {
      value: `https://${distribution.distributionDomainName}`,
    });
    new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
      value: distribution.distributionId,
    });
    new cdk.CfnOutput(this, 'GraphQLEndpoint', {
      value: appsyncPlaygroundApi.graphqlUrl,
    });
  }
}
