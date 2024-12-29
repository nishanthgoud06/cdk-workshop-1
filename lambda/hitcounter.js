const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { Lambda, InvokeCommand } = require("@aws-sdk/client-lambda");

exports.handler = async function(event) {
  console.log("request:", JSON.stringify(event, undefined, 2));
  
  const dynamo = new DynamoDB();
  const lambda = new Lambda();

  await dynamo.updateItem({
    TableName: process.env.HITS_TABLE_NAME,
    Key: { path: { S: event.path } },
    UpdateExpression: 'ADD hits :incr',
    ExpressionAttributeValues: { ':incr': { N: '1' } }
  });

  const command = new InvokeCommand({
    FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
    Payload: JSON.stringify(event)
  });

    const { Payload } = await lambda.send(command);
    const result = Buffer.from(Payload).toString();
    
    console.log('downstream function result:', result);

    return JSON.parse(result);
};