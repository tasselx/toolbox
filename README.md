# 老李的工具箱

这是一个实用工具集合，可以部署在GitHub Pages上作为静态网站使用。

## 工具列表

### MD5文件修改器

修改文件内容，改变MD5哈希值，而不影响文件功能。适用于测试文件完整性检查、哈希碰撞研究等场景。

功能特点：
- 支持单个文件或批量处理
- 提供两种修改方式：追加数据或修改特定字节
- 实时显示原始和修改后的MD5哈希值
- 支持文件预览和下载
- 按文件类型筛选功能

## 部署说明

### 在GitHub Pages上部署

1. Fork这个仓库到你的GitHub账户
2. 进入仓库设置 (Settings)
3. 找到Pages选项
4. 在Source下选择main分支
5. 点击Save
6. 等待几分钟后，你的工具箱将在`https://yourusername.github.io/toolbox`上线

### 本地运行

由于使用了ES模块，需要通过HTTP服务器运行：

```bash
# 使用Python启动简单的HTTP服务器
python -m http.server

# 或使用Node.js的http-server
npx http-server
```

然后在浏览器中访问`http://localhost:8000`

## 技术说明

- 纯前端实现，无需后端服务器
- 使用ES模块从CDN加载依赖
- 所有处理都在浏览器中完成，不会上传文件到服务器
- 响应式设计，适配各种设备

## 使用的库

- CryptoJS: 用于MD5哈希计算
- FileSaver.js: 用于文件下载
- JSZip: 用于创建ZIP文件

## 许可证

MIT