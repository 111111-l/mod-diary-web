# 每日一记 - Web版

一个基于 Vue.js 的心情日记 Web 应用，完整保留微信小程序的所有功能。

## 功能特点

### 🎯 核心功能
- **用户登录**：支持学生/教师双角色，同一微信号可切换身份
- **心情记录**：记录每日心情，0-30分制评分
- **AI 心情分析**：基于关键词和情感词典分析心情状态
- **历史查看**：查看历史心情记录和趋势

### 👥 社交功能
- **好友系统**：添加好友，实时聊天
- **班级管理**：
  - 学生：加入班级、查看班级信息
  - 教师：创建班级、管理学生、查看学生心情预警

### ⚠️ 预警系统
- 学生连续 5 天心情分数低于 15 分时，自动向教师发送预警通知

### 🎮 休闲娱乐
- 接雪花游戏
- 心情数据统计

## 技术栈

- **前端框架**：Vue 3
- **构建工具**：Vite
- **样式**：原生 CSS

## 部署到 Vercel（推荐，无需本地环境）

### 步骤一：上传代码到 GitHub

1. 打开 https://github.com
2. 点击右上角 **"+"** -> **"New repository"**
3. 仓库名称填写 `mod-diary-web`
4. 选择 **"Public"**
5. 点击 **"Create repository"**
6. 在新仓库页面，找到 **"uploading an existing file"**
7. 将 `ModDiaryWeb` 文件夹内的**所有文件和文件夹**拖拽进去
8. 点击 **"Commit changes"**

### 步骤二：部署到 Vercel

1. 打开 https://vercel.com
2. 点击 **"Sign Up"** -> 使用 **GitHub 账号登录**
3. 点击 **"Add New..."** -> **"Project"**
4. 在列表中找到 `mod-diary-web` 仓库，点击 **"Import"**
5. 直接点击 **"Deploy"**（默认配置即可）
6. 等待 1-2 分钟，部署完成！

Vercel 会提供你的网站地址，例如：`https://mod-diary-web.vercel.app`

### 之后更新代码

只需将修改后的代码推送到 GitHub，Vercel 会自动重新部署。

```bash
git add .
git commit -m "更新说明"
git push
```

## 本地运行

如果想在本地运行：

```bash
cd ModDiaryWeb
npm install
npm run dev
```

## 数据存储

Web 版本使用浏览器 localStorage 存储数据：
- `userInfo`：当前用户信息
- `users`：所有已登录用户列表
- `moodHistory`：心情历史记录
- `friends`：好友列表
- `classes`：班级列表
- `notifications`：通知列表

**注意**：数据仅存储在当前浏览器中，不会同步到云端。

## 微信小程序版本

如需使用微信小程序版本，请访问：
[微信小程序完整代码](../每日一记)

## License

MIT
