// ============== 人格卡（16 张·抽卡用） ==============
const CARDS = [
  { id: 1, name: '卷王型', gold: 1500, selfMockery: '我卷我自己,今天又被自己卷到了', image: './cards-front/01-卷王型.png' },
  { id: 2, name: '佛系型', gold: 300, selfMockery: '能拖就拖,拖不动就躺', image: './cards-front/02-佛系型.png' },
  { id: 3, name: 'PPT 美学派', gold: 600, selfMockery: '导师的审美全靠我 PPT 撑着', image: './cards-front/03-PPT美学派.png' },
  { id: 4, name: '文献考古学家', gold: 700, selfMockery: '我引的文献比我都老', image: './cards-front/04-文献考古学家.png' },
  { id: 5, name: '组会汇报演技派', gold: 900, selfMockery: '组会汇报 80%是演技,20%是数据', image: './cards-front/05-组会汇报演技派.png' },
  { id: 6, name: '图书馆气氛组', gold: 500, selfMockery: '我以为我是去学习的,其实是去摆 pose 的', image: './cards-front/06-图书馆气氛组.png' },
  { id: 7, name: '凌晨四点还在调问卷', gold: 700, selfMockery: '凌晨四点的科研楼,灯火通明的是我', image: './cards-front/07-凌晨四点还在调问卷.png' },
  { id: 8, name: '数据焦虑晚期', gold: 800, selfMockery: 'p<0.05 之前,我没睡过一个好觉', image: './cards-front/08-数据焦虑晚期.png' },
  { id: 9, name: '被试招募困难户', gold: 600, selfMockery: '感谢七大姑八大姨帮我填问卷', image: './cards-front/09-被试招募困难户.png' },
  { id: 10, name: 'DDL 战士', gold: 600, selfMockery: 'DDL 是第一生产力', image: './cards-front/10-DDL战士.png' },
  { id: 11, name: '零食补给站', gold: 500, selfMockery: '我的工位零食养活整个教研室', image: './cards-front/11-零食补给站.png' },
  { id: 12, name: '设备氪金党', gold: 800, selfMockery: '设备比我的论文贵多了', image: './cards-front/12-设备氪金党.png' },
  { id: 13, name: '咖啡因成瘾者', gold: 500, selfMockery: '今天又是靠咖啡续命的一天', image: './cards-front/13-咖啡因成瘾者.png' },
  { id: 14, name: '选题困难户', gold: 900, selfMockery: '选题改到第八版\n开题还是没写', image: './cards-front/14-选题困难户.png' },
  { id: 15, name: '答辩PTSD', gold: 1000, selfMockery: '梦里评委还在追问\'请再讲一下你的创新点\'', image: './cards-front/15-答辩PTSD.png' },
  { id: 16, name: '实验翻车型', gold: 800, selfMockery: '我做的不是实验，是大型行为艺术', image: './cards-front/16-实验翻车型.png' },
];

// ============== 拍品（12 张） ==============
// 编号按你 6/14 02:01 拍板的轮次表
// 默认 maxUses=10, A6=1次
const AUCTION_ITEMS = [
  // ====== 10 张主拍品 (按轮次顺序) ======
  { id: 'A1', type: 'skill', name: '我穷我有理', startPrice: 100, maxUses: 10, usesLeft: 10,
    effect: '选一个目标,比目标穷则 +50/对方 -50; 否则 -20/对方 +20',
    useParams: ['target'],
    owner: null, status: 'available',
    front: './skill-cards/A1-front.png', back: './skill-cards/A1-back.png', comic: './skill-cards/A1-comic.png' },
  { id: 'A2', type: 'skill', name: '沉默是金 v2.0', startPrice: 150, maxUses: 10, usesLeft: 10,
    effect: '本轮不叫价,成交时若真没叫价,获成交价 10% 奖励',
    useParams: [],
    owner: null, status: 'available',
    front: './skill-cards/A2-front.png', back: './skill-cards/A2-back.png', comic: './skill-cards/A2-comic.png' },
  { id: 'A3', type: 'skill', name: '护身符', startPrice: 200, maxUses: 10, usesLeft: 10,
    effect: '指定1个靠山(-30/+30),本轮成交时若为本人,实付90%成交价,靠山扣10%', useParams: ['target'],
    owner: null, status: 'available',
    front: './skill-cards/A3-front.png', back: './skill-cards/A3-back.png', comic: './skill-cards/A3-comic.png' },
  { id: 'A4', type: 'skill', name: '导师答疑券', startPrice: 200, maxUses: 10, usesLeft: 10,
    effect: '拥有者拍到时,主持人可判定点评,点评则成交价 -10% 退回', useParams: [],
    owner: null, status: 'available',
    front: './skill-cards/A4-front.png', back: './skill-cards/A4-back.png', comic: './skill-cards/A4-comic.png' },
  { id: 'B1', type: 'social', name: '我真的很不错', startPrice: 350, maxUses: 1, usesLeft: 1,
    effect: '恭喜【拥有者】拍到《我真的很不错》展品，请【拥有者】现在享受你的「权益」（当场执行）：要求全场夸你', owner: null, status: 'available',
    front: './skill-cards/B1-front.png', back: './skill-cards/B1-back.png', comic: './skill-cards/B1-comic.png' },
  { id: 'A5', type: 'skill', name: '选牌官', startPrice: 250, maxUses: 1, usesLeft: 1,
    effect: '打开私密选卡链接,从未拍出的主拍品中指定 1 张作为下一轮开锤拍品 (中控确认后生效, 一次性)',
    useParams: ['itemId'],
    owner: null, status: 'available',
    front: './skill-cards/A5-front.png', back: './skill-cards/A5-back.png', comic: './skill-cards/A5-comic.png' },
  { id: 'B2', type: 'social', name: '话题制造者', startPrice: 300, maxUses: 1, usesLeft: 1,
    effect: '恭喜【拥有者】拍到《话题制造者》展品，请【拥有者】现在享受你的「权益」（当场执行）：指定话题 + 指定玩家回答', owner: null, status: 'available',
    front: './skill-cards/B2-front.png', back: './skill-cards/B2-back.png', comic: './skill-cards/B2-comic.png' },
  { id: 'B3', type: 'social', name: '导师:没有你我可怎么办', startPrice: 400, maxUses: 1, usesLeft: 1,
    effect: '恭喜【拥有者】拍到《导师:没有你我可怎么办》展品，请【拥有者】现在享受你的「权益」（当场执行）：让导师/玩家讲 1 句话', owner: null, status: 'available',
    front: './skill-cards/B3-front.png', back: './skill-cards/B3-back.png', comic: './skill-cards/B3-comic.png' },
  { id: 'B4', type: 'social', name: '我这人超 e 的', startPrice: 400, maxUses: 1, usesLeft: 1,
    effect: '恭喜【拥有者】拍到《我这人超 e 的》展品，请【拥有者】现在享受你的「权益」（当场执行）：邀请 5 人做第一印象陈述', owner: null, status: 'available',
    front: './skill-cards/B4-front.png', back: './skill-cards/B4-back.png', comic: './skill-cards/B4-comic.png' },
  { id: 'B5', type: 'social', name: '研三:我亲爱的学弟学妹们', startPrice: 350, maxUses: 1, usesLeft: 1,
    effect: '恭喜【拥有者】拍到《研三:我亲爱的学弟学妹们》展品，请【拥有者】现在享受你的「权益」（当场执行）：邀请 1 位玩家合影', owner: null, status: 'available',
    front: './skill-cards/B5-front.png', back: './skill-cards/B5-back.png', comic: './skill-cards/B5-comic.png' },
  // ====== 2 张备用 ======
  { id: 'A6', type: 'skill', name: '拓扑效应', startPrice: 300, maxUses: 1, usesLeft: 1,
    effect: '备用卡 · 本次未启用', owner: null, status: 'available',
    front: './skill-cards/A6-front.png', back: './skill-cards/A6-back.png', comic: './skill-cards/A6-comic.png' },
  { id: 'B6', type: 'social', name: '催眠大师', startPrice: 500, maxUses: 1, usesLeft: 1,
    effect: '备用卡 · 本次未启用', owner: null, status: 'available',
    front: './skill-cards/B6-front.png', back: './skill-cards/B6-back.png', comic: './skill-cards/B6-comic.png' },
];

// 拍品顺序（上架顺序，按表里的 10 张）
const AUCTION_ORDER = ['A1','A2','A3','A4','B1','A5','B2','B3','B4','B5'];
const RESERVE_ITEMS = ['A6','B6'];

const CARD_BACK = './cards-back/card-back.png';
const STORAGE_KEY = 'card-game-state-v3';
const INIT_GOLD = 1000; // 玩家注册 (输入名字) 即得 1000 起始资金, 抽卡时再叠加人格卡金币值

// ============== State ==============
function defaultState() {
  return {
    players: [],
    cardPool: CARDS.map(c => c.id),
    currentDraw: null,
    items: AUCTION_ITEMS.map(i => ({...i})),
    currentItem: null,
    log: [],
    phase: 'draw',
    silentPlayers: [], // A2 沉默是金·启用本轮不叫价的玩家名单
    a3Chains: {}, // A3 护身符·本轮键值对: { 拥有者名字: 靠山名字 }
    a4Owner: '', // A4 导师答疑券·拥有者名字 (固定, 整场不变)
    a4Active: false, // A4 本轮是否已激活 (使用技能卡后为 true, 成交后清空)
    pendingSale: null, // 等待 A2 判定的成交记录 { itemId, winner, price, silentPlayer }
    pendingA4Review: null, // 等待主持人判定 A4 是否点评: { itemId, winner, price, discount }
    pendingNextItem: null, // A5 选牌官: 等待中控确认 { itemId, selectedBy, at }
    a5Used: false, // A5 是否已用 (一次性)
  };
}

function getState() {
  // 房间模式下：localStorage 是兜底缓存（D1 是 source of truth）
  // 但 getState 是同步 API，所以这里直接返回本地缓存；
  // subscribeRoom 每 2 秒从 D1 拉真值并触发 React 刷新。
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultState();
  try { return JSON.parse(raw); } catch { return defaultState(); }
}

function setState(state) {
  // 房间模式：写 D1（不写 localStorage，避免本地与远端错乱）
  if (typeof getRoomId === 'function' && getRoomId()) {
    // 异步写 D1；不阻塞原同步调用
    if (typeof setRoomState === 'function') {
      setRoomState(state).then(ok => {
        if (ok) window.dispatchEvent(new Event('card-game-update'));
      });
    }
    // 同时保留本地一份（兜底 + 让 useTick 立刻拿到新值）
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('card-game-update'));
    return;
  }
  // 单机模式：原行为
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event('card-game-update'));
}

function subscribe(callback) {
  const handler = () => callback();
  window.addEventListener('card-game-update', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('card-game-update', handler);
    window.removeEventListener('storage', handler);
  };
}

function resetGame() {
  setState(defaultState());
}

// ============== 跨设备同步（D1 房间模式） ==============
// 房间号从 URL ?room=xxx 读，fallback 到 localStorage
const ROOM_STORAGE_KEY = 'card-game-room';

function getRoomId() {
  try {
    const params = new URLSearchParams(location.search);
    const fromUrl = params.get('room');
    if (fromUrl) {
      localStorage.setItem(ROOM_STORAGE_KEY, fromUrl);
      return fromUrl;
    }
  } catch (e) {}
  return localStorage.getItem(ROOM_STORAGE_KEY) || '';
}

function setRoomId(room) {
  localStorage.setItem(ROOM_STORAGE_KEY, room);
  try {
    const url = new URL(location.href);
    url.searchParams.set('room', room);
    history.replaceState(null, '', url);
  } catch (e) {}
}

// 房间模式下的 getState：从 D1 拉（异步）
async function getRoomState() {
  const room = getRoomId();
  if (!room) return null;
  try {
    const r = await fetch('/api/state?room=' + encodeURIComponent(room));
    if (!r.ok) return null;
    const data = await r.json();
    return data.state || null;
  } catch (e) {
    console.error('getRoomState failed:', e);
    return null;
  }
}

// 房间模式下的 setState：写到 D1（异步）
async function setRoomState(state) {
  const room = getRoomId();
  if (!room) return false;
  try {
    state.updatedAt = Date.now();
    const r = await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room, state }),
    });
    return r.ok;
  } catch (e) {
    console.error('setRoomState failed:', e);
    return false;
  }
}

// 房间模式下的 subscribe：每 2 秒轮询 + 页面不可见时暂停
function subscribeRoom(callback) {
  let interval = null;
  let lastUpdatedAt = 0;

  const tick = async () => {
    const state = await getRoomState();
    if (state && state.updatedAt !== lastUpdatedAt) {
      lastUpdatedAt = state.updatedAt || 0;
      callback(state);
    }
  };

  const start = () => {
    if (interval) return;
    tick();
    interval = setInterval(tick, 2000);
  };
  const stop = () => {
    if (interval) { clearInterval(interval); interval = null; }
  };

  // visibility API：页面不可见时停止轮询，省 D1 配额
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });

  start();
  return stop;
}

// ============== 抽卡 ==============
function drawCard(name) {
  const state = getState();
  if (state.players.find(p => p.name === name)) {
    throw new Error('玩家 ' + name + ' 已经抽过卡了');
  }
  if (state.cardPool.length === 0) {
    throw new Error('卡池已空,所有卡都被抽走了');
  }
  const idx = Math.floor(Math.random() * state.cardPool.length);
  const cardId = state.cardPool[idx];
  const card = CARDS.find(c => c.id === cardId);
  state.cardPool.splice(idx, 1);
  const player = {
    name: name,
    cardId: cardId,
    gold: INIT_GOLD + card.gold,
    selfMockery: '',
    items: [],
    usedItems: [],
    createdAt: Date.now(),
  };
  state.players.push(player);
  state.currentDraw = { name: name, cardId: cardId };
  setState(state);
  return { card: card, player: player };
}

function clearCurrentDraw() {
  const state = getState();
  state.currentDraw = null;
  setState(state);
}

function getPlayer(name) {
  return getState().players.find(p => p.name === name) || null;
}

// 房间模式：从 D1 异步查玩家（玩家端用）
async function getPlayerRoom(name) {
  if (!getRoomId()) return null;
  try {
    const room = getRoomId();
    const r = await fetch('/api/player?room=' + encodeURIComponent(room) + '&name=' + encodeURIComponent(name));
    if (!r.ok) return null;
    const data = await r.json();
    if (!data.found) return null;
    // 同步本地缓存
    const localState = getState();
    const idx = localState.players.findIndex(p => p.name === name);
    if (idx >= 0) localState.players[idx] = data.player;
    else localState.players.push(data.player);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localState));
    return data.player;
  } catch (e) {
    console.error('getPlayerRoom failed:', e);
    return null;
  }
}

// 中控手动加减金币 (兜底: 出现意外时手动调整)
function adjustGold(playerName, delta) {
  const state = getState();
  const p = state.players.find(p => p.name === playerName);
  if (!p) throw new Error('玩家不存在: ' + playerName);
  const newGold = p.gold + delta;
  if (newGold < 0) throw new Error('金币不能为负 (当前 ' + p.gold + ', 尝试扣 ' + Math.abs(delta) + ')');
  p.gold = newGold;
  state.log = state.log || [];
  state.log.push({ type: 'manual_adjust', player: playerName, delta: delta, at: Date.now() });
  setState(state);
  return { ok: true, player: p.name, gold: p.gold, delta: delta };
}

function updateSelfMockery(name, text) {
  const state = getState();
  const p = state.players.find(p => p.name === name);
  if (!p) throw new Error('玩家不存在');
  p.selfMockery = text;
  setState(state);
}

function getCardById(id) {
  return CARDS.find(c => c.id === id) || null;
}

// ============== 拍品 ==============
function listItem(itemId) {
  const state = getState();
  const it = state.items.find(i => i.id === itemId);
  if (!it) throw new Error('拍品不存在');
  if (it.status === 'sold') throw new Error('已成交的拍品不能再上架');
  it.status = 'listed';
  state.currentItem = itemId;
  setState(state);
  return it;
}

function startBidding(itemId) {
  const state = getState();
  const it = state.items.find(i => i.id === itemId);
  if (!it) throw new Error('拍品不存在');
  it.status = 'bidding';
  state.currentItem = itemId;
  setState(state);
  return it;
}

function sellItem(itemId, winnerName, price) {
  const state = getState();
  const it = state.items.find(i => i.id === itemId);
  if (!it) throw new Error('拍品不存在');
  const winner = state.players.find(p => p.name === winnerName);
  if (!winner) throw new Error('玩家不存在');
  if (winner.gold < price) throw new Error('玩家余额不足');

  // 找激活了 A2 沉默是金 的玩家(用过的就从名单移除,只触发一次)
  const silentPlayer = state.silentPlayers.shift() || null;

  if (silentPlayer) {
    // 暂存到 pendingSale, 等中控判定后再真正扣钱
    // 同时结算 A3 (如果成交者是 A3 拥有者)
    let a3Backer = null;
    if (state.a3Chains[winnerName]) {
      const backerName = state.a3Chains[winnerName];
      const backer = state.players.find(p => p.name === backerName);
      if (backer) {
        const discount = Math.floor(price * 0.1);
        a3Backer = { ownerName: winnerName, backerName, payerPays: price - discount, backerLoses: discount };
      }
    }
    state.pendingSale = { itemId, winner: winnerName, price, silentPlayer, a3Backer, at: Date.now() };
    setState(state);
    return { pending: true, silentPlayer, item: it, winner, price, a3Backer };
  }

  // 没有 A2 玩家, 直接成交 (但要看 A3 链: 如果成交者是 A3 拥有者, 靠山分担 10%)
  let a3Backer = null; // { ownerName, backerName, payerPays, backerLoses }
  let a3BackerPlayer = null; // 提到外层, 后面要用
  if (state.a3Chains[winnerName]) {
    const backerName = state.a3Chains[winnerName];
    a3BackerPlayer = state.players.find(p => p.name === backerName);
    if (a3BackerPlayer) {
      const discount = Math.floor(price * 0.1); // 10% 金额
      a3Backer = { ownerName: winnerName, backerName, payerPays: price - discount, backerLoses: discount };
    }
  }

  if (a3Backer) {
    // 护身符: 拥有者实付 90%, 靠山当场扣 10%
    if (winner.gold < a3Backer.payerPays) throw new Error(`玩家余额不足 (含 A3 靠山优惠后实付 ${a3Backer.payerPays} 元)`);
    if (a3BackerPlayer.gold < a3Backer.backerLoses) throw new Error(`靠山 ${a3Backer.backerName} 余额不足 (需扣 ${a3Backer.backerLoses} 元)`);
    winner.gold -= a3Backer.payerPays;
    a3BackerPlayer.gold -= a3Backer.backerLoses;
    // 记录到 log
    state.log.push({
      type: 'a3_split', owner: winnerName, backer: a3Backer.backerName,
      ownerPays: a3Backer.payerPays, backerLoses: a3Backer.backerLoses,
      itemId, price, at: Date.now()
    });
  } else {
    winner.gold -= price;
  }
  it.owner = winnerName;
  it.status = 'sold';
  it.soldPrice = price;
  if (!winner.items.includes(itemId)) winner.items.push(itemId);
  state.log.push({ type: 'sold', itemId, winner: winnerName, price, at: Date.now() });
  // B 卡 (互动卡, 一次性) · 成交时大屏展示"恭喜 XXX" 横幅
  if (it.type === 'social') {
    const realEffect = it.effect.replace(/【拥有者】/g, winnerName);
    state.log.push({ type: 'b_sold', itemId, winner: winnerName, itemName: it.name, effect: realEffect, at: Date.now() });
  }
  state.currentItem = null;
  // 成交后清空 A3 链 (本轮结束)
  state.a3Chains = {};
  setState(state);

  // A4 导师答疑券: 拥有者已激活 + 拍到本轮拍品 → 转给中控判定
  if (state.a4Owner && state.a4Active && state.a4Owner === winnerName) {
    const discount = Math.floor(price * 0.1);
    state.pendingA4Review = { itemId, winner: winnerName, price, discount, at: Date.now() };
    state.a4Active = false; // 用了就清, 下一轮要重新举手
    setState(state);
    return { pending: false, item: it, winner, price, a3Backer, a4Pending: true };
  }

  return { pending: false, item: it, winner, price, a3Backer };
}

// A2 判定后调用: 是 → silentPlayer += 10% 成交价; 否 → 啥也不加
// 然后才真正执行 sellItem 的扣钱逻辑
function confirmSilentSale(stayed) {
  const state = getState();
  const p = state.pendingSale;
  if (!p) return null;
  const { itemId, winner: winnerName, price, silentPlayer } = p;
  const it = state.items.find(i => i.id === itemId);
  const winner = state.players.find(p => p.name === winnerName);
  if (!it || !winner) { state.pendingSale = null; setState(state); return null; }

  let rewardLog = null;
  if (stayed) {
    // 沉默是金 玩家真没叫价 → 获 10% 成交价
    const reward = Math.floor(price * 0.1);
    const sp = state.players.find(p => p.name === silentPlayer);
    if (sp) {
      sp.gold += reward;
      rewardLog = { player: silentPlayer, reward, itemId, price };
      state.log.push({ type: 'silent_reward', player: silentPlayer, itemId, price, reward, at: Date.now() });
    }
  } else {
    state.log.push({ type: 'silent_no_reward', player: silentPlayer, itemId, price, at: Date.now() });
  }

  let a3Log = null;
  if (p.a3Backer) {
    const ab = p.a3Backer;
    const backer = state.players.find(pp => pp.name === ab.backerName);
    if (winner.gold < ab.payerPays) {
      // 余额不足 → 退回原方案
      state.log.push({ type: 'a3_fail', reason: `${winnerName} 余额不足 (实付 ${ab.payerPays}), A3 失效按全价扣`, itemId, price, at: Date.now() });
    } else if (backer && backer.gold < ab.backerLoses) {
      // 靠山余额不足 → 退回原方案
      state.log.push({ type: 'a3_fail', reason: `靠山 ${ab.backerName} 余额不足 (需扣 ${ab.backerLoses}), A3 失效按全价扣`, itemId, price, at: Date.now() });
    } else {
      winner.gold -= ab.payerPays;
      if (backer) backer.gold -= ab.backerLoses;
      a3Log = { owner: winnerName, backer: ab.backerName, ownerPays: ab.payerPays, backerLoses: ab.backerLoses, itemId, price };
      state.log.push({ type: 'a3_split', owner: winnerName, backer: ab.backerName, ownerPays: ab.payerPays, backerLoses: ab.backerLoses, itemId, price, at: Date.now() });
    }
  }

  if (!a3Log) {
    // 没有 A3 或 A3 失败 → 走全价
    winner.gold -= price;
  }
  it.owner = winnerName;
  it.status = 'sold';
  it.soldPrice = price;
  if (!winner.items.includes(itemId)) winner.items.push(itemId);
  state.log.push({ type: 'sold', itemId, winner: winnerName, price, at: Date.now() });
  state.currentItem = null;
  state.pendingSale = null;
  // 成交后清空 A3 链
  state.a3Chains = {};
  setState(state);

  // A4 导师答疑券: 拥有者已激活 + 拍到本轮拍品 → 转给中控判定
  if (state.a4Owner && state.a4Active && state.a4Owner === winnerName) {
    const discount = Math.floor(price * 0.1);
    state.pendingA4Review = { itemId, winner: winnerName, price, discount, at: Date.now() };
    state.a4Active = false; // 用了就清
    setState(state);
    return { rewardLog, item: it, winner, price, silentPlayer, stayed, a3Log, a4Pending: true };
  }

  return { rewardLog, item: it, winner, price, silentPlayer, stayed, a3Log };
}

// 取消 A2 判定(中控不想成交,返回上一步)
function cancelSilentSale() {
  const state = getState();
  state.pendingSale = null;
  setState(state);
}

function passItem(itemId) {
  const state = getState();
  const it = state.items.find(i => i.id === itemId);
  if (!it) throw new Error('拍品不存在');
  it.status = 'available';
  state.log.push({ type: 'passed', itemId, at: Date.now() });
  state.currentItem = null;
  setState(state);
  return it;
}

// ============== 技能卡使用 ==============
// 每张卡可以声明 useParams: ['target'] 表示使用时要选一个目标玩家
// params: { target?: string }
// 返回: { item, success, message, change? }  change = { userDelta, targetDelta }
function useItem(playerName, itemId, params = {}) {
  const state = getState();
  const p = state.players.find(p => p.name === playerName);
  if (!p) throw new Error('玩家不存在');
  const it = state.items.find(i => i.id === itemId);
  if (!it) throw new Error('拍品不存在');
  if (it.owner !== playerName) throw new Error('这张卡不属于该玩家');
  if (it.usesLeft <= 0) throw new Error('使用次数已用完');

  // 扣次数
  it.usesLeft -= 1;
  if (it.usesLeft === 0 && !p.usedItems.includes(itemId)) {
    p.usedItems.push(itemId);
  }

  // 走每张卡自己的规则
  const result = runSkillRule(it, p, params, state);
  state.log.push({
    type: 'used',
    player: playerName,
    itemId,
    target: params.target,
    success: result.success,
    effect: result.message,
    at: Date.now(),
  });
  // 临时屏播消息
  state.skillNotice = { player: playerName, itemId, itemName: it.name, success: result.success, message: result.message, at: Date.now() };
  setState(state);
  return result;
}

// 单张技能卡规则: 根据 it.id 分发
function runSkillRule(it, user, params, state) {
  switch (it.id) {
    case 'A1': return skill_A1(it, user, params, state);
    case 'A2': return skill_A2(it, user, params, state);
    case 'A3': return skill_A3(it, user, params, state);
    case 'A4': return skill_A4(it, user, params, state);
    case 'A5': return skill_A5(it, user, params, state);
    default:
      // 默认: 仅扣次数,不产生资产变化
      return { item: it, success: true, message: `${user.name} 使用了 ${it.name}: ${it.effect}` };
  }
}

// A3「护身符」 — 选1个靠山 + 立刻支付30元靠山使用费 + 本轮成交优惠
// params.target = 靠山名字
function skill_A3(it, user, params, state) {
  const target = params.target;
  if (!target || target === user.name) {
    return { item: it, success: false, message: '护身符: 需选择不同的玩家作为靠山' };
  }
  // 余额检查
  if ((user.gold || 0) < 30) {
    return { item: it, success: false, message: `护身符: 余额不足30元 (${user.name} 当前 ${user.gold}元)` };
  }
  // 检查靠山存在
  const targetPlayer = state.players.find(p => p.name === target);
  if (!targetPlayer) {
    return { item: it, success: false, message: `护身符: 找不到玩家 ${target}` };
  }
  // 不能有重复的 A3 链
  if (state.a3Chains[user.name]) {
    return { item: it, success: false, message: `护身符: ${user.name} 本轮已绑定靠山 ${state.a3Chains[user.name]}` };
  }
  // 立即转账: 拥有者 -30, 靠山 +30
  user.gold -= 30;
  targetPlayer.gold = (targetPlayer.gold || 0) + 30;
  // 记录 A3 链
  state.a3Chains[user.name] = target;
  return {
    item: it, success: true,
    message: `${user.name} 启用「护身符」· 靠山 ${target} (+30) · 本轮成交时若为本人,实付 90% 成交价, 靠山扣 10%`
  };
}

// A2「沉默是金 v2.0」 — 启用"本轮不叫价"
// 本身不发钱; 真正的奖励在 sellItem 时由中控询问后结算
function skill_A2(it, user, params, state) {
  if (!state.silentPlayers.includes(user.name)) {
    state.silentPlayers.push(user.name);
  }
  return {
    item: it, success: true,
    message: `${user.name} 启用「沉默是金」· 本轮不叫价 · 拍品成交时若真没叫价,获成交价 10% 奖励`
  };
}

// A1「我穷我有理」 — 目标比使用者富,使用+50/目标-50; 否则使用-20/目标+20
function skill_A1(it, user, params, state) {
  const targetName = params.target;
  if (!targetName) return { item: it, success: false, message: '未选择目标' };
  if (targetName === user.name) return { item: it, success: false, message: '不能对自己使用' };
  const target = state.players.find(p => p.name === targetName);
  if (!target) return { item: it, success: false, message: '目标玩家不存在' };

  if (target.gold > user.gold) {
    // 成功: 抢 50
    user.gold += 50;
    target.gold -= 50;
    return { item: it, success: true, message: `${user.name} 对 ${target.name} 喊「我穷我有理」! ${target.name} 比 ${user.name} 富, ${user.name} +50 / ${target.name} -50` };
  } else {
    // 失败: 倒贴 20
    user.gold -= 20;
    target.gold += 20;
    return { item: it, success: false, message: `${user.name} 对 ${target.name} 喊「我穷我有理」! 但 ${target.name} 没 ${user.name} 富, ${user.name} -20 / ${target.name} +20` };
  }
}

// A4「导师答疑券」 — 举手激活本轮点评, 拍到拍品时中控可判定退回 10%
// 使用时不扣钱, 仅标记 a4Active = true
function skill_A4(it, user, params, state) {
  if (!state.a4Owner) {
    // 第一次使用时记录 A4 拥有者
    state.a4Owner = user.name;
  } else if (state.a4Owner !== user.name) {
    return { item: it, success: false, message: `A4 导师答疑券属于 ${state.a4Owner}, 其他人不能使用` };
  }
  if (state.a4Active) {
    return { item: it, success: false, message: `${user.name} 本轮已激活 A4, 拍品成交时再判定` };
  }
  state.a4Active = true;
  return {
    item: it, success: true,
    message: `${user.name} 举手激活「导师答疑券」· 本轮拍到拍品时,主持人可判定点评 → 成交价 -10% 退回`
  };
}

// A4 判定后调用: shouldDiscount=true 退回 10%, false 原价
function confirmA4Review(shouldDiscount) {
  const state = getState();
  const p = state.pendingA4Review;
  if (!p) return null;
  const { itemId, winner: winnerName, price, discount } = p;
  const it = state.items.find(i => i.id === itemId);
  const winner = state.players.find(pp => pp.name === winnerName);
  if (!it || !winner) { state.pendingA4Review = null; setState(state); return null; }

  let a4Log = null;
  if (shouldDiscount) {
    // 退回 10%
    winner.gold += discount;
    a4Log = { owner: winnerName, itemId, price, discount };
    state.log.push({ type: 'a4_review', owner: winnerName, itemId, price, discount, at: Date.now(), msg: `${winnerName} 现场点评了「${it.name}」· 退回 ${discount} 元` });
  } else {
    state.log.push({ type: 'a4_no_review', owner: winnerName, itemId, price, at: Date.now(), msg: `${winnerName} 没点评「${it.name}」· 不退` });
  }
  state.pendingA4Review = null;
  setState(state);
  return { a4Log, item: it, winner, price, discount, shouldDiscount };
}

// A5「选牌官」— 拥有者通过私密链接指定下一轮拍品
// 使用时弹出提示让拥有者去 select.html 挑选, A5 拥有者会主动打开链接
function skill_A5(it, user, params, state) {
  if (state.a5Used) {
    return { item: it, success: false, message: `A5 选牌官已被 ${user.name} 用过, 一次性` };
  }
  // 标记 A5 拥有者 (整场保持, 不清), 拥有者可随时打开 select.html
  state.a5Owner = user.name;
  return {
    item: it, success: true,
    message: `${user.name} 激活「选牌官」· 请打开私密链接 https://.../select.html 挑选下一轮拍品, 选完通知主持人确认`
  };
}

// A5 拥有者在 select.html 选拍品: 写入 pendingNextItem
function selectNextItem(itemId, selectorName) {
  const state = getState();
  // 找到该拍品, 必须是主拍品 (非备用) 且未拍出
  const it = state.items.find(i => i.id === itemId);
  if (!it) throw new Error(`拍品 ${itemId} 不存在`);
  if (it.status !== 'available') throw new Error(`拍品 ${it.name} 状态: ${it.status}, 不能选`);
  if (RESERVE_ITEMS.includes(it.id)) throw new Error(`备用拍品 ${it.name} 不能选, 只能选主拍品`);
  if (!AUCTION_ORDER.includes(it.id)) throw new Error(`${it.name} 不在主拍品列表中`);

  state.pendingNextItem = { itemId, selectedBy: selectorName || state.a5Owner || '匿名', at: Date.now() };
  setState(state);
  return { ok: true, item: it, selectedBy: state.pendingNextItem.selectedBy };
}

// 中控确认 pendingNextItem → 正式上架
function confirmSelectedItem() {
  const state = getState();
  const p = state.pendingNextItem;
  if (!p) throw new Error('没有待确认的拍品');
  const it = state.items.find(i => i.id === p.itemId);
  if (!it) throw new Error('拍品不存在');
  if (it.status !== 'available') throw new Error('拍品状态已变更, 不能上架');

  // 标记 a5Used
  state.a5Used = true;
  state.pendingNextItem = null;
  // 记一条 log, 大屏 5秒大提示
  state.log = state.log || [];
  state.log.push({ type: 'a5_confirm', itemId: p.itemId, selectedBy: p.selectedBy, at: Date.now() });
  setState(state);
  return { ok: true, item: it, selectedBy: p.selectedBy };
}

// 取消 pendingNextItem (中控撤销)
function cancelSelectedItem() {
  const state = getState();
  state.pendingNextItem = null;
  setState(state);
  return { ok: true };
}

function getCurrentItem() {
  const state = getState();
  if (!state.currentItem) return null;
  return state.items.find(i => i.id === state.currentItem);
}
