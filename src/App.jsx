import { useEffect, useState } from 'react';
import HomePage from './components/HomePage';
import GamePage from './components/GamePage';
import CompletionPage from './components/CompletionPage';
import { clearSave, hasSave, loadSave, saveGame } from './utils/storage';
import { createInitialPlayer } from './utils/gameLogic';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [player, setPlayer] = useState(createInitialPlayer());
  const [existingSave, setExistingSave] = useState(false);

  useEffect(() => {
    setExistingSave(hasSave());
  }, []);

  useEffect(() => {
    if (screen === 'game' || screen === 'complete') {
      saveGame(player);
    }
  }, [player, screen]);

  useEffect(() => {
    if (player.isCompleted) {
      setScreen('complete');
    }
  }, [player.isCompleted]);

  function startNewGame() {
    const freshPlayer = createInitialPlayer();
    clearSave();
    setPlayer(freshPlayer);
    setScreen('game');
    setExistingSave(false);
  }

  function continueGame() {
    const saved = loadSave();
    if (saved) {
      setPlayer(saved);
      setScreen(saved.isCompleted ? 'complete' : 'game');
    }
  }

  function restart() {
    startNewGame();
  }

  if (screen === 'complete') {
    return <CompletionPage player={player} onRestart={restart} />;
  }

  if (screen === 'game') {
    return <GamePage player={player} setPlayer={setPlayer} onRestart={restart} />;
  }

  return <HomePage hasExistingSave={existingSave} onStart={startNewGame} onContinue={continueGame} />;
}
