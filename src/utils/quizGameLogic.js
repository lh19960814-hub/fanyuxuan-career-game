import { titles } from '../data/titles';
import { equipments } from '../data/equipments';
import { publicQuestions } from '../data/publicQuestions';
import { quizNpcs } from '../data/quizNpcs';
import { quizSkills } from '../data/quizSkills';

const QUIZ_VERSION = 'quiz-v1';
const RANK_WIN_STEPS = [0, 1, 3, 5, 7, 9, 11, 12, 13];
export const QUIZ_DUEL_QUESTION_COUNT = 12;
const DUEL_QUESTION_COUNT = QUIZ_DUEL_QUESTION_COUNT;
const NPC_EXCLUSIVE_COUNT = 3;

export function createInitialQuizPlayer() {
  return {
    version: QUIZ_VERSION,
    name: '范宇轩',
    levelIndex: 0,
    exp: 0,
    equipments: [],
    buffs: [],
    winCount: 0,
    loseCount: 0,
    currentStage: 1,
    currentNpcIndex: 0,
    defeatedNpcs: [],
    completedBuffCount: 0,
    totalCorrect: 0,
    totalWrong: 0,
    bestStreak: 0,
    answeredQuestionTexts: [],
    recentQuestionTextsByNpc: {},
    cadreExp: 0,
    isCompleted: false,
  };
}

export function migrateQuizPlayer(saved) {
  if (!saved || saved.version !== QUIZ_VERSION) {
    return createInitialQuizPlayer();
  }

  return repairQuizPlayer({
    ...createInitialQuizPlayer(),
    ...saved,
    version: QUIZ_VERSION,
  });
}

export function repairQuizPlayer(player) {
  const defeatedSet = new Set(player.defeatedNpcs || []);
  const firstUndefeatedIndex = quizNpcs.findIndex((npc) => !defeatedSet.has(npc.id));
  const repairedNpcIndex = firstUndefeatedIndex === -1 ? quizNpcs.length - 1 : firstUndefeatedIndex;
  const repairedWinCount = Math.max(player.winCount || 0, defeatedSet.size);
  const repairedLevelIndex = player.isCompleted
    ? titles.length - 1
    : Math.max(player.levelIndex || 0, getRankIndexByWins(repairedWinCount));

  return {
    ...player,
    currentNpcIndex: repairedNpcIndex,
    winCount: repairedWinCount,
    levelIndex: repairedLevelIndex,
    currentStage: titles[repairedLevelIndex]?.appearanceStage || 1,
    recentQuestionTextsByNpc: player.recentQuestionTextsByNpc || {},
    isCompleted: player.isCompleted || defeatedSet.has('yang-shuyuan'),
  };
}

export function getCurrentRank(player) {
  return titles[player.levelIndex] || titles[0];
}

export function getQuizSkill(player) {
  return quizSkills[Math.min(player.levelIndex, quizSkills.length - 1)];
}

export function getAvailableNpcs(player) {
  const defeatedSet = new Set(player.defeatedNpcs || []);
  const firstUndefeatedIndex = quizNpcs.findIndex((npc) => !defeatedSet.has(npc.id));
  const currentIndex = firstUndefeatedIndex === -1 ? quizNpcs.length - 1 : firstUndefeatedIndex;

  return quizNpcs.map((npc, index) => ({
    ...npc,
    index,
    unlocked: index <= currentIndex || defeatedSet.has(npc.id),
    defeated: defeatedSet.has(npc.id),
    current: index === currentIndex && !defeatedSet.has(npc.id),
  }));
}

export function getCurrentQuizNpc(player) {
  const available = getAvailableNpcs(player);
  return available.find((npc) => npc.current) || quizNpcs[Math.min(player.currentNpcIndex, quizNpcs.length - 1)];
}

export function buildBattleState(npc, answeredQuestionTexts = [], recentQuestionTexts = []) {
  return {
    playerAura: 100,
    npcAura: npc.aura,
    questionIndex: 0,
    questionDeck: createBattleQuestionDeck(npc, answeredQuestionTexts, recentQuestionTexts),
    answeredQuestionTexts: [],
    correct: 0,
    wrong: 0,
    streak: 0,
    bestStreak: 0,
    hiddenOptions: [],
    usedSkill: false,
    skillMode: null,
    npcFlags: {},
    log: [`${npc.name}登上擂台：${npc.dialogue}`],
    status: 'playing',
  };
}

export function getNpcDamageProfile(npc) {
  const npcIndex = typeof npc.index === 'number'
    ? npc.index
    : Math.max(0, quizNpcs.findIndex((item) => item.id === npc.id));

  return {
    correctDamage: Math.max(8, 16 - Math.floor(npcIndex * 0.6)),
    wrongDamage: 8 + Math.ceil((npc.difficulty || 1) * 1.2),
  };
}

export function getQuestion(npc, battle) {
  return battle.questionDeck?.[battle.questionIndex] || battle.questionDeck?.[0] || npc.questions[0];
}

function createBattleQuestionDeck(npc, answeredQuestionTexts, recentQuestionTexts) {
  const answeredSet = new Set(answeredQuestionTexts);
  const recentSet = new Set(recentQuestionTexts);
  const npcSource = getPreferredQuestionSource(uniqueQuestions(npc.questions), NPC_EXCLUSIVE_COUNT, answeredSet, recentSet);
  const npcQuestions = shuffleQuestions(npcSource).slice(0, NPC_EXCLUSIVE_COUNT);
  const usedTexts = new Set(npcQuestions.map((question) => question.text));
  const publicSource = getPreferredQuestionSource(
    uniqueQuestions(publicQuestions).filter((question) => !usedTexts.has(question.text)),
    DUEL_QUESTION_COUNT - npcQuestions.length,
    answeredSet,
    recentSet,
  );
  const publicDeck = shuffleQuestions(publicSource)
    .filter((question) => !usedTexts.has(question.text))
    .slice(0, DUEL_QUESTION_COUNT - npcQuestions.length);

  return shuffleQuestions([...npcQuestions, ...publicDeck])
    .slice(0, DUEL_QUESTION_COUNT)
    .map(shuffleQuestionOptions);
}

function getPreferredQuestionSource(questions, requiredCount, answeredSet, recentSet) {
  const freshQuestions = questions.filter((question) => (
    !answeredSet.has(question.text) && !recentSet.has(question.text)
  ));
  if (freshQuestions.length >= requiredCount) return freshQuestions;

  const notRecentQuestions = questions.filter((question) => !recentSet.has(question.text));
  if (notRecentQuestions.length >= requiredCount) return notRecentQuestions;

  return notRecentQuestions.length ? notRecentQuestions : questions;
}

function uniqueQuestions(questions) {
  const seen = new Set();

  return questions.filter((question) => {
    if (seen.has(question.text)) return false;
    seen.add(question.text);
    return true;
  });
}

function shuffleQuestions(questions) {
  const result = [...questions];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

function shuffleQuestionOptions(question) {
  const correctOption = question.options[question.answerIndex];
  const shuffledOptions = shuffleQuestions(question.options);

  return {
    ...question,
    options: shuffledOptions,
    answerIndex: shuffledOptions.indexOf(correctOption),
  };
}

function mergeAnsweredQuestions(player, battle) {
  const answeredSet = new Set(player.answeredQuestionTexts || []);
  (battle.answeredQuestionTexts || []).forEach((text) => answeredSet.add(text));

  return [...answeredSet];
}

export function getRankIndexByWins(wins) {
  let index = 0;
  RANK_WIN_STEPS.forEach((required, rankIndex) => {
    if (wins >= required) index = rankIndex;
  });
  return Math.min(index, titles.length - 1);
}

function addUniqueEquipment(player, npcIndex) {
  const owned = new Set(player.equipments);
  const pool = equipments.filter((item) => !owned.has(item.id));
  if (!pool.length) return null;
  if ((npcIndex + player.winCount) % 3 !== 0) return null;
  return pool[(npcIndex + player.levelIndex) % pool.length];
}

export function settleQuizVictory(player, npc, battle) {
  const defeatedNpcs = player.defeatedNpcs.includes(npc.id)
    ? player.defeatedNpcs
    : [...player.defeatedNpcs, npc.id];

  const defeatedSet = new Set(defeatedNpcs);
  const firstUndefeatedIndex = quizNpcs.findIndex((item) => !defeatedSet.has(item.id));
  const nextNpcIndex = firstUndefeatedIndex === -1 ? quizNpcs.length - 1 : firstUndefeatedIndex;
  const winCount = player.winCount + 1;
  const nextLevelIndex = npc.id === 'yang-shuyuan'
    ? titles.length - 1
    : getRankIndexByWins(winCount);
  const rewardExp = 60 + npc.difficulty * 18 + battle.correct * 6;
  const rewardCadreExp = 18 + npc.difficulty * 8 + battle.bestStreak * 2;
  const equipment = addUniqueEquipment(player, player.currentNpcIndex);
  const isCompleted = npc.id === 'yang-shuyuan' || nextLevelIndex >= titles.length - 1;
  const levelUps = nextLevelIndex > player.levelIndex
    ? [{ from: titles[player.levelIndex].name, to: titles[nextLevelIndex].name }]
    : [];
  const recentQuestionTextsByNpc = { ...(player.recentQuestionTextsByNpc || {}) };
  delete recentQuestionTextsByNpc[npc.id];

  return {
    player: {
      ...player,
      winCount,
      exp: player.exp + rewardExp,
      cadreExp: player.cadreExp + rewardCadreExp,
      levelIndex: nextLevelIndex,
      currentStage: titles[nextLevelIndex].appearanceStage,
      currentNpcIndex: nextNpcIndex,
      defeatedNpcs,
      totalCorrect: player.totalCorrect + battle.correct,
      totalWrong: player.totalWrong + battle.wrong,
      bestStreak: Math.max(player.bestStreak || 0, battle.bestStreak),
      answeredQuestionTexts: mergeAnsweredQuestions(player, battle),
      recentQuestionTextsByNpc,
      equipments: equipment ? [...player.equipments, equipment.id] : player.equipments,
      isCompleted,
    },
    reward: {
      exp: rewardExp,
      cadreExp: rewardCadreExp,
      equipment,
      levelUps,
      defeatedNpc: npc.name,
      isCompleted,
    },
  };
}

export function settleQuizFailure(player, npc, battle) {
  const recentQuestionTextsByNpc = {
    ...(player.recentQuestionTextsByNpc || {}),
    [npc.id]: [...new Set(battle.answeredQuestionTexts || [])],
  };

  return {
    ...player,
    loseCount: player.loseCount + 1,
    cadreExp: player.cadreExp + 8,
    totalCorrect: player.totalCorrect + battle.correct,
    totalWrong: player.totalWrong + battle.wrong,
    bestStreak: Math.max(player.bestStreak || 0, battle.bestStreak),
    answeredQuestionTexts: mergeAnsweredQuestions(player, battle),
    recentQuestionTextsByNpc,
  };
}

export function getFailureReason(battle) {
  if (battle.finishReason === 'playerAuraZero') {
    if (battle.lastMistake === 'timeout') {
      return '倒计时归零导致范哥气势见底，本题判错后没能撑住擂台。';
    }

    return '范哥气势被扣到 0，对手暂时守住了擂台。';
  }

  if (battle.finishReason === 'questionsEndedBehind') {
    return `${QUIZ_DUEL_QUESTION_COUNT} 道题全部答完后，范哥剩余气势低于对手，所以本轮惜败。`;
  }

  if (battle.finishReason === 'skillBackfire') {
    return '技能没有形成击杀，对手的气势仍然占优。';
  }

  return '本轮答题节奏略乱，范哥需要整理错题本再冲一次。';
}

export function getNpcSkillNote(npc) {
  return `${npc.skillName}：${npc.skillDesc}`;
}
