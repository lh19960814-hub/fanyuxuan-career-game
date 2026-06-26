# 《范宇轩：厅级干部之路》项目进度记录

最后更新：2026-06-26

## 当前项目方向

当前版本已经放弃塔防玩法，项目从现在开始以“一站到底答题对决”为主线继续开发。

请后续开发时优先阅读本文件，不要再沿着旧塔防方案继续做。旧塔防相关文件如果还在仓库里，可以暂时忽略，后续稳定后再清理。

## 当前核心玩法

游戏名称仍然是：

《范宇轩：厅级干部之路》

玩法结构：

1. 玩家控制范宇轩。
2. 范宇轩依次挑战朋友 NPC。
3. 每场挑战是“一站到底”式答题擂台。
4. 答对题目会削减 NPC 气势。
5. 答错题目会扣除范哥气势。
6. NPC 有专属技能和登场台词。
7. 范宇轩根据当前职级拥有不同技能。
8. 击败 NPC 后获得经验、干部阅历、装备，并推动职级成长。
9. 最终击败杨淑媛后晋升为“厅级干部”并通关。

## 已完成内容

### 1. 答题主流程

已完成：

- 首页
- 挑战路线页
- NPC 战前情报弹窗
- 答题擂台页
- 胜负结算页
- 最终通关页
- localStorage 存档
- Vercel 可构建部署

入口文件：

- `src/App.jsx`

### 2. 范宇轩角色

已保留并继续使用卡通角色组件：

- `src/components/CartoonCharacter.jsx`

当前主角立绘：

- `src/assets/fanyuxuan-stage-1.png`
- `src/assets/fanyuxuan-stage-2.png`
- `src/assets/fanyuxuan-stage-3.png`
- `src/assets/fanyuxuan-stage-4.png`
- `src/assets/fanyuxuan-stage-5.png`

说明：

- 这 5 张图片来自用户提供的 Q 版范宇轩全身成长形态。
- 已批量处理为透明背景 PNG。
- 当前组件按职级阶段自动切换完整立绘。
- 已移除头顶圆形职级徽章，不再显示“实”等遮挡头发的标记。
- 成长视觉主要由完整立绘本身承担，不再依赖 CSS 强行叠工牌、眼镜、公文包。

旧头像贴图仍在项目中，但当前主流程不再优先使用：

- `src/assets/fanyuxuan-head.png`
- `src/assets/fanyuxuan-character-base.png`

角色会继续根据职级变化显示不同外观。

### 3. 职级路线

职级路线保留：

1. 实习生
2. 办事员
3. 科员
4. 副科
5. 正科
6. 副处
7. 正处
8. 副厅
9. 厅级干部

数据文件：

- `src/data/titles.js`

### 4. 答题 NPC

已把朋友们改造成答题擂台 NPC：

- 李欢
- 孙天一
- 何三江
- 任行云
- 郭鹏强
- 张年杰
- 尹原
- 领队李哥
- 徐超超
- 高老师
- 高子健
- 赵乾宏
- 龚庆林
- 杨淑媛

数据文件：

- `src/data/quizNpcs.js`

注意：朋友特色已经做了轻度游戏化处理，避免过于低俗或攻击性太强，但保留了朋友之间娱乐感。

当前题库状态：

- NPC 题库已经改为“专属梗题 + 公共题海”的混合模式。
- 每个 NPC 保留少量专属题，用来体现朋友特色和技能主题。
- 新增公共题海 `src/data/publicQuestions.js`，共 100 道题。
- 公共题海覆盖数学、语文、物理、生物、化学、英语、音乐、舞蹈、体育、历史、地理、通识等方向。
- 每场战斗会随机抽取最多 3 道 NPC 专属题，其余从公共题海补足。
- 已做精确题干去重，公共题海和 NPC 题库之间不会出现完全相同的题干。
- 同一场战斗中，已经回答过的题不会再次出现。
- 玩家存档会记录已经回答过的题干，后续战斗会优先避开这些题，不管之前答对还是答错。
- 每道题有 15 秒答题时间。
- 超时只判定当前题答错，并扣除范哥气势；只有范哥气势归零或题目用尽仍未击败 NPC，才会判定整场挑战失败。

当前 NPC 头像状态：

- 已接入全部 14 位 NPC 的专属 Q 版图标：
  - 李欢：`src/assets/npcs/li-huan.png`
  - 孙天一：`src/assets/npcs/sun-tianyi.png`
  - 何三江：`src/assets/npcs/he-sanjiang.png`
  - 任行云：`src/assets/npcs/ren-xingyun.png`
  - 郭鹏强：`src/assets/npcs/guo-pengqiang.png`
  - 张年杰：`src/assets/npcs/zhang-nianjie.png`
  - 尹原：`src/assets/npcs/yin-yuan.png`
  - 领队李哥：`src/assets/npcs/leader-li.png`
  - 徐超超：`src/assets/npcs/xu-chaochao.png`
  - 高老师：`src/assets/npcs/gao-laoshi.png`
  - 高子健：`src/assets/npcs/gao-zijian.png`
  - 赵乾宏：`src/assets/npcs/zhao-qianhong.png`
  - 龚庆林：`src/assets/npcs/gong-qinglin.png`
  - 杨淑媛：`src/assets/npcs/yang-shuyuan.png`
- 头像组件：`src/components/NpcAvatar.jsx`
- 路线页、战前情报弹窗、答题擂台都已使用该头像组件。
- 图片已处理成透明背景 PNG，并统一压到最大边约 640px，减少网页加载压力。
- 如果后续新增 NPC 但没有头像，组件仍可自动回退到原来的文字头像。

### 5. 范宇轩技能

范宇轩技能按职级解锁：

- 蒙一个
- 稳住全场
- 老干部保温杯
- 紧急加班
- 公文包拍桌
- 领导讲话
- 全员动员
- 气场压制
- 厅级干部气场

数据文件：

- `src/data/quizSkills.js`

### 6. 答题逻辑

核心逻辑文件：

- `src/utils/quizGameLogic.js`

当前支持：

- 创建新答题存档
- 迁移旧存档为答题存档
- 获取当前 NPC
- 获取当前职级技能
- 生成战斗状态
- 胜利结算
- 失败结算
- 职级晋升
- 装备掉落

### 7. 答题页面

挑战路线页：

- `src/pages/QuizRoutePage.jsx`

已完成：

- 当前职级展示
- 进度展示
- 当前技能展示
- NPC 列表
- NPC 战前情报弹窗
- NPC 技能说明

答题擂台页：

- `src/pages/QuizDuelPage.jsx`

已完成：

- 范宇轩 VS NPC 舞台
- 双方气势条
- 题目进度
- 连击显示
- 四选一答题
- 答对/答错反馈
- 伤害数字
- 技能按钮
- 战斗日志

当前战斗页布局状态：

- 已改成左右对称的紧凑对战卡片。
- 范宇轩和 NPC 都显示为同规格卡片：头像/立绘、名字、身份、气势条。
- 范宇轩立绘在战斗页已缩小，避免把答题区域挤到首屏外。
- 桌面端目标是尽量在一屏内看到对战区、题目和选项。

### 8. 分享版打磨 v1

已完成：

- 战前情报弹窗
- 路线进度条
- 伤害数字
- 连击提示
- 正确率结算
- 晋升战报
- 通关证书感 UI
- 手机端布局优化

样式主要在：

- `src/styles/global.css`

## 当前验证状态

最近一次验证命令：

```bash
npm run build
```

结果：通过。

说明：当前代码可以正常 Vite 构建，适合继续部署到 Vercel。

## 本地运行方式

在项目目录执行：

```bash
npm run dev -- --host 0.0.0.0 --port 3000
```

浏览器打开：

```text
http://localhost:3000/
```

如果页面显示旧内容：

1. 刷新浏览器。
2. 点“开始游戏”重新开始。
3. 如仍异常，清理该网站 localStorage 后再刷新。

## 部署方式

项目仍然使用 Vercel 部署。

构建命令：

```bash
npm run build
```

输出目录：

```text
dist
```

Vercel 配置：

- Framework Preset：Vite
- Build Command：`npm run build`
- Output Directory：`dist`

## 后续推荐开发顺序

### 第一优先级：题库扩充

目标：让朋友试玩时不觉得题太少。

建议：

- 后续可以继续把每个 NPC 扩展到 20 道题。
- 最终 Boss 杨淑媛可以扩展到 25 道题。
- 题目分为几类：朋友梗、办公室晋升、逻辑判断、范宇轩专属事件。

### 第二优先级：战斗节奏

建议：

- 每场固定 6 题可以保留。
- 如果 NPC 未被击败，可以进入“加赛题”。
- 连击 3、5、6 时加入更强文案。
- 答错两次后可以给一次“保温杯安慰”提示。

### 第三优先级：视觉完整度

建议：

- 首页增加更强的游戏标题视觉。
- NPC 卡片可以加不同小图标。
- 答题正确时让 NPC 卡片轻微震动。
- 答错时范宇轩气势条轻微闪烁。
- 通关页可以做成一张“厅级干部证书”分享卡。

### 第四优先级：项目清理

旧塔防相关文件当前可以暂时忽略。

后续确认答题玩法稳定后，可以清理：

- `src/data/towerBosses.js`
- `src/data/towerEnemies.js`
- `src/data/towerFriends.js`
- `src/data/towerLevels.js`
- `src/data/towerMaps.js`
- `src/utils/towerGameLogic.js`
- `src/pages/TowerDefensePage.jsx`
- `src/pages/LevelSelectPage.jsx`
- `src/pages/GrowthCenterPage.jsx`
- `src/data/heroSkills.js`
- `src/data/permanentUpgrades.js`

注意：清理前先跑一次 `npm run build`，确认没有引用后再删除。

## 重要提醒

从现在开始，后续开发请默认：

1. 不继续塔防方向。
2. 不恢复点击反应、猜拳、21 点作为核心玩法。
3. 当前主玩法是“一站到底答题对决”。
4. 朋友 NPC 和他们的特色要继续保留。
5. 最终目标必须仍然是“厅级干部”。
6. 项目优先适合手机浏览器分享给朋友玩。
