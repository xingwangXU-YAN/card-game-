// 单玩家查询（玩家端登录时用）
// GET /api/player?room=ABC123&name=韩晓嫣
export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const roomId = url.searchParams.get('room');
  const playerName = url.searchParams.get('name');
  if (!roomId || !playerName) return new Response(JSON.stringify({ error: 'Missing room/name' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });

  try {
    const row = await context.env.DB.prepare(
      'SELECT state_json FROM rooms WHERE room_id = ?'
    ).bind(roomId).first();

    if (!row) return new Response(JSON.stringify({ found: false, error: 'Room not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });

    const state = JSON.parse(row.state_json);
    const player = state.players.find(p => p.name === playerName);
    if (!player) return new Response(JSON.stringify({ found: false }), {
      headers: { 'Content-Type': 'application/json' },
    });

    return new Response(JSON.stringify({ found: true, player }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ found: false, error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
