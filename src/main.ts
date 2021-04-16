import { App, Construct, Stack, StackProps } from '@aws-cdk/core';
import { CertificatesManager } from './certificatesManager';
import { Cognito } from './cognito';
import { LoadBalancedEcs } from './loadBalancedEcs';

export class CloudBakeryStack extends Stack {
  constructor( scope: Construct, id: string, props: StackProps = {}) {
    super( scope, id, props );
    new LoadBalancedEcs(this, `${id}-loadbalanced-ecs`, { clusterName: 'n8n-dev', fargate: true, imageName: 'n8nio/n8n', ports: [{ containerPort: 5678 }] });
    new Cognito(this, `${id}-cognito`, { cognitoDomain: { domainPrefix: 'n8n-dev' } });
    new CertificatesManager(this, `${id}-certificates-manager`, { zoneName: 'jolo-zone' }, 'jolo.com');
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new CloudBakeryStack( app, 'loadbalanced-ecs-stack-projendev'
  , { env: devEnv, description: 'Loadbalanced Ecs App' });
// new LoadbalancedEcsAppStack(app, 'ecs-stack-projenprod', { env: prodEnv });

app.synth();