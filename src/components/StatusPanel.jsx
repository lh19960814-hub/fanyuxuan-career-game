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
        <small>第 {player.round || 1} / {player.maxRounds || 14} 回合</small>
      </div>
      <div className="status-card compact-stat">
        <span>压力</span>
        <strong>{player.pressure ?? 0}/100</strong>
        <small>满了会提前沉淀</small>
      </div>
      <div className="status-card compact-stat">
        <span>口碑 / 谣言</span>
        <strong>{player.reputation ?? 0} / {player.gossip ?? 0}</strong>
        <small>影响朋友局结局</small>
      </div>
      <div className="status-card compact-stat">
        <span>材料 / 协调</span>
        <strong>{player.paperwork ?? 0} / {player.social ?? 0}</strong>
        <small>肉鸽路线核心属性</small>
      </div>
    </section>
  );
}
