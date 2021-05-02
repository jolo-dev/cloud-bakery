import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import { HostedZone, PublicHostedZone, IHostedZone, PublicHostedZoneProps } from '@aws-cdk/aws-route53';
import { CfnOutput, Construct } from '@aws-cdk/core';
import { ACMClient, ListCertificatesCommand, CertificateSummary, GetCertificateCommand } from '@aws-sdk/client-acm';
import { Route53Client, ListHostedZonesCommand } from '@aws-sdk/client-route-53';
// import validator from 'validator';

type OwnHostedZoneProps = Omit<PublicHostedZoneProps, 'x'> & {
  zoneName: string;
  hostedZoneId?: string;
};

/**
 * This class creates a Hosted Zone in Route53 if needed and issues a certificate which is needed
 * for the Loadbalancer to provide SSL/TLS and support HTTPS
 */
export class CertificatesManager extends Construct {
  readonly appDnsName: string;
  readonly hostedZone: IHostedZone;
  private acmClient = new ACMClient({ region: 'eu-central-1' });

  constructor(scope: Construct, id: string, hostedZoneProps: OwnHostedZoneProps, appDnsName: string) {
    super( scope, id );
    this.appDnsName = appDnsName;
    this.hostedZone = hostedZoneProps.hostedZoneId === undefined
      ? this.createHostedZone(scope, hostedZoneProps)
      : HostedZone.fromHostedZoneAttributes(
        this,
        'HostedZone',
        { hostedZoneId: hostedZoneProps.hostedZoneId, zoneName: hostedZoneProps.zoneName },
      );
    this.createCfnOutputs();
  }

  private createHostedZone(scope: Construct, hostedZoneProps: OwnHostedZoneProps): HostedZone {
    return new PublicHostedZone(scope, 'PublicHostedZone', { zoneName: hostedZoneProps.zoneName });
  }

  private createCfnOutputs() {
    new CfnOutput(this, 'CfnHostedZoneId', { exportName: 'HostedZoneId', value: this.hostedZone.hostedZoneId });
    new CfnOutput(this, 'CfnHostedZoneName', { exportName: 'HostedZoneName', value: this.hostedZone.zoneName });
    new CfnOutput(this, 'CfnHostedZoneArn', { exportName: 'HostedZoneArn', value: this.hostedZone.hostedZoneArn });
    new CfnOutput(this, 'CfnAppDnsName', { exportName: 'CfnAppDnsName', value: this.appDnsName });
  }

  public async getListOfHostedZones(): Promise<OwnHostedZoneProps[] | undefined> {
    const route53 = new Route53Client({ region: 'eu-central-1' });
    const listOfHostedZones: OwnHostedZoneProps[] = [];
    const data = await route53.send(new ListHostedZonesCommand({}));

    if (data.HostedZones !== undefined) {
      data.HostedZones.map((hostedZone) => {
        listOfHostedZones.push({ zoneName: hostedZone.Name!, hostedZoneId: hostedZone.Id!.replace('/hostedzone/', '') });
      });
    }

    return listOfHostedZones;
  }

  public getDnsCertificate(): DnsValidatedCertificate {
    const dnsValidatedCertificate = new DnsValidatedCertificate( this, 'Certificate', {
      hostedZone: this.hostedZone,
      domainName: this.appDnsName,
    } );
    return dnsValidatedCertificate;
  };

  public async getAcmCertificates(): Promise<CertificateSummary[]> {
    const data = await this.acmClient.send(new ListCertificatesCommand({}));
    const certificates: CertificateSummary[] = [];
    if (data.CertificateSummaryList !== undefined) {
      data.CertificateSummaryList.map((cert) => {
        certificates.push(cert);
      });
    }
    return certificates;
  }

  public async getAcmCertificateByArn(certArn: string) {
    const data = await this.acmClient.send(new GetCertificateCommand({ CertificateArn: certArn }));
    return data;
  }
}
