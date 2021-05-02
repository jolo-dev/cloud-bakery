#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

import { App } from '@aws-cdk/core';
import clear = require( 'clear' );
import figlet = require( 'figlet' );
import { Cli } from './cli';
import { CloudBakeryStack } from './stack';

clear();
console.log(
  figlet.textSync('cloud-bakery', { horizontalLayout: 'full', font: 'ANSI Shadow' }),
);

export enum Resources {
  LOADBALANCED_ECS = 'Load Balanced ECS',
  STATIC_APP_TO_S3 = 'Deploy a static App to S3'
}

interface answer {
  resources: string;
}

export async function main(): Promise<any> {
  const inquirer = new Cli();
  const choice: answer = await inquirer.whatToBake();

  if (choice.resources === Resources.LOADBALANCED_ECS) {
    const devEnv = {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    };
    const app = new App();
    new CloudBakeryStack( app, 'loadbalanced-ecs-stack-projendev'
      , { env: devEnv, description: 'Loadbalanced Ecs App' }
      , { resources: choice.resources });
    app.synth();
    console.log(choice);
  }
}

void main();