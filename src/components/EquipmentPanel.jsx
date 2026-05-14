import { equipments } from '../data/equipments';

export default function EquipmentPanel({ equipmentIds }) {
  const owned = equipments.filter((item) => equipmentIds.includes(item.id));

  return (
    <section className="panel">
      <div className="panel-title">当前装备</div>
      {owned.length ? (
        <div className="tag-list">
          {owned.map((item) => (
            <span className="tag tag--gold" title={item.desc} key={item.id}>
              {item.name}
            </span>
          ))}
        </div>
      ) : (
        <p className="muted">暂时两手空空，但笑容很有潜力。</p>
      )}
    </section>
  );
}
