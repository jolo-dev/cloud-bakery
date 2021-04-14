import '@aws-cdk/assert/jest';
import { Stack } from '@aws-cdk/core';
import { Cognito } from '../src/cognito';

test( 'Cognito', () => {
  const stack = new Stack();
  new Cognito( stack, 'test',
    { userPoolName: 'testUserPool' },
    { userPoolClientName: 'testUserPoolClientName' },
    { cognitoDomain: { domainPrefix: 'test-cognito-domain' } },
  );

  expect( stack ).toHaveResource( 'AWS::Cognito::UserPool', { UserPoolName: 'testUserPool' } );
  expect( stack ).toHaveResource( 'AWS::Cognito::UserPoolClient', { ClientName: 'testUserPoolClientName' } );
  expect( stack ).toHaveResource( 'AWS::Cognito::UserPoolDomain', { Domain: 'test-cognito-domain' } );
} );
