// ============== 钩子 ==============
const { useState, useEffect, useMemo, useCallback } = React;
const { createRoot } = ReactDOM;

// 房间模式标记（app.jsx 启动时确定一次）
const USE_ROOM = !!(typeof getRoomId === 'function' && getRoomId());

function useTick() {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (USE_ROOM && typeof subscribeRoom === 'function') {
      return subscribeRoom(() => setTick(t => t + 1));
    }
    return subscribe(() => setTick(t => t + 1));
  }, []);
  // 房间模式下，返回的是上次缓存的 localStorage state；
  // 真实 state 由 tick 触发后从 subscribeRoom 内部异步更新。
  // 非房间模式维持原行为。
  return getState();
}

// 房间模式下的 setState 包装：写完 D1 后立即触发 React 刷新
async function commitState(nextState) {
  if (USE_ROOM && typeof setRoomState === 'function') {
    await setRoomState(nextState);
    // 同步本地缓存，避免 useTick 短暂返回旧值
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    window.dispatchEvent(new Event('card-game-update'));
  } else {
    setState(nextState);
  }
}

function useEscape(handler) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') handler(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [handler]);
}

// ============== 共享 UI：灯箱 ==============
function Lightbox({ data, onClose }) {
  useEscape(onClose);
  if (!data) return null;
  return (
    <div className="lightbox" onClick={onClose}>
      <div className="lightbox-content" onClick={e => e.stopPropagation()}>
        <img src={data.src} alt={data.label} />
        <div className="lightbox-label">{data.label} · 点空白处或按 ESC 关闭</div>
      </div>
    </div>
  );
}

// ============== 拍卖展示（3 张图常驻，CSS 切显隐） ==============
function AuctionStage({ item }) {
  const [step, setStep] = useState(1);
  const [zoom, setZoom] = useState(null);
  useEscape(() => zoom ? setZoom(null) : null);
  // 切拍品时归位第 1 步
  useEffect(() => setStep(1), [item.id]);
  const advance = () => setStep(s => s >= 3 ? 1 : s + 1);
  const z = useCallback((src, label) => setZoom({ src, label }), []);
  // 用 className 控制哪几张显示，哪张放大
  return (
    <>
      <div className={'auction-stage step-' + step} onClick={advance} title="点空白处翻下一步">
        <div className="auction-card slot-front" onClick={e => { e.stopPropagation(); z(item.front, '📇 展示页'); }}>
          <img src={item.front} alt={item.name} />
          <div className="label">📇 展示页</div>
        </div>
        <div className="auction-card slot-back" onClick={e => { e.stopPropagation(); z(item.back, '📋 规则页'); }}>
          <img src={item.back} alt="规则" />
          <div className="label">📋 规则页</div>
        </div>
        <div className="auction-card slot-comic" onClick={e => { e.stopPropagation(); z(item.comic, '🎬 解释页'); }}>
          <img src={item.comic} alt="解释" />
          <div className="label">🎬 解释页</div>
        </div>
        <div className="auction-info" onClick={e => e.stopPropagation()}>
          <div className="name">{item.name}</div>
          <div className="label-sub">起拍价</div>
          <div className="price-big">{item.startPrice}</div>
          <div className="status-text">
            {item.status === 'listed' && '⏳ 等待出价'}
            {item.status === 'bidding' && '🔨 拍卖中 · 现场喊价'}
            {item.status === 'sold' && `✅ 成交！${item.soldPrice} 元`}
          </div>
          <div className="step-hint">第 {step}/3 步</div>
          <button className="btn-next-step" onClick={(e) => { e.stopPropagation(); advance(); }}>
            {step < 3 ? '▶ 下一步' : '↩ 返回第 1 步'}
          </button>
          <div className="step-hint-mini">点屏幕空白处也能翻</div>
        </div>
      </div>
      <Lightbox data={zoom} onClose={() => setZoom(null)} />
    </>
  );
}

// ============== 拍品卡（中控用） ==============
const STATUS_TEXT = { available: '备用', listed: '已上架', bidding: '开锤中', sold: '已成交' };

function ItemCard({ it, state, onList, onStartBid, onPass, onSell }) {
  const expired = it.owner && it.usesLeft === 0;
  return (
    <div className={'item-card ' + it.status + (expired ? ' used-up' : '')}>
      <img src={it.front} alt={it.name} />
      <div className="item-name">{it.id} {it.name}</div>
      <div className="item-price">起拍价 {it.startPrice} · {it.type === 'skill' ? '技能卡' : '互动卡'}</div>
      <span className={'item-status ' + it.status}>{STATUS_TEXT[it.status]}</span>
      {state && state.pendingNextItem && state.pendingNextItem.itemId === it.id && (
        <span className="item-a5-mark">🎯 {state.pendingNextItem.selectedBy} 选了</span>
      )}
      <div className="item-uses">剩余 {it.usesLeft}/{it.maxUses} 次{it.owner ? ` · 拥有: ${it.owner}` : ''}</div>
      <div className="item-actions">
        {it.status === 'available' && <button onClick={() => onList(it.id)}>上架</button>}
        {it.status === 'listed' && <button onClick={() => onStartBid(it.id)}>开锤</button>}
        {it.status === 'bidding' && <>
          <button onClick={() => onSell(it.id)}>成交</button>
          <button onClick={() => onPass(it.id)}>流拍</button>
        </>}
      </div>
    </div>
  );
}

// ============== 大屏 ==============
function Display() {
  const state = useTick();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [flipped, setFlipped] = useState(false);

  const currentDraw = state.currentDraw;
  const card = currentDraw ? getCardById(currentDraw.cardId) : null;
  const currentItem = getCurrentItem();
  const phase = state.phase;

  const start = () => { setShowModal(true); setName(''); setError(''); };
  const draw = () => {
    if (!name.trim()) return setError('请输入姓名');
    try {
      drawCard(name.trim());
      setShowModal(false);
      setFlipped(false);
      setTimeout(() => setFlipped(true), 600); // 跟 CSS 翻转时长对齐
    } catch (e) { setError(e.message); }
  };
  const next = () => { clearCurrentDraw(); setFlipped(false); };

  // 颁奖态
  if (phase === 'award') {
    const king = state.players.reduce((w, p) =>
      (!w || (p.items?.length || 0) > (w.items?.length || 0)) ? p : w, null);
    return (
      <div className="display">
        <div className="award-display">
          <div className="crown">👑</div>
          <h1>经营王者</h1>
          <div className="award-name">拍品最多者</div>
          {king ? <>
            <div className="winner-name">{king.name}</div>
            <div className="winner-stat">拍到 <b>{king.items?.length || 0}</b> 件拍品</div>
          </> : <div className="empty-tip">暂无玩家</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="display">
      <h1>🎴 研究生人格抽卡 · 拍卖会 🎴</h1>

      {phase === 'draw' && !currentDraw && !showModal &&
        <button className="btn-primary" onClick={start}>🎰 点击开始抽卡</button>}

      {phase === 'draw' && currentDraw && card && (
        <div className="draw-result">
          <div className="card-stage">
            <div className={'card ' + (flipped ? 'flipped' : '')}>
              <div className="card-face card-back"><img src={CARD_BACK} alt="卡背" /></div>
              <div className="card-face card-front"><img src={card.image} alt={card.name} /></div>
            </div>
          </div>
          <h2>🎉 {currentDraw.name}</h2>
          <p className="mockery">"{card.selfMockery}"</p>
          <button className="btn-secondary" onClick={next}>下一位抽卡 →</button>
        </div>
      )}

      {phase === 'draw' && showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>输入你的姓名</h2>
            <input autoFocus value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && draw()}
              placeholder="请输入姓名" maxLength={20} />
            {error && <div className="error">{error}</div>}
            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn-primary big" onClick={draw}>抽卡！</button>
            </div>
          </div>
        </div>
      )}

      {phase === 'auction' && currentItem && <AuctionStage key={itemKey(currentItem)} item={currentItem} />}
      {phase === 'auction' && !currentItem && (
        <div className="auction-waiting">
          <div className="title">🎤 拍卖会进行中</div>
          <div className="sub">请等待主持人上架拍品...</div>
        </div>
      )}

      {state.skillNotice && (Date.now() - state.skillNotice.at < 6000) && (
        <div className={'skill-notice ' + (state.skillNotice.success ? 'success' : 'fail')}>
          <div className="notice-icon">{state.skillNotice.success ? '🎉' : '💥'}</div>
          <div className="notice-title">
            {state.skillNotice.success ? '✨ 使用成功!' : '💔 使用失败!'}
          </div>
          <div className="notice-card-name">{state.skillNotice.itemName}</div>
          <div className="notice-message">{state.skillNotice.message}</div>
        </div>
      )}

      {/* 大屏: A2 等待主持人判定 (非交互, 仅展示) */}
      {state.pendingSale && (
        <div className="display-silent-wait">
          🔇 等待主持人判定「沉默是金」: {state.pendingSale.silentPlayer} 本轮是否未叫价？
        </div>
      )}

      {/* 大屏: 最新一条 A2 沉默是金奖励 (5秒后自动消失) */}
      <SilentRewardDisplay log={state.log} />

      {/* 大屏: 最新一条 A3 护身符分担 (5秒后自动消失) */}
      <A3SplitDisplay log={state.log} />

      {/* 大屏: 最新一条 A4 导师答疑券点评 (5秒后自动消失) */}
      <A4ReviewDisplay log={state.log} />

      {/* 大屏: A4 等待主持人判定 (非交互, 仅展示) */}
      {state.pendingA4Review && (
        <div className="display-silent-wait">
          🎓 等待主持人判定「导师答疑券」: {state.pendingA4Review.winner} 是否现场点评？
        </div>
      )}

      {/* 大屏: A5 三种状态 */}
      <A5StatusDisplay state={state} />

      {/* 大屏: B 卡 (互动卡) 成交瞬间权益横幅 (10秒后自动消失) */}
      <BSocialRewardDisplay log={state.log} />

      <div className="status-bar">
        {phase === 'draw' && <>卡池剩余 <span className="count">{state.cardPool.length}</span> / {CARDS.length} 张</>}
        {phase === 'auction' && <>已成交 <span className="count">{state.items.filter(i => i.status === 'sold').length}</span> / {AUCTION_ORDER.length} 件</>}
        {phase === 'award' && <>🏆 颁奖中</>}
      </div>
    </div>
  );
}
// 拍品没变时（仅状态变）不重建组件,保持翻牌步骤
function itemKey(it) { return it.id; }

// 大屏 A2 奖励提示
function SilentRewardDisplay({ log }) {
  if (!log || log.length === 0) return null;
  const reward = log.slice().reverse().find(function(e) {
    return e.type === 'silent_reward' && Date.now() - e.at < 5000;
  });
  if (!reward) return null;
  return (
    React.createElement('div', { className: 'display-silent-reward' },
      React.createElement('div', { className: 'dsr-icon' }, '🔇'),
      React.createElement('div', { className: 'dsr-title' }, '沉默是金 · 奖励'),
      React.createElement('div', { className: 'dsr-line' }, reward.player + ' 本轮真的没叫价'),
      React.createElement('div', { className: 'dsr-amount' }, '+' + reward.reward + ' 元'),
      React.createElement('div', { className: 'dsr-hint' }, reward.itemId + ' 以 ' + reward.price + ' 元成交 · 10% 成交价奖励')
    )
  );
}

// 大屏 A3 护身符分担提示
function A3SplitDisplay({ log }) {
  if (!log || log.length === 0) return null;
  const a3 = log.slice().reverse().find(function(e) {
    return e.type === 'a3_split' && Date.now() - e.at < 5000;
  });
  if (!a3) return null;
  return (
    React.createElement('div', { className: 'display-a3-reward' },
      React.createElement('div', { className: 'da3-icon' }, '🛡️'),
      React.createElement('div', { className: 'da3-title' }, '护身符 · 成交优惠'),
      React.createElement('div', { className: 'da3-line' }, a3.owner + ' 拍到 ' + a3.itemId),
      React.createElement('div', { className: 'da3-amount' }, '实付 ' + a3.ownerPays + ' 元'),
      React.createElement('div', { className: 'da3-hint' }, '成交价 ' + a3.price + ' 元 · 靠山 ' + a3.backer + ' 扣 ' + a3.backerLoses + ' 元 (10%)')
    )
  );
}

// 大屏 A4 导师答疑券点评提示
function A4ReviewDisplay({ log }) {
  if (!log || log.length === 0) return null;
  const a4 = log.slice().reverse().find(function(e) {
    return (e.type === 'a4_review' || e.type === 'a4_no_review') && Date.now() - e.at < 5000;
  });
  if (!a4) return null;
  if (a4.type === 'a4_review') {
    return (
      React.createElement('div', { className: 'display-a4-reward' },
        React.createElement('div', { className: 'da4-icon' }, '🎓'),
        React.createElement('div', { className: 'da4-title' }, '导师答疑券 · 点评成功'),
        React.createElement('div', { className: 'da4-line' }, a4.owner + ' 现场点评了「' + a4.itemId + '」'),
        React.createElement('div', { className: 'da4-amount' }, '退回 ' + a4.discount + ' 元'),
        React.createElement('div', { className: 'da4-hint' }, '成交价 ' + a4.price + ' 元 · 10% 优惠')
      )
    );
  } else {
    return (
      React.createElement('div', { className: 'display-a4-reward' },
        React.createElement('div', { className: 'da4-icon' }, '🎓'),
        React.createElement('div', { className: 'da4-title' }, '导师答疑券 · 未点评'),
        React.createElement('div', { className: 'da4-line' }, a4.owner + ' 没点评「' + a4.itemId + '」'),
        React.createElement('div', { className: 'da4-hint' }, '成交价 ' + a4.price + ' 元 · 不退')
      )
    );
  }
}

// 大屏 B 卡 (互动卡) 成交瞬间 · "恭喜 XXX 拍到 XXXX, 请 XXX 现在享受你的权益" 横幅 (10秒后自动消失)
function BSocialRewardDisplay({ log }) {
  if (!log || log.length === 0) return null;
  const bsold = log.slice().reverse().find(function(e) {
    return e.type === 'b_sold' && Date.now() - e.at < 10000;
  });
  if (!bsold) return null;
  // 解析 effect 中的 "权益" 部分 (：后面的内容)
  const colonIdx = bsold.effect.indexOf('：');
  const rightPart = colonIdx >= 0 ? bsold.effect.substring(colonIdx + 1) : '';
  return React.createElement('div', { className: 'display-b-reward' },
    React.createElement('div', { className: 'dbr-icon' }, '🎉'),
    React.createElement('div', { className: 'dbr-title' }, '恭喜 ' + bsold.winner + ' 拍到'),
    React.createElement('div', { className: 'dbr-item' }, '《' + bsold.itemName + '》展品'),
    React.createElement('div', { className: 'dbr-line' }, '请 ' + bsold.winner + ' 现在享受你的「权益」（当场执行）'),
    rightPart && React.createElement('div', { className: 'dbr-detail' }, '📌 ' + rightPart),
    React.createElement('div', { className: 'dbr-hint' }, '一次性权益 · 10秒后自动消失')
  );
}

// 大屏 A5 选牌官 · 三种状态
// 1) a5Owner 已激活, 没选拍品: 顶部小条 "X 激活了选牌官, 正在私密选卡"
// 2) pendingNextItem 有, 没确认: 顶部小条 "X 已选了拍品, 等待主持人确认"
// 3) a5Used=true 且刚 confirmSelectedItem: 显示 "下一轮开锤拍品: XXX (5秒后消失)"
function A5StatusDisplay({ state }) {
  const [showConfirm, setShowConfirm] = React.useState(null);
  // 监听 log: confirm 时记录一条 type=a5_confirm 的 log, 5秒后消失
  React.useEffect(() => {
    if (!state.log || state.log.length === 0) return;
    const last = state.log[state.log.length - 1];
    if (last && last.type === 'a5_confirm') {
      setShowConfirm({ itemId: last.itemId, selectedBy: last.selectedBy, at: last.at });
      const t = setTimeout(() => setShowConfirm(null), 5000);
      return () => clearTimeout(t);
    }
  }, [state.log && state.log.length]);

  // 1) 激活 + 没选 → 提示"激活了选牌官"
  if (state.a5Owner && !state.pendingNextItem && !state.a5Used) {
    return React.createElement('div', { className: 'display-a5-active' },
      React.createElement('div', { className: 'da5-icon' }, '🎯'),
      React.createElement('div', { className: 'da5-text' },
        React.createElement('div', { className: 'da5-title' }, 'A5 选牌官 · 激活中'),
        React.createElement('div', { className: 'da5-line' }, state.a5Owner + ' 正在私密选卡 · 等待选择下一轮开锤拍品')
      )
    );
  }

  // 2) 已选 · 等确认
  if (state.pendingNextItem) {
    return React.createElement('div', { className: 'display-a5-pending' },
      React.createElement('div', { className: 'da5-icon' }, '⏳'),
      React.createElement('div', { className: 'da5-text' },
        React.createElement('div', { className: 'da5-title' }, 'A5 选牌官 · 等待主持人确认'),
        React.createElement('div', { className: 'da5-line' }, state.pendingNextItem.selectedBy + ' 已选了拍品 · 等待主持人确认上架')
      )
    );
  }

  // 3) 刚确认 · 5秒大提示
  if (showConfirm) {
    const it = state.items.find(i => i.id === showConfirm.itemId);
    return React.createElement('div', { className: 'display-a5-confirmed' },
      React.createElement('div', { className: 'da5-icon-big' }, '🎯'),
      React.createElement('div', { className: 'da5-title-big' }, '下一轮开锤拍品已指定'),
      React.createElement('div', { className: 'da5-item-name' }, it ? it.name : '?'),
      React.createElement('div', { className: 'da5-item-id' }, showConfirm.itemId + ' · 由 ' + showConfirm.selectedBy + ' 指定'),
      React.createElement('div', { className: 'da5-hint' }, '5秒后自动消失')
    );
  }

  return null;
}

// 玩家端 A3 护身符提示 (拥有者看优惠, 靠山看扣钱)
function PlayerA3Reward({ log, playerName }) {
  if (!log || log.length === 0) return null;
  const a3 = log.slice().reverse().find(function(e) {
    return e.type === 'a3_split' && (e.owner === playerName || e.backer === playerName) && Date.now() - e.at < 5000;
  });
  if (!a3) return null;
  const isOwner = a3.owner === playerName;
  return (
    React.createElement('div', { className: 'player-a3-reward' },
      React.createElement('div', { className: 'par-icon' }, '🛡️'),
      React.createElement('div', { className: 'par-title' }, isOwner ? '护身符 · 成交优惠' : '护身符 · 靠山被扣'),
      React.createElement('div', { className: 'par-amount' },
        isOwner ? ('实付 ' + a3.ownerPays + ' 元') : ('-' + a3.backerLoses + ' 元')
      ),
      React.createElement('div', { className: 'par-hint' },
        isOwner
          ? ('成交价 ' + a3.price + ' 元 · 靠山 ' + a3.backer + ' 扣 ' + a3.backerLoses + ' 元 (10%)')
          : (a3.owner + ' 拍到 ' + a3.itemId + ' · 你作为靠山分担')
      )
    )
  );
}

// 技能卡目标下拉 (中控)
function SkillTargetSelect({ use, setUse, state }) {
  const it = state.items.find(i => i.id === use.itemId);
  if (!it) return null;
  if (!it.useParams || !it.useParams.includes('target')) return null;
  return (
    <div className="use-row">
      <div className="use-hint">🎯 {it.name} 需要指定目标:</div>
      <select value={use.target} onChange={e => setUse(s => ({ ...s, target: e.target.value, err: '' }))}>
        <option value="">选择目标(被喊的人)...</option>
        {state.players.filter(p => p.name !== use.player).map(p =>
          <option key={p.name} value={p.name}>{p.name} (余额 {p.gold})</option>
        )}
      </select>
    </div>
  );
}

// 技能卡效果说明 (中控)
function SkillEffectHint({ use, state }) {
  const it = state.items.find(i => i.id === use.itemId);
  if (!it) return null;
  return <div className="skill-effect-hint">📜 规则: {it.effect}</div>;
}

// 玩家端 A2 奖励提示
function PlayerSilentReward({ log, playerName }) {
  if (!log || log.length === 0) return null;
  const reward = log.slice().reverse().find(function(e) {
    return e.type === 'silent_reward' && e.player === playerName && Date.now() - e.at < 5000;
  });
  if (!reward) return null;
  return (
    React.createElement('div', { className: 'player-silent-reward' },
      React.createElement('div', { className: 'psr-icon' }, '🔇'),
      React.createElement('div', { className: 'psr-title' }, '沉默是金 · 奖励到账'),
      React.createElement('div', { className: 'psr-amount' }, '+' + reward.reward + ' 元'),
      React.createElement('div', { className: 'psr-hint' }, reward.itemId + ' 成交价 ' + reward.price + ' 元 × 10%')
    )
  );
}

// ============== 中控 ==============
function Admin() {
  const state = useTick();
  const [sell, setSell] = useState({ id: null, price: '', winner: '', err: '' });
  const [use, setUse] = useState({ player: '', itemId: '', target: '', err: '' });
  const [useResult, setUseResult] = useState(null); // 使用结果, 大屏显示

  const totalGold = state.players.reduce((s, p) => s + p.gold, 0);
  const king = useMemo(() => state.players.reduce((w, p) => {
    const cnt = p.items?.length || 0;
    return (!w || cnt > w.cnt) ? { name: p.name, cnt } : w;
  }, null), [state.players]);
  const soldCount = state.items.filter(i => i.status === 'sold').length;
  const mainItems = AUCTION_ORDER.map(id => state.items.find(i => i.id === id));
  const reserveItems = RESERVE_ITEMS.map(id => state.items.find(i => i.id === id));

  const safe = fn => (...args) => { try { fn(...args); } catch (e) { alert(e.message); } };
  const handlers = {
    onList: safe(id => listItem(id)),
    onStartBid: safe(id => startBidding(id)),
    onPass: id => { if (confirm('流拍这件拍品？')) safe(id => passItem(id))(id); },
    onSell: id => setSell({ id, price: '', winner: '', err: '' }),
  };

  const confirmSell = () => {
    const p = parseInt(sell.price);
    if (!p || p <= 0) return setSell(s => ({ ...s, err: '请输入成交价' }));
    if (!sell.winner) return setSell(s => ({ ...s, err: '请选择拍到的人' }));
    try {
      const result = sellItem(sell.id, sell.winner, p);
      if (result.pending) {
        // A2 沉默是金·等待中控判定
        // 弹窗由 render 中的 pending UI 接管
        setSell({ id: null, price: '', winner: '', err: '' });
      } else {
        setSell({ id: null, price: '', winner: '', err: '' });
      }
    }
    catch (e) { setSell(s => ({ ...s, err: e.message })); }
  };

  // A2 判定: 是/否
  const judgeSilent = (stayed) => {
    confirmSilentSale(stayed);
  };
  const cancelSilent = () => {
    cancelSilentSale();
  };

  // A4 判定: 主持人拍板是否点评 → 退 10% / 不退
  const judgeA4 = (reviewed) => {
    confirmA4Review(reviewed);
  };
  const confirmUse = () => {
    if (!use.player) return setUse(s => ({ ...s, err: '请选择玩家' }));
    if (!use.itemId) return setUse(s => ({ ...s, err: '请选择技能卡' }));
    const it = state.items.find(i => i.id === use.itemId);
    const params = {};
    if (it.useParams?.includes('target')) {
      if (!use.target) return setUse(s => ({ ...s, err: '这张卡需要选目标玩家' }));
      if (use.target === use.player) return setUse(s => ({ ...s, err: '不能对自己使用' }));
      params.target = use.target;
    }
    try {
      const result = useItem(use.player, use.itemId, params);
      setUse({ player: '', itemId: '', target: '', err: '' });
      setUseResult(result);
    } catch (e) { setUse(s => ({ ...s, err: e.message })); }
  };
  const switchPhase = p => { const s = getState(); s.phase = p; commitState(s); };
  const reset = () => { if (confirm('重置？所有玩家+拍品数据清空,卡池恢复 16 张。')) resetGame(); };

  return (
    <div className="admin">
      <h1>🎛️ 主持人中控台</h1>
      <div className="subtitle">实时同步中 · {state.players.length} 位玩家 · 金币池 {totalGold}</div>

      <div className="phase-tabs">
        {['draw', 'auction', 'award'].map((p, i) => (
          <button key={p} className={'phase-tab ' + (state.phase === p ? 'active' : '')}
            onClick={() => switchPhase(p)}>
            {['🎴 抽卡', '🔨 拍卖', '🏆 颁奖'][i]}阶段
          </button>
        ))}
      </div>

      <div className="admin-grid">
        <div className="panel">
          <h2>📋 玩家列表 ({state.players.length})</h2>
          {state.silentPlayers && state.silentPlayers.length > 0 && (
            <div className="silent-banner">
              🔇 本轮「沉默是金」启用中：<b>{state.silentPlayers.join(' · ')}</b>
              <span className="silent-hint">（拍品成交时会弹窗判定）</span>
            </div>
          )}
          {state.a3Chains && Object.keys(state.a3Chains).length > 0 && (
            <div className="a3-banner">
              🛡️ 本轮「护身符」启用中：
              {Object.entries(state.a3Chains).map(([owner, backer]) => (
                <span key={owner}><b>{owner}</b> ↔ 靠山 <b>{backer}</b></span>
              ))}
              <span className="silent-hint">（成交时若为本人,实付 90% · 靠山扣 10%）</span>
            </div>
          )}
          {state.players.length === 0
            ? <div className="empty">还没有玩家抽卡</div>
            : <div className="player-list">
              {state.players.map(p => {
                const c = getCardById(p.cardId);
                const isSilent = state.silentPlayers.includes(p.name);
                const a3Backer = state.a3Chains && state.a3Chains[p.name];
                return (
                  <div key={p.name} className={'player-row' + (isSilent ? ' silent' : '') + (a3Backer ? ' a3-active' : '')}>
                    <div>
                      <div className="name">{p.name}
                        {isSilent && <span className="silent-badge">🔇 沉默</span>}
                        {a3Backer && <span className="a3-badge">🛡️ 靠山: {a3Backer}</span>}
                      </div>
                      <div className="sub-stat">拍品 {p.items?.length || 0} 件</div>
                    </div>
                    <div className="gold">💰 {p.gold}</div>
                    <div className="card-name">{c?.name || '?'}</div>
                    <div className="gold-adjust">
                      <button className="gold-btn plus" onClick={() => { try { adjustGold(p.name, 100); } catch(e) { alert(e.message); } }} title="加 100">+100</button>
                      <button className="gold-btn plus" onClick={() => { try { adjustGold(p.name, 500); } catch(e) { alert(e.message); } }} title="加 500">+500</button>
                      <button className="gold-btn minus" onClick={() => { try { adjustGold(p.name, -100); } catch(e) { alert(e.message); } }} title="扣 100">-100</button>
                      <input type="number" className="gold-input" placeholder="±" step="50"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && e.target.value !== '') {
                            const v = parseInt(e.target.value, 10);
                            if (!isNaN(v) && v !== 0) {
                              try { adjustGold(p.name, v); e.target.value = ''; } catch(err) { alert(err.message); }
                            }
                          }
                        }} title="回车确认 (正数加/负数扣)" />
                    </div>
                  </div>
                );
              })}
            </div>}
          <div className="admin-actions"><button className="btn-danger" onClick={reset}>🔄 重置游戏</button></div>
        </div>

        <div className="panel">
          <h2>📦 拍品管理 ({mainItems.length} 主拍品 + {reserveItems.length} 备用 · 成交 {soldCount})</h2>
          {state.pendingNextItem && (() => {
            const pi = state.items.find(i => i.id === state.pendingNextItem.itemId);
            return (
              <div className="a5-pending">
                <div className="a5-pending-icon">🎯</div>
                <div className="a5-pending-text">
                  <div className="a5-pending-title">A5 选牌官 · 等待确认</div>
                  <div className="a5-pending-detail">
                    {state.pendingNextItem.selectedBy} 通过私密链接选了：<b>{pi ? pi.name : '?'}</b>
                    {pi && <span className="a5-pending-price">（起拍价 {pi.startPrice}）</span>}
                  </div>
                </div>
                <div className="a5-pending-actions">
                  <button className="btn-a5-confirm" onClick={() => { try { confirmSelectedItem(); } catch(e) { alert(e.message); } }}>✅ 确认上架</button>
                  <button className="btn-a5-cancel" onClick={() => { cancelSelectedItem(); }}>❌ 撤销</button>
                </div>
              </div>
            );
          })()}
          <div className="section-divider">━━━ 主拍品 (按上架顺序) ━━━</div>
          <div className="items-grid">{mainItems.map(it => <ItemCard key={it.id} it={it} state={state} {...handlers} />)}</div>
          <div className="section-divider dim">━━━ 备用 (2 张) ━━━</div>
          <div className="items-grid">{reserveItems.map(it => <ItemCard key={it.id} it={it} state={state} {...handlers} />)}</div>
        </div>
      </div>

      <div className="admin-grid">
        <div className="panel">
          <h2>⚡ 技能卡使用</h2>
          <div className="use-row">
            <select value={use.player} onChange={e => setUse(s => ({ ...s, player: e.target.value, target: '', err: '' }))}>
              <option value="">使用者(谁要喊)...</option>
              {state.players.map(p => <option key={p.name} value={p.name}>{p.name} (余额 {p.gold})</option>)}
            </select>
            <select value={use.itemId} onChange={e => setUse(s => ({ ...s, itemId: e.target.value, target: '', err: '' }))} disabled={!use.player}>
              <option value="">{use.player ? '选择该玩家拥有的卡...' : '请先选使用者'}</option>
              {state.items.filter(i => i.owner === use.player && i.usesLeft > 0).map(i =>
                <option key={i.id} value={i.id}>{i.id} {i.name} ({i.usesLeft}/{i.maxUses})</option>
              )}
              {use.player && state.items.filter(i => i.owner === use.player && i.usesLeft > 0).length === 0 && (
                <option value="" disabled>{use.player} 还没拍到任何技能卡</option>
              )}
            </select>
          </div>
          {use.itemId && (
            <SkillTargetSelect
              use={use}
              setUse={setUse}
              state={state}
            />
          )}
          {use.itemId && (
            <SkillEffectHint
              use={use}
              state={state}
            />
          )}
          {use.err && <div className="error-box">{use.err}</div>}
          <button className="btn-primary wide" onClick={confirmUse}>▶ 使用 (扣 1 次)</button>
        </div>

        <div className="panel">
          <h2>🏆 经营王者 (拍品最多)</h2>
          {king && king.cnt > 0
            ? <div className="king-box">
              <div className="king-emoji">👑</div>
              <div className="king-name">{king.name}</div>
              <div className="king-stat">拍到 {king.cnt} 件拍品</div>
            </div>
            : <div className="empty">还没有成交记录</div>}
          <div className="admin-actions">
            <button className="btn-primary" onClick={() => switchPhase('award')}>📢 大屏揭晓</button>
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>📜 现场记录 ({state.log.length})</h2>
        <div className="log-list">
          {state.log.length === 0
            ? <div className="empty">还没有记录</div>
            : state.log.slice().reverse().map((e, i) => (
              <div key={i} className={'log-entry ' + e.type}>
                {e.type === 'sold' && `💰 ${e.winner} 拍到 ${e.itemId} · ${e.price} 元`}
                {e.type === 'silent_reward' && `🔇 ${e.player} 沉默是金奖励 +${e.reward} 元 (${e.itemId} 成交价 ${e.price} × 10%)`}
                {e.type === 'silent_no_reward' && `🔇 ${e.player} 沉默是金未达奖励 (${e.itemId} 成交价 ${e.price})`}
                {e.type === 'a3_split' && `🛡️ ${e.owner} 护身符·靠山 ${e.backer} 分担 · 实付 ${e.ownerPays} 靠山扣 ${e.backerLoses} (${e.itemId} 成交价 ${e.price})`}
                {e.type === 'a3_fail' && `🛡️ 护身符失效: ${e.reason} (${e.itemId})`}
                {e.type === 'passed' && `🚫 ${e.itemId} 流拍`}
                {e.type === 'used' && `⚡ ${e.player} 使用了 ${e.itemId} · ${e.effect}`}
              </div>
            ))}
        </div>
      </div>

      {sell.id && (
        <div className="modal-backdrop" onClick={() => setSell(s => ({ ...s, id: null }))}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>🏷️ 成交登记</h2>
            <div className="modal-sub">拍品: {state.items.find(i => i.id === sell.id)?.name}</div>
            <div className="form-row">
              <div className="form-label">成交价</div>
              <input type="number" value={sell.price} autoFocus
                onChange={e => setSell(s => ({ ...s, price: e.target.value, err: '' }))}
                placeholder="输入成交价" />
            </div>
            <div className="form-row">
              <div className="form-label">拍到的人</div>
              <select value={sell.winner} onChange={e => setSell(s => ({ ...s, winner: e.target.value, err: '' }))}>
                <option value="">选择玩家...</option>
                {state.players.map(p => <option key={p.name} value={p.name}>{p.name} (余额 {p.gold})</option>)}
              </select>
            </div>
            {sell.err && <div className="error-box">{sell.err}</div>}
            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => setSell(s => ({ ...s, id: null }))}>取消</button>
              <button className="btn-primary" onClick={confirmSell}>确认成交</button>
            </div>
          </div>
        </div>
      )}

      {useResult && (
        <div className="modal-backdrop" onClick={() => setUseResult(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className={useResult.success ? 'result-success' : 'result-fail'}>
              {useResult.success ? '✅ 使用成功!' : '❌ 使用失败!'}
            </h2>
            <div className="modal-sub">技能卡已扣 1 次</div>
            <div className="result-message">{useResult.message}</div>
            <div className="modal-buttons">
              <button className="btn-primary" onClick={() => setUseResult(null)}>✓ 知道了</button>
            </div>
          </div>
        </div>
      )}

      {/* A2 沉默是金 · 成交判定弹窗 (中控专属) */}
      {state.pendingSale && (
        <div className="silent-modal">
          <div className="silent-modal-box">
            <div className="silent-modal-icon">🔇</div>
            <div className="silent-modal-title">沉默是金 · 判定</div>
            <div className="silent-modal-q">
              <span className="silent-name">{state.pendingSale.silentPlayer}</span> 启用了「沉默是金」<br/>
              拍品「{(state.items.find(i => i.id === state.pendingSale.itemId) || {}).name}」
              以 <span className="silent-price">{state.pendingSale.price}</span> 元成交给 <b>{state.pendingSale.winner}</b>
              <div className="silent-q-main">本轮 {state.pendingSale.silentPlayer} 真的没叫价吗？</div>
            </div>
            <div className="silent-reward-hint">
              「是」→ <b>{state.pendingSale.silentPlayer}</b> 获 <span className="silent-reward-num">
                {Math.floor(state.pendingSale.price * 0.1)}
              </span> 元 (成交价 10%)<br/>
              「否」→ 不获得奖励
            </div>
            <div className="silent-modal-actions">
              <button className="btn-silent-yes" onClick={() => judgeSilent(true)}>✅ 是 · 真没叫价</button>
              <button className="btn-silent-no" onClick={() => judgeSilent(false)}>❌ 否 · 叫过价</button>
              <button className="btn-silent-cancel" onClick={cancelSilent}>↩ 取消成交</button>
            </div>
          </div>
        </div>
      )}

      {/* A4 导师答疑券 · 拍品成交判定弹窗 (中控专属) */}
      {state.pendingA4Review && (
        <div className="a4-modal">
          <div className="a4-modal-box">
            <div className="a4-modal-icon">🎓</div>
            <div className="a4-modal-title">导师答疑券 · 判定</div>
            <div className="a4-modal-q">
              <span className="a4-name">{state.pendingA4Review.winner}</span> 已激活 A4<br/>
              拍品「{(state.items.find(i => i.id === state.pendingA4Review.itemId) || {}).name}」
              以 <span className="a4-price">{state.pendingA4Review.price}</span> 元成交
              <div className="a4-q-main">{state.pendingA4Review.winner} 现场点评了吗？</div>
            </div>
            <div className="a4-reward-hint">
              「是点评」→ 退回 <span className="a4-discount-num">{state.pendingA4Review.discount}</span> 元 (成交价 10%) 给 {state.pendingA4Review.winner}<br/>
              「否没评」→ 不退
            </div>
            <div className="a4-modal-actions">
              <button className="btn-a4-yes" onClick={() => judgeA4(true)}>✅ 是 · 点评了 · 退 10%</button>
              <button className="btn-a4-no" onClick={() => judgeA4(false)}>❌ 否 · 没点评 · 不退</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== 玩家端 ==============
const PLAYER_NAME_KEY = 'card-game-player-name';

function Player() {
  const state = useTick();
  const [name, setName] = useState(localStorage.getItem(PLAYER_NAME_KEY) || '');
  const [inputName, setInputName] = useState('');
  const [error, setError] = useState('');
  const [mockery, setMockery] = useState('');
  const [saved, setSaved] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [zoom, setZoom] = useState(null);

  useEscape(() => {
    if (zoom) setZoom(null);
    else if (viewItem) setViewItem(null);
  });

  const player = name ? getPlayer(name) : null;
  const card = player ? getCardById(player.cardId) : null;
  const myItems = useMemo(
    () => player ? (player.items || []).map(id => state.items.find(i => i.id === id)).filter(Boolean) : [],
    [player, state.items]
  );

  useEffect(() => {
    if (player) setMockery(player.selfMockery || card?.selfMockery || '');
  }, [player?.name, player?.selfMockery]);

  const login = () => {
    const n = inputName.trim();
    if (!n) return setError('请输入姓名');
    if (!getPlayer(n)) return setError('找不到你的抽卡记录, 请确认姓名, 或先到大屏抽卡');
    setName(n); localStorage.setItem(PLAYER_NAME_KEY, n); setError('');
  };
  const logout = () => {
    if (!confirm('确定要退出登录吗？')) return;
    localStorage.removeItem(PLAYER_NAME_KEY);
    setName(''); setInputName(''); setMockery(''); setError('');
  };
  const saveMockery = () => {
    if (!name) return;
    try { updateSelfMockery(name, mockery); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    catch (e) { setError(e.message); }
  };

  if (!name) return <PlayerLogin inputName={inputName} setInputName={setInputName} error={error} onLogin={login} />;
  if (!player) return <PlayerNotFound name={name} onBack={() => { localStorage.removeItem(PLAYER_NAME_KEY); setName(''); setInputName(''); setError(''); setMockery(''); }} />;

  return (
    <div className="player">
      <button onClick={logout} className="btn-logout" title="退出登录">🚪 退出登录</button>
      <div className="player-info">
        <div className="greeting">👋 你好,</div>
        <div className="name-big">{player.name}</div>

        <div className="balance-card">
          <div className="label">我的余额</div>
          <div className="amount">💰 {player.gold}</div>
        </div>

        {/* 玩家端: A2 沉默是金奖励 (5秒内提示, 仅提示自己) */}
        <PlayerSilentReward log={state.log} playerName={player.name} />

        {/* 玩家端: A3 护身符 (5秒内提示, 拥有者/靠山都看) */}
        <PlayerA3Reward log={state.log} playerName={player.name} />

        {card && <>
          <div className="player-card-img"><img src={card.image} alt={card.name} /></div>
          <div className="card-title">{card.name}</div>
        </>}

        {myItems.length > 0 && (
          <div className="player-section">
            <h3>🎁 我拍到的拍品 ({myItems.length})</h3>
            <div className="player-items-list">
              {myItems.map(it => (
                <div key={it.id}
                  className={'player-item-tile ' + (it.usesLeft === 0 ? 'used-up' : '')}
                  onClick={() => setViewItem(it)}>
                  <img src={it.front} alt={it.name} />
                  <div className="uses-badge">{it.usesLeft}/{it.maxUses}</div>
                  <div className="owner-tag">{it.owner}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mockery-input">
          <div className="label">💬 我的自嘲语</div>
          <textarea value={mockery}
            onChange={e => { setMockery(e.target.value); setSaved(false); }}
            placeholder="说点什么..." maxLength={100} />
          {card && (!player.selfMockery || player.selfMockery === card.selfMockery) &&
            <div className="default-text">默认: {card.selfMockery}</div>}
          <button onClick={saveMockery}>保存</button>
          {saved && <div className="saved">✓ 已保存</div>}
        </div>
      </div>

      {viewItem && (
        <div className="item-modal-backdrop" onClick={() => setViewItem(null)}>
          <div className="item-modal" onClick={e => e.stopPropagation()}>
            <button className="item-modal-close" onClick={() => setViewItem(null)}>✕ 关闭</button>
            <div className="item-modal-title">
              {viewItem.id} · {viewItem.name}
              <span className="item-modal-uses">剩余 {viewItem.usesLeft}/{viewItem.maxUses} 次</span>
            </div>
            <div className="item-modal-3up">
              {[
                { src: viewItem.front, label: '📇 展示页' },
                { src: viewItem.back, label: '📋 规则页' },
                { src: viewItem.comic, label: '🎬 解释页' },
              ].map(p => (
                <div key={p.label} className="item-modal-pane" onClick={() => setZoom(p)}>
                  <img src={p.src} alt={p.label} />
                  <div className="item-modal-label">{p.label}</div>
                </div>
              ))}
            </div>
            <div className="item-modal-hint">点图放大 · 点空白处关闭</div>
          </div>
        </div>
      )}

      <Lightbox data={zoom} onClose={() => setZoom(null)} />
    </div>
  );
}

function PlayerLogin({ inputName, setInputName, error, onLogin }) {
  return (
    <div className="player">
      <div className="player-login">
        <h1>📱 我的私人账本</h1>
        <div className="sub">第一次使用, 请输入你的姓名登录</div>
        <input autoFocus value={inputName}
          onChange={e => { setInputName(e.target.value); }}
          onKeyDown={e => e.key === 'Enter' && onLogin()}
          placeholder="请输入你的姓名" maxLength={20} />
        {error && <div className="error-box">{error}</div>}
        <button onClick={onLogin}>进入我的账本</button>
      </div>
    </div>
  );
}

function PlayerNotFound({ name, onBack }) {
  return (
    <div className="player">
      <div className="player-login">
        <h1>📱 我的私人账本</h1>
        <div className="greeting-static">👋 {name}</div>
        <div className="error-box" style={{ marginTop: 20 }}>
          还没找到你的抽卡记录<br />
          <span style={{ fontSize: 13 }}>请先在主持人大屏输入 "{name}" 抽卡</span>
        </div>
        <button onClick={onBack} className="btn-secondary" style={{ marginTop: 20 }}>
          ← 返回重新输入姓名
        </button>
      </div>
    </div>
  );
}

// ============== 路由 ==============
function App() {
  const path = window.location.pathname;
  if (path.indexOf('admin') !== -1) return <Admin />;
  if (path.indexOf('player') !== -1) return <Player />;
  return <Display />;
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
