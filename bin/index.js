/*
 * @Descripttion:
 * @version:
 * @Author: ZZF
 * @Date: 2020-06-11 15:28:36
 * @LastEditors: ZZF
 * @LastEditTime: 2020-06-11 17:03:29
 */

const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const packageJson = require('../package.json');
// const deployPath = path.join(process.cwd(), './frontend-prod-docker-cli'); // cli工具的文件目录
const deployPath = path.join(process.cwd()); // cli工具的文件目录
const deployConfigPath = `${deployPath}/config/prod.config.js`;
const { checkNodeVersion, checkDeployConfig, underlineLog, infoLog } = require('../utils/index');

const version = packageJson.version;
const requiredNodeVersion = packageJson.engines.node;

const versionOptions = ['-V', '--version'];

checkNodeVersion(requiredNodeVersion, 'fe-deploy');

const program = require('commander');

program
    .version(version)
    .command('init')
    .description('初始化部署相关配置')
    .action(() => {
        // require('../lib/init')();
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

    // 注册部署命令
    deployConfigs.forEach(config => {
        const { command, projectName, name, host, dockerName } = config;
        program
            .command(`${command}`)
            .description(`即将部署：${underlineLog(projectName)}项目 ${underlineLog(host)}主机 ${underlineLog(name)}环境`)
            .action(() => {
                inquirer
                    .prompt([
                        {
                            type: 'confirm',
                            message: `${underlineLog(projectName)}项目是否部署到${underlineLog(name)}？`,
                            name: 'publishSure'
                        },
                        {
                            type: 'confirm',
                            message: `项目是否更新到docker：${underlineLog(dockerName)}？`,
                            name: 'dockerSure'
                        }
                    ])
                    .then(answers => {
                        const { publishSure, dockerSure } = answers;
                        if (!publishSure) {
                            process.exit(1);
                        }
                        if (publishSure) {
                            const deploy = require('../lib/deploy');
                            deploy(config, dockerSure);
                        }
                    });
            });
    });
}

// 解析参数
program.parse(process.argv);
