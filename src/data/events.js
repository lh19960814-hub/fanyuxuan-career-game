export const officeEvents = [
  {
    id: 'final-file',
    title: '最终版不是最终版',
    desc: '群里出现了“最终版”“最终版2”“真的最终版”。范宇轩短暂失去语言能力。',
    choices: [
      { text: '全部重新核对', effect: { paperwork: 4, pressure: 10, exp: 18 }, result: '材料能力提升，但眼神逐渐空洞。' },
      { text: '只看最新时间', effect: { luck: 2, pressure: 4, gossip: 4 }, result: '速度很快，但总觉得哪里埋了雷。' },
      { text: '请高老师帮忙看一眼', effect: { reputation: 3, social: 2, pressure: 3 }, result: '专业人士轻轻一点，气氛稳定了。' },
    ],
  },
  {
    id: 'printer',
    title: '打印机关键时刻卡纸',
    desc: '打印机发出一种很官方但很绝望的声音。',
    choices: [
      { text: '徒手修打印机', effect: { paperwork: 2, pressure: 8, exp: 12 }, result: '范宇轩获得了打印机的短暂尊重。' },
      { text: '改成电子版', effect: { social: 2, reputation: 1, pressure: -2 }, result: '流程被数字化拯救了一次。' },
      { text: '找郭鹏强远程观战', effect: { luck: 3, social: 1, pressure: 3 }, result: '他虽然没动手，但点评非常到位。' },
    ],
  },
  {
    id: 'meeting',
    title: '会议突然提前',
    desc: '通知刚弹出，会议已经开始倒计时。',
    choices: [
      { text: '带着半成品硬上', effect: { reputation: -2, pressure: 6, exp: 20 }, result: '场面有点险，但范宇轩顶住了。' },
      { text: '请求再给十分钟', effect: { social: 3, paperwork: 2, pressure: 5 }, result: '沟通也是战斗力。' },
      { text: '让李欢先别扩散', effect: { gossip: -6, pressure: 4 }, result: '传闻风暴被暂时压住。' },
    ],
  },
  {
    id: 'snail-noodle',
    title: '螺蛳粉气场',
    desc: '杨淑媛端起螺蛳粉，范宇轩意识到这不是午饭，这是考核。',
    choices: [
      { text: '认真夸一句地道', effect: { familyApproval: 6, pressure: -4 }, result: '家庭认可度稳定上升。' },
      { text: '假装很懂柳州风味', effect: { familyApproval: 2, social: 2, pressure: 3 }, result: '略显冒险，但态度还行。' },
      { text: '转移话题聊晋升', effect: { paperwork: 2, familyApproval: -3, pressure: 8 }, result: '这个转移并不丝滑。' },
    ],
  },
  {
    id: 'tft-review',
    title: '金铲铲复盘局',
    desc: '徐超超和赵乾宏同时开始复盘，范宇轩感到屏幕在发光。',
    choices: [
      { text: '虚心学习阵容运营', effect: { paperwork: 2, reputation: 2, pressure: 5 }, result: '被锐评之后，理解力提升了。' },
      { text: '强调自己只是没传到棋子', effect: { gossip: 5, pressure: 6 }, result: '解释越多，弹幕越热闹。' },
      { text: '承认并重新开局', effect: { social: 3, pressure: -3, luck: 1 }, result: '这波认了，反而舒服了。' },
    ],
  },
  {
    id: 'paint-bucket',
    title: '还差一桶乳胶漆',
    desc: '何三江带着设计图出现，范宇轩想起那桶迟迟没到的乳胶漆。',
    choices: [
      { text: '礼貌催一下', effect: { social: 2, paperwork: 1 }, result: '成年人之间的催促，点到为止。' },
      { text: '直接写入待办清单', effect: { paperwork: 3, pressure: 4 }, result: '清单变长，但心里踏实了。' },
      { text: '先假装忘了', effect: { pressure: -5, gossip: 3 }, result: '短暂轻松，长期风险。' },
    ],
  },
];

export const restEvents = [
  {
    id: 'tea-break',
    title: '茶水间短暂休整',
    desc: '范宇轩喝了一口水，决定让灵魂追上身体。',
    choices: [
      { text: '认真休息十分钟', effect: { pressure: -12, exp: 6 }, result: '压力下降，晋升路继续。' },
      { text: '顺便听听八卦', effect: { gossip: 4, social: 3, pressure: -4 }, result: '信息量很大，但不一定全有用。' },
      { text: '整理下一关策略', effect: { paperwork: 2, social: 1, pressure: -3 }, result: '思路更清楚了。' },
    ],
  },
];
