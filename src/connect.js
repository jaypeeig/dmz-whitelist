'use strict';
const AWS = require('aws-sdk');
const ec2 = new AWS.EC2();

module.exports.handler = async event => {
    const securityGroupId = process.env.SECURITY_GROUP_ID || '';
    const {ip, port} = getParams(event);
    try {
      await getIngressRules(securityGroupId);
      return addIngressRules(ip, port);
    } catch (error) {
      return {
        statusCode: 400,
        body: error
      };
    }
};

const getIngressRules = (securityGroupId) => {
  return new Promise((resolve, reject) => {
    console.log(`Getting SG Ingress rules for ${securityGroupId}`);
    let params = { GroupIds: [securityGroupId ] };
    ec2.describeSecurityGroups(params, (err, data) => {
      if (err) return resolve(err);
      return resolve(data);
    });
  });
};

const addIngressRules = (ip, port) => {
  return new Promise((resolve, reject) => {
    const TTL_IN_MINUTES = process.env.TTL_IN_MINUTES || 2;
    const timestamp_ttl = Math.floor((new Date().getTime() / 1000) + (TTL_IN_MINUTES * 60));

    const params = {
        GroupId: process.env.SECURITY_GROUP_ID,
        IpPermissions: [
          {
          FromPort: port,
          IpProtocol: "tcp",
          IpRanges: [{
            CidrIp: `${ip}/32`,
            Description: `TTL ${timestamp_ttl}`
           }],
          ToPort: port
         }
        ]
    };
    ec2.authorizeSecurityGroupIngress(params, (err, data) => {
      if (err) return resolve({statusCode: 400, body: JSON.stringify(err)});
      return resolve({statusCode: 200, body: JSON.stringify({
        message: `Ingress Rule for ${ip}/32:${port} added to ${process.env.SECURITY_GROUP_ID}`,
        expireTime: timestamp_ttl
        })
      });
    });
  });
};

const getParams = (event) => {
  try {
    return {
      ip:  event.headers['X-Forwarded-For'].split(',')[0].trim(),
      port: process.env.PORT || 8080
    }
  } catch (e) {
    //return failover defaults
    return {
      ip: '1.1.1.1',
      port: 8080
    }
  }
}
