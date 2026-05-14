import { useMemo, useState } from 'react';

function drawCard() {
  const value = Math.floor(Math.random() * 10) + 2;
  return Math.min(value, 10);
}

function getTotal(cards) {
  return cards.reduce((sum, card) => sum + card, 0);
}

export default function BlackjackGame({ npc, player, onFinish }) {
  const initialPlayerCards = useMemo(() => [drawCard(), drawCard()], []);
  const initialNpcCards = useMemo(() => [drawCard(), drawCard()], []);
  const [playerCards, setPlayerCards] = useState(initialPlayerCards);
  const [npcCards, setNpcCards] = useState(initialNpcCards);
  const [finished, setFinished] = useState(false);
  const [text, setText] = useState('接近 21 点但不要超过。范宇轩正在冷静判断。');

  const playerTotal = getTotal(playerCards);
  const npcTotal = getTotal(npcCards);

  function hit() {
    const nextCards = [...playerCards, drawCard()];
    const nextTotal = getTotal(nextCards);
    setPlayerCards(nextCards);

    if (nextTotal > 21) {
      setFinished(true);
      setText('爆牌了！范宇轩把这次称为“大胆试点”。');
      onFinish(false, '21 点爆牌，稳健程度需要再提升一点。');
    }
  }

  function stand() {
    let nextNpcCards = [...npcCards];
    const calmBonus = player.buffs.some((buff) => buff.effectType === 'blackjackCalm') ? 1 : 0;
    const briefcaseBonus = player.equipments.includes('briefcase') ? 1 : 0;
    const npcStopLine = Math.max(15, 17 - npc.blackjackSkill);

    while (getTotal(nextNpcCards) < npcStopLine) {
      nextNpcCards.push(drawCard());
    }

    const finalPlayer = Math.min(21, playerTotal + calmBonus + briefcaseBonus);
    const finalNpc = getTotal(nextNpcCards);
    setNpcCards(nextNpcCards);
    setFinished(true);

    let win = false;
    if (finalNpc > 21) win = true;
    else if (finalPlayer <= 21 && finalPlayer >= finalNpc) win = true;

    setText(win ? '范宇轩稳稳停牌，像写完材料后按时提交。' : `${npc.name} 点数更稳，范宇轩决定下次少一点冲动。`);
    onFinish(win, win ? '21 点获胜，冷静判断发挥了作用。' : '21 点惜败，下一轮继续稳住。');
  }

  return (
    <section className="mini-game">
      <h3>21 点简化版</h3>
      <p>要牌或停牌，尽量接近 21 点。超过 21 点就爆牌。</p>
      <div className="card-table">
        <div>
          <span>范宇轩手牌</span>
          <div className="playing-cards">
            {playerCards.map((card, index) => <b key={`${card}-${index}`}>{card}</b>)}
          </div>
          <strong>点数：{playerTotal}</strong>
        </div>
        <div>
          <span>NPC 手牌</span>
          <div className="playing-cards">
            {npcCards.map((card, index) => <b key={`${card}-${index}`}>{card}</b>)}
          </div>
          <strong>点数：{npcTotal}</strong>
        </div>
      </div>
      <div className="choice-row">
        <button className="button button--primary" onClick={hit} disabled={finished}>继续要牌</button>
        <button className="button button--secondary" onClick={stand} disabled={finished}>停牌</button>
      </div>
      <div className="game-result-inline">{text}</div>
    </section>
  );
}
