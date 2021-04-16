import {
  Cluster,
  ContainerImage,
  Ec2TaskDefinition,
  FargateTaskDefinition,
  PortMapping,
  ClusterProps,
  Ec2TaskDefinitionProps,
  FargateTaskDefinitionProps,
} from '@aws-cdk/aws-ecs';
import {
  ApplicationLoadBalancedEc2Service,
  ApplicationLoadBalancedEc2ServiceProps,
  ApplicationLoadBalancedFargateService,
  ApplicationLoadBalancedFargateServiceProps,
} from '@aws-cdk/aws-ecs-patterns';
import { Construct, CfnOutput } from '@aws-cdk/core';

// Remove Cluster prop because we create a new one
// type loadBalancedEcsProps = Omit<ApplicationLoadBalancedFargateServiceProps | ApplicationLoadBalancedEc2ServiceProps, 'cluster'>;

export interface EcsData {
  clusterName: string;
  fargate: boolean;
  imageName: string;
  ports: PortMapping[];
  // optionally passing information like cluster or VPC. If not it will be created during runtime
  loadBalancedEcsProps?: ApplicationLoadBalancedFargateServiceProps | ApplicationLoadBalancedEc2ServiceProps;
  clusterProps?: ClusterProps;
  taskDefinitonProps?: FargateTaskDefinitionProps | Ec2TaskDefinitionProps;
}

export class LoadBalancedEcs extends Construct {
  private clusterName: string;
  private ports: PortMapping[];
  private imageName: string;
  private fargate: boolean;
  private cluster: Cluster;
  private taskDefinition: FargateTaskDefinition | Ec2TaskDefinition;
  private loadBalancedEcsProps: ApplicationLoadBalancedFargateServiceProps | ApplicationLoadBalancedEc2ServiceProps | undefined;
  private loadBalancedService: ApplicationLoadBalancedFargateService | ApplicationLoadBalancedEc2Service;

  constructor( scope: Construct, id: string, ecsData: EcsData ) {
    super( scope, id );
    this.clusterName = ecsData.clusterName;
    this.fargate = ecsData.fargate;
    this.imageName = ecsData.imageName;
    this.ports = ecsData.ports;
    this.cluster = new Cluster( scope, `${id}-cluster`, ecsData.clusterProps );
    this.taskDefinition = this.createTaskDefinition(id, ecsData.taskDefinitonProps);
    this.loadBalancedEcsProps = ecsData.loadBalancedEcsProps ?? undefined;
    this.loadBalancedService = this.buildLoadBalancedService();
    this.createCfnOutputs();
  }

  private createTaskDefinition(id: string, taskDefinitionProps?: FargateTaskDefinitionProps | Ec2TaskDefinitionProps) {
    const taskDefinition = this.fargate ?
      new FargateTaskDefinition( this, `${id}-fargate-task-definition`, taskDefinitionProps ) :
      new Ec2TaskDefinition( this, `${id}-ec2-task-definition`, taskDefinitionProps );
    taskDefinition.addContainer( `${this.clusterName}-container`, { image: ContainerImage.fromRegistry( this.imageName ), portMappings: this.ports } );
    return taskDefinition;
  }

  private buildLoadBalancedService() {
    const serviceName = `${this.clusterName}-service`;
    const ecsProps: ApplicationLoadBalancedFargateServiceProps | ApplicationLoadBalancedEc2ServiceProps
      = this.loadBalancedEcsProps !== undefined
        ? { cluster: this.cluster, taskDefinition: this.taskDefinition, ...this.loadBalancedEcsProps }
        : { cluster: this.cluster, taskDefinition: this.taskDefinition };

    if ( this.fargate ) {
      return new ApplicationLoadBalancedFargateService( this, serviceName, ecsProps );
    } else {
      return new ApplicationLoadBalancedEc2Service( this, serviceName, ecsProps );
    }
  }

  private createCfnOutputs() {
    new CfnOutput(this, 'CfnClusterName', { exportName: 'ClusterName', value: this.cluster.clusterName });
    new CfnOutput(this, 'CfnClusterArn', { exportName: 'ClusterName', value: this.cluster.clusterArn });
    new CfnOutput(this, 'CfnTaskDefinitionArn', { exportName: 'ClusterName', value: this.taskDefinition.taskDefinitionArn });
    // LoadBalancer related information
    new CfnOutput(this, 'CfnLoadBalancerName', { exportName: 'LoadBalancerName', value: this.loadBalancedService.loadBalancer.loadBalancerName });
    new CfnOutput(this, 'CfnLoadBalancerArn', { exportName: 'LoadBalancerArn', value: this.loadBalancedService.loadBalancer.loadBalancerArn });
    new CfnOutput(this, 'CfnLoadBalancerDnsName', { exportName: 'LoadBalancerDnsName', value: this.loadBalancedService.loadBalancer.loadBalancerDnsName });
    new CfnOutput(this, 'CfnLoadBalancerFullName', { exportName: 'LoadBalancerFullName', value: this.loadBalancedService.loadBalancer.loadBalancerFullName });
    new CfnOutput(this, 'CfnLoadBalancerCanonicalHostedZoneId', { exportName: 'LoadBalancerCanonicalHostedZoneId', value: this.loadBalancedService.loadBalancer.loadBalancerCanonicalHostedZoneId });
    new CfnOutput(this, 'CfnListenerArn', { exportName: 'ListenerArn', value: this.loadBalancedService.listener.listenerArn });
    // VPC related information
    new CfnOutput(this, 'CfnVpcId', { exportName: 'VpcId', value: this.loadBalancedService.loadBalancer.vpc.vpcId });

    this.loadBalancedService.loadBalancer.vpc.privateSubnets.forEach((sub, index: number) => {
      new CfnOutput(this, `CfnPrivateSubnetid-${index}`, { exportName: `PrivateSubnetId-${index}`, value: sub.subnetId });
      new CfnOutput(this, `CfnPrivateSubnetAZ-${index}`, { exportName: `PrivateSubnetAZ-${index}`, value: sub.availabilityZone });
    });

    this.loadBalancedService.loadBalancer.vpc.publicSubnets.forEach((sub, index: number) => {
      new CfnOutput(this, `CfnPublicSubnetid-${index}`, { exportName: `PublicSubnetId-${index}`, value: sub.subnetId });
      new CfnOutput(this, `CfnPublicSubnetAZ-${index}`, { exportName: `PublicSubnetAZ-${index}`, value: sub.availabilityZone });
    });
  }
}