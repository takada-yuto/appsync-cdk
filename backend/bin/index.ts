#!/usr/bin/env node
import "source-map-support/register"
import * as cdk from "aws-cdk-lib"
import { AppsyncTodoBackendStack } from "../lib/backend-stack"
import { AppsyncTodoFrontendStack } from "../lib/frontend-stack"

const app = new cdk.App()
new AppsyncTodoBackendStack(app, "AppsyncTodoBackendStack", {})
new AppsyncTodoFrontendStack(app, "AppsyncTodoFrontendStack", {})
