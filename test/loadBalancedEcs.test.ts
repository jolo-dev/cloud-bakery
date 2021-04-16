import '@aws-cdk/assert/jest';
import { Stack } from '@aws-cdk/core';
import { LoadBalancedEcs, EcsData } from '../src/loadBalancedEcs';

const fargateData: EcsData = {
  clusterName: 'fargateTest',
  clusterProps: { clusterName: 'fargateClusterName' },
  fargate: true,
  imageName: 'test-image',
  ports: [{ containerPort: 8080 }],
  taskDefinitonProps: { cpu: 512 },
};

test( 'ECS', () => {
  const stack = new Stack();
  new LoadBalancedEcs( stack, 'test', fargateData);

  expect( stack ).toHaveResource( 'AWS::ECS::Cluster' );
  expect( stack ).toHaveResource( 'AWS::ECS::TaskDefinition' );
  expect( stack ).toHaveResource( 'AWS::ECS::Service' );
  expect( stack ).toHaveResource( 'AWS::EC2::VPC' );
} );