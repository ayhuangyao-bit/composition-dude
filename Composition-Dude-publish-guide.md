# Composition Dude：自己发布到 GitHub

你可以完成全部 GitHub 操作，不需要安装额外插件。源码包已包含打包流程；它只生成文件，不会替你发布。

## 1. 创建仓库并上传源码

1. 登录 GitHub，点击右上角 **＋ → New repository**。
2. Repository name 建议填写 **composition-dude**，选择 **Public**，点击 **Create repository**。
3. 解压 `Composition-Dude-source.zip`，打开其中的 `composition-dude` 文件夹。
4. 在仓库选择 **Add file → Upload files**；空仓库可以点击页面中的 **uploading an existing file**。
5. 上传 `composition-dude` 文件夹里面的文件和子文件夹。不要把外面的整个 `composition-dude` 文件夹作为仓库根目录。
6. 点击 **Commit changes**。

根目录应直接看到 `package.json`、`package-lock.json`、`README.md`、`desktop/`、`app/`、`components/` 等文件。

**特别检查 `.github/workflows/build-desktop.yml` 是否上传。** `.github` 是隐藏目录：macOS Finder 按 **Command + Shift + .** 可显示。若上传漏掉了它，可在 GitHub 点击 **Add file → Create new file**，文件名填 `.github/workflows/build-desktop.yml`，复制源码包中同名文件的完整内容，提交到默认分支。

浏览器上传有大小和数量限制；这个源码包的文件数量低于 100，单个文件也低于 25 MiB。无需上传 `node_modules` 或打包产物。

官方说明：[上传文件](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)。

## 2. 运行 Windows 和 macOS 自动打包

1. 打开仓库顶部 **Actions**。
2. 左侧选择 **Build Desktop**。
3. 点击右侧 **Run workflow**，选择默认分支（通常为 `main`），再次点击 **Run workflow**。
4. 打开这次运行，等待 **Build Windows** 和 **Build macOS** 都变绿。
5. 在运行页面下方的 **Artifacts** 下载 `Composition-Dude-Windows` 和 `Composition-Dude-macOS`。
6. 解压这两个下载的 ZIP，拿到真正的 `.exe`、`.dmg` 与 macOS 应用 ZIP。

如果没有 Run workflow，先确认工作流文件位于仓库默认分支，且仓库允许 Actions。若构建红色失败，打开失败步骤查看日志；可以把错误文本发给我。不要上传或发出签名证书密码、令牌等密钥。

Artifacts 保存 30 天，适合取回构建结果；长期提供下载请放到下一步的 Release。

官方说明：[手动运行工作流](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow)。

## 3. 选择正确安装包并验证

| 你的电脑 | 验证文件 |
| --- | --- |
| Windows x64 | `Composition-Dude-1.0.0-Windows-x64-nsis.exe` 安装版；也可试 `portable.exe` 便携版 |
| Mac Apple Silicon（M 系列） | `Composition-Dude-1.0.0-macOS-arm64.dmg` |
| Mac Intel | `Composition-Dude-1.0.0-macOS-x64.dmg` |

先在对应系统实际打开，检查：增加画面、删除确认、自定义尺寸、增加多个产品、调整身高和尺寸、拖动位置、Logo 开关、复制摘要、截图复制或导出 PNG。

构建通过表示安装包生成成功，不等于所有电脑上的安装验证完成。当前没有配置发行者代码签名或 Apple 公证，系统可能给出验证提示。正式公开发行建议配置自己的签名证书；不要把证书或密码提交到源码仓库。

当前版本的编辑状态只在会话内保留；关闭或刷新会恢复默认配置。

## 4. 建立公开下载页

1. 回到仓库主页，点击右侧 **Releases → Create a new release**（或 **Draft a new release**）。
2. Tag 填 **v1.0.0** 并创建该标签；Target 选择默认分支。
3. Release title 填 **Composition Dude 1.0.0**。
4. 在附件区上传解压后的 Windows `.exe`、Mac `.dmg` / `.zip`，以及 `Composition-Dude-offline.html`。
5. 说明中写清楚系统版本、CPU 架构、功能和当前签名状态。
6. 检查附件后，点击 **Publish release**。

用户打开你的仓库 **Releases** 就能下载。GitHub 自动显示的 **Source code (zip)** 只是源码，不是安装程序。不要只上传 Actions 下载的外层压缩包；直接提供真正的安装文件更容易使用。

官方说明：[管理 Release](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)。

## 以后更新

修改源码后，将根目录与 `desktop/package.json` 的版本号同步更新，例如 `1.0.1`；`desktop/preload.cjs` 和 `scripts/build-offline.mjs` 中展示的版本号也同步更新。运行 Actions，验证安装包，再发布 `v1.0.1` Release。

公开仓库会公开你上传的源码。此包只含通用构图代码，不包含原私有网站的账号、部署配置或你的 Logo 素材。你自己的商品或品牌素材可以在本机使用，不需要上传到 GitHub。

## 可直接使用的发布说明

> Composition Dude 1.0.0：本地产品构图工作台。支持主图、A+图和自定义画布，多产品与人物比例调整，Logo 设计或留空，拖动排版、截图及配置摘要。Windows 请选择 x64；M 系列 Mac 请选择 arm64；Intel Mac 请选择 x64。本版本未配置发行者代码签名或 Apple 公证。配置只在当前编辑会话内保留，关闭或刷新后恢复预设。
