// Allow acess with MFA
// Code taken from https://github.com/aws/aws-sdk-js/issues/1543

module.exports = function(AWS) {
  const ini = require('ini');
  const fs=require('fs');
  if (!fs.existsSync(`${process.env.HOME}/.aws/config`)) {
    return;
  }
  fs.readFileSync(
        `${process.env.HOME}/.aws/config`,
        'utf-8'
      )
  let awsProfile = process.env.AWS_PROFILE || process.env.AWS_DEFAULT_PROFILE;
  if (awsProfile) {
    try {
      let configIni = ini.parse(fs.readFileSync(
        `${process.env.HOME}/.aws/config`,
        'utf-8'
      ));
      let awsProfileConfig = configIni[`profile ${awsProfile}`];
      if (awsProfileConfig && awsProfileConfig.role_arn) {
        let roleArn = awsProfileConfig.role_arn.replace(/:/g, '_').replace(/[^A-Za-z0-9\-_]/g, '-');
        let awsCliCacheFilename = `${awsProfile}--${roleArn}`;
        let awsCliCache =
            JSON.parse(fs.readFileSync(
              `${process.env.HOME}/.aws/cli/cache/${awsCliCacheFilename}.json`,
              'utf-8'
            ));
        let sts = new AWS.STS();
        AWS.config.credentials = sts.credentialsFrom(awsCliCache,awsCliCache);
      }
    } catch (_err) {
      console.log(_err)
    }
  }
}
