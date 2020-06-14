'use strict';
const AWS = require('aws-sdk');
const ec2 = new AWS.EC2();

module.exports.handler = async event => {
    const securityGroupId = process.env.SECURITY_GROUP_ID || '';
    try {
        const securityGroup = await getIngressRules(securityGroupId);
        const formatData = buildParams(securityGroup);
        await removeIngressRules(formatData);
        console.log('Params: ', JSON.stringify(formatData));
        return {
            message: `Removed ingress rules`,
            body: JSON.stringify(formatData)
        };
    } catch (error) {
        console.log(error);
    }
};

const getIngressRules = (securityGroupId) => {
    return new Promise((resolve) => {
        console.log(`Getting SG Ingress rules for ${securityGroupId}`);
        let params = { GroupIds: [securityGroupId ] };
        ec2.describeSecurityGroups(params, (err, data) => {
            if (err) return resolve(err);
            return resolve(data);
        });
    });
};

const removeIngressRules = (params) => {
  return new Promise((resolve, reject) => {
    if (params.IpPermissions.length > 0) {
      ec2.revokeSecurityGroupIngress(params, (err) => {
        if (err) {
          console.log(err)
          return reject(err);
        }
        return resolve();
      });
    } else {
      console.log('No ingress rules found');
      return resolve();
    }
  });
};

const buildParams = (data) => {
  return {
    GroupId: process.env.SECURITY_GROUP_ID,
    IpPermissions: data.SecurityGroups[0].IpPermissions.map(row => ({
      FromPort: row.FromPort,
      IpProtocol: row.IpProtocol,
      IpRanges: row.IpRanges.filter(ipSet => {
        const rule = Object.assign({Description:''}, ipSet);
        const timestamp_ttl = rule.Description.replace('TTL ', '').trim();
        console.log(`Timestamp TTL `, timestamp_ttl);
        console.log(`Timestamp Current `, (new Date().getTime() / 1000));
        return (timestamp_ttl !== '' && parseInt(timestamp_ttl) < (new Date().getTime() / 1000));
      }),
      ToPort: row.ToPort
    }))
    .filter(row => {
      return row.IpRanges.length
    })
  }
}
