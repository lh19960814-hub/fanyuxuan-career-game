import { useRef, useState } from 'react';

export default function ReactionGame({ npc, player, onFinish }) {
  const [phase, setPhase] = useState('idle');
  const [result, setResult] = useState(null);
  const startAtRef = useRef(0);
  const timerRef = useRef(null);

  function start() {
    setResult(null);
    setPhase('waiting');
    const delay = 1000 + Math.floor(Math.random() * 2000);
    timerRef.current = window.setTimeout(() => {
      startAtRef.current = performance.now();
      setPhase('ready');
    }, delay);
  }

  function clickTarget() {
    if (phase === 'waiting') {
      window.clearTimeout(timerRef.current);
      setPhase('done');
      setResult({ text: '提前点了！范宇轩的手比流程还快，按规则本轮失败。' });
      onFinish(false, '提前点击，流程意识还有提升空间。');
      return;
    }

    if (phase !== 'ready') return;

    const reaction = Math.round(performance.now() - startAtRef.current);
    const equipmentBonus = player.equipments.includes('leather-shoes') ? 60 : 0;
    const watchBonus = player.equipments.includes('watch') ? 45 : 0;
    const buffBonus = player.buffs.some((buff) => buff.effectType === 'reactionFocus') ? 80 : 0;
    const adjustedReaction = Math.max(120, reaction - equipmentBonus - watchBonus - buffBonus);
    const npcTime = Math.round(npc.reactionBase - npc.difficulty * 18 + Math.random() * 170);
    const win = adjustedReaction < npcTime;

    setPhase('done');
    setResult({
      text: win ? '快！非常快！像是会议通知刚弹出来就已经读完了。' : '慢了一点点，可能是在思考这次点击的历史意义。',
      reaction,
      adjustedReaction,
      npcTime,
    });
    onFinish(win, win ? '反应挑战获胜，范宇轩手速沉稳又精准。' : '反应挑战惜败，下一次看到提示再出手。');
  }

  return (
    <section className="mini-game">
      <h3>点击反应速度测试</h3>
      <p>点击开始后，等到出现“立即点击”再点。提前点击会失败。</p>
      {phase === 'idle' && <button className="button button--primary" onClick={start}>开始反应挑战</button>}
      {phase !== 'idle' && (
        <button className={`reaction-pad reaction-pad--${phase}`} onClick={clickTarget}>
          {phase === 'waiting' && '沉住气，别急...'}
          {phase === 'ready' && '立即点击！'}
          {phase === 'done' && '本轮完成'}
        </button>
      )}
      {result && (
        <div className="game-result-inline">
          <span>{result.text}</span>
          {result.reaction && (
            <strong>
              你的反应：{result.reaction}ms，计入加成后：{result.adjustedReaction}ms，NPC：{result.npcTime}ms
            </strong>
          )}
        </div>
      )}
    </section>
  );
}
