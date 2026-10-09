# Composition Dude

产品构图工作台：先安排产品、人物与品牌位置，再复制清晰的画面配置摘要，作为制作商品图片的参考。

界面采用通用蓝灰配色，适用于不同产品。画布显示比例示意框，不生成商品照片。

## 功能

- 主图 1500 × 1500、A+图 970 × 600、自定义画布；添加、独立编辑与确认删除。
- 多产品；参考实物高度、画面宽度与高度占比独立设置。
- 0–2 位成人、0–3 位儿童；成人身高、儿童比例、身份与亲子互动可调。
- 拖动画布元素、方向键微调、精确坐标、居中、底部对齐、复制产品。
- 可选品牌 Logo；设计或留空，独立调整宽高与位置。
- 按当前实际元素生成摘要；复制当前或全部摘要；画布导出 PNG。

## 下载使用

在本仓库的 Releases 中下载对应系统的安装包。维护者第一次发布前，需要按照 [发布指南](Composition-Dude-publish-guide.md) 构建并上传安装包。

| 平台 | 选择 |
| --- | --- |
| Windows x64 | `Windows-x64-nsis.exe` 安装版，或 `Windows-x64-portable.exe` 便携版 |
| Mac Apple Silicon | `macOS-arm64.dmg` |
| Mac Intel | `macOS-x64.dmg` |
| 浏览器离线版 | `Composition-Dude-offline.html`，下载后双击打开 |

名称前面还会带 `Composition-Dude-1.0.0-`。macOS 同时提供 ZIP 格式。

软件无需账号，运行资源在本地，无后端服务。编辑状态只保留在当前会话；刷新或关闭后恢复初始配置。请及时复制摘要或保存 PNG。Logo 图片也只保留在本次会话。

桌面版截图通过系统剪贴板复制；浏览器离线版根据浏览器支持复制或下载 PNG。

## 本地开发与构建

需要 Node.js 22.13+，建议 Node.js 24。先在源码根目录打开终端：

```bash
npm ci
npm run typecheck
npm run desktop:ui
npm ci --prefix desktop
npm start --prefix desktop
```

构建单文件离线版：

```bash
npm run offline:build
```

Windows 上打包：

```bash
npm run package:windows --prefix desktop
```

macOS 上打包：

```bash
npm run package:mac --prefix desktop
```

安装包输出在 `desktop/release/`。GitHub Actions 提供 Windows 与 macOS 自动构建，流程本身不会发布 Release。

## 发布状态

本次交付已验证 TypeScript、生产界面构建、离线 HTML 和构图交互。Windows / macOS 原生安装包需在 Actions 或对应系统构建，然后执行安装验证。

默认打包未配置 Windows 代码签名、Apple Developer 签名与公证；系统可能显示发行者或验证提示。面向正式用户发行时，请使用你自己的证书完成签名与公证。详见 [Electron 代码签名](https://www.electronjs.org/docs/latest/tutorial/code-signing)。

## 开源

项目代码采用 MIT 许可证。UI 使用 React、Radix UI、shadcn/ui、Tailwind CSS、Lucide 与 Sonner；桌面壳使用 Electron / electron-builder。依赖保留其各自许可证；附带的 shadcn 样式许可证位于 `vendor/`。
