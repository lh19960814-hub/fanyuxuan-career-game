import { getCurrentTitle, getExpProgress, getNextTitle } from '../utils/gameLogic';
import ProgressBar from './ProgressBar';

export default function StatusPanel({ player }) {
  const title = getCurrentTitle(player);
  const nextTitle = getNextTitle(player);
  const progress = getExpProgress(player);
  const stats = [
    { label: '压力', value: `${player.pressure ?? 0}`, tone: 'red' },
    { label: '口碑', value: `${player.reputation ?? 0}`, tone: 'green' },
    { label: '谣言', value: `${player.gossip ?? 0}`, tone: 'purple' },
    { label: '材料', value: `${player.paperwork ?? 0}`, tone: 'blue' },
    { label: '协调', value: `${player.social ?? 0}`, tone: 'cyan' },
    { label: '家庭', value: `${player.familyApproval ?? 0}`, tone: 'gold' },
  ];

  return (
    <section className="status-hud">
      <div className="status-hud__top">
        <div>
          <span>当前职级</span>
          <strong>{title.name}</strong>
        </div>
        <div>
          <span>回合</span>
          <strong>{player.round || 1}/{player.maxRounds || 14}</strong>
        </div>
        <div>
          <span>战绩</span>
          <strong>{player.winCount}胜 {player.loseCount}败</strong>
        </div>
      </div>

      <div className="status-hud__exp">
        <div className="status-hud__exp-label">
          <span>经验</span>
          <strong>{player.exp}{nextTitle ? ` / ${nextTitle.requiredExp}` : ' / 已满级'}</strong>
        </div>
        <ProgressBar value={progress} />
      </div>

      <div className="status-hud__stats">
        {stats.map((stat) => (
          <div className={`mini-stat mini-stat--${stat.tone}`} key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
