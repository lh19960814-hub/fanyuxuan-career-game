import { useState } from 'react';

const options = [
  { id: 'rock', label: '石头', beats: 'scissors' },
  { id: 'scissors', label: '剪刀', beats: 'paper' },
  { id: 'paper', label: '布', beats: 'rock' },
];

function getLabel(id) {
  return options.find((item) => item.id === id)?.label || id;
}

export default function RockPaperScissorsGame({ npc, player, onFinish }) {
  const [round, setRound] = useState(null);

  function play(choice) {
    let npcChoice = options[Math.floor(Math.random() * options.length)].id;
    const hasLuck = player.buffs.some((buff) => buff.effectType === 'rpsLuck');

    // 好运 Buff 会小概率让 NPC 出被玩家克制的选项。
    if (hasLuck && Math.random() < 0.35) {
      npcChoice = options.find((item) => item.id === choice).beats;
    }

    if (choice === npcChoice) {
      setRound({
        player: choice,
        npc: npcChoice,
        text: '平局！两个人都露出了“我就知道”的表情，再来一次。',
      });
      return;
    }

    const playerWins = options.find((item) => item.id === choice).beats === npcChoice;
    setRound({
      player: choice,
      npc: npcChoice,
      text: playerWins ? '范宇轩一个沉稳出拳，局势瞬间明朗。' : `${npc.name} 预判成功，范宇轩决定把这叫做经验积累。`,
    });
    onFinish(playerWins, playerWins ? '猜拳获胜，范宇轩的判断力获得办公室认证。' : '猜拳惜败，这不是失败，是眼神交流还没完全同步。');
  }

  return (
    <section className="mini-game">
      <h3>猜拳挑战</h3>
      <p>选择一个手势，和 {npc.name} 正面交锋。</p>
      <div className="choice-row">
        {options.map((option) => (
          <button className="choice-button" onClick={() => play(option.id)} key={option.id}>
            {option.label}
          </button>
        ))}
      </div>
      {round && (
        <div className="game-result-inline">
          <strong>你：{getLabel(round.player)} / NPC：{getLabel(round.npc)}</strong>
          <span>{round.text}</span>
        </div>
      )}
    </section>
  );
}
