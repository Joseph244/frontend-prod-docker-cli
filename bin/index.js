#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const inquirer = require("inquirer");
const packageJson = require("../package.json");
const deployPath = path.join(process.cwd(), "./frontend-prod-docker-cli"); // cli工具的文件目录
const deployConfigPath = `${deployPath}/prod.config.js`;
const {
  checkNodeVersion,
  checkDeployConfig,
  underlineLog,
  successLog,
  infoLog,
} = require("../utils/index");

const version = packageJson.version;
const requiredNodeVersion = packageJson.engines.node;

const versionOptions = ["-V", "--version"];

checkNodeVersion(requiredNodeVersion, "fe-deploy");

const program = require("commander");

program
  .version(version)
  .command("init")
  .description(
    `初始化部署相关配置
  \r\n--------------------------------------------------------`
  )
  .action(() => {
    require("../lib/init")();
  });

const agrs = process.argv.slice(2);

const firstArg = agrs[0];
// 非version选项且有配置文件时，进入部署流程
if (!versionOptions.includes(firstArg) && fs.existsSync(deployConfigPath)) {
  deploy();
}

// 无参数时默认输出help信息
if (!firstArg) {
  program.outputHelp();
}

// 部署流程
function deploy() {
  // 检测部署配置是否合理
  const deployConfigs = checkDeployConfig(deployConfigPath);
  if (!deployConfigs) {
    process.exit(1); // 退出
  }

  // 注册部署命令,可以使用fe-deploy看到有哪些命令
  deployConfigs.forEach((config) => {
    const {
      command,
      projectName,
      name,
      host,
      dockerName,
      dockerWebDir,
    } = config;
    program
      .command(`${command}`)
      .description(
        `${underlineLog(projectName)}项目部署到 ${underlineLog(
          name
        )}环境---主机: ${underlineLog(host)}
        \r\n配置项:\r\n${JSON.stringify(config).replace(/,/g, "\r\n")}
        \r\n--------------------------------------------------------`
      )
      .action(() => {
        let arr = [
          {
            type: "confirm",
            message: `${underlineLog(projectName)}项目是否部署到${underlineLog(
              host
            )}---${underlineLog(name)}？`,
            name: "publishSure",
            default: true,
          },
        ];
        if (dockerName && dockerWebDir) {
          arr.push({
            type: "confirm",
            message: `项目是否更新到docker：${underlineLog(dockerName)}？`,
            name: "dockerSure",
            default: true,
          });
        }

        inquirer.prompt(arr).then((answers) => {
          const { publishSure, dockerSure } = answers;
          if (!publishSure) {
            process.exit(1);
          }
          if (publishSure) {
            const deploy = require("../lib/deploy");
            deploy(config, dockerSure);
          }
        });
      });
  });
}

// 解析参数
program.parse(process.argv);
