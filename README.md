# frontend-prod-docker-cli

前端轻量化部署脚手架，支持测试、线上等多环境部署，支持环境配置扩展，实现一条命令即可完成整个部署流程，同时支持将资源更新到 docker 中并重启 docker。

## github 地址：

https://github.com/Joseph244/frontend-prod-docker-cli

## npm 地址：

https://www.npmjs.com/package/frontend-prod-docker-cli

## 博客

暂未更新，可关注掘金主页：https://juejin.im/post/5ee10b0ce51d4578853d3bee

## 使用指南

https://github.com/Joseph244/frontend-prod-docker-cli

## 前提条件

能通过 ssh 连上服务器

## 安装

全局安装 frontend-prod-docker-cli

```
npm i frontend-prod-docker-cli -g

fe-deploy -V
```

查看版本，表示安装成功。

## 使用

### 1.初始化部署模板

```
fe-deploy init
```

### 2.配置部署环境

部署配置文件位于 fe-deploy 文件夹下的`prod.config.js`, 一般包含`dev`（测试环境）和`prod`（线上环境）两个配置，再有多余的环境配置形式与之类似，只有一个环境的可以删除另一个多余的配置（比如只有`prod`线上环境，请删除`dev`测试环境配置）。

具体配置信息请参考配置文件注释：
下面的 dev 和 noDocker 这两个变量名可自由配置，自己起名（可以起为自己服务器 ip 末尾）

```
module.exports = {
	projectName: 'xxx', // 项目名称
	dev: { //采用docker部署的情况
		name: '106环境',
		script: 'npm run build', // 前端打包命令
		host: 'xxx.xxx.xxx.xxx', // 服务器地址
		port: 22, // ssh port，一般ssh为22
		username: 'xxxx', // 登录服务器用户名,也可以手动输入
		password: 'xxxxxx', // 登录服务器密码,也可以手动输入
		distPath: 'dist', // 本地打包dist目录(不加斜杠)
		webDir: '/root/temp/messageRouteApp', // 打包文件上传服务器地址(末尾不要加斜杠)
		dockerName: 'messageroute', // docker名称(如果只是上传到服务器，则dockerName和dockerWebDir无需配置)
		dockerWebDir: '/usr/app/' // 容器中文件存放位置
	},
	noDocker: {  // 不采用docker部署的情况
		name: '207环境',
		script: 'npm run build', // 前端打包命令
		host: 'xxx.xxx.xxx.xxx', // 服务器地址
		port: 22, // ssh port，一般ssh为22
		username: 'xxxx', // 登录服务器用户名
		password: 'xxxxxx', // 登录服务器密码
		distPath: 'dist', // 本地打包dist目录,也不加斜杠
		webDir: '/root/temp/messageRouteApp', // 打包文件上传服务器地址(末尾不要加斜杠)
	}
	// 再还有多余的环境按照这个格式写即可
}
```

### 3.查看部署命令

配置好`prod.config.js`，运行

```
fe-deploy    可以看到自己的部署命令和配置文件内容
```

### 4.环境部署

执行部署命令
fe-deploy xxx (xxx 为 prod.config.js 中配置环境的键值，如上面的“dev”)

如 dev 环境部署，采用`dev`的配置

```
fe-deploy dev
```

noDocker 环境部署采用的时`noDocker`的配置

```
fe-deploy noDocker
```

本系统参考https://github.com/dadaiwei/fe-deploy-cli，感谢开源！

欢迎大家支持，还会不断更新支持更多功能，如有改进意见请多读指教，欢迎 star 一下子！
