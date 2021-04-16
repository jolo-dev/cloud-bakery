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
export class Cognito extends Construct {
  private userPool: UserPool;
  private userPoolClient: UserPoolClient;
  private userPoolDomain: UserPoolDomain;

  constructor(scope: Construct, id: string
    , domainProps: UserPoolDomainOptions
    , userPoolProps?: UserPoolProps
    , userPoolClientProps?: OwnUserPoolClientProps,
  ) {
    super(scope, id);
    this.userPool = new UserPool(this, `${id}-userPool`, userPoolProps);
    this.userPoolClient = new UserPoolClient(this,
      `${id}-userPoolClient`,
      // @ts-ignore because we want to overwrite the userPool attribute
      { userPool: this.userPool, ...userPoolClientProps });
    this.userPoolDomain = this.createUserPoolDomain(id, domainProps);
    this.createCfnOutputs();
  }

  private createUserPoolDomain(id: string, domain: UserPoolDomainOptions) {
    return this.userPool.addDomain(`${id}-domain`, domain);
  }

  private createCfnOutputs() {
    new CfnOutput(this, 'CfnCognitoUserPoolId', { exportName: 'CognitoUserPoolId', value: this.userPool.userPoolId });
    new CfnOutput(this, 'CfnCognitoUserPoolArn', { exportName: 'CognitoUserPoolArn', value: this.userPool.userPoolArn });
    new CfnOutput(this, 'CfnCognitoUserPoolClientId', { exportName: 'CognitoUserPoolClientId', value: this.userPoolClient.userPoolClientId });
    new CfnOutput(this, 'CfnCognitoUserPoolDomain', { exportName: 'CognitoUserPoolDomain', value: this.userPoolDomain.domainName });
  }

}