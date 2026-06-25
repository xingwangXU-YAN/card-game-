// 创建新房间（POST）：生成 6 位 room_id 并写入 D1
export async function onRequestPost(context) {
  // 生成 6 位大写字母数字组合（去掉易混淆的 0/O/1/I）
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let roomId = '';
  for (let i = 0; i < 6; i++) {
    roomId += chars[Math.floor(Math.random() * chars.length)];
  }

  // 默认 state（16 张人格卡池）
  const defaultState = {
    players: [],
    cardPool: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
    currentDraw: null,
    items: [],
    currentItem: null,
    log: [],
    phase: 'draw',
    silentPlayers: [],
    a3Chains: {},
    a4Owner: '',
    a4Active: false,
    pendingSale: null,
    pendingA4Review: null,
    pendingNextItem: null,
    a5Used: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  try {
    await context.env.DB.prepare(
      'INSERT OR REPLACE INTO rooms (room_id, state_json, updated_at) VALUES (?, ?, ?)'
    ).bind(roomId, JSON.stringify(defaultState), Date.now()).run();

    return new Response(JSON.stringify({ ok: true, roomId }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
