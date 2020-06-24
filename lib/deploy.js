#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const childProcess = require("child_process");
const ora = require("ora");
const node_ssh = require("node-ssh");
const archiver = require("archiver");
const {
  successLog,
  errorLog,
  underlineLog,
  infoLog,
} = require("../utils/index");
const projectDir = process.cwd(); // 当前路径

let ssh = new node_ssh(); // 生成ssh实例

/**
 * @description 发布流程主要公共函数
 */
async function deployCommon(config, dockerSure) {
  try {
    const { webDir, distPath, lastCmd } = config;
    const stat = fs.lstatSync(path.resolve(projectDir, distPath));
    // console.log(stat.isFile(), stat.isDirectory());
    if (stat.isDirectory()) {
      await startZip(distPath);
    }

    await connectSSH(config);

    if (stat.isDirectory()) {
      const dir = webDir + "/" + distPath;
      const fileName = distPath + ".zip";
      await uploadFile(dir, fileName);
      await unzipFile(dir, fileName);
      if (dockerSure) {
        await updateDocker(config);
      }
    }
    if (stat.isFile()) {
      const temp = distPath.split("/");
      const file = temp[temp.length - 1];
      await uploadFile(webDir, distPath, file);
      if (dockerSure) {
        await updateDocker(config, file);
      }
    }
    if (lastCmd) {
      await runCommand(lastCmd, webDir);
    }
  } catch (err) {
    errorLog(`  部署失败 ${err}`);
  }
}
/**
 * @description: 单环境部署流程入口
 * @param {config}  部署配置
 * @param {dockerSure} true：更新到对应docker，false：只上传静态资源，不操作docker
 * @return:
 */
async function deploySingle(config, dockerSure) {
  try {
    const { script, projectName, distPath, name } = config;
    if (script) {
      execBuild(script);
    }
    await deployCommon(config, dockerSure);
    const stat = fs.lstatSync(path.resolve(projectDir, distPath));
    if (stat.isDirectory()) {
      await deleteLocalZip(config.distPath);
    }

    successLog(
      `\n 恭喜您，${underlineLog(projectName)}项目${underlineLog(
        name
      )}部署成功了^_^\n`
    );
    process.exit(0);
  } catch (err) {
    errorLog(`  部署失败 ${err}`);
    process.exit(1);
  }
}

// 多环境发布
async function deployMuti(projectConfig, deployConfigAll, deployChoices) {
  try {
    console.log("即将发布到以下环境：", deployChoices);
    if (projectConfig.script) {
      execBuild(projectConfig.script);
    }

    for (let config of deployConfigAll) {
      const { command, distPath, name } = config;
      if (!deployChoices.includes(command)) {
        // console.error("跳过环境", command);
        continue;
      }
      infoLog(JSON.stringify(config));
      await deployCommon(config, true);
      const stat = fs.lstatSync(path.resolve(projectDir, distPath));
      if (stat.isDirectory()) {
        await deleteLocalZip(distPath);
      }
      successLog(`\n 恭喜您，${underlineLog(name)}部署成功了^_^\n`);
    }

    process.exit(0);
  } catch (err) {
    errorLog(`  部署失败 ${err}`);
    process.exit(1);
  }
}

// 运行命令
async function runCommand(command, webDir) {
  console.log(command);
  return ssh.execCommand(command, { cwd: webDir }).then((result) => {
    if (result.code != 0) {
      errorLog(JSON.stringify(result));
      process.exit(1);
    } else {
      return result;
    }
  });
}
// 执行打包命令
function execBuild(script) {
  try {
    console.log(`\n（*）${script}`);
    const spinner = ora({
      text: script,
      color: "yellow",
      spinner: "dots",
    });
    spinner.start();
    childProcess.execSync(script, { cwd: projectDir });
    spinner.stop();
    successLog("  打包成功");
  } catch (err) {
    errorLog(err);
    process.exit(1);
  }
}

// 打包zip
function startZip(distPath) {
  return new Promise((resolve, reject) => {
    const _distPath = path.resolve(projectDir, distPath);
    console.log("（*）打包成zip");
    const archive = archiver("zip", {
      zlib: { level: 9 },
    }).on("error", (err) => {
      throw err;
    });
    const output = fs.createWriteStream(`${projectDir}/${distPath}.zip`);
    output.on("close", (err) => {
      if (err) {
        errorLog(`  关闭archiver异常 ${err}`);
        reject(err);
        process.exit(1);
      }
      successLog("  zip打包成功");
      resolve();
    });
    archive.pipe(output);

    archive.directory(_distPath, "/");
    archive.finalize();
  });
}

// 第三步，连接SSH
async function connectSSH(config) {
  const { host, port, username, password, privateKey, passphrase } = config;
  const sshConfig = {
    host,
    port,
    username,
    password,
    privateKey,
    passphrase,
  };
  try {
    console.log(`（*）连接${underlineLog(host)}`);
    await ssh.connect(sshConfig);
    successLog("  SSH连接成功");
  } catch (err) {
    errorLog(`  连接失败 ${err}`);
    process.exit(1);
  }
}

/**
 * @description 上传zip包
 * @param dir 上传到服务器上的目录地址
 * @param distPath 上传到服务器上的文件夹
 * @param file 上传到服务器上的文件
 */
async function uploadFile(dir, distPath, file) {
  try {
    console.log(`（*）上传zip至目录${underlineLog(dir)}`);
    const sshTarget = file ? `${dir}/${file}` : `${dir}/${distPath}`;
    await ssh.putFile(`${projectDir}/${distPath}`, sshTarget);
    successLog("  文件上传成功");
  } catch (err) {
    errorLog(`  文件上传失败 ${err}`);
    process.exit(1);
  }
}

/**
 * @description 解压zip包
 * @param dir 上传到服务器上的目录地址
 * @param distPath 上传到服务器上的文件or文件夹
 */
async function unzipFile(dir, distPath) {
  try {
    console.log("（*）开始解压zip包");
    await runCommand(`cd ${dir}`, dir);
    await runCommand(`unzip -o ${distPath} && rm -f ${distPath}`, dir);
    successLog("  zip包解压成功");
  } catch (err) {
    errorLog(`  zip包解压失败 ${err}`);
    process.exit(1);
  }
}

// docker操作
async function updateDocker(config, file) {
  try {
    const { webDir, dockerName, dockerWebDir, distPath } = config;
    const _tempPath = file ? file : distPath;
    infoLog(`（*）开始更新docker:${dockerName}`);
    await runCommand(`cd ${webDir}`, webDir);
    // 检查docker是否存在和是否启动
    let _res = await runCommand(`docker ps | grep ${dockerName}`, webDir);
    if (_res.code != 0) {
      errorLog(`当前docker【 ${dockerName}】不存在，请确认`);
    }
    // 先删除docker中文件
    await runCommand(
      `docker exec -i ${dockerName} rm -rf ${_tempPath}`,
      webDir
    );

    // 上传文件到docker;
    await runCommand(
      `docker cp ${_tempPath} ${dockerName}:${dockerWebDir}`,
      webDir
    );
    await runCommand(`docker restart ${dockerName}`, webDir);
    successLog("  docker资源更新成功");
  } catch (err) {
    errorLog(`  docker资源更新失败 ${err}`);
    process.exit(1);
  }
}
// 第六步，删除本地zip包
async function deleteLocalZip(distPath) {
  return new Promise((resolve, reject) => {
    console.log("（*）开始删除本地zip包");
    fs.unlink(`${projectDir}/${distPath}.zip`, (err) => {
      if (err) {
        errorLog(`  本地zip包删除失败 ${err}`, err);
        reject(err);
        process.exit(1);
      }
      successLog("  本地zip包删除成功\n");
      resolve();
    });
  });
}

module.exports = { deploySingle, deployMuti };
