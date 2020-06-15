# dmz-whitelist

Steps to deploy:

- Install serverless `npm install -g serverless`
- Copy config file

```
cp examample.config.dev.json config.dev.json
```
- Update the configuration file
- Assumed that aws are already configured with neccessary permissions
- Deploy `serverless deploy`
- Get the API Gateway post endpoint on the cli deployment output
- Update the slack integration settings url
