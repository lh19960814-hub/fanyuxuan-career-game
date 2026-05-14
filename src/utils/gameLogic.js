import { titles } from '../data/titles';
import { npcs } from '../data/npcs';
import { gameTypes } from '../data/gameTypes';
import { officeEvents, restEvents } from '../data/events';
import { endings } from '../data/endings';

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
    round: 1,
    maxRounds: 14,
    pressure: 18,
    reputation: 0,
    paperwork: 0,
    social: 0,
    luck: 0,
    gossip: 12,
    familyApproval: 0,
    routeOptions: [],
    defeatedNpcs: [],
    storyFlags: [],
    ending: null,
    isCompleted: false,
  };
}

export function migratePlayerSave(saved) {
  return {
    ...createInitialPlayer(),
    ...saved,
    routeOptions: [],
    ending: saved?.ending || null,
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

export function clampStats(player) {
  return {
    ...player,
    pressure: Math.max(0, Math.min(100, player.pressure ?? 0)),
    reputation: Math.max(-20, Math.min(80, player.reputation ?? 0)),
    paperwork: Math.max(0, Math.min(80, player.paperwork ?? 0)),
    social: Math.max(-20, Math.min(80, player.social ?? 0)),
    luck: Math.max(0, Math.min(80, player.luck ?? 0)),
    gossip: Math.max(0, Math.min(100, player.gossip ?? 0)),
    familyApproval: Math.max(-20, Math.min(80, player.familyApproval ?? 0)),
  };
}

export function applyStatEffect(player, effect = {}) {
  return clampStats({
    ...player,
    exp: player.exp + (effect.exp || 0),
    pressure: player.pressure + (effect.pressure || 0),
    reputation: player.reputation + (effect.reputation || 0),
    paperwork: player.paperwork + (effect.paperwork || 0),
    social: player.social + (effect.social || 0),
    luck: player.luck + (effect.luck || 0),
    gossip: player.gossip + (effect.gossip || 0),
    familyApproval: player.familyApproval + (effect.familyApproval || 0),
  });
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function getNextNpc(player, offset = 0) {
  const bossRound = player.round >= player.maxRounds - 1;
  if (bossRound) {
    return npcs.find((npc) => npc.id === 'yang-shuyuan');
  }

  const available = npcs.filter((npc) => !npc.boss);
  const index = (player.currentNpcIndex + offset + player.round) % available.length;
  return available[index];
}

export function generateRouteOptions(player) {
  const battleNpc = getNextNpc(player, 0);
  const secondNpc = getNextNpc(player, 3);
  const event = pickRandom(officeEvents);
  const rest = pickRandom(restEvents);
  const isBossRound = player.round >= player.maxRounds - 1 || player.levelIndex >= 7;

  if (isBossRound) {
    const boss = npcs.find((npc) => npc.id === 'yang-shuyuan');
    return [
      {
        id: `boss-${player.round}`,
        type: 'battle',
        title: '终极 Boss',
        desc: '螺蛳粉气场展开，最终考核开始。',
        npc: boss,
        risk: '高压',
      },
      {
        id: `event-${event.id}-${player.round}`,
        type: 'event',
        title: event.title,
        desc: event.desc,
        event,
        risk: '剧情',
      },
      {
        id: `rest-${rest.id}-${player.round}`,
        type: 'event',
        title: rest.title,
        desc: rest.desc,
        event: rest,
        risk: '休整',
      },
    ];
  }

  return [
    {
      id: `battle-${battleNpc.id}-${player.round}`,
      type: 'battle',
      title: `挑战 ${battleNpc.name}`,
      desc: battleNpc.desc,
      npc: battleNpc,
      risk: `难度 ${battleNpc.difficulty}`,
    },
    {
      id: `event-${event.id}-${player.round}`,
      type: 'event',
      title: event.title,
      desc: event.desc,
      event,
      risk: '剧情',
    },
    {
      id: `battle-${secondNpc.id}-${player.round}`,
      type: 'battle',
      title: `绕路挑战 ${secondNpc.name}`,
      desc: secondNpc.desc,
      npc: secondNpc,
      risk: `难度 ${secondNpc.difficulty}`,
    },
  ];
}

export function ensureRouteOptions(player) {
  if (player.routeOptions?.length) return player;
  return {
    ...player,
    routeOptions: generateRouteOptions(player),
  };
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

  const withLevel = {
    ...player,
    levelIndex: nextLevelIndex,
    currentStage: nextTitle.appearanceStage,
    currentNpcIndex: Math.min(player.currentNpcIndex + levelUps.length, npcs.length - 1),
    levelUps,
  };

  return evaluateEnding(withLevel);
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

export function advanceRound(player) {
  return evaluateEnding({
    ...player,
    round: player.round + 1,
    routeOptions: [],
  });
}

export function evaluateEnding(player) {
  let endingId = null;

  if (player.pressure >= 100) endingId = 'pressure-break';
  else if (player.levelIndex >= titles.length - 1 && player.familyApproval >= 18) endingId = 'snail-approved';
  else if (player.levelIndex >= titles.length - 1 && player.gossip <= 4) endingId = 'anti-gossip';
  else if (player.levelIndex >= titles.length - 1) endingId = 'department-leader';
  else if (player.paperwork >= 32 && player.round >= player.maxRounds) endingId = 'paperwork-god';
  else if (player.social + player.reputation >= 42 && player.round >= player.maxRounds) endingId = 'team-favorite';
  else if (player.gossip >= 85 && player.round >= player.maxRounds) endingId = 'tft-broken';
  else if (player.round > player.maxRounds) endingId = 'stable-life';

  if (!endingId) {
    return { ...player, isCompleted: false, ending: null };
  }

  return {
    ...player,
    isCompleted: true,
    ending: endings.find((ending) => ending.id === endingId),
  };
}
