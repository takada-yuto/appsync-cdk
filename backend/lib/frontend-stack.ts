import * as cdk from "aws-cdk-lib"
import * as cloudFront from "aws-cdk-lib/aws-cloudfront"
import * as s3 from "aws-cdk-lib/aws-s3"
import { Construct } from "constructs"
import path = require("path")

export class AppsyncTodoFrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const todoBucket = new s3.Bucket(this, "AppsyncTodoBucket", {
      websiteIndexDocument: "index.html",
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    const todoOAI = new cloudFront.OriginAccessIdentity(this, "AppsyncTodoOAI")

    todoBucket.grantRead(todoOAI)

    const todoWebDestribution = new cloudFront.CloudFrontWebDistribution(
      this,
      "AppsyncTodoWebDestribution",
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: todoBucket,
              originAccessIdentity: todoOAI,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
      }
    )

    new cdk.aws_s3_deployment.BucketDeployment(this, "TodoBucketDeployment", {
      sources: [
        cdk.aws_s3_deployment.Source.asset(
          path.resolve(__dirname, "../../frontend/out")
        ),
      ],
      destinationBucket: todoBucket,
      distribution: todoWebDestribution,
      distributionPaths: ["/*"],
    })

    new cdk.CfnOutput(this, "AppsyncTodoWebDestributionName", {
      value: todoWebDestribution.distributionDomainName,
    })
  }
}
