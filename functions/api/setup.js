// 一次性建表端点（GET 调用即可，幂等）
export async function onRequestGet(context) {
  try {
    await context.env.DB.exec(
      `CREATE TABLE IF NOT EXISTS rooms (
        room_id TEXT PRIMARY KEY,
        state_json TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )`
    );
    return new Response(JSON.stringify({ ok: true, message: 'rooms table ready' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
