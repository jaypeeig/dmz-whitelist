'use strict';
const AWS = require('aws-sdk');

const ec2 = new AWS.EC2();

const getIngressRules = async(securityGrp) => {
  let params = { GroupIds: [ securityGrp ] };
  const response = ec2.describeSecurityGroups(params);
  console.log(response);
  const [obj] = response.SecurityGroups;
  console.log(obj);
  return obj;
};


module.exports.connect = async event => {
  const securityGroupId = process.env.SECURITY_GROUP_ID || '';
  let groupDetails = await getIngressRules(securityGroupId);

  const response = {
    message: 'Go serverless',
    securityGroupId
  };

  return {
    statusCode: 200,
    body: JSON.stringify(response)
  };
};
