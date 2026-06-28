import { useEffect, useMemo, useState } from 'react';
import HomePage from './components/HomePage';
import CompletionPage from './components/CompletionPage';
import ShareCard from './components/ShareCard';
import QuizRoutePage from './pages/QuizRoutePage';
import QuizDuelPage from './pages/QuizDuelPage';
import { quizNpcs } from './data/quizNpcs';
import { clearSave, hasSave, loadSave, saveGame } from './utils/storage';
import {
  createInitialQuizPlayer,
  getFailureReason,
  migrateQuizPlayer,
  repairQuizPlayer,
  settleQuizFailure,
  settleQuizVictory,
} from './utils/quizGameLogic';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [player, setPlayer] = useState(createInitialQuizPlayer());
  const [existingSave, setExistingSave] = useState(false);
  const [selectedNpcId, setSelectedNpcId] = useState(null);
  const [battleResult, setBattleResult] = useState(null);

  const selectedNpc = useMemo(
    () => quizNpcs.find((npc) => npc.id === selectedNpcId),
    [selectedNpcId],
  );

  useEffect(() => {
    setExistingSave(hasSave());
  }, []);

  useEffect(() => {
    if (screen !== 'home') {
      saveGame(player);
    }
  }, [player, screen]);

  useEffect(() => {
    if (player.isCompleted) {
      setScreen('complete');
    }
  }, [player.isCompleted]);

  function startNewGame() {
    const freshPlayer = createInitialQuizPlayer();
    clearSave();
    setPlayer(freshPlayer);
    setBattleResult(null);
    setSelectedNpcId(null);
    setExistingSave(false);
    setScreen('route');
  }

  function continueGame() {
    const saved = loadSave();
    if (!saved) return;

    const nextPlayer = migrateQuizPlayer(saved);
    setPlayer(nextPlayer);
    setScreen(nextPlayer.isCompleted ? 'complete' : 'route');
  }

  function repairSave() {
    const saved = loadSave();
    if (!saved) return;

    const repairedPlayer = repairQuizPlayer(migrateQuizPlayer(saved));
    setPlayer(repairedPlayer);
    saveGame(repairedPlayer);
    setExistingSave(true);
    setBattleResult(null);
    setSelectedNpcId(null);
    setScreen(repairedPlayer.isCompleted ? 'complete' : 'route');
  }

  function resetLocalSave() {
    if (!window.confirm('确定要清空本机存档吗？清空后会回到新游戏状态。')) {
      return;
    }

    clearSave();
    const freshPlayer = createInitialQuizPlayer();
    setPlayer(freshPlayer);
    setExistingSave(false);
    setSelectedNpcId(null);
    setBattleResult(null);
    setScreen('home');
  }

  function openRoute() {
    setScreen('route');
  }

  function openNpc(npcId) {
    setSelectedNpcId(npcId);
    setBattleResult(null);
    setScreen('duel');
  }

  function handleWin(battle) {
    const { player: nextPlayer, reward } = settleQuizVictory(player, selectedNpc, battle);
    setPlayer(nextPlayer);
    saveGame(nextPlayer);
    setBattleResult({
      status: 'won',
      npc: selectedNpc,
      battle,
      reward,
    });
    setScreen(reward.isCompleted ? 'complete' : 'result');
  }

  function handleLose(battle) {
    const nextPlayer = settleQuizFailure(player, battle);
    const failureReason = getFailureReason(battle);
    setPlayer(nextPlayer);
    saveGame(nextPlayer);
    setBattleResult({
      status: 'lost',
      npc: selectedNpc,
      battle,
      reward: { cadreExp: 8 },
      failureReason,
    });
    setScreen('result');
  }

  function backHome() {
    setScreen('home');
    setSelectedNpcId(null);
    setBattleResult(null);
    setExistingSave(hasSave());
  }

  if (screen === 'complete') {
    return <CompletionPage player={player} onRestart={startNewGame} />;
  }

  if (screen === 'route') {
    return <QuizRoutePage player={player} onSelectNpc={openNpc} onBack={backHome} />;
  }

  if (screen === 'duel' && selectedNpc) {
    return (
      <QuizDuelPage
        player={player}
        npc={selectedNpc}
        onBack={() => setScreen('route')}
        onWin={handleWin}
        onLose={handleLose}
      />
    );
  }

  if (screen === 'result' && battleResult) {
    const won = battleResult.status === 'won';
    const rankUp = battleResult.reward.levelUps?.[0];
    const accuracy = battleResult.battle.correct + battleResult.battle.wrong > 0
      ? Math.round((battleResult.battle.correct / (battleResult.battle.correct + battleResult.battle.wrong)) * 100)
      : 0;

    return (
      <main className="quiz-result-page">
        <section className={`quiz-result-card ${won ? 'quiz-result-card--win' : 'quiz-result-card--lost'}`}>
          <div className="result-medal">{won ? '胜' : '稳'}</div>
          <p className="eyebrow">{won ? '擂台胜利' : '本轮失利'}</p>
          <h1>{won ? `击败 ${battleResult.npc.name}` : `${battleResult.npc.name} 暂时守住擂台`}</h1>
          <p>
            {won
              ? `${battleResult.npc.defeatedLine} 范宇轩的晋升气势继续上涨。`
              : '这不是失败，这是范宇轩整理错题本的必要过程。'}
          </p>

          {!won && (
            <div className="failure-reason">
              <strong>失败原因</strong>
              <span>{battleResult.failureReason}</span>
            </div>
          )}

          <div className="completion-stats">
            <span>答对：{battleResult.battle.correct}</span>
            <span>答错：{battleResult.battle.wrong}</span>
            <span>正确率：{accuracy}%</span>
            <span>最佳连击：{battleResult.battle.bestStreak}</span>
            <span>干部阅历：+{battleResult.reward.cadreExp}</span>
            {won && <span>经验：+{battleResult.reward.exp}</span>}
          </div>

          {rankUp && (
            <div className="rank-up-banner">
              职级提升：{rankUp.from} → {rankUp.to}
            </div>
          )}

          {battleResult.reward.equipment && (
            <div className="rank-up-banner rank-up-banner--item">
              获得装备：{battleResult.reward.equipment.name}
            </div>
          )}

          {won && (
            <div className="route-report">
              晋升战报已生成：范宇轩用 {battleResult.battle.correct} 次正确回答拿下本轮考核。
            </div>
          )}

          <ShareCard
            player={player}
            npc={battleResult.npc}
            battle={battleResult.battle}
            status={battleResult.status}
          />

          <div className="modal-actions">
            <button className="button button--primary" onClick={openRoute}>返回挑战路线</button>
            {!won && <button className="button button--secondary" onClick={() => openNpc(battleResult.npc.id)}>重新挑战</button>}
          </div>
        </section>
      </main>
    );
  }

  return (
    <HomePage
      hasExistingSave={existingSave}
      onStart={startNewGame}
      onContinue={continueGame}
      onLevels={openRoute}
      onGrowth={openRoute}
      onRepairSave={repairSave}
      onClearSave={resetLocalSave}
    />
  );
}
