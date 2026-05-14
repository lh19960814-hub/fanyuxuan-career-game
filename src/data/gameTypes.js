export const gameTypes = [
  {
    type: 'reaction',
    name: '点击反应速度测试',
    rules: '等待提示出现后立刻点击，提前点击会失败。',
    rewardBase: 26,
  },
  {
    type: 'rps',
    name: '猜拳',
    rules: '选择石头、剪刀、布，击败 NPC 即可获胜。',
    rewardBase: 24,
  },
  {
    type: 'blackjack',
    name: '21点简化版',
    rules: '尽量接近 21 点但不要爆牌，停牌后与 NPC 比点数。',
    rewardBase: 30,
  },
];
