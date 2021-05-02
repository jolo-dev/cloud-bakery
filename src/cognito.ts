import {
  UserPool,
  UserPoolClient,
  UserPoolClientProps,
  UserPoolDomain,
  UserPoolDomainOptions,
  UserPoolProps,
} from '@aws-cdk/aws-cognito';
import { CfnOutput, Construct } from '@aws-cdk/core';

type OwnUserPoolClientProps = Omit<UserPoolClientProps, 'userPool'>

type EitherCognitoOrCustomDomain<T, TKey extends keyof T = keyof T> =
    TKey extends keyof T ? { [P in TKey]-?:T[TKey] } & Partial<Record<Exclude<keyof T, TKey>, never>>: never
interface OwnDomain {
  domain: EitherCognitoOrCustomDomain<UserPoolDomainOptions>;
}

export class Cognito extends Construct {
  readonly userPool: UserPool;
  readonly userPoolClient: UserPoolClient;
  readonly userPoolDomain: UserPoolDomain;

  constructor(scope: Construct, id: string
    , domainProps: OwnDomain // should be either Cognito or Custom Domain
    , userPoolProps?: UserPoolProps
    , userPoolClientProps?: OwnUserPoolClientProps,
  ) {
    super(scope, id);
    this.userPool = new UserPool(this, 'userPool', userPoolProps);
    this.userPoolClient = new UserPoolClient(this,
      'userPoolClient',
      // @ts-ignore because we want to overwrite the userPool attribute
      { userPool: this.userPool, generateSecret: true, ...userPoolClientProps });
    this.userPoolDomain = this.createUserPoolDomain(domainProps.domain);
    this.createCfnOutputs();
  }

  private createUserPoolDomain(domain: UserPoolDomainOptions) {
    return this.userPool.addDomain('domain', domain);
  }

  private createCfnOutputs() {
    new CfnOutput(this, 'CfnCognitoUserPoolId', { exportName: 'CognitoUserPoolId', value: this.userPool.userPoolId });
    new CfnOutput(this, 'CfnCognitoUserPoolArn', { exportName: 'CognitoUserPoolArn', value: this.userPool.userPoolArn });
    new CfnOutput(this, 'CfnCognitoUserPoolClientId', { exportName: 'CognitoUserPoolClientId', value: this.userPoolClient.userPoolClientId });
    new CfnOutput(this, 'CfnCognitoUserPoolDomain', { exportName: 'CognitoUserPoolDomain', value: this.userPoolDomain.domainName });
  }

}