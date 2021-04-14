import { UserPool, UserPoolClient, UserPoolClientProps, UserPoolDomain, UserPoolDomainOptions, UserPoolProps } from '@aws-cdk/aws-cognito';
import { CfnOutput, Construct } from '@aws-cdk/core';

type OwnUserPoolClientProps = Omit<UserPoolClientProps, 'userPool'>

export class Cognito extends Construct {
  private userPool: UserPool;
  private userPoolClient: UserPoolClient;
  private userPoolDomain: UserPoolDomain;

  constructor(scope: Construct, id: string
    , userPoolProps: UserPoolProps
    , userPoolClientProps: OwnUserPoolClientProps
    , domainProps: UserPoolDomainOptions ) {
    super(scope, id);
    this.userPool = new UserPool(scope, `${id}-userPool`, userPoolProps);
    this.userPoolClient = new UserPoolClient(scope,
      `${id}-userPoolClient`,
      // @ts-ignore because we want to overwrite the userPool attribute
      { userPool: this.userPool, ...userPoolClientProps });
    this.userPoolDomain = this.createUserPoolDomain(domainProps);
    this.createCfnOutputs();
  }

  private createUserPoolDomain(domain: UserPoolDomainOptions) {
    return this.userPool.addDomain(`${this.userPoolClient.userPoolClientName}-domain`, domain);
  }

  private createCfnOutputs() {
    new CfnOutput(this, 'CfnCognitoUserPoolId', { exportName: 'CognitoUserPoolId', value: this.userPool.userPoolId });
    new CfnOutput(this, 'CfnCognitoUserPoolArn', { exportName: 'CognitoUserPoolArn', value: this.userPool.userPoolArn });
    new CfnOutput(this, 'CfnCognitoUserPoolClientId', { exportName: 'CognitoUserPoolClientId', value: this.userPoolClient.userPoolClientId });
    new CfnOutput(this, 'CfnCognitoUserPoolClientName', { exportName: 'CognitoUserPoolClientName', value: this.userPoolClient.userPoolClientName });
    new CfnOutput(this, 'CfnCognitoUserPoolDomain', { exportName: 'CognitoUserPoolDomain', value: this.userPoolDomain.domainName });
  }

}