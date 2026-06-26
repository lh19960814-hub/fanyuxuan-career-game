import CartoonCharacter from './CartoonCharacter';
import { createInitialQuizPlayer } from '../utils/quizGameLogic';

export default function HomePage({ hasExistingSave, onStart, onContinue, onLevels, onGrowth }) {
  return (
    <main className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">一站到底答题对决</p>
          <h1>范宇轩：厅级干部之路</h1>
          <p className="hero-subtitle">控制范宇轩登上答题擂台，击败朋友 NPC，一路晋升到厅级干部。</p>
          <div className="hero-actions">
            <button className="button button--primary" onClick={onStart}>开始游戏</button>
            {hasExistingSave && <button className="button button--secondary" onClick={onContinue}>继续游戏</button>}
            <button className="button button--ghost" onClick={onLevels}>挑战路线</button>
            <button className="button button--ghost" onClick={onGrowth}>查看进度</button>
          </div>
        </div>
        <CartoonCharacter player={createInitialQuizPlayer()} />
      </section>

      <section className="guide-section" id="guide">
        <h2>怎么玩</h2>
        <div className="guide-grid">
          <div>
            <strong>答题对决</strong>
            <p>每题四个选项，答对削掉 NPC 气势，答错扣范哥气势。</p>
          </div>
          <div>
            <strong>朋友技能</strong>
            <p>李欢、高子健、徐超超等朋友都有专属擂台效果。</p>
          </div>
          <div>
            <strong>一路晋升</strong>
            <p>击败 NPC 获得阅历、装备和职级成长，最终冲击厅级干部。</p>
          </div>
        </div>
      </section>
    </main>
  );
}
