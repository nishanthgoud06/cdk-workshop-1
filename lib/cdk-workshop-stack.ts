import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from 'constructs';
import { HitCounter } from './hitcounter';
import { TableViewer } from 'cdk-dynamo-table-viewer';

export class CdkWorkshopStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const hello = new Function(this, 'HelloHandler', {
      runtime: Runtime.NODEJS_LATEST,
      code: Code.fromAsset('lambda'),
      handler: 'lambda.handler',
      timeout: Duration.seconds(5)
    });

    const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {
        downStream: hello
    })

    const gateway = new LambdaRestApi(this, 'Endpoint', {
      handler: helloWithCounter.handler
    })

    const tv = new TableViewer(this, 'ViewHitCounter', {
      title: 'Hello Hits',
      sortBy: '-hits',
      table: helloWithCounter.table
    })
  }
}
