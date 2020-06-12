# frontend-prod-docker-cli

前端轻量化部署脚手架，支持测试、线上等多环境部署，支持环境配置扩展，实现一条命令即可完成整个部署流程，同时支持将资源更新到 docker 中并重启 docker。

## github 地址：

https://github.com/Joseph244/frontend-prod-docker-cli

## npm 地址：

https://www.npmjs.com/package/frontend-prod-docker-cli

## 博客

暂未更新，可关注掘金：https://juejin.im/post/5ee10b0ce51d4578853d3bee

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

```
module.exports = {
  projectName: 'xxx', // 项目名称
  dev: { // 测试环境

  },
  prod: {  // 线上环境

  }
  // 再还有多余的环境按照这个格式写即可
}
```

### 3.查看部署命令

配置好`prod.config.js`，运行

```
fe-deploy --help
```

查看部署命令
fe-deploy xxx (xxx 为 prod.config.js 中配置环境的键值，如上面的“dev”)

### 4.环境部署

如 dev 环境部署，采用`dev`的配置

```
fe-deploy dev
```

prod 环境部署采用的时`prod`的配置

```
fe-deploy prod
```

本系统参考https://github.com/dadaiwei/fe-deploy-cli，感谢开源！

欢迎大家支持，还会不断更新支持更多功能，如有改进意见请多读指教，欢迎 star 一下子！
