/*
 * @Descripttion:
 * @version:
 * @Author: ZZF
 * @Date: 2020-06-02 10:35:29
 * @LastEditors: ZZF
 * @LastEditTime: 2020-06-11 16:20:32
 */

module.exports = {
    projectName: 'zzf-APP', // 项目名称
    // 根据需要进行配置，如只需部署prod线上环境，请删除dev测试环境配置，反之亦然，支持多环境部署
    prod: {
        name: '测试环境',
        script: 'npm run build', // 线上环境打包脚本
        host: '192.168.78.xxx', // 测试服务器地址,其中xxx为手动输入ip末尾
        port: 22, // ssh port，一般默认22
        username: 'root', // 登录服务器用户名,也可以手动输入，回车默认root
        password: '123456', // 登录服务器密码,也可以手动输入，回车默认123456
        distPath: 'dist', // 本地打包dist目录
        webDir: '/root/temp/messageRouteApp/dist/', // 打包文件上传服务器地址(末尾不要加斜杠)
        dockerName: 'iotinfoapp', // docker名称
        dockerWebDir: '/app/' // 容器中文件存放位置
    }
    // 再还有多余的环境按照这个格式写即可
};

// docker cp app.js iotinfoapp:/app
// docker cp dist iotinfoapp:/app/
// docker exec -it iotinfoapp /bin/bash
// docker restart iotinfoapp
