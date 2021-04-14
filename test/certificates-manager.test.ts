import '@aws-cdk/assert/jest';
import { Stack } from '@aws-cdk/core';
import { CertificateManager } from '../src/certificates-manager';

test( 'CertificatesManager', () => {
  const stack = new Stack();
  new CertificateManager( stack, 'test',
    { zoneName: '12345ABC' },
    'appDnsName',
  );
  expect( stack ).toHaveResource( 'AWS::Route53::PublicHostedZone' );
} );
