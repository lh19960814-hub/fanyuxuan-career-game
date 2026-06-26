import { titles } from '../data/titles';
import { equipments } from '../data/equipments';
import { publicQuestions } from '../data/publicQuestions';
import { quizNpcs } from '../data/quizNpcs';
import { quizSkills } from '../data/quizSkills';

const QUIZ_VERSION = 'quiz-v1';
const RANK_WIN_STEPS = [0, 1, 3, 5, 7, 9, 11, 12, 13];
const DUEL_QUESTION_COUNT = 6;
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
    cadreExp: 0,
    isCompleted: false,
  };
}

export function migrateQuizPlayer(saved) {
  if (!saved || saved.version !== QUIZ_VERSION) {
    return createInitialQuizPlayer();
  }

  return {
    ...createInitialQuizPlayer(),
    ...saved,
    version: QUIZ_VERSION,
  };
}

export function getCurrentRank(player) {
  return titles[player.levelIndex] || titles[0];
}

export function getQuizSkill(player) {
  return quizSkills[Math.min(player.levelIndex, quizSkills.length - 1)];
}

export function getAvailableNpcs(player) {
  return quizNpcs.map((npc, index) => ({
    ...npc,
    index,
    unlocked: index <= player.currentNpcIndex || player.defeatedNpcs.includes(npc.id),
    defeated: player.defeatedNpcs.includes(npc.id),
    current: index === player.currentNpcIndex && !player.defeatedNpcs.includes(npc.id),
  }));
}

export function getCurrentQuizNpc(player) {
  return quizNpcs[Math.min(player.currentNpcIndex, quizNpcs.length - 1)];
}

export function buildBattleState(npc, answeredQuestionTexts = []) {
  return {
    playerAura: 100,
    npcAura: npc.aura,
    questionIndex: 0,
    questionDeck: createBattleQuestionDeck(npc, answeredQuestionTexts),
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

export function getQuestion(npc, battle) {
  return battle.questionDeck?.[battle.questionIndex] || battle.questionDeck?.[0] || npc.questions[0];
}

function createBattleQuestionDeck(npc, answeredQuestionTexts) {
  const answeredSet = new Set(answeredQuestionTexts);
  const freshNpcQuestions = uniqueQuestions(npc.questions).filter((question) => !answeredSet.has(question.text));
  const npcSource = freshNpcQuestions.length >= NPC_EXCLUSIVE_COUNT ? freshNpcQuestions : uniqueQuestions(npc.questions);
  const npcQuestions = shuffleQuestions(npcSource).slice(0, NPC_EXCLUSIVE_COUNT);
  const usedTexts = new Set(npcQuestions.map((question) => question.text));
  const freshPublicQuestions = uniqueQuestions(publicQuestions).filter((question) => !answeredSet.has(question.text));
  const publicSource = freshPublicQuestions.length >= DUEL_QUESTION_COUNT - npcQuestions.length
    ? freshPublicQuestions
    : uniqueQuestions(publicQuestions);
  const publicDeck = shuffleQuestions(publicSource)
    .filter((question) => !usedTexts.has(question.text))
    .slice(0, DUEL_QUESTION_COUNT - npcQuestions.length);

  return shuffleQuestions([...npcQuestions, ...publicDeck])
    .slice(0, DUEL_QUESTION_COUNT)
    .map(shuffleQuestionOptions);
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

  const nextNpcIndex = Math.min(player.currentNpcIndex + 1, quizNpcs.length - 1);
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

export function settleQuizFailure(player, battle) {
  return {
    ...player,
    loseCount: player.loseCount + 1,
    cadreExp: player.cadreExp + 8,
    totalCorrect: player.totalCorrect + battle.correct,
    totalWrong: player.totalWrong + battle.wrong,
    bestStreak: Math.max(player.bestStreak || 0, battle.bestStreak),
    answeredQuestionTexts: mergeAnsweredQuestions(player, battle),
  };
}

export function getNpcSkillNote(npc) {
  return `${npc.skillName}：${npc.skillDesc}`;
}
