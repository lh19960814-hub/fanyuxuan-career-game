import CartoonCharacter from './CartoonCharacter';

export default function CompletionPage({ player, onRestart }) {
  const endingName = player.ending?.name || '厅级干部正统结局';
  const endingDesc = player.ending?.desc || '恭喜范宇轩成功晋升厅级干部！';

  return (
    <main className="completion-page">
      <section className="completion-card">
        <p className="eyebrow">最终通关</p>
        <h1>{endingName}</h1>
        <CartoonCharacter player={player} />
        <div className="completion-stats">
          <span>总胜场：{player.winCount}</span>
          <span>失败次数：{player.loseCount}</span>
          <span>获得装备：{player.equipments.length}</span>
          <span>获得 Buff：{player.completedBuffCount}</span>
          <span>压力：{player.pressure}</span>
          <span>口碑：{player.reputation}</span>
          <span>家庭认可：{player.familyApproval}</span>
        </div>
        <p>{endingDesc}</p>
        <button className="button button--primary" onClick={onRestart}>重新开始</button>
      </section>
    </main>
  );
}
