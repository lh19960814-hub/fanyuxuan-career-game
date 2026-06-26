import CartoonCharacter from './CartoonCharacter';

export default function CompletionPage({ player, onRestart }) {
  return (
    <main className="completion-page">
      <section className="completion-card">
        <div className="final-certificate">
          <span>范宇轩晋升证明</span>
          <strong>厅级干部</strong>
        </div>
        <p className="eyebrow">最终通关</p>
        <h1>恭喜范宇轩成功晋升厅级干部！</h1>
        <CartoonCharacter player={player} />
        <div className="completion-stats">
          <span>总胜场：{player.winCount}</span>
          <span>失败次数：{player.loseCount}</span>
          <span>答对总数：{player.totalCorrect || 0}</span>
          <span>答错总数：{player.totalWrong || 0}</span>
          <span>最佳连击：{player.bestStreak || 0}</span>
          <span>干部阅历：{player.cadreExp}</span>
          <span>最终职级：厅级干部</span>
        </div>
        <p>朋友团轮番上擂台，范宇轩一路答题、一路晋升，最终完成厅级干部考核。此刻，全场起立，晋升路线正式闭环。</p>
        <button className="button button--primary" onClick={onRestart}>重新开始</button>
        <button className="button button--ghost">高难模式开发中</button>
      </section>
    </main>
  );
}
