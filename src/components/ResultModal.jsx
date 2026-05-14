export default function ResultModal({ result, onNext, onRetry, onClose }) {
  if (!result) return null;

  const isWin = result.type === 'win';

  return (
    <div className="modal-backdrop">
      <section className={`modal ${isWin ? 'modal--win' : 'modal--lose'}`}>
        <p className="eyebrow">{isWin ? '挑战成功' : '挑战失败'}</p>
        <h2>{isWin ? '本关获胜！' : '稍微沉淀一下'}</h2>
        <p>{result.message}</p>

        {isWin && (
          <div className="settle-list">
            <div>获得经验：+{result.reward.exp}</div>
            {result.reward.levelUps.length > 0 && (
              <div>
                职级提升：
                {result.reward.levelUps.map((item) => `${item.from} -> ${item.to}`).join('，')}
              </div>
            )}
            {result.reward.equipment && <div>获得装备：{result.reward.equipment.name}</div>}
            {result.reward.buff && <div>获得 Buff：{result.reward.buff.name}</div>}
            <div>角色变化：范宇轩的气质又往上走了一格。</div>
          </div>
        )}

        <div className="modal-actions">
          {isWin ? (
            <button className="button button--primary" onClick={onNext}>下一关</button>
          ) : (
            <button className="button button--primary" onClick={onRetry}>重新挑战</button>
          )}
          <button className="button button--ghost" onClick={onClose}>先看看状态</button>
        </div>
      </section>
    </div>
  );
}
