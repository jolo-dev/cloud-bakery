import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { CertificatesManager } from './certificatesManager';
import { Cognito } from './cognito';
import { LoadBalancedEcs } from './loadBalancedEcs';
import { Resources } from './main';


interface CloudBakeryRecipies {
  resources: Resources;
}


export class CloudBakeryStack extends Stack {
  constructor( scope: Construct, id: string, props: StackProps = {}, recipes: CloudBakeryRecipies ) {
    super( scope, id, props );

    switch (recipes.resources) {
      case Resources.LOADBALANCED_ECS:
        break;
      default:
        break;
    }
    const certManager = new CertificatesManager(this, 'certificates-manager',
      { zoneName: 'cloud-bakery.store', hostedZoneId: 'Z04625751OFTNM6DFI132' },
      'cloud-bakery.store');
    const lbe = new LoadBalancedEcs(this, 'loadbalanced-ecs',
      {
        clusterName: 'n8n-dev',
        fargate: true,
        imageName: 'n8nio/n8n',
        ports: [{ containerPort: 5678 }],
        loadBalancedEcsProps: {
          domainName: certManager.appDnsName,
          domainZone: certManager.hostedZone,
          certificate: certManager.getDnsCertificate(),
          authenticateViaCognito: true,
        },
      });
    if (lbe.authenticateViaCognito) {
      const cognito = new Cognito(this,
        'cognito',
        { domain: { cognitoDomain: { domainPrefix: 'n8n-dev' } } },
        {},
        { oAuth: { callbackUrls: [`https://${certManager.appDnsName}/oauth2/idpresponse`] } });
      lbe.authenticateViaCognito(cognito, certManager.appDnsName);
    }

  }
}