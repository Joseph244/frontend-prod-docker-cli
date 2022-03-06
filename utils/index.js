#!/usr/bin/env node

const fs = require("fs");
const chalk = require("chalk");
const semver = require("semver");

const DEPLOY_SCHEMA = [
  "name",
  //   "script",
  "distPath",
  "host",
  "port",
  "username",
  "password",
  "webDir",
];

const DOCKER_SCHEMA = [...DEPLOY_SCHEMA, "dockerName", "dockerWebDir"];

// 开始部署日志
function startLog(...content) {
  console.log(chalk.magenta(...content));
}

// 信息日志
function infoLog(...content) {
  console.log(chalk.white(...content));
}

// 成功日志
function successLog(...content) {
  console.log(chalk.green(...content));
}

// 错误日志
function errorLog(...content) {
  console.log(chalk.red(...content));
}

// 下划线重点输出
function underlineLog(content) {
  return chalk.blue.underline.bold(`${content}`);
}

// 检查node版本是否符合特定范围
function checkNodeVersion(wanted, id) {
  if (!semver.satisfies(process.version, wanted)) {
    errorLog(
      `You ar using Node ${process.version}, but this version of ${id} requres Node ${wanted} .\nPlease upgrage your Node version.`
    );
    process.exit(1);
  }
}

/**
 * @description: 检查配置是否包含必须字段
 * @param {configKey}  当前部署key
 * @param {configObj}  当前部署的具体配置
 * @return: true 标识校验通过
 */
function checkConfigScheme(configKey, configObj) {
  const configKeys = Object.keys(configObj);
  const neededKeys = [];
  const unConfigedKeys = [];
  let configValid = true;
  for (let key of DEPLOY_SCHEMA) {
    if (!configKeys.includes(key)) {
      neededKeys.push(key);
    }
    if (configObj[key] === "") {
      unConfigedKeys.push(key);
    }
  }
  if (neededKeys.length > 0) {
    errorLog(`${configKey}缺少${neededKeys.join(",")}配置，请检查配置`);
    configValid = false;
  }
  if (unConfigedKeys.length > 0) {
    errorLog(
      `${configKey}中的${unConfigedKeys.join(", ")}暂未配置，请设置该配置项`
    );
    configValid = false;
  }
  return configValid;
}

/**
 *  @description 检查发布配置是否正确
 * @params deploySeverKey 要部署的环境key
 * */ 
function checkDeployConfig(deployConfigPath, deploySeverKey) {
  if (fs.existsSync(deployConfigPath)) {
    const config = require(deployConfigPath);
    const { projectName, script } = config;
    const keys = Object.keys(config);
    const configs = [];
    // 一个环境的发布配置检查
    if(deploySeverKey){
      if (keys.includes(deploySeverKey) && config[deploySeverKey] instanceof Object) {
        if (!checkConfigScheme(deploySeverKey, config[deploySeverKey])) {
          return false;
        }
        config[deploySeverKey].projectName = projectName;
        config[deploySeverKey].script = script;
        config[deploySeverKey].command = deploySeverKey;
        configs.push(config[deploySeverKey]);
      }
      return configs
    }

    // 全部配置检查
    for (let key of keys) {
      if (config[key] instanceof Object) {
        if (!checkConfigScheme(key, config[key])) {
          return false;
        }
        config[key].projectName = projectName;
        config[key].script = script;
        config[key].command = key;
        // config[key].privateKey = privateKey;
        // config[key].passphrase = passphrase;
        configs.push(config[key]);
      }
    }
    return configs;
  }
  infoLog(
    `缺少部署相关的配置，请运行${underlineLog("deploy init")}下载部署配置`
  );
  return false;
}

/**
 * @description 从全路径解析最后一个文件or文件夹
 * @return 最后一个文件全名or文件夹
 */
function lastPathFromFullPath(fullpath) {
  const temp = fullpath.split("/");
  const lastName = temp[temp.length - 1];
  return lastName;
}
module.exports = {
  startLog,
  infoLog,
  successLog,
  errorLog,
  underlineLog,
  checkNodeVersion,
  checkDeployConfig,
  lastPathFromFullPath,
};
