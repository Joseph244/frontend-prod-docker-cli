module.exports = {
  projectName: "消息路由APP", // 项目名称
  // 根据需要进行配置，如只需部署prod线上环境，请删除dev测试环境配置，反之亦然，支持多环境部署
  dev: {
    name: "106dev环境",
    script: "npm run build", // 打包脚本
    host: "192.168.78.106", // 服务器地址,其中xxx为手动输入ip末尾
    port: 22, // ssh port，一般默认22
    username: "xxxx", // 登录服务器用户名
    password: "xxxxxx", // 登录服务器密码
    distPath: "dist", // 本地需要打包的目录,不加斜杠
    webDir: "/xxxx/temp/messageRouteApp", // 打包文件上传服务器地址(会将distPath文件夹放过来，如果是nginx做前端配置的话要加distPath)
    dockerName: "messageroute", // docker名称
    dockerWebDir: "/usr/app", // 容器中文件存放位置
  },
  prod: {
    name: "228prod环境",
    script: "npm run build", // 打包脚本
    host: "192.168.78.228", // 服务器地址,其中xxx为手动输入ip末尾
    port: 22, // ssh port，一般默认22
    username: "root", // 登录服务器用户名
    password: "xxxxxx", // 登录服务器密码
    distPath: "dist", // 本地打包dist目录,不加斜杠
    webDir: "/root/temp/messageRouteApp",
    dockerName: "messageroute", // docker名称
    dockerWebDir: "/usr/app", // 容器中文件存放位置
  },
  // 再还有多余的环境按照这个格式写即可
};
