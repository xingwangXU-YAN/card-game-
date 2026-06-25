// 全量 state 读写
// GET  /api/state?room=ABC123  →  读
// POST /api/state  body={room, state}  →  写
export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const roomId = url.searchParams.get('room');
  if (!roomId) return new Response(JSON.stringify({ error: 'Missing room' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });

  try {
    const row = await context.env.DB.prepare(
      'SELECT state_json, updated_at FROM rooms WHERE room_id = ?'
    ).bind(roomId).first();

    if (!row) return new Response(JSON.stringify({ error: 'Room not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });

    return new Response(JSON.stringify({
      ok: true,
      state: JSON.parse(row.state_json),
      updatedAt: row.updated_at,
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { room, state } = body;
    if (!room || !state) return new Response(JSON.stringify({ error: 'Missing room/state' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

    // state.updatedAt 自动更新为 now
    state.updatedAt = Date.now();

    await context.env.DB.prepare(
      'INSERT OR REPLACE INTO rooms (room_id, state_json, updated_at) VALUES (?, ?, ?)'
    ).bind(room, JSON.stringify(state), state.updatedAt).run();

    return new Response(JSON.stringify({ ok: true, updatedAt: state.updatedAt }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
