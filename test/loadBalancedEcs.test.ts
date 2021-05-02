import '@aws-cdk/assert/jest';
import { Stack } from '@aws-cdk/core';
import { Cognito } from '../src/cognito';
import { LoadBalancedEcs, LoadBalancedEcsIngridients } from '../src/loadBalancedEcs';
// jest.mock('../src/cognito'); // SoundPlayer is now a mock constructor

describe('Loadbalanced ECS', () => {
  const stack = new Stack();
  test( 'ECS', () => {
    const fargateData: LoadBalancedEcsIngridients = {
      clusterName: 'fargateTest1',
      clusterProps: { clusterName: 'fargateClusterName' },
      fargate: true,
      imageName: 'test-image',
      ports: [{ containerPort: 8080 }],
      taskDefinitonProps: { cpu: 512 },
    };
    new LoadBalancedEcs( stack, 'test-loadbalanced-ecs', fargateData);
    expect( stack ).toHaveResource( 'AWS::ECS::Cluster' );
    expect( stack ).toHaveResource( 'AWS::ECS::TaskDefinition' );
    expect( stack ).toHaveResource( 'AWS::ECS::Service' );
    expect( stack ).toHaveResource( 'AWS::EC2::VPC' );
  });

  it('should create a cognito auth-based listener rule', () => {
    const fargateData: LoadBalancedEcsIngridients = {
      clusterName: 'fargateTest2',
      clusterProps: { clusterName: 'fargateClusterName' },
      fargate: true,
      imageName: 'test-image',
      ports: [{ containerPort: 8080 }],
      taskDefinitonProps: { cpu: 512 },
    };
    const lbe = new LoadBalancedEcs( stack, 'test-loadbalanced-ecs-with-cognito', fargateData);
    lbe.authenticateViaCognito(
      new Cognito(stack, 'test-cognito-before-alb', { domain: { cognitoDomain: { domainPrefix: 'test-prefix' } } }),
      'testDnsName',
    );
    expect( stack ).toHaveResource( 'AWS::ECS::TaskDefinition' );
    // expect( stack ).toHaveResource( 'AWS::Cognito::Userpool' );
  });
});

