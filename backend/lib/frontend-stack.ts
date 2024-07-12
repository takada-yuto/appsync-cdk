import * as cdk from "aws-cdk-lib"
import { CfnApp, CfnBranch } from "aws-cdk-lib/aws-amplify"
import * as cloudFront from "aws-cdk-lib/aws-cloudfront"
import { BuildSpec } from "aws-cdk-lib/aws-codebuild"
import { Platform } from "aws-cdk-lib/aws-ecr-assets"
import * as s3 from "aws-cdk-lib/aws-s3"
import { Construct } from "constructs"
import path = require("path")
import * as amplify from "@aws-cdk/aws-amplify-alpha"
import * as codebuild from "aws-cdk-lib/aws-codebuild"

export class AppsyncPlaygroundFrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const appsyncPlaygroundFrontendBucket = new s3.Bucket(
      this,
      "AppsyncPlaygroundFrontendBucket",
      {
        websiteIndexDocument: "index.html",
        autoDeleteObjects: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    )

    const appsyncPlaygroundOAI = new cloudFront.OriginAccessIdentity(
      this,
      "AppsyncPlaygroundOAI"
    )

    appsyncPlaygroundFrontendBucket.grantRead(appsyncPlaygroundOAI)

    const todoWebDestribution = new cloudFront.CloudFrontWebDistribution(
      this,
      "AppsyncPlaygroundWebDestribution",
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
    )

    new cdk.aws_s3_deployment.BucketDeployment(
      this,
      "AppsyncPlaygroundBucketDeployment",
      {
        sources: [
          cdk.aws_s3_deployment.Source.asset(
            path.resolve(__dirname, "../../frontend/.next")
          ),
        ],
        destinationBucket: appsyncPlaygroundFrontendBucket,
        distribution: todoWebDestribution,
        distributionPaths: ["/*"],
      }
    )

    new cdk.CfnOutput(this, "AppsyncPlaygroundWebDestributionName", {
      value: todoWebDestribution.distributionDomainName,
    })

    // // Lambda 関数の実行ロールを作成
    // const lambdaExecutionRole = new cdk.aws_iam.Role(
    //   this,
    //   "LambdaExecutionRole",
    //   {
    //     assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
    //   }
    // )

    // // Lambda 関数の実行ロールにポリシーをアタッチ
    // lambdaExecutionRole.addManagedPolicy(
    //   cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
    //     "service-role/AWSLambdaBasicExecutionRole"
    //   )
    // )
    // lambdaExecutionRole.addManagedPolicy(
    //   cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
    //     "service-role/AWSLambdaVPCAccessExecutionRole"
    //   )
    // )

    // // API Gateway から Lambda 関数を呼び出す権限をロールに付与
    // lambdaExecutionRole.addToPolicy(
    //   new cdk.aws_iam.PolicyStatement({
    //     actions: ["lambda:InvokeFunction"],
    //     resources: ["*"], // 本番環境ではより具体的なリソースARNを指定することが推奨されます。
    //   })
    // )

    // // Lambda 関数を作成し、実行ロールを割り当て
    // const handler = new cdk.aws_lambda.DockerImageFunction(this, "Handler", {
    //   code: cdk.aws_lambda.DockerImageCode.fromImageAsset("../frontend", {
    //     platform: Platform.LINUX_AMD64,
    //   }),
    //   memorySize: 256,
    //   timeout: cdk.Duration.seconds(60),
    //   role: lambdaExecutionRole, // 作成した実行ロールをLambda関数に割り当て
    // })

    // // API Gateway を作成
    // const apigw = new cdk.aws_apigateway.RestApi(this, "SaNextApi", {
    //   restApiName: "SaNext",
    // })

    // // Lambda 関数を API Gateway に統合
    // const lambdaIntegration = new cdk.aws_apigateway.LambdaIntegration(handler)
    // apigw.root.addMethod("ANY", lambdaIntegration)
  }
}
