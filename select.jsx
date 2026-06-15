// A5 选牌官 · 私密选卡页面
// 用法: 打开 select.html, 看到所有未拍出的主拍品 (不含备用), 点击卡牌查看详情, 选完通知主持人点 "确认上架"

const { useState, useEffect } = React;

function useGameState() {
  const [state, setState] = useState(() => getState());
  useEffect(() => subscribe(() => setState({ ...getState() })), []);
  return state;
}

function SelectApp() {
  const state = useGameState();
  const [selecting, setSelecting] = useState(false);
  const [picking, setPicking] = useState(null); // 正在查看这张 → 显示规则弹窗

  // A5 已被用完
  if (state.a5Used && !state.pendingNextItem) {
    return (
      <div className="select-used">
        <div className="select-icon">🔒</div>
        <div className="select-title">A5 选牌官 · 已用完</div>
        <div className="select-sub">本场 A5 已被使用, 选卡功能已关闭</div>
      </div>
    );
  }

  // 已选了某张拍品, 等待主持人确认
  if (state.pendingNextItem) {
    const it = state.items.find(i => i.id === state.pendingNextItem.itemId);
    return (
      <div className="select-confirmed">
        <div className="select-icon-big">✅</div>
        <div className="select-title">你已选了</div>
        <div className="select-picked-name">{it ? it.name : '?'}</div>
        <div className="select-picked-id">{state.pendingNextItem.itemId}</div>
        <div className="select-wait">⏳ 等待主持人确认上架...</div>
        <div className="select-hint">主持人点 "确认上架" 后, 下一轮开锤拍品就是它</div>
      </div>
    );
  }

  // 还没激活 A5 (没拍到 A5)
  if (!state.a5Owner) {
    return (
      <div className="select-confirmed">
        <div className="select-icon">⏳</div>
        <div className="select-title">A5 选牌官 · 未激活</div>
        <div className="select-sub">你还没有拍到 A5 选牌官</div>
        <div className="select-hint">请在拍卖会中拍下 A5 卡牌, 然后在【中控·技能卡触发区】让主持人执行 A5</div>
      </div>
    );
  }

  // 主拍品 (未拍出, 不含备用)
  const available = state.items.filter(it =>
    it.status === 'available' && AUCTION_ORDER.includes(it.id) && !RESERVE_ITEMS.includes(it.id)
  );

  const handlePick = (itemId) => {
    if (selecting) return;
    const selector = state.a5Owner;
    if (!selector) { alert('请先在中控使用 A5 技能卡激活选牌官'); return; }
    setSelecting(true);
    try {
      selectNextItem(itemId, selector);
    } catch (e) {
      alert('选拍品失败: ' + e.message);
      setSelecting(false);
    }
  };

  return (
    <div className="select-app">
      <div className="select-header">
        <div className="select-header-icon">🎯</div>
        <div className="select-header-title">A5 选牌官 · 私密选卡</div>
        <div className="select-header-sub">从未拍出的主拍品中挑 1 张作为下一轮开锤拍品 (不含备用卡)</div>
        {state.a5Owner && (
          <div className="select-player">玩家: <b>{state.a5Owner}</b></div>
        )}
      </div>

      <div className="select-count">可选拍品: {available.length} 张 · 👆 点击卡牌查看大图与规则</div>

      <div className="select-grid">
        {available.length === 0 && (
          <div className="select-empty">没有可拍的拍品了</div>
        )}
        {available.map(it => (
          <div key={it.id} className="select-card" onClick={() => setPicking(it)}>
            <img className="select-card-img" src={it.front} alt={it.name} onError={e => { e.target.style.display='none'; }} />
            <div className="select-card-id">{it.id}</div>
            <div className="select-card-name">{it.name}</div>
            <div className="select-card-type">{it.type === 'skill' ? '技能卡' : '互动卡'}</div>
            <div className="select-card-price">起拍价 {it.startPrice}</div>
            <div className="select-card-effect">{it.effect}</div>
            <div className="select-card-hint">👆 点击查看大图与规则</div>
          </div>
        ))}
      </div>

      <div className="select-footer">
        ⚠️ 此页面仅 A5 拥有者可见 · 一次性 · 选完通知主持人点 "确认上架"
      </div>

      {/* 全屏规则弹窗: 点击某张卡时弹出 */}
      {picking && (
        <div className="select-rules-modal" onClick={() => setPicking(null)}>
          <div className="select-rules-box" onClick={e => e.stopPropagation()}>
            <button className="select-rules-close" onClick={() => setPicking(null)}>✕</button>
            <div className="select-rules-header">
              <div className="select-rules-id">{picking.id}</div>
              <div className="select-rules-name">{picking.name}</div>
              <div className="select-rules-type">{picking.type === 'skill' ? '🛠 技能卡' : '🎭 互动卡'} · 起拍价 {picking.startPrice}</div>
            </div>
            <div className="select-rules-tabs">
              <div className="select-rule-tab">
                <div className="select-rule-tab-title">🎴 卡图</div>
                <img className="select-rule-img" src={picking.front} alt={picking.name} onError={e => { e.target.style.display='none'; }} />
              </div>
              <div className="select-rule-tab">
                <div className="select-rule-tab-title">📋 规则</div>
                <img className="select-rule-img" src={picking.back} alt="规则" onError={e => { e.target.style.display='none'; }} />
                <div className="select-rule-text">{picking.effect}</div>
              </div>
              <div className="select-rule-tab">
                <div className="select-rule-tab-title">💡 解释</div>
                <img className="select-rule-img" src={picking.comic} alt="解释" onError={e => { e.target.style.display='none'; }} />
              </div>
            </div>
            <div className="select-rules-actions">
              <button className="select-rules-cancel" onClick={() => setPicking(null)}>← 继续浏览</button>
              <button className="select-rules-confirm" onClick={() => { handlePick(picking.id); setPicking(null); }} disabled={selecting}>
                ✅ 就选这张 ({picking.name})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<SelectApp />);
