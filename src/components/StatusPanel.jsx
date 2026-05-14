import { getCurrentTitle, getExpProgress, getNextTitle } from '../utils/gameLogic';
import ProgressBar from './ProgressBar';

export default function StatusPanel({ player }) {
  const title = getCurrentTitle(player);
  const nextTitle = getNextTitle(player);
  const progress = getExpProgress(player);

  return (
    <section className="status-grid">
      <div className="status-card">
        <span>当前职级</span>
        <strong>{title.name}</strong>
        <small>{title.description}</small>
      </div>
      <div className="status-card status-card--wide">
        <span>经验值</span>
        <strong>
          {player.exp}
          {nextTitle ? ` / ${nextTitle.requiredExp}` : ' / 已满级'}
        </strong>
        <ProgressBar value={progress} />
      </div>
      <div className="status-card">
        <span>战绩</span>
        <strong>{player.winCount}胜 / {player.loseCount}败</strong>
        <small>当前第 {player.winCount + player.loseCount + 1} 关</small>
      </div>
    </section>
  );
}
