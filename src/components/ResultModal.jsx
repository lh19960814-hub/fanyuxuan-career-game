export default function ResultModal({ result, onNext, onRetry, onClose, onChooseReward }) {
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
            <div>角色变化：范宇轩的气质又往上走了一格。</div>
          </div>
        )}

        {isWin && result.reward.rewardOptions?.length > 0 && (
          <>
          <p className="reward-hint">选择一项战利品，进入下一回合。</p>
          <div className="reward-choice-list">
            {result.reward.rewardOptions.map((choice) => (
              <button className="reward-choice" key={choice.id} onClick={() => onChooseReward(choice)}>
                <strong>{choice.title}</strong>
                <span>{choice.desc}</span>
                <small>{choice.effectText}</small>
              </button>
            ))}
          </div>
          </>
        )}

        <div className="modal-actions">
          {isWin && !result.reward.rewardOptions?.length ? (
            <button className="button button--primary" onClick={onNext}>下一关</button>
          ) : null}
          {!isWin ? (
            <button className="button button--primary" onClick={onRetry}>继续下一回合</button>
          ) : null}
          {!isWin && <button className="button button--ghost" onClick={onClose}>先看看状态</button>}
        </div>
      </section>
    </div>
  );
}
