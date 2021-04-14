import '@aws-cdk/assert/jest';
import { App } from '@aws-cdk/core';
import { LoadbalancedEcsAppStack } from '../src/main';

test( 'Resources', () => {
  const app = new App();
  const stack = new LoadbalancedEcsAppStack( app, 'test', {}, { clusterName: 'test', fargate: true, imageName: 'test-image', ports: [{ containerPort: 8080 }] } );

  expect( stack ).toHaveResource( 'AWS::ECS::Cluster' );
  expect( stack ).toHaveResource( 'AWS::ECS::TaskDefinition' );
  expect( stack ).toHaveResource( 'AWS::ECS::Service' );
} );

test( 'Fargate', () => {
  const app = new App();
  const stack = new LoadbalancedEcsAppStack( app, 'test', {}, { clusterName: 'test', fargate: true, imageName: 'test-image', ports: [{ containerPort: 8080 }] } );

  expect( stack ).toHaveResource( 'AWS::ECS::Cluster' );
  expect( stack ).toHaveResource( 'AWS::ECS::Service' );
  expect( stack ).toHaveProperty( 'LaunchType', 'FARGATE' );
} );