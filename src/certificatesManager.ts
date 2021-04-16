import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import { HostedZone, PublicHostedZone, IHostedZone, PublicHostedZoneProps } from '@aws-cdk/aws-route53';
import { CfnOutput, Construct } from '@aws-cdk/core';

type OwnHostedZoneProps = Omit<PublicHostedZoneProps, 'x'> & {
  zoneName: string;
  hostedZoneId?: string;
};

export class CertificatesManager extends Construct {
  private appDnsName: string;
  private hostedZone: IHostedZone;

  constructor(scope: Construct, id: string, hostedZoneProps: OwnHostedZoneProps, appDnsName: string) {
    super( scope, id );
    this.appDnsName = appDnsName;
    this.hostedZone = hostedZoneProps.hostedZoneId === undefined
      ? this.createHostedZone(scope, hostedZoneProps)
      : HostedZone.fromHostedZoneAttributes(
        this,
        `${id}-HostedZone`,
        { hostedZoneId: hostedZoneProps.hostedZoneId, zoneName: hostedZoneProps.zoneName },
      );

    this.createCfnOutputs();
  }

  public getDnsCertificate() {
    const cert = new DnsValidatedCertificate( this, 'Certificate', {
      hostedZone: this.hostedZone,
      domainName: this.appDnsName,
    } );
    return cert;
  };

  private createHostedZone(scope: Construct, hostedZoneProps: OwnHostedZoneProps): HostedZone {
    return new PublicHostedZone(scope, 'PublicHostedZone', { zoneName: hostedZoneProps.zoneName });
  }

  private createCfnOutputs() {
    new CfnOutput(this, 'CfnHostedZoneId', { exportName: 'HostedZoneId', value: this.hostedZone.hostedZoneId });
    new CfnOutput(this, 'CfnHostedZoneName', { exportName: 'HostedZoneName', value: this.hostedZone.zoneName });
    new CfnOutput(this, 'CfnHostedZoneArn', { exportName: 'HostedZoneArn', value: this.hostedZone.hostedZoneArn });
    new CfnOutput(this, 'CfnAppDnsName', { exportName: 'CfnAppDnsName', value: this.appDnsName });
  }
}
