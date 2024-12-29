import { Stack } from "aws-cdk-lib";
import { Capture, Template } from "aws-cdk-lib/assertions";
import { Code,Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { HitCounter } from "../lib/hitcounter";

test("DynamoDB Table Created",()=>{
    const stack =new Stack();

    new HitCounter(stack,"hitCounter",{
        downStream:new Function(stack,"testFunction",{
            runtime:Runtime.NODEJS_LATEST,
            handler:"handler.handler",
            code:Code.fromInline("test")
        })
    });
    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::DynamoDB::Table",1);
    });

test("Lambda has env Variables",()=>{
    const stack =new Stack();

    new HitCounter(stack,"hitCounter",{
        downStream:new Function(stack,"testFunction",{
            runtime:Runtime.NODEJS_LATEST,
            handler:"hello.handler",
            code:Code.fromAsset("lambda")
        })
    });
    const template = Template.fromStack(stack);
    const envCapture = new Capture();
    template.hasResourceProperties("AWS::Lambda::Function",{
        Environment:envCapture
    });
    expect(envCapture.asObject()).toEqual({
        Variables:{
            DOWNSTREAM_FUNCTION_NAME:{Ref:"testFunction483F4CBE"},
            HITS_TABLE_NAME:{Ref:"hitCounterHits894A5A42"}
        }
    })
})

test("DynamoDB Table has be Encrypted",()=>{
    const stack =new Stack();

    new HitCounter(stack,"HitCounter",{
        downStream: new Function(stack,"testFunction",{
            runtime:Runtime.NODEJS_LATEST,
            handler:"hello.handler",
            code:Code.fromAsset("lambda")
        })
    })

    const template = Template.fromStack(stack);
    template.hasResource("AWS::DynamoDB::Table",{
        DeletionPolicy:"Retain",
        UpdateReplacePolicy:"Retain",
        Properties:{
            SSESpecification:{
                SSEEnabled:true
            }
        }
    })
})

test("read capacity can be configured",()=>{
    const stack = new Stack();

    expect(()=>{

    new HitCounter(stack,"hitCounter",{
        downStream:new Function(stack,"testFunction",{
            runtime:Runtime.NODEJS_LATEST,
            handler:"hello.handler",
            code:Code.fromAsset("lambda")
        }),
        readCapacity:1
    })
    }).toThrow("readCapacity must be greater than 5")

})