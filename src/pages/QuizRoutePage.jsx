import { useMemo, useState } from 'react';
import CartoonCharacter from '../components/CartoonCharacter';
import NpcAvatar from '../components/NpcAvatar';
import { getAvailableNpcs, getCurrentRank, getQuizSkill } from '../utils/quizGameLogic';

export default function QuizRoutePage({ player, onSelectNpc, onBack }) {
  const [previewNpc, setPreviewNpc] = useState(null);
  const rank = getCurrentRank(player);
  const skill = getQuizSkill(player);
  const npcs = getAvailableNpcs(player);
  const defeatedCount = player.defeatedNpcs?.length || 0;
  const progressText = `${Math.min(defeatedCount + 1, npcs.length)} / ${npcs.length}`;
  const currentNpc = useMemo(() => npcs.find((npc) => npc.current), [npcs]);

  return (
    <main className="quiz-route-page">
      <section className="quiz-topbar">
        <button className="button button--ghost" onClick={onBack}>返回首页</button>
        <div>
          <p className="eyebrow">一站到底挑战路线</p>
          <h1>当前职级：{rank.name}</h1>
        </div>
      </section>

      <section className="quiz-profile-card">
        <CartoonCharacter player={player} size="small" />
        <div className="quiz-profile-info">
          <p className="eyebrow">范宇轩状态</p>
          <h2>{rank.description}</h2>
          <div className="quiz-stat-strip">
            <span>路线 {progressText}</span>
            <span>胜场 {player.winCount}</span>
            <span>失败 {player.loseCount}</span>
            <span>最佳连击 {player.bestStreak || 0}</span>
            <span>干部阅历 {player.cadreExp || 0}</span>
          </div>
          <div className="quiz-route-progress">
            <i style={{ width: `${Math.round((defeatedCount / npcs.length) * 100)}%` }} />
          </div>
          <div className="quiz-skill-card">
            <strong>{skill.name}</strong>
            <span>{skill.desc}</span>
          </div>
          {currentNpc && (
            <p className="route-next-tip">
              下一位对手：{currentNpc.name} · {currentNpc.title}
            </p>
          )}
        </div>
      </section>

      <section className="quiz-npc-grid">
        {npcs.map((npc) => (
          <button
            key={npc.id}
            className={`quiz-npc-card ${npc.current ? 'quiz-npc-card--current' : ''} ${npc.defeated ? 'quiz-npc-card--done' : ''}`}
            disabled={!npc.unlocked || npc.defeated}
            onClick={() => setPreviewNpc(npc)}
          >
            <NpcAvatar npc={npc} />
            <div>
              <small>{npc.defeated ? '已击败' : npc.unlocked ? '可挑战' : '未解锁'}</small>
              <h3>{npc.name}</h3>
              <p>{npc.title}</p>
              <span>{npc.skillName}：{npc.skillDesc}</span>
            </div>
          </button>
        ))}
      </section>

      {previewNpc && (
        <div className="quiz-preview-backdrop" role="presentation" onClick={() => setPreviewNpc(null)}>
          <section className="quiz-preview-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <NpcAvatar npc={previewNpc} size="big" />
            <p className="eyebrow">战前情报</p>
            <h2>{previewNpc.name}</h2>
            <strong>{previewNpc.title}</strong>
            <p>{previewNpc.desc}</p>
            <div className="preview-info-grid">
              <span>难度 {previewNpc.difficulty}</span>
              <span>气势 {previewNpc.aura}</span>
              <span>题量 6</span>
            </div>
            <div className="preview-skill">
              <b>{previewNpc.skillName}</b>
              <span>{previewNpc.skillDesc}</span>
            </div>
            <blockquote>{previewNpc.dialogue}</blockquote>
            <div className="modal-actions">
              <button className="button button--primary" onClick={() => onSelectNpc(previewNpc.id)}>登上擂台</button>
              <button className="button button--secondary" onClick={() => setPreviewNpc(null)}>再看看</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
