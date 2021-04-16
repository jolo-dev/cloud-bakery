import { Cluster, ContainerImage, Ec2TaskDefinition, FargateTaskDefinition, PortMapping } from '@aws-cdk/aws-ecs';
import { ApplicationLoadBalancedFargateServiceProps, ApplicationLoadBalancedEc2ServiceProps, ApplicationLoadBalancedFargateService, ApplicationLoadBalancedEc2Service } from '@aws-cdk/aws-ecs-patterns';
import { Construct } from '@aws-cdk/core';

export interface EcsData {
  clusterName: string;
  imageName: string;
  fargate: boolean;
  ports: PortMapping[];

}

export class Test extends Construct {
  private clusterName: string;
  private ports: PortMapping[];
  private serviceName: string;
  private imageName: string;
  private fargateType: boolean;

  constructor( scope: Construct, id: string, ecsData: EcsData ) {
    super( scope, id );
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