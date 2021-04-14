import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import { Cluster, ContainerImage, Ec2TaskDefinition, FargateTaskDefinition, PortMapping } from '@aws-cdk/aws-ecs';
import { ApplicationLoadBalancedFargateService, ApplicationLoadBalancedEc2Service, ApplicationLoadBalancedEc2ServiceProps, ApplicationLoadBalancedFargateServiceProps } from '@aws-cdk/aws-ecs-patterns';
import { HostedZone } from '@aws-cdk/aws-route53';
// import { ApplicationProtocol } from '@aws-cdk/aws-elasticloadbalancingv2';
import { App, Construct, Stack, StackProps } from '@aws-cdk/core';

export interface EcsData {
  clusterName: string;
  imageName: string;
  fargate: boolean;
  ports: PortMapping[];

}

export class LoadbalancedEcsAppStack extends Stack {
  private clusterName: string;
  private ports: PortMapping[];
  private serviceName: string;
  private imageName: string;
  private fargateType: boolean;

  constructor( scope: Construct, id: string, props: StackProps = {}, ecsData: EcsData ) {
    super( scope, id, props );
    this.clusterName = ecsData.clusterName;
    this.serviceName = `${ecsData.clusterName}-service`;
    this.fargateType = ecsData.fargate;
    this.imageName = ecsData.imageName;
    this.ports = ecsData.ports;
    this.buildEcs();
  }

  private buildEcs() {
    const cluster = new Cluster( this, this.clusterName );
    const taskdefinitionName = `${this.clusterName}-task-definition`;
    const taskDefinition = this.fargateType ?
      new FargateTaskDefinition( this, taskdefinitionName ) :
      new Ec2TaskDefinition( this, taskdefinitionName );

    taskDefinition.addContainer( `${this.clusterName}-container`, { image: ContainerImage.fromRegistry( this.imageName ), portMappings: this.ports } );

    const ecsProps: ApplicationLoadBalancedFargateServiceProps | ApplicationLoadBalancedEc2ServiceProps = {
      cluster: cluster, // Required
      cpu: 512, // Default is 256
      desiredCount: 2, // Default is 1
      memoryLimitMiB: 1024, // Default is 512
      publicLoadBalancer: true, // Default is false
      taskDefinition: taskDefinition,
      // listenerPort: 443,
      // protocol: ApplicationProtocol.HTTPS,
    };
    if ( this.fargateType ) {
      new ApplicationLoadBalancedFargateService( this, this.serviceName, ecsProps );
    } else {
      new ApplicationLoadBalancedEc2Service( this, this.serviceName, ecsProps );
    }


  }

}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new LoadbalancedEcsAppStack( app, 'loadbalanced-ecs-stack-projendev'
  , { env: devEnv, description: 'Loadbalanced Ecs App' }
  , { clusterName: 'n8n-dev', fargate: true, imageName: 'n8nio/n8n', ports: [{ containerPort: 5678 }] } );
// new LoadbalancedEcsAppStack(app, 'ecs-stack-projenprod', { env: prodEnv });

app.synth();