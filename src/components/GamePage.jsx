import { useEffect, useState } from 'react';
import CartoonCharacter from './CartoonCharacter';
import StatusPanel from './StatusPanel';
import EquipmentPanel from './EquipmentPanel';
import BuffPanel from './BuffPanel';
import NpcCard from './NpcCard';
import ResultModal from './ResultModal';
import ReactionGame from '../games/ReactionGame';
import RockPaperScissorsGame from '../games/RockPaperScissorsGame';
import BlackjackGame from '../games/BlackjackGame';
import { advanceRound, applyLevelUp, applyStatEffect, chooseGameType, ensureRouteOptions } from '../utils/gameLogic';
import { applyRewardChoice, settleLose, settleWin } from '../utils/rewardLogic';
import { saveGame } from '../utils/storage';

const gameNameMap = {
  reaction: '点击反应速度测试',
  rps: '猜拳',
  blackjack: '21 点简化版',
};

const statLabelMap = {
  exp: '经验',
  pressure: '压力',
  reputation: '口碑',
  paperwork: '材料',
  social: '协调',
  luck: '运气',
  gossip: '谣言',
  familyApproval: '家庭认可',
};

function formatEffect(effect = {}) {
  return Object.entries(effect)
    .filter(([, value]) => value !== 0)
    .map(([key, value]) => ({
      key,
      label: statLabelMap[key] || key,
      value,
      text: `${statLabelMap[key] || key} ${value > 0 ? '+' : ''}${value}`,
    }));
}

export default function GamePage({ player, setPlayer, onRestart }) {
  const [activeGame, setActiveGame] = useState(null);
  const [result, setResult] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [eventResult, setEventResult] = useState(null);
  const playerWithRoutes = ensureRouteOptions(player);
  const routeOptions = playerWithRoutes.routeOptions;
  const npc = selectedRoute?.npc || routeOptions.find((option) => option.type === 'battle')?.npc;

  useEffect(() => {
    if (player.routeOptions?.length !== playerWithRoutes.routeOptions.length) {
      setPlayer(playerWithRoutes);
      saveGame(playerWithRoutes);
    }
  }, [player, playerWithRoutes, setPlayer]);

  function selectRoute(route) {
    setResult(null);
    setEventResult(null);
    setSelectedRoute(route);

    if (route.type === 'battle') {
      setActiveGame(chooseGameType(route.npc));
    } else {
      setActiveGame(null);
    }
  }

  function finishChallenge(win, message) {
    if (result) return;

    if (win) {
      const settled = settleWin(player, activeGame, selectedRoute.npc);
      setPlayer(settled.player);
      saveGame(settled.player);
      setResult({
        type: 'win',
        message: message || settled.reward.text,
        reward: settled.reward,
      });
    } else {
      const nextPlayer = settleLose(player, selectedRoute.npc);
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
    setSelectedRoute(null);
    setEventResult(null);
  }

  function chooseEventOption(choice) {
    let nextPlayer = applyStatEffect(player, choice.effect);
    nextPlayer = applyLevelUp(nextPlayer);
    nextPlayer = advanceRound(nextPlayer);
    setPlayer(nextPlayer);
    saveGame(nextPlayer);
    setEventResult({
      title: choice.text,
      result: choice.result,
      effects: formatEffect(choice.effect),
    });
  }

  function chooseReward(choice) {
    const nextPlayer = applyRewardChoice(player, choice);
    setPlayer(nextPlayer);
    saveGame(nextPlayer);
    resetRound();
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
          {npc && <NpcCard npc={npc} />}
          <div className="panel challenge-panel">
            <div className="panel-title">路线选择</div>
            {!selectedRoute && (
              <div className="route-grid">
                {routeOptions.map((route) => (
                  <button className={`route-card route-card--${route.type}`} key={route.id} onClick={() => selectRoute(route)}>
                    <span>{route.risk}</span>
                    <strong>{route.title}</strong>
                    <small>{route.desc}</small>
                  </button>
                ))}
              </div>
            )}
            {selectedRoute?.type === 'event' && (
              <section className="mini-game">
                <h3>{selectedRoute.event.title}</h3>
                <p>{selectedRoute.event.desc}</p>
                {!eventResult ? (
                  <div className="event-choice-list">
                    {selectedRoute.event.choices.map((choice) => (
                      <button className="event-choice" key={choice.text} onClick={() => chooseEventOption(choice)}>
                        {choice.text}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="game-result-inline">
                    <strong>{eventResult.title}</strong>
                    <span>{eventResult.result}</span>
                    {eventResult.effects?.length > 0 && (
                      <div className="effect-list">
                        {eventResult.effects.map((effect) => (
                          <span className={`effect-pill ${effect.value >= 0 ? 'effect-pill--up' : 'effect-pill--down'}`} key={effect.key}>
                            {effect.text}
                          </span>
                        ))}
                      </div>
                    )}
                    <button className="button button--primary" onClick={resetRound}>继续下一回合</button>
                  </div>
                )}
              </section>
            )}
            {selectedRoute?.type === 'battle' && activeGame && (
              <>
                <p className="active-game-name">本轮小游戏：{gameNameMap[activeGame]}</p>
                {activeGame === 'reaction' && (
                  <ReactionGame key={`${player.winCount}-${player.loseCount}-reaction`} npc={selectedRoute.npc} player={player} onFinish={finishChallenge} />
                )}
                {activeGame === 'rps' && (
                  <RockPaperScissorsGame key={`${player.winCount}-${player.loseCount}-rps`} npc={selectedRoute.npc} player={player} onFinish={finishChallenge} />
                )}
                {activeGame === 'blackjack' && (
                  <BlackjackGame key={`${player.winCount}-${player.loseCount}-blackjack`} npc={selectedRoute.npc} player={player} onFinish={finishChallenge} />
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

      <ResultModal result={result} onNext={resetRound} onRetry={resetRound} onClose={() => setResult(null)} onChooseReward={chooseReward} />
    </main>
  );
}
