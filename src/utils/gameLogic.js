import { titles } from '../data/titles';
import { npcs } from '../data/npcs';
import { gameTypes } from '../data/gameTypes';

export function createInitialPlayer() {
  return {
    name: '范宇轩',
    levelIndex: 0,
    exp: 0,
    equipments: [],
    buffs: [],
    winCount: 0,
    loseCount: 0,
    currentStage: 1,
    currentNpcIndex: 0,
    completedBuffCount: 0,
    isCompleted: false,
  };
}

export function getCurrentTitle(player) {
  return titles[player.levelIndex] || titles[0];
}

export function getNextTitle(player) {
  return titles[player.levelIndex + 1] || null;
}

export function getCurrentNpc(player) {
  const index = Math.min(player.currentNpcIndex, npcs.length - 1);
  return npcs[index];
}

export function getExpProgress(player) {
  const current = getCurrentTitle(player);
  const next = getNextTitle(player);

  if (!next) {
    return 100;
  }

  const span = next.requiredExp - current.requiredExp;
  const gained = player.exp - current.requiredExp;
  return Math.max(0, Math.min(100, Math.round((gained / span) * 100)));
}

export function chooseGameType(npc) {
  const preferred = npc.preferredGameType;
  const randomGame = gameTypes[Math.floor(Math.random() * gameTypes.length)];

  if (preferred === 'random') {
    return randomGame.type;
  }

  // NPC 有较高概率进入自己擅长的小游戏，但仍保留随机感。
  return Math.random() < 0.65 ? preferred : randomGame.type;
}

export function applyLevelUp(player) {
  let nextLevelIndex = player.levelIndex;
  const levelUps = [];

  while (
    nextLevelIndex < titles.length - 1 &&
    player.exp >= titles[nextLevelIndex + 1].requiredExp
  ) {
    const from = titles[nextLevelIndex].name;
    nextLevelIndex += 1;
    const to = titles[nextLevelIndex].name;
    levelUps.push({ from, to });
  }

  const nextTitle = titles[nextLevelIndex];

  return {
    ...player,
    levelIndex: nextLevelIndex,
    currentStage: nextTitle.appearanceStage,
    isCompleted: nextTitle.name === '厅级干部',
    currentNpcIndex: Math.min(player.currentNpcIndex + levelUps.length, npcs.length - 1),
    levelUps,
  };
}

export function consumeBuffs(player) {
  return {
    ...player,
    buffs: player.buffs
      .map((buff) => ({ ...buff, duration: buff.duration - 1 }))
      .filter((buff) => buff.duration > 0),
  };
}

export function hasBuff(player, effectType) {
  return player.buffs.some((buff) => buff.effectType === effectType);
}

export function getBuffValue(player, effectType) {
  return player.buffs
    .filter((buff) => buff.effectType === effectType)
    .reduce((sum, buff) => sum + buff.effectValue, 0);
}
