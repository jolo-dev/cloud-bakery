import '@aws-cdk/assert/jest';
import { Stack } from '@aws-cdk/core';
import { CertificatesManager } from '../src/certificatesManager';

test( 'CertificatesManager', () => {
  const stack = new Stack();
  new CertificatesManager( stack, 'test-1',
    { zoneName: '12345ABC' },
    'appDnsName',
  );
  expect( stack ).toHaveResource( 'AWS::Route53::HostedZone' );
} );

test( 'Getting hosted zones', async () => {

  const stack = new Stack();
  const cem = new CertificatesManager( stack, 'test-2',
    { zoneName: '12345ABC' },
    'appDnsName',
  );
  const hostedZones = await cem.getListOfHostedZones();
  expect(hostedZones?.length).toBeGreaterThan(0);
} );

// test( 'Validate Dns Certificate', async () => {
//   const stack = new Stack();
//   const cem = new CertificatesManager( stack, 'test-3',
//     { zoneName: '12345ABCDE' },
//     'https://example.org',
//   );
//   cem.getDnsCertificate();
//   expect(stack).toHaveResource('AWS::CertificateManager::Certificate');
// } );

test( 'Validate Dns Certificate', async () => {
  const stack = new Stack();
  const cem = new CertificatesManager( stack, 'test-3',
    { zoneName: '12345ABCDE' },
    'example.org',
  );
  const listOfHostedZones = await cem.getListOfHostedZones();
  expect(listOfHostedZones?.length).toBeGreaterThan(0);
} );