import CartoonCharacter from './CartoonCharacter';
import { createInitialPlayer } from '../utils/gameLogic';

export default function HomePage({ hasExistingSave, onStart, onContinue }) {
  return (
    <main className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">轻松搞笑成长小游戏</p>
          <h1>范宇轩：厅级干部之路</h1>
          <p className="hero-subtitle">从实习生到厅级干部的离谱晋升挑战。</p>
          <div className="hero-actions">
            <button className="button button--primary" onClick={onStart}>开始游戏</button>
            {hasExistingSave && <button className="button button--secondary" onClick={onContinue}>继续游戏</button>}
            <a className="button button--ghost" href="#guide">游戏说明</a>
          </div>
        </div>
        <CartoonCharacter player={createInitialPlayer()} />
      </section>

      <section className="guide-section" id="guide">
        <h2>怎么玩</h2>
        <div className="guide-grid">
          <div>
            <strong>随机挑战</strong>
            <p>每一关会遇到不同 NPC，并随机进入点击反应、猜拳或 21 点。</p>
          </div>
          <div>
            <strong>一路晋升</strong>
            <p>获胜获得经验，职级从实习生一路升到厅级干部。</p>
          </div>
          <div>
            <strong>角色成长</strong>
            <p>装备和职级会改变范宇轩的卡通形象，不只是数字变强。</p>
          </div>
        </div>
      </section>
    </main>
  );
}
