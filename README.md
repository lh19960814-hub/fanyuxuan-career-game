# 范宇轩：厅级干部之路

一个使用 React + Vite 制作的轻量网页小游戏。玩家操控卡通版范宇轩，通过点击反应、猜拳、21 点挑战 NPC，一路晋升到厅级干部。

## 本地运行

```bash
npm install
npm run dev
```

然后打开终端提示的本地地址，通常是：

```txt
http://localhost:5173
```

## 打包

```bash
npm run build
```

打包后会生成 `dist` 文件夹，Vercel 会使用这个目录部署。

## Vercel 配置

- Framework Preset: Vite
- Build Command: npm run build
- Output Directory: dist
