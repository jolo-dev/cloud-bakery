// import { Peer, Port, Protocol } from '@aws-cdk/aws-ec2';
import { Peer, Port, Protocol } from '@aws-cdk/aws-ec2';
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
import { ApplicationLoadBalancer, CfnListenerRule } from '@aws-cdk/aws-elasticloadbalancingv2';
// import { AuthenticateCognitoAction } from '@aws-cdk/aws-elasticloadbalancingv2-actions';
import { Construct, CfnOutput } from '@aws-cdk/core';
// import { CertificatesManager } from './certificatesManager';
import { Cognito } from './cognito';

// Remove Cluster prop because we create a new one
type LoadBalancedEcsProps =
  Omit<ApplicationLoadBalancedFargateServiceProps | ApplicationLoadBalancedEc2ServiceProps, 'cluster'> &
  { authenticateViaCognito: boolean }


export interface LoadBalancedEcsIngridients {
  clusterName: string;
  fargate: boolean;
  imageName: string;
  ports: PortMapping[];
  // optionally passing information like cluster or VPC. If not it will be created during runtime
  loadBalancedEcsProps?: LoadBalancedEcsProps;
  clusterProps?: ClusterProps;
  taskDefinitonProps?: FargateTaskDefinitionProps | Ec2TaskDefinitionProps;
}

export class LoadBalancedEcs extends Construct {
  readonly clusterName: string;
  readonly ports: PortMapping[];
  readonly imageName: string;
  readonly fargate: boolean;
  readonly cluster: Cluster;
  readonly taskDefinition: FargateTaskDefinition | Ec2TaskDefinition;
  readonly loadBalancedEcsProps: ApplicationLoadBalancedFargateServiceProps | ApplicationLoadBalancedEc2ServiceProps | undefined;
  readonly loadBalancedService: ApplicationLoadBalancedFargateService | ApplicationLoadBalancedEc2Service;
  readonly loadBalancer: ApplicationLoadBalancer;

  constructor( scope: Construct, id: string, lbEcsIngridients: LoadBalancedEcsIngridients ) {
    super( scope, id );
    this.clusterName = lbEcsIngridients.clusterName;
    this.fargate = lbEcsIngridients.fargate;
    this.imageName = lbEcsIngridients.imageName;
    this.ports = lbEcsIngridients.ports;
    this.cluster = new Cluster( scope, `${this.clusterName}-cluster`, lbEcsIngridients.clusterProps );
    this.taskDefinition = this.createTaskDefinition(lbEcsIngridients.taskDefinitonProps);
    this.loadBalancedEcsProps = lbEcsIngridients.loadBalancedEcsProps ?? undefined;
    this.loadBalancedService = this.buildLoadBalancedService();
    this.loadBalancer = this.loadBalancedService.loadBalancer;
    this.createCfnOutputs();
  }

  private createTaskDefinition(taskDefinitionProps?: FargateTaskDefinitionProps | Ec2TaskDefinitionProps) {
    const taskDefinition = this.fargate ?
      new FargateTaskDefinition( this, `${this.clusterName}-fargate-task-definition`, taskDefinitionProps ) :
      new Ec2TaskDefinition( this, `${this.clusterName}-ec2-task-definition`, taskDefinitionProps );
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
    new CfnOutput(this, 'CfnClusterArn', { exportName: 'ClusterArn', value: this.cluster.clusterArn });
    new CfnOutput(this, 'CfnTaskDefinitionArn', { exportName: 'TaskDefinitionArn', value: this.taskDefinition.taskDefinitionArn });
    // LoadBalancer related information
    new CfnOutput(this, 'CfnLoadBalancerName', { exportName: 'LoadBalancerName', value: this.loadBalancedService.loadBalancer.loadBalancerName });
    new CfnOutput(this, 'CfnLoadBalancerArn', { exportName: 'LoadBalancerArn', value: this.loadBalancedService.loadBalancer.loadBalancerArn });
    new CfnOutput(this, 'CfnLoadBalancerDnsName', { exportName: 'LoadBalancerDnsName', value: this.loadBalancedService.loadBalancer.loadBalancerDnsName });
    new CfnOutput(this, 'CfnLoadBalancerFullName', { exportName: 'LoadBalancerFullName', value: this.loadBalancedService.loadBalancer.loadBalancerFullName });
    new CfnOutput(this, 'CfnLoadBalancerCanonicalHostedZoneId', { exportName: 'LoadBalancerCanonicalHostedZoneId', value: this.loadBalancedService.loadBalancer.loadBalancerCanonicalHostedZoneId });
    new CfnOutput(this, 'CfnListenerArn', { exportName: 'ListenerArn', value: this.loadBalancedService.listener.listenerArn });
    // VPC related information
    new CfnOutput(this, 'CfnVpcId', { exportName: 'VpcId', value: this.loadBalancedService.loadBalancer.vpc!.vpcId });

    this.loadBalancedService.loadBalancer.vpc?.privateSubnets.forEach((sub, index: number) => {
      new CfnOutput(this, `CfnPrivateSubnetid-${index}`, { exportName: `PrivateSubnetId-${index}`, value: sub.subnetId });
      new CfnOutput(this, `CfnPrivateSubnetAZ-${index}`, { exportName: `PrivateSubnetAZ-${index}`, value: sub.availabilityZone });
    });

    this.loadBalancedService.loadBalancer.vpc?.publicSubnets.forEach((sub, index: number) => {
      new CfnOutput(this, `CfnPublicSubnetid-${index}`, { exportName: `PublicSubnetId-${index}`, value: sub.subnetId });
      new CfnOutput(this, `CfnPublicSubnetAZ-${index}`, { exportName: `PublicSubnetAZ-${index}`, value: sub.availabilityZone });
    });
  }

  public authenticateViaCognito(cognito: Cognito, appDnsName: string) {
    const lbSg = this.loadBalancer.connections.securityGroups[0];
    lbSg.addEgressRule(
      Peer.anyIpv4(),
      new Port({ protocol: Protocol.TCP, stringRepresentation: '443', fromPort: 443, toPort: 443 }),
      'Outbound HTTPS traffic to get to Cognito',
    );
    // Allow 10 seconds for in flight requests before termination, the default of 5 minutes is much too high.
    this.loadBalancedService.targetGroup.setAttribute('deregistration_delay.timeout_seconds', '10');
    new CfnListenerRule(this, 'AuthenticateRule', {
      actions: [
        {
          type: 'authenticate-cognito',
          authenticateCognitoConfig: {
            userPoolArn: cognito.userPool.userPoolArn,
            userPoolClientId: cognito.userPoolClient.userPoolClientId,
            userPoolDomain: cognito.userPoolDomain.domainName,
          },
          order: 1,
        },
        {
          type: 'forward',
          order: 100,
          targetGroupArn: this.loadBalancedService.targetGroup.targetGroupArn,
        },
      ],
      conditions: [
        {
          field: 'host-header',
          hostHeaderConfig: {
            values: [appDnsName],
          },
        },
      ],
      listenerArn: this.loadBalancedService.listener.listenerArn,
      priority: 1000,
    });
  }
}