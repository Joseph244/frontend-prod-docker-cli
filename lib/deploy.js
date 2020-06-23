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

// 运行命令
async function runCommand(command, webDir) {
  console.log(command);
  await ssh.execCommand(command, { cwd: webDir }).then(function (result) {
    console.log("INFO: " + JSON.stringify(result));
  });
}

/**
 * @description: 部署流程入口
 * @param {config}  部署配置
 * @param {dockerSure} true：更新到对应docker，false：只上传静态资源，不操作docker
 * @return:
 */
async function deploy(config, dockerSure) {
  const { script, webDir, distPath, projectName, name } = config;
  try {
    execBuild(script);
    await startZip(distPath);
    await connectSSH(config);
    // 如果配置了重启命令
    if (config.restartCmd) {
      // TODO: 执行之前需要检查服务器上node版本,如果低于
      await restartCmd(config.restartCmd, webDir);
    }
    const _dir = webDir + "/" + distPath;
    await uploadFile(_dir);
    await unzipFile(_dir);
    await deleteLocalZip();

    if (dockerSure) {
      await updateDocker(config);
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

// 第一步，执行打包脚本
function execBuild(script) {
  try {
    console.log(`\n（1）${script}`);
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

// 第二部，打包zip
function startZip(distPath) {
  return new Promise((resolve, reject) => {
    distPath = path.resolve(projectDir, distPath);
    console.log("（2）打包成zip");
    const archive = archiver("zip", {
      zlib: { level: 9 },
    }).on("error", (err) => {
      throw err;
    });
    const output = fs.createWriteStream(`${projectDir}/mydist.zip`);
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
    archive.directory(distPath, "/");
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
    console.log(`（3）连接${underlineLog(host)}`);
    await ssh.connect(sshConfig);
    successLog("  SSH连接成功");
  } catch (err) {
    errorLog(`  连接失败 ${err}`);
    process.exit(1);
  }
}

// 第四部，上传zip包
async function uploadFile(dir) {
  try {
    console.log(`（4）上传zip至目录${underlineLog(dir)}`);
    await ssh.putFile(`${projectDir}/mydist.zip`, `${dir}/mydist.zip`);
    successLog("  zip包上传成功");
  } catch (err) {
    errorLog(`  zip包上传失败 ${err}`);
    process.exit(1);
  }
}

// 第五步，解压zip包
async function unzipFile(dir) {
  try {
    console.log("（5）开始解压zip包");
    await runCommand(`cd ${dir}`, dir);
    await runCommand("unzip -o mydist.zip && rm -f mydist.zip", dir);
    successLog("  zip包解压成功");
  } catch (err) {
    errorLog(`  zip包解压失败 ${err}`);
    process.exit(1);
  }
}

// 执行重启命令
async function restartCmd(restartCmd, dir) {
  try {
    await runCommand(restartCmd, dir);
    successLog("  服务重启成功");
  } catch {
    errorLog(`  服务重启失败 ${err}`);
    process.exit(1);
  }
}
// docker操作
async function updateDocker(config) {
  try {
    infoLog(`（7）开始更新docker:${config.dockerName}`);
    await runCommand(`cd ${config.webDir}`, config.webDir);
    // infoLog(
    //   `即将执行：docker cp ${config.distPath} ${config.dockerName}:${config.dockerWebDir}`
    // );
    await runCommand(
      `docker cp ${config.distPath} ${config.dockerName}:${config.dockerWebDir}`,
      config.webDir
    );
    // infoLog(`即将执行：docker restart ${config.dockerName}`);
    await runCommand(`docker restart ${config.dockerName}`, config.webDir);
    successLog("  docker资源更新成功");
  } catch (err) {
    errorLog(`  docker资源更新失败 ${err}`);
    process.exit(1);
  }
}
// 第六步，删除本地mydist.zip包
async function deleteLocalZip() {
  return new Promise((resolve, reject) => {
    console.log("（6）开始删除本地zip包");
    fs.unlink(`${projectDir}/mydist.zip`, (err) => {
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

module.exports = deploy;
