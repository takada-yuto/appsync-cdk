#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AppsyncPlaygroundBackendStack } from '../lib/backend-stack';
import { AppsyncPlaygroundFrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();
new AppsyncPlaygroundBackendStack(app, 'AppsyncPlaygroundBackendStack', {});
// new AppsyncPlaygroundFrontendStack(app, "AppsyncPlaygroundFrontendStack", {})
