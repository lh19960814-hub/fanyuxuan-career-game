import { useState } from 'react';
import CartoonCharacter from './CartoonCharacter';
import StatusPanel from './StatusPanel';
import EquipmentPanel from './EquipmentPanel';
import BuffPanel from './BuffPanel';
import NpcCard from './NpcCard';
import ResultModal from './ResultModal';
import ReactionGame from '../games/ReactionGame';
import RockPaperScissorsGame from '../games/RockPaperScissorsGame';
import BlackjackGame from '../games/BlackjackGame';
import { chooseGameType, getCurrentNpc } from '../utils/gameLogic';
import { settleLose, settleWin } from '../utils/rewardLogic';
import { saveGame } from '../utils/storage';

const gameNameMap = {
  reaction: '点击反应速度测试',
  rps: '猜拳',
  blackjack: '21 点简化版',
};

export default function GamePage({ player, setPlayer, onRestart }) {
  const [activeGame, setActiveGame] = useState(null);
  const [result, setResult] = useState(null);
  const npc = getCurrentNpc(player);

  function startChallenge() {
    setResult(null);
    setActiveGame(chooseGameType(npc));
  }

  function finishChallenge(win, message) {
    if (result) return;

    if (win) {
      const settled = settleWin(player, activeGame, npc);
      setPlayer(settled.player);
      saveGame(settled.player);
      setResult({
        type: 'win',
        message: message || settled.reward.text,
        reward: settled.reward,
      });
    } else {
      const nextPlayer = settleLose(player);
      setPlayer(nextPlayer);
      saveGame(nextPlayer);
      setResult({
        type: 'lose',
        message: message || '范宇轩略微沉思了一下，决定再来一次。这不是失败，这是晋升路上的必要沉淀。',
      });
    }
  }

  function resetRound() {
    setActiveGame(null);
    setResult(null);
  }

  return (
    <main className="game-page game-shell">
      <header className="game-header">
        <div>
          <p className="eyebrow">当前路线</p>
          <h1>厅级干部之路</h1>
        </div>
        <div className="header-actions">
          <button className="button button--ghost button--small" onClick={() => saveGame(player)}>存档</button>
          <button className="button button--danger button--small" onClick={onRestart}>重开</button>
        </div>
      </header>

      <StatusPanel player={player} />

      <section className="game-layout">
        <div className="character-panel panel">
          <CartoonCharacter player={player} />
          <p className="character-caption">每次胜利后，范宇轩都会在职级、装备或气场上产生可见成长。</p>
        </div>

        <div className="right-column">
          <NpcCard npc={npc} />
          <div className="panel challenge-panel">
            <div className="panel-title">小游戏区域</div>
            {!activeGame && (
              <div className="empty-challenge">
                <p>准备好接受 {npc.name} 的考验了吗？</p>
                <button className="button button--primary" onClick={startChallenge}>开始挑战</button>
              </div>
            )}
            {activeGame && (
              <>
                <p className="active-game-name">本轮小游戏：{gameNameMap[activeGame]}</p>
                {activeGame === 'reaction' && (
                  <ReactionGame key={`${player.winCount}-${player.loseCount}-reaction`} npc={npc} player={player} onFinish={finishChallenge} />
                )}
                {activeGame === 'rps' && (
                  <RockPaperScissorsGame key={`${player.winCount}-${player.loseCount}-rps`} npc={npc} player={player} onFinish={finishChallenge} />
                )}
                {activeGame === 'blackjack' && (
                  <BlackjackGame key={`${player.winCount}-${player.loseCount}-blackjack`} npc={npc} player={player} onFinish={finishChallenge} />
                )}
              </>
            )}
          </div>
          <div className="side-panels">
            <EquipmentPanel equipmentIds={player.equipments} />
            <BuffPanel buffs={player.buffs} />
          </div>
        </div>
      </section>

      <ResultModal result={result} onNext={resetRound} onRetry={resetRound} onClose={() => setResult(null)} />
    </main>
  );
}
