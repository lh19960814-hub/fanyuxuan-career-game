import CartoonCharacter from './CartoonCharacter';
import NpcAvatar from './NpcAvatar';
import shareCardBg from '../assets/share-card-bg.png';
import { getCurrentRank } from '../utils/quizGameLogic';

function getAccuracy(correct = 0, wrong = 0) {
  const total = correct + wrong;
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

export default function ShareCard({ player, npc, battle, status = 'won', final = false }) {
  const rank = final ? { name: '厅级干部' } : getCurrentRank(player);
  const correct = final ? player.totalCorrect || 0 : battle?.correct || 0;
  const wrong = final ? player.totalWrong || 0 : battle?.wrong || 0;
  const accuracy = getAccuracy(correct, wrong);
  const won = final || status === 'won';
  const title = final ? '厅级干部通关战报' : won ? '范哥拿下本轮擂台' : '范哥整理错题本中';
  const targetName = final ? '最终考核' : npc?.name || '神秘对手';
  const resultText = final ? '最终晋升成功' : won ? `击败 ${targetName}` : `惜败 ${targetName}`;

  return (
    <section className="share-card-wrap" aria-label="战绩分享卡">
      <p className="share-card-tip">截图这一张，发群里最有节目效果。</p>
      <div className="share-card">
        <img className="share-card__bg" src={shareCardBg} alt="" draggable="false" />
        <div className="share-card__title">
          <span>范宇轩：厅级干部之路</span>
          <strong>{title}</strong>
        </div>

        <div className="share-card__hero">
          <CartoonCharacter player={player} size="small" />
        </div>

        <div className="share-card__result">
          <strong>{resultText}</strong>
          <span>{won ? '没人能影响我的仕途' : '下一把范哥要开始发力'}</span>
        </div>

        <div className="share-card__stats share-card__stats--top">
          <div>
            <span>当前职级</span>
            <strong>{rank.name}</strong>
          </div>
          <div>
            <span>正确率</span>
            <strong>{accuracy}%</strong>
          </div>
          <div>
            <span>最高连击</span>
            <strong>{final ? player.bestStreak || 0 : battle?.bestStreak || 0}</strong>
          </div>
        </div>

        <div className="share-card__stats share-card__stats--bottom">
          <div>
            <span>答对</span>
            <strong>{correct}</strong>
          </div>
          <div>
            <span>答错</span>
            <strong>{wrong}</strong>
          </div>
          <div>
            <span>{final ? '总胜场' : '范哥气势'}</span>
            <strong>{final ? player.winCount || 0 : Math.max(0, battle?.playerAura || 0)}</strong>
          </div>
        </div>

        {!final && npc && (
          <div className="share-card__npc">
            <NpcAvatar npc={npc} />
            <div>
              <span>本轮对手</span>
              <strong>{npc.name}</strong>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
