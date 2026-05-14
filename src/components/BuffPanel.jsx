export default function BuffPanel({ buffs }) {
  return (
    <section className="panel">
      <div className="panel-title">临时 Buff</div>
      {buffs.length ? (
        <div className="tag-list">
          {buffs.map((buff) => (
            <span className="tag tag--blue" title={buff.desc} key={buff.id}>
              {buff.name} · {buff.duration}关
            </span>
          ))}
        </div>
      ) : (
        <p className="muted">暂无 Buff，主打一个稳定发挥。</p>
      )}
    </section>
  );
}
