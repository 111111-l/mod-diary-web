# 部署到 GitHub Pages 详细指南

## 前提条件

1. 一个 GitHub 账号
2. Git 已安装在本地
3. Node.js 已安装（版本 >= 16）

## 步骤一：创建 GitHub 仓库

1. 登录 GitHub
2. 点击右上角 "+" -> "New repository"
3. 填写仓库名称（例如：`mod-diary-web`）
4. 选择 "Private" 或 "Public"（公开仓库才能使用 GitHub Pages 免费托管）
5. 点击 "Create repository"

## 步骤二：初始化本地 Git 仓库

打开终端，进入 `ModDiaryWeb` 文件夹：

```bash
cd d:\2026-5-29每日一记 (2)\每日一记\ModDiaryWeb
```

初始化 Git 仓库：

```bash
git init
```

添加所有文件：

```bash
git add .
```

提交：

```bash
git commit -m "Initial commit: 每日一记 Web版本"
```

## 步骤三：连接远程仓库

将本地仓库连接到 GitHub 远程仓库：

```bash
git remote add origin https://github.com/你的用户名/仓库名.git
```

例如：

```bash
git remote add origin https://github.com/yourusername/mod-diary-web.git
```

## 步骤四：推送代码到 GitHub

创建 main 分支并推送：

```bash
git branch -M main
git push -u origin main
```

## 步骤五：启用 GitHub Pages

1. 在 GitHub 仓库页面，点击 "Settings"（设置）
2. 左侧菜单找到 "Pages"
3. 在 "Source" 部分：
   - 选择 "Deploy from a branch"
   - Branch 选择 `gh-pages`（如果下拉菜单没有，先不要选，看下一步）
   - 点击 "Save"

注意：第一次可能需要在代码推送后，等待 GitHub Actions 自动创建 `gh-pages` 分支后再回来设置。

## 步骤六：等待自动部署

推送代码后，GitHub Actions 会自动：
1. 检测代码变更
2. 安装依赖
3. 构建项目
4. 部署到 GitHub Pages

你可以在仓库页面的 "Actions" 标签页查看部署进度。

## 步骤七：访问网站

部署完成后，访问：

```
https://你的用户名.github.io/仓库名/
```

例如：`https://yourusername.github.io/mod-diary-web/`

## 常见问题

### 1. GitHub Pages 没有显示网站

- 检查 Settings -> Pages 中的 Source 设置是否正确
- 检查 Actions 中的部署日志是否有错误
- 确认仓库是 Public（公开）的

### 2. 样式或图片不显示

这是因为项目已配置 `base: './'` 在 `vite.config.js` 中，应该没问题。如果仍有问题，检查资源的引用路径是否正确。

### 3. 构建失败

检查本地是否能正常构建：

```bash
npm run build
```

如果本地构建成功但 GitHub 构建失败，可能是依赖问题，尝试删除 `node_modules` 后重新提交。

### 4. 如何更新网站

只需将新代码推送到 main 分支：

```bash
git add .
git commit -m "更新说明"
git push
```

GitHub Actions 会自动重新部署。

## 自动部署说明

项目已配置 GitHub Actions workflow (`.github/workflows/deploy.yml`)，每次推送到 main 分支都会自动：

1. 检出代码
2. 安装 Node.js 和依赖
3. 运行 `npm run build` 构建项目
4. 将构建产物部署到 GitHub Pages

## 本地开发

如果你想本地运行：

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 数据说明

Web 版本使用浏览器 localStorage 存储所有数据：
- 用户信息
- 心情记录
- 好友列表
- 班级信息
- 聊天记录
- 通知

这些数据仅存储在用户的浏览器中，不会同步到云端。如需数据持久化，需要自行配置后端服务。
