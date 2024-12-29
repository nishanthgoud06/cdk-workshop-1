import { Code, Function, IFunction, Runtime } from "aws-cdk-lib/aws-lambda";
import { AttributeType, Table, TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { RemovalPolicy } from "aws-cdk-lib";

export interface HitCounterProps{
    downStream : IFunction;
    readCapacity?: number;
}

export class HitCounter extends Construct {
    public readonly handler: Function;
    public readonly table: Table;
    constructor(scope: Construct, id: string, props: HitCounterProps) {

        if(props.readCapacity && props.readCapacity < 5){
            throw new Error('readCapacity must be greater than 5');
        }
        super(scope, id);

        this.table = new Table(this, 'Hits', {
            partitionKey: { name: 'path', type:  AttributeType.STRING },
            encryption: TableEncryption.AWS_MANAGED,
            readCapacity: props.readCapacity ?? 5,
            removalPolicy: RemovalPolicy.DESTROY
        });

        this.handler = new Function(this, 'HitCounterHandler', {
            runtime: Runtime.NODEJS_LATEST,
            code: Code.fromAsset('lambda'),
            handler: 'hitcounter.handler',
            environment: {
                DOWNSTREAM_FUNCTION_NAME: props.downStream.functionName,
                HITS_TABLE_NAME: this.table.tableName
            }
        });
        this.table.grantReadWriteData(this.handler);
        props.downStream.grantInvoke(this.handler);
    }
}