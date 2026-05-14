import CartoonCharacter from './CartoonCharacter';

export default function CompletionPage({ player, onRestart }) {
  return (
    <main className="completion-page">
      <section className="completion-card">
        <p className="eyebrow">最终通关</p>
        <h1>恭喜范宇轩成功晋升厅级干部！</h1>
        <CartoonCharacter player={player} />
        <div className="completion-stats">
          <span>总胜场：{player.winCount}</span>
          <span>失败次数：{player.loseCount}</span>
          <span>获得装备：{player.equipments.length}</span>
          <span>获得 Buff：{player.completedBuffCount}</span>
          <span>最终职级：厅级干部</span>
        </div>
        <p>从黑 T 开朗青年到沉稳厅级干部，范宇轩完成了办公室传说级晋升路线。</p>
        <button className="button button--primary" onClick={onRestart}>重新开始</button>
      </section>
    </main>
  );
}
