import { gameTypes } from '../data/gameTypes';

export default function NpcCard({ npc }) {
  const preferred = gameTypes.find((game) => game.type === npc.preferredGameType)?.name || '随机';

  return (
    <section className="npc-card">
      <div>
        <p className="eyebrow">本关 NPC</p>
        <h3>{npc.name}</h3>
        <p>{npc.desc}</p>
      </div>
      <div className="npc-meta">
        <span>难度 {npc.difficulty}</span>
        <span>偏好：{preferred}</span>
      </div>
    </section>
  );
}
