# Composition Dude 桌面版

桌面版共用网页的构图界面，所有运行资源打包在软件内，可离线使用。截图复制通过系统剪贴板完成。

- Windows：x64 安装版 `.exe` 和便携版 `.exe`。
- macOS：Apple Silicon（arm64）和 Intel（x64）的 `.dmg` 与 `.zip`。
- 当前工作区仅完成界面构建和桌面代码检查。原生安装包需在对应系统或 GitHub Actions 中构建，随后进行安装验证。
- 构图编辑为本次会话状态，关闭或刷新后恢复预设。

开发：先在项目根目录安装依赖并运行 `npm run desktop:ui`，再运行 `npm ci --prefix desktop` 和 `npm start --prefix desktop`。

打包：Windows 运行 `npm run package:windows --prefix desktop`；macOS 运行 `npm run package:mac --prefix desktop`。输出位于 `desktop/release/`。

默认未配置开发者签名与 Apple 公证。公开发行前应在目标系统安装测试；正式签名需使用发行者自己的证书。参考 [Electron 代码签名说明](https://www.electronjs.org/docs/latest/tutorial/code-signing)。
