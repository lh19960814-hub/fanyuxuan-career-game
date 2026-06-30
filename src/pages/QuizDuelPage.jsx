import { useEffect, useMemo, useState } from 'react';
import CartoonCharacter from '../components/CartoonCharacter';
import NpcAvatar from '../components/NpcAvatar';
import officeArenaBg from '../assets/office-arena-bg.png';
import { buildBattleState, getNpcDamageProfile, getQuestion, getQuizSkill, QUIZ_DUEL_QUESTION_COUNT } from '../utils/quizGameLogic';
import { getNpcReactionLine } from '../data/npcReactionLines';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function AuraBar({ label, value, max, flash }) {
  const percent = clamp(Math.round((value / max) * 100), 0, 100);
  return (
    <div className={`aura-wrap ${flash ? 'aura-wrap--flash' : ''}`}>
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

const QUESTIONS_PER_DUEL = QUIZ_DUEL_QUESTION_COUNT;
const QUESTION_TIME_LIMIT = 20;

function getTimerClass(timeLeft) {
  if (timeLeft <= 3) return 'timer-pill timer-pill--danger timer-pill--critical';
  if (timeLeft <= 5) return 'timer-pill timer-pill--danger';
  return 'timer-pill';
}

function getComboMessage(streak) {
  if (streak >= 3) return '范哥开始控场';
  if (streak >= 2) return '范哥状态来了';
  return '';
}

const NPC_SKILL_VISUALS = {
  wrongBonusDamage: {
    tone: 'danger',
    icon: '弹',
    title: '黑粉弹幕',
    text: '答错会额外扣范哥气势。',
  },
  fluffyDistract: {
    tone: 'soft',
    icon: '?',
    title: '毛绒干扰',
    text: '本场更容易出现迷惑选项。',
  },
  shieldAtHalf: {
    tone: 'blue',
    icon: '盾',
    title: '方案返工',
    text: '对手低气势时会获得一次护盾。',
  },
  resetStreak: {
    tone: 'gold',
    icon: '拍',
    title: '韩流节拍',
    text: '答错会打断范哥连击节奏。',
  },
  comboPunish: {
    tone: 'orange',
    icon: '评',
    title: '观战锐评',
    text: '连续答错会追加气势打击。',
  },
  healOnCorrect: {
    tone: 'green',
    icon: '援',
    title: '粉丝声援',
    text: '范哥答对时额外恢复气势。',
  },
  confuse: {
    tone: 'purple',
    icon: '迷',
    title: '变装迷惑',
    text: '选项看起来更会扰乱判断。',
  },
  recoverOnce: {
    tone: 'blue',
    icon: '脉',
    title: '人脉支援',
    text: '对手低气势时会恢复一次。',
  },
  strategyPunish: {
    tone: 'orange',
    icon: '策',
    title: '运营压迫',
    text: '答错策略题时会被额外追击。',
  },
  detail: {
    tone: 'blue',
    icon: '镜',
    title: '镜头审判',
    text: '题目更偏细节，答错会给出辛辣点评。',
  },
  bossPressure: {
    tone: 'danger',
    icon: '山',
    title: '大山压迫',
    text: '答错时承受更重气势伤害。',
  },
  disableSkill: {
    tone: 'purple',
    icon: '锁',
    title: '羁绊封锁',
    text: '首次使用技能会被对手封锁。',
  },
  lastStand: {
    tone: 'green',
    icon: '宝',
    title: '元宝护盾',
    text: '对手首次致命伤会保留气势。',
  },
  finalBoss: {
    tone: 'final',
    icon: '辣',
    title: '柳州终极考核',
    text: '三阶段 Boss，低气势会恢复一次。',
  },
};

function getNpcSkillVisual(skillType, fallbackTitle, fallbackText) {
  return NPC_SKILL_VISUALS[skillType] || {
    tone: 'blue',
    icon: '技',
    title: fallbackTitle,
    text: fallbackText,
  };
}

function createSkillEvent(skillType, text, fallbackTitle, fallbackText) {
  const visual = getNpcSkillVisual(skillType, fallbackTitle, fallbackText);
  return {
    ...visual,
    text: text || visual.text,
  };
}

export default function QuizDuelPage({ player, npc, onBack, onWin, onLose }) {
  const [battle, setBattle] = useState(() => buildBattleState(
    npc,
    player.answeredQuestionTexts,
    player.recentQuestionTextsByNpc?.[npc.id] || [],
  ));
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const skill = getQuizSkill(player);
  const question = getQuestion(npc, battle);
  const playerMaxAura = 100;
  const npcMaxAura = npc.aura;
  const npcSkillVisual = getNpcSkillVisual(npc.skillType, npc.skillName, npc.skillDesc);
  const activeSkillEvent = feedback?.skillEvent || battle.skillEvent;
  const damageProfile = getNpcDamageProfile(npc);

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
      onWin({ ...nextBattle, finishReason: 'npcAuraZero' });
      return true;
    }

    if (nextBattle.playerAura <= 0) {
      onLose({ ...nextBattle, finishReason: 'playerAuraZero' });
      return true;
    }

    if (nextBattle.questionIndex >= QUESTIONS_PER_DUEL) {
      if (nextBattle.playerAura >= nextBattle.npcAura) {
        onWin({ ...nextBattle, finishReason: 'questionsEndedLead' });
      } else {
        onLose({ ...nextBattle, finishReason: 'questionsEndedBehind' });
      }
      return true;
    }

    return false;
  }

  function applyNpcPassive(nextBattle, wasCorrect) {
    const flags = { ...nextBattle.npcFlags };
    let log = [...nextBattle.log];
    let playerAura = nextBattle.playerAura;
    let npcAura = nextBattle.npcAura;
    let skillEvent = null;

    if (!wasCorrect && npc.skillType === 'wrongBonusDamage') {
      playerAura -= 6;
      log.push('李欢发动黑粉弹幕，范哥气势额外 -6。');
      skillEvent = createSkillEvent(npc.skillType, '黑粉弹幕命中，范哥气势额外 -6。', npc.skillName, npc.skillDesc);
    }

    if (wasCorrect && npc.skillType === 'healOnCorrect') {
      playerAura = clamp(playerAura + 6, 0, playerMaxAura);
      log.push('张年杰发动粉丝声援，范哥气势 +6。');
      skillEvent = createSkillEvent(npc.skillType, '粉丝声援生效，范哥气势 +6。', npc.skillName, npc.skillDesc);
    }

    if (!wasCorrect && npc.skillType === 'resetStreak') {
      log.push('任行云发动韩流节拍，范哥连击节奏被打断。');
      skillEvent = createSkillEvent(npc.skillType, '韩流节拍打断连击，重新找回节奏。', npc.skillName, npc.skillDesc);
    }

    if (!wasCorrect && npc.skillType === 'comboPunish' && nextBattle.wrong >= 2) {
      playerAura -= 8;
      log.push('郭鹏强观战锐评：连续失误，范哥气势额外 -8。');
      skillEvent = createSkillEvent(npc.skillType, '观战锐评追击，范哥气势额外 -8。', npc.skillName, npc.skillDesc);
    }

    if (!wasCorrect && npc.skillType === 'strategyPunish') {
      playerAura -= 8;
      log.push('徐超超指出运营问题，范哥气势额外 -8。');
      skillEvent = createSkillEvent(npc.skillType, '运营压迫生效，范哥气势额外 -8。', npc.skillName, npc.skillDesc);
    }

    if (!wasCorrect && npc.skillType === 'detail') {
      log.push('高老师发动镜头审判：这题细节被放大了。');
      skillEvent = createSkillEvent(npc.skillType, '镜头审判触发，细节题被狠狠审了一下。', npc.skillName, npc.skillDesc);
    }

    if (!wasCorrect && npc.skillType === 'bossPressure') {
      playerAura -= 10;
      log.push('高子健的大山压迫生效，范哥气势额外 -10。');
      skillEvent = createSkillEvent(npc.skillType, '大山压迫落下，范哥气势额外 -10。', npc.skillName, npc.skillDesc);
    }

    if (npc.skillType === 'shieldAtHalf' && !flags.shielded && npcAura > 0 && npcAura < npc.aura / 2) {
      flags.shielded = true;
      npcAura += 16;
      log.push('何三江提出方案返工，恢复 16 点气势。');
      skillEvent = createSkillEvent(npc.skillType, '方案返工启动，对手气势 +16。', npc.skillName, npc.skillDesc);
    }

    if (npc.skillType === 'recoverOnce' && !flags.recovered && npcAura > 0 && npcAura < 34) {
      flags.recovered = true;
      npcAura += 18;
      log.push('领队李哥发动人脉支援，恢复 18 点气势。');
      skillEvent = createSkillEvent(npc.skillType, '人脉支援到场，对手气势 +18。', npc.skillName, npc.skillDesc);
    }

    if (npc.skillType === 'lastStand' && !flags.lastStand && npcAura <= 0) {
      flags.lastStand = true;
      npcAura = 22;
      log.push('龚庆林发动元宝护盾，保留 22 点气势。');
      skillEvent = createSkillEvent(npc.skillType, '元宝护盾挡住致命一击，对手保留 22 点气势。', npc.skillName, npc.skillDesc);
    }

    if (npc.skillType === 'finalBoss' && !flags.finalHeal && npcAura > 0 && npcAura < 55) {
      flags.finalHeal = true;
      npcAura += 24;
      log.push('杨淑媛展开柳州终极考核，恢复 24 点气势。');
      skillEvent = createSkillEvent(npc.skillType, '柳州终极考核升温，Boss 气势 +24。', npc.skillName, npc.skillDesc);
    }

    return { ...nextBattle, playerAura, npcAura, npcFlags: flags, log, skillEvent };
  }

  function answer(optionIndex) {
    if (feedback) return;
    const isCorrect = optionIndex === question.answerIndex;
    const bonus = battle.skillMode === 'bonusDamage' ? 8 : 0;
    const doubleBonus = battle.skillMode === 'doubleNext' ? 5 : 0;
    const streak = isCorrect ? battle.streak + 1 : 0;
    const damage = isCorrect ? damageProfile.correctDamage + bonus + doubleBonus : 0;
    const wrongDamage = battle.skillMode === 'shieldWrong' ? 0 : damageProfile.wrongDamage;

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
      lastMistake: isCorrect ? null : 'wrong',
      skillEvent: null,
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
      skillEvent: nextBattle.skillEvent,
      npcReactionLine: getNpcReactionLine(npc.id, isCorrect ? 'wrong' : 'win', isCorrect ? nextBattle.correct : nextBattle.wrong),
    });
    setBattle(nextBattle);
  }

  function handleTimeout() {
    const wrongDamage = battle.skillMode === 'shieldWrong' ? 0 : damageProfile.wrongDamage;
    let nextBattle = {
      ...battle,
      playerAura: battle.playerAura - wrongDamage,
      wrong: battle.wrong + 1,
      streak: 0,
      answeredQuestionTexts: [...battle.answeredQuestionTexts, question.text],
      hiddenOptions: [],
      skillMode: battle.skillMode === 'doubleNext' ? 'doubleNext' : null,
      lastMistake: 'timeout',
      timeoutCount: (battle.timeoutCount || 0) + 1,
      skillEvent: null,
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
      skillEvent: nextBattle.skillEvent,
      npcReactionLine: getNpcReactionLine(npc.id, 'win', nextBattle.wrong),
    });
    setBattle(nextBattle);
  }

  function nextQuestion() {
    const nextBattle = {
      ...battle,
      questionIndex: battle.questionIndex + 1,
      skillEvent: null,
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
        skillEvent: createSkillEvent(npc.skillType, '羁绊封锁生效，范宇轩技能被挡下。', npc.skillName, npc.skillDesc),
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
        npcAura: battle.npcAura - 14,
        log: [...battle.log, '公文包拍桌，对手气势 -14。'],
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
        npcAura: battle.npcAura - 18,
        playerAura: clamp(battle.playerAura + 10, 0, playerMaxAura),
        log: [...battle.log, '气场压制展开，对手 -18，范哥 +10。'],
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

      <section
        className={`duel-arena duel-arena--${npcSkillVisual.tone} ${activeSkillEvent ? 'duel-arena--skill-active' : ''}`}
        style={{ '--duel-arena-bg': `url(${officeArenaBg})` }}
      >
        <div className="duel-arena__hud">
          <AuraBar label="范哥气势" value={battle.playerAura} max={playerMaxAura} flash={feedback?.isCorrect} />
          <span className={getTimerClass(timeLeft)}>倒计时 {timeLeft}s</span>
          <AuraBar label="对手气势" value={battle.npcAura} max={npcMaxAura} flash={feedback && !feedback.isCorrect} />
        </div>

        <div className="duel-stage">
          <div className={`duel-player duel-card ${feedback?.isCorrect ? 'duel-card--player-correct' : ''} ${feedback && !feedback.isCorrect ? 'duel-card--player-wrong' : ''}`}>
            <div className="duel-figure duel-figure--player">
              <CartoonCharacter player={player} size="small" />
            </div>
            <div className="duel-nameplate">
              <span>我方</span>
              <strong>范宇轩</strong>
              <em>{player.levelIndex === 0 ? '实习生' : '晋升挑战者'}</em>
            </div>
          </div>
          <div className="duel-vs">VS</div>
          <div className={`duel-npc duel-card ${feedback?.isCorrect ? 'duel-card--npc-hit' : ''} ${feedback && !feedback.isCorrect ? 'duel-card--npc-power' : ''}`}>
            <div className="duel-figure">
              <NpcAvatar npc={npc} size="scene" />
            </div>
            {feedback?.npcReactionLine && (
              <div className={`npc-reaction-bubble ${feedback.isCorrect ? 'npc-reaction-bubble--wrong' : 'npc-reaction-bubble--win'}`}>
                {feedback.npcReactionLine}
              </div>
            )}
            <div className="duel-nameplate duel-nameplate--npc">
              <span>对手</span>
              <strong>{npc.name}</strong>
              <em>{npc.title}</em>
            </div>
          </div>
        </div>
      </section>

      <section className="question-panel">
        <div className="duel-progress-line duel-progress-line--with-skill">
          <span>题目进度 {Math.min(battle.questionIndex + 1, QUESTIONS_PER_DUEL)} / {QUESTIONS_PER_DUEL}</span>
          <div className="duel-progress-action">
            {feedback && (
              <button className="button button--primary answer-feedback__continue answer-feedback__continue--top" onClick={nextQuestion}>
                继续
              </button>
            )}
          </div>
          <span className="combo-pill">连击 {battle.streak}</span>
        </div>
        <div className={`npc-skill-card npc-skill-card--compact npc-skill-card--${npcSkillVisual.tone}`}>
          <span className="npc-skill-card__icon">{npcSkillVisual.icon}</span>
          <div>
            <strong>{npc.skillName}</strong>
            <span>{npc.skillDesc}</span>
          </div>
        </div>
        {activeSkillEvent && (
          <div className={`skill-burst skill-burst--inline skill-burst--${activeSkillEvent.tone}`}>
            <span>{activeSkillEvent.icon}</span>
            <div>
              <strong>{activeSkillEvent.title}</strong>
              <p>{activeSkillEvent.text}</p>
            </div>
          </div>
        )}
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
            <div className="answer-feedback__top">
              <strong>{feedback.isCorrect ? '范哥开始发力！' : feedback.timedOut ? '时间到，范哥急了！' : '范哥急了！'}</strong>
            </div>
            <div className="damage-pop-row">
              {feedback.isCorrect ? (
                <>
                  <b className="damage-pop damage-pop--hit">对手气势 -{feedback.damage}</b>
                  {getComboMessage(feedback.streak) && (
                    <b className="damage-pop damage-pop--combo">{getComboMessage(feedback.streak)}</b>
                  )}
                </>
              ) : (
                <b className="damage-pop damage-pop--hurt">范哥气势 -{Math.max(0, feedback.playerAuraBefore - feedback.playerAuraAfter)}</b>
              )}
            </div>
            <span>{feedback.explanation}</span>
          </div>
        )}

        {!feedback && (
          <div className="skill-row">
            <button className="button button--primary" disabled={battle.usedSkill || Boolean(feedback)} onClick={useSkill}>
              使用技能：{skill.name}
            </button>
            <span>{skill.desc}</span>
          </div>
        )}
      </section>

      <section className="battle-log">
        {battle.log.slice(-4).map((item, index) => (
          <p key={`${item}-${index}`}>{item}</p>
        ))}
      </section>
    </main>
  );
}
