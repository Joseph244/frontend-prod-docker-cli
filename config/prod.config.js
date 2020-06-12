module.exports = {
  projectName: "xxxxAPP", // 项目名称
  // 根据需要进行配置，如只需部署prod线上环境，请删除dev测试环境配置，反之亦然，支持多环境部署
  prod: {
    name: "测试环境",
    script: "npm run build", // 线上环境打包脚本
    host: "192.168.xxx.xxx", // 测试服务器地址,其中xxx为ip
    port: 22, // ssh port，一般默认22
    username: "xxx", // 登录服务器用户名
    password: "xxxxxx", // 登录服务器密码
    distPath: "dist", // 本地打包dist目录,也不加斜杠
    webDir: "/root/temp/messageRouteApp", // 打包文件上传服务器地址(末尾不要加斜杠)
    dockerName: "messageroute", // docker名称
    dockerWebDir: "/usr/app/", // 容器中文件存放位置
  },
  // 再还有多余的环境按照这个格式写即可
};
