import * as cdk from "aws-cdk-lib"
import * as cloudFront from "aws-cdk-lib/aws-cloudfront"
import { Platform } from "aws-cdk-lib/aws-ecr-assets"
import * as s3 from "aws-cdk-lib/aws-s3"
import { Construct } from "constructs"
import path = require("path")

export class AppsyncPlaygroundFrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // const appsyncPlaygroundFrontendBucket = new s3.Bucket(
    //   this,
    //   "AppsyncPlaygroundFrontendBucket",
    //   {
    //     websiteIndexDocument: "index.html",
    //     autoDeleteObjects: true,
    //     removalPolicy: cdk.RemovalPolicy.DESTROY,
    //   }
    // )

    // const appsyncPlaygroundOAI = new cloudFront.OriginAccessIdentity(
    //   this,
    //   "AppsyncPlaygroundOAI"
    // )

    // appsyncPlaygroundFrontendBucket.grantRead(appsyncPlaygroundOAI)

    // const todoWebDestribution = new cloudFront.CloudFrontWebDistribution(
    //   this,
    //   "AppsyncPlaygroundWebDestribution",
    //   {
    //     originConfigs: [
    //       {
    //         s3OriginSource: {
    //           s3BucketSource: appsyncPlaygroundFrontendBucket,
    //           originAccessIdentity: appsyncPlaygroundOAI,
    //         },
    //         behaviors: [{ isDefaultBehavior: true }],
    //       },
    //     ],
    //   }
    // )

    // new cdk.aws_s3_deployment.BucketDeployment(
    //   this,
    //   "AppsyncPlaygroundBucketDeployment",
    //   {
    //     sources: [
    //       cdk.aws_s3_deployment.Source.asset(
    //         path.resolve(__dirname, "../../frontend/out")
    //       ),
    //     ],
    //     destinationBucket: appsyncPlaygroundFrontendBucket,
    //     distribution: todoWebDestribution,
    //     distributionPaths: ["/*"],
    //   }
    // )

    // new cdk.CfnOutput(this, "AppsyncPlaygroundWebDestributionName", {
    //   value: todoWebDestribution.distributionDomainName,
    // })
    const handler = new cdk.aws_lambda.DockerImageFunction(this, "Handler", {
      code: cdk.aws_lambda.DockerImageCode.fromImageAsset("../frontend", {
        platform: Platform.LINUX_AMD64,
      }),
      memorySize: 256,
      timeout: cdk.Duration.seconds(60),
    })

    const apigw = new cdk.aws_apigateway.RestApi(this, "SaNextApi", {
      restApiName: "SaNext",
    })

    const lambdaIntegration = new cdk.aws_apigateway.LambdaIntegration(handler)
    apigw.root.addMethod("ANY", lambdaIntegration)
  }
}
