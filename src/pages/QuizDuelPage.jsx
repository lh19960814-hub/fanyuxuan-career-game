import { useEffect, useMemo, useState } from 'react';
import CartoonCharacter from '../components/CartoonCharacter';
import NpcAvatar from '../components/NpcAvatar';
import { buildBattleState, getQuestion, getQuizSkill } from '../utils/quizGameLogic';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function AuraBar({ label, value, max }) {
  const percent = clamp(Math.round((value / max) * 100), 0, 100);
  return (
    <div className="aura-wrap">
      <div className="aura-label">
        <span>{label}</span>
        <strong>{Math.max(0, value)}</strong>
      </div>
      <div className="aura-track">
        <i style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

const QUESTIONS_PER_DUEL = 6;
const QUESTION_TIME_LIMIT = 15;

export default function QuizDuelPage({ player, npc, onBack, onWin, onLose }) {
  const [battle, setBattle] = useState(() => buildBattleState(npc, player.answeredQuestionTexts));
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const skill = getQuizSkill(player);
  const question = getQuestion(npc, battle);
  const playerMaxAura = 100;
  const npcMaxAura = npc.aura;

  const disabledByNpc = npc.skillType === 'disableSkill' && !battle.npcFlags.skillBlocked;
  const visibleOptions = useMemo(() => {
    return question.options.map((option, index) => ({
      option,
      index,
      hidden: battle.hiddenOptions.includes(index),
    }));
  }, [question, battle.hiddenOptions]);

  useEffect(() => {
    setTimeLeft(QUESTION_TIME_LIMIT);
  }, [battle.questionIndex]);

  useEffect(() => {
    if (feedback) return undefined;

    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          handleTimeout();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [feedback, battle.questionIndex]);

  function finishIfNeeded(nextBattle) {
    if (nextBattle.npcAura <= 0) {
      onWin(nextBattle);
      return true;
    }
    if (nextBattle.playerAura <= 0 || nextBattle.questionIndex >= QUESTIONS_PER_DUEL) {
      onLose(nextBattle);
      return true;
    }
    return false;
  }

  function applyNpcPassive(nextBattle, wasCorrect) {
    const flags = { ...nextBattle.npcFlags };
    let log = [...nextBattle.log];
    let playerAura = nextBattle.playerAura;
    let npcAura = nextBattle.npcAura;

    if (!wasCorrect && npc.skillType === 'wrongBonusDamage') {
      playerAura -= 6;
      log.push('李欢发动黑粉弹幕，范哥气势额外 -6。');
    }

    if (wasCorrect && npc.skillType === 'healOnCorrect') {
      playerAura = clamp(playerAura + 6, 0, playerMaxAura);
      log.push('张年杰发动粉丝声援，范哥气势 +6。');
    }

    if (!wasCorrect && npc.skillType === 'comboPunish' && nextBattle.wrong >= 2) {
      playerAura -= 8;
      log.push('郭鹏强观战锐评：连续失误，范哥气势额外 -8。');
    }

    if (!wasCorrect && npc.skillType === 'strategyPunish') {
      playerAura -= 8;
      log.push('徐超超指出运营问题，范哥气势额外 -8。');
    }

    if (!wasCorrect && npc.skillType === 'bossPressure') {
      playerAura -= 10;
      log.push('高子健的大山压迫生效，范哥气势额外 -10。');
    }

    if (npc.skillType === 'shieldAtHalf' && !flags.shielded && npcAura > 0 && npcAura < npc.aura / 2) {
      flags.shielded = true;
      npcAura += 16;
      log.push('何三江提出方案返工，恢复 16 点气势。');
    }

    if (npc.skillType === 'recoverOnce' && !flags.recovered && npcAura > 0 && npcAura < 34) {
      flags.recovered = true;
      npcAura += 18;
      log.push('领队李哥发动人脉支援，恢复 18 点气势。');
    }

    if (npc.skillType === 'lastStand' && !flags.lastStand && npcAura <= 0) {
      flags.lastStand = true;
      npcAura = 22;
      log.push('龚庆林发动元宝护盾，保留 22 点气势。');
    }

    if (npc.skillType === 'finalBoss' && !flags.finalHeal && npcAura > 0 && npcAura < 55) {
      flags.finalHeal = true;
      npcAura += 24;
      log.push('杨淑媛展开柳州终极考核，恢复 24 点气势。');
    }

    return { ...nextBattle, playerAura, npcAura, npcFlags: flags, log };
  }

  function answer(optionIndex) {
    if (feedback) return;
    const isCorrect = optionIndex === question.answerIndex;
    const bonus = battle.skillMode === 'bonusDamage' ? 18 : 0;
    const doubleBonus = battle.skillMode === 'doubleNext' ? 14 : 0;
    const streak = isCorrect ? battle.streak + 1 : 0;
    const damage = isCorrect ? 24 + Math.min(streak * 4, 16) + bonus + doubleBonus : 0;
    const wrongDamage = battle.skillMode === 'shieldWrong' ? 0 : 18 + npc.difficulty * 2;

    let nextBattle = {
      ...battle,
      npcAura: isCorrect ? battle.npcAura - damage : battle.npcAura,
      playerAura: isCorrect ? battle.playerAura : battle.playerAura - wrongDamage,
      correct: battle.correct + (isCorrect ? 1 : 0),
      wrong: battle.wrong + (isCorrect ? 0 : 1),
      streak,
      bestStreak: Math.max(battle.bestStreak, streak),
      answeredQuestionTexts: [...battle.answeredQuestionTexts, question.text],
      hiddenOptions: [],
      skillMode: battle.skillMode === 'doubleNext' ? 'doubleNext' : null,
      log: [
        ...battle.log,
        isCorrect ? `答对！${npc.name}气势 -${damage}。` : `答错，范哥气势 -${wrongDamage}。`,
      ],
    };

    if (battle.skillMode === 'doubleNext' && isCorrect) {
      nextBattle.skillMode = nextBattle.correct % 2 === 0 ? null : 'doubleNext';
    }

    nextBattle = applyNpcPassive(nextBattle, isCorrect);
    setFeedback({
      isCorrect,
      selected: optionIndex,
      answer: question.answerIndex,
      explanation: question.explanation,
      damage,
      wrongDamage,
      streak,
      playerAuraBefore: battle.playerAura,
      npcAuraBefore: battle.npcAura,
      playerAuraAfter: nextBattle.playerAura,
      npcAuraAfter: nextBattle.npcAura,
    });
    setBattle(nextBattle);
  }

  function handleTimeout() {
    const wrongDamage = battle.skillMode === 'shieldWrong' ? 0 : 18 + npc.difficulty * 2;
    let nextBattle = {
      ...battle,
      playerAura: battle.playerAura - wrongDamage,
      wrong: battle.wrong + 1,
      streak: 0,
      answeredQuestionTexts: [...battle.answeredQuestionTexts, question.text],
      hiddenOptions: [],
      skillMode: battle.skillMode === 'doubleNext' ? 'doubleNext' : null,
      log: [...battle.log, `倒计时结束，本题判错，范哥气势 -${wrongDamage}。`],
    };

    nextBattle = applyNpcPassive(nextBattle, false);
    setFeedback({
      isCorrect: false,
      timedOut: true,
      selected: null,
      answer: question.answerIndex,
      explanation: question.explanation,
      damage: 0,
      wrongDamage,
      streak: 0,
      playerAuraBefore: battle.playerAura,
      npcAuraBefore: battle.npcAura,
      playerAuraAfter: nextBattle.playerAura,
      npcAuraAfter: nextBattle.npcAura,
    });
    setBattle(nextBattle);
  }

  function nextQuestion() {
    const nextBattle = {
      ...battle,
      questionIndex: battle.questionIndex + 1,
    };
    setFeedback(null);
    setBattle(nextBattle);
    finishIfNeeded(nextBattle);
  }

  function useSkill() {
    if (battle.usedSkill || feedback) return;

    if (disabledByNpc) {
      setBattle({
        ...battle,
        usedSkill: true,
        npcFlags: { ...battle.npcFlags, skillBlocked: true },
        log: [...battle.log, '赵乾宏发动羁绊封锁，本次范宇轩技能被挡下。'],
      });
      return;
    }

    if (skill.type === 'removeWrong') {
      const wrongOptions = question.options
        .map((_, index) => index)
        .filter((index) => index !== question.answerIndex && !battle.hiddenOptions.includes(index));
      setBattle({
        ...battle,
        usedSkill: true,
        hiddenOptions: [wrongOptions[0]],
        log: [...battle.log, `${skill.name}生效，排除一个错误选项。`],
      });
      return;
    }

    if (skill.type === 'heal') {
      setBattle({
        ...battle,
        usedSkill: true,
        playerAura: clamp(battle.playerAura + 24, 0, playerMaxAura),
        log: [...battle.log, '老干部保温杯热气升腾，范哥气势 +24。'],
      });
      return;
    }

    if (skill.type === 'directDamage') {
      const nextBattle = {
        ...battle,
        usedSkill: true,
        npcAura: battle.npcAura - 22,
        log: [...battle.log, '公文包拍桌，对手气势 -22。'],
      };
      setBattle(nextBattle);
      finishIfNeeded(nextBattle);
      return;
    }

    if (skill.type === 'doubleNext') {
      setBattle({
        ...battle,
        usedSkill: true,
        skillMode: 'doubleNext',
        log: [...battle.log, '全员动员开启，接下来答对伤害提升。'],
      });
      return;
    }

    if (skill.type === 'auraCrush') {
      const nextBattle = {
        ...battle,
        usedSkill: true,
        npcAura: battle.npcAura - 30,
        playerAura: clamp(battle.playerAura + 12, 0, playerMaxAura),
        log: [...battle.log, '气场压制展开，对手 -30，范哥 +12。'],
      };
      setBattle(nextBattle);
      finishIfNeeded(nextBattle);
      return;
    }

    setBattle({
      ...battle,
      usedSkill: true,
      skillMode: skill.type,
      log: [...battle.log, `${skill.name}已准备，本题答题效果增强。`],
    });
  }

  return (
    <main className="quiz-duel-page">
      <section className="duel-header">
        <button className="button button--ghost" onClick={onBack}>退出擂台</button>
        <div>
          <p className="eyebrow">一站到底 · 第 {battle.questionIndex + 1} 题</p>
          <h1>范宇轩 VS {npc.name}</h1>
        </div>
      </section>

      <section className="duel-stage">
        <div className="duel-player duel-card">
          <div className="duel-figure duel-figure--player">
            <CartoonCharacter player={player} size="small" />
          </div>
          <h2>范宇轩</h2>
          <p>{player.levelIndex === 0 ? '实习生' : '晋升挑战者'}</p>
          <AuraBar label="范哥气势" value={battle.playerAura} max={playerMaxAura} />
        </div>
        <div className="duel-vs">VS</div>
        <div className="duel-npc duel-card">
          <div className="duel-figure">
            <NpcAvatar npc={npc} size="big" />
          </div>
          <h2>{npc.name}</h2>
          <p>{npc.title}</p>
          <AuraBar label="对手气势" value={battle.npcAura} max={npcMaxAura} />
        </div>
      </section>

      <section className="question-panel">
        <div className="duel-progress-line">
          <span>题目进度 {Math.min(battle.questionIndex + 1, QUESTIONS_PER_DUEL)} / {QUESTIONS_PER_DUEL}</span>
          <span className={timeLeft <= 5 ? 'timer-pill timer-pill--danger' : 'timer-pill'}>倒计时 {timeLeft}s</span>
          <span className="combo-pill">连击 {battle.streak}</span>
        </div>
        <div className="npc-skill-line">
          <strong>{npc.skillName}</strong>
          <span>{npc.skillDesc}</span>
        </div>
        <h2>{question.text}</h2>
        <div className="answer-grid">
          {visibleOptions.map(({ option, index, hidden }) => (
            <button
              key={`${battle.questionIndex}-${option}`}
              className={`answer-card ${feedback?.answer === index ? 'answer-card--right' : ''} ${feedback?.selected === index && !feedback.isCorrect ? 'answer-card--wrong' : ''}`}
              disabled={hidden || Boolean(feedback)}
              onClick={() => answer(index)}
            >
              {hidden ? '已排除' : option}
            </button>
          ))}
        </div>

        {feedback && (
          <div className={`answer-feedback ${feedback.isCorrect ? 'answer-feedback--right' : 'answer-feedback--wrong'}`}>
            <strong>{feedback.isCorrect ? '答对了，气势上涨！' : feedback.timedOut ? '时间到，本题算答错。' : '答错了，先稳一下。'}</strong>
            <div className="damage-pop-row">
              {feedback.isCorrect ? (
                <>
                  <b className="damage-pop damage-pop--hit">对手气势 -{feedback.damage}</b>
                  {feedback.streak >= 3 && <b className="damage-pop damage-pop--combo">{feedback.streak} 连击</b>}
                </>
              ) : (
                <b className="damage-pop damage-pop--hurt">范哥气势 -{Math.max(0, feedback.playerAuraBefore - feedback.playerAuraAfter)}</b>
              )}
            </div>
            <span>{feedback.explanation}</span>
            <button className="button button--primary" onClick={nextQuestion}>继续</button>
          </div>
        )}

        <div className="skill-row">
          <button className="button button--primary" disabled={battle.usedSkill || Boolean(feedback)} onClick={useSkill}>
            使用技能：{skill.name}
          </button>
          <span>{skill.desc}</span>
        </div>
      </section>

      <section className="battle-log">
        {battle.log.slice(-4).map((item, index) => (
          <p key={`${item}-${index}`}>{item}</p>
        ))}
      </section>
    </main>
  );
}
