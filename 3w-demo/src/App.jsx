import { useState, useRef, useEffect } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Pretendard:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #080c0a; --surface: #0f1510; --card: #131a14; --card2: #161e17;
    --accent: #00e5a0; --accent-dim: #00b87a; --accent-glow: rgba(0,229,160,0.12);
    --accent-glow2: rgba(0,229,160,0.06); --white: #eef5f0; --gray: #6b7c70;
    --gray-light: #9bb0a0; --border: rgba(0,229,160,0.1); --border-dim: rgba(255,255,255,0.05);
    --red: #ff4d4d; --orange: #ff9a3c; --yellow: #ffd740;
  }
  body { font-family: 'Pretendard', sans-serif; background: var(--bg); color: var(--white); min-height: 100vh; overflow-x: hidden; }
  body::after {
    content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image: linear-gradient(var(--border-dim) 1px, transparent 1px), linear-gradient(90deg, var(--border-dim) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  .app { position: relative; z-index: 1; max-width: 960px; margin: 0 auto; padding: 32px 24px 64px; }
  .header { text-align: center; padding: 40px 0 36px; }
  .header-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--accent-glow2); border: 1px solid var(--border);
    padding: 6px 14px; margin-bottom: 20px;
    font-family: 'DM Mono', monospace; font-size: 10px; color: var(--accent); letter-spacing: 0.18em;
  }
  .badge-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); animation: blink 2s infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
  .header h1 { font-size: 36px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 10px; }
  .header h1 em { font-style: normal; color: var(--accent); }
  .header p { font-size: 14px; color: var(--gray); max-width: 420px; margin: 0 auto; line-height: 1.7; }
  .tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); border: 1px solid var(--border); margin-bottom: 28px; }
  .tab { padding: 16px 20px; cursor: pointer; background: var(--surface); display: flex; align-items: center; gap: 10px; transition: background 0.2s; font-size: 14px; font-weight: 600; color: var(--gray); border-bottom: 2px solid transparent; }
  .tab:hover { background: var(--card); }
  .tab.active { background: var(--card); color: var(--white); border-bottom-color: var(--accent); }
  .tab-icon { font-size: 18px; }
  .tab-sub { font-size: 11px; font-weight: 400; color: var(--gray); margin-top: 1px; display: block; }
  .panel { animation: fadeIn 0.3s ease; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .chat-setup { background: var(--card); border: 1px solid var(--border); padding: 20px 22px; margin-bottom: 16px; }
  .chat-setup-label { font-family: 'DM Mono', monospace; font-size: 9px; color: var(--accent); letter-spacing: 0.2em; margin-bottom: 14px; }
  .setup-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .setup-field label { font-size: 11px; color: var(--gray); display: block; margin-bottom: 6px; }
  .setup-field input, .setup-field select { width: 100%; background: var(--bg); border: 1px solid var(--border-dim); color: var(--white); padding: 9px 12px; font-size: 13px; font-family: 'Pretendard', sans-serif; outline: none; transition: border-color 0.2s; }
  .setup-field input:focus, .setup-field select:focus { border-color: var(--accent); }
  .setup-field select option { background: #0f1510; }
  .chat-window { background: var(--surface); border: 1px solid var(--border-dim); height: 360px; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; scroll-behavior: smooth; }
  .chat-window::-webkit-scrollbar { width: 4px; }
  .chat-window::-webkit-scrollbar-thumb { background: var(--border); }
  .msg { display: flex; flex-direction: column; gap: 4px; max-width: 82%; }
  .msg.user { align-self: flex-end; align-items: flex-end; }
  .msg.bot { align-self: flex-start; }
  .msg-label { font-family: 'DM Mono', monospace; font-size: 9px; color: var(--gray); letter-spacing: 0.1em; }
  .msg-bubble { padding: 11px 15px; font-size: 13px; line-height: 1.65; }
  .msg.user .msg-bubble { background: var(--accent-glow); border: 1px solid var(--border); color: var(--white); }
  .msg.bot .msg-bubble { background: var(--card2); border: 1px solid var(--border-dim); color: var(--white); }
  .msg.bot .msg-bubble.typing { color: var(--gray); font-style: italic; }
  .chat-input-row { display: flex; gap: 8px; margin-top: 10px; }
  .chat-input { flex: 1; background: var(--card); border: 1px solid var(--border-dim); color: var(--white); padding: 11px 14px; font-size: 13px; font-family: 'Pretendard', sans-serif; outline: none; transition: border-color 0.2s; height: 46px; }
  .chat-input:focus { border-color: var(--accent); }
  .chat-input::placeholder { color: var(--gray); }
  .send-btn { background: var(--accent); color: #000; padding: 0 20px; font-size: 13px; font-weight: 700; font-family: 'Pretendard', sans-serif; border: none; cursor: pointer; transition: opacity 0.2s; white-space: nowrap; }
  .send-btn:hover { opacity: 0.85; }
  .send-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .quick-btns { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
  .quick-btn { background: transparent; border: 1px solid var(--border); color: var(--gray-light); padding: 6px 12px; font-size: 11px; font-family: 'Pretendard', sans-serif; cursor: pointer; transition: all 0.2s; }
  .quick-btn:hover { border-color: var(--accent); color: var(--accent); }
  .scorer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .scorer-input-card { background: var(--card); border: 1px solid var(--border-dim); padding: 24px; }
  .scorer-input-card h3 { font-family: 'DM Mono', monospace; font-size: 9px; color: var(--accent); letter-spacing: 0.2em; margin-bottom: 20px; }
  .slider-row { margin-bottom: 22px; }
  .slider-row-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .slider-label { font-size: 13px; font-weight: 600; color: var(--white); }
  .slider-val { font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500; color: var(--accent); min-width: 36px; text-align: right; }
  .slider-desc { font-size: 11px; color: var(--gray); margin-bottom: 8px; }
  input[type=range] { width: 100%; -webkit-appearance: none; height: 3px; background: var(--border-dim); outline: none; cursor: pointer; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; background: var(--accent); border-radius: 50%; cursor: pointer; transition: transform 0.15s; }
  input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.3); }
  .calc-btn { width: 100%; background: var(--accent); color: #000; padding: 13px; font-size: 14px; font-weight: 800; font-family: 'Pretendard', sans-serif; border: none; cursor: pointer; transition: opacity 0.2s; margin-top: 6px; }
  .calc-btn:hover { opacity: 0.85; }
  .result-card { background: var(--card); border: 1px solid var(--border-dim); padding: 24px; display: flex; flex-direction: column; }
  .result-card h3 { font-family: 'DM Mono', monospace; font-size: 9px; color: var(--accent); letter-spacing: 0.2em; margin-bottom: 20px; }
  .risk-display { text-align: center; padding: 24px 0 20px; }
  .risk-score-label { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--gray); letter-spacing: 0.15em; margin-bottom: 8px; }
  .risk-score-num { font-size: 72px; font-weight: 900; line-height: 1; letter-spacing: -0.04em; transition: color 0.4s; }
  .risk-score-num.low { color: var(--accent); }
  .risk-score-num.mid { color: var(--yellow); }
  .risk-score-num.high { color: var(--orange); }
  .risk-score-num.crit { color: var(--red); }
  .risk-badge { display: inline-block; padding: 5px 16px; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; margin-top: 10px; }
  .risk-badge.low { background: rgba(0,229,160,0.12); color: var(--accent); }
  .risk-badge.mid { background: rgba(255,215,64,0.12); color: var(--yellow); }
  .risk-badge.high { background: rgba(255,154,60,0.12); color: var(--orange); }
  .risk-badge.crit { background: rgba(255,77,77,0.12); color: var(--red); }
  .score-bar-wrap { margin: 16px 0; }
  .score-bar-bg { height: 4px; background: var(--border-dim); position: relative; }
  .score-bar-fill { height: 4px; transition: width 0.6s cubic-bezier(0.34,1.56,0.64,1), background 0.4s; position: absolute; top: 0; left: 0; }
  .care-section-label { font-family: 'DM Mono', monospace; font-size: 9px; color: var(--gray); letter-spacing: 0.15em; margin: 16px 0 10px; }
  .care-items { display: flex; flex-direction: column; gap: 6px; }
  .care-item { display: flex; align-items: center; gap: 10px; background: var(--card2); border: 1px solid var(--border-dim); padding: 10px 12px; font-size: 12px; color: var(--white); animation: slideIn 0.3s ease; }
  @keyframes slideIn { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
  .care-icon { font-size: 15px; flex-shrink: 0; }
  .care-text strong { display: block; font-size: 12px; font-weight: 600; }
  .care-text span { font-size: 10px; color: var(--gray); }
  .empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: var(--gray); padding: 32px 0; }
  .empty-state p { font-size: 13px; text-align: center; line-height: 1.6; }
  @media (max-width: 640px) {
    .setup-grid { grid-template-columns: 1fr; }
    .scorer-grid { grid-template-columns: 1fr; }
    .header h1 { font-size: 26px; }
  }
`;

const QUICK = ["연차는 어떻게 신청해?", "슬랙 채널 구조 알려줘", "코드 리뷰 프로세스?", "복지 제도가 뭐가 있어?"];

function getCareItems(score) {
  if (score < 30) return [{ icon: "📱", title: "AI 힐링 앱 추천", desc: "명상 가이드 5분 · 수면 루틴 설정" }];
  if (score < 55) return [
    { icon: "📱", title: "AI 힐링 앱 — 감정 일기 시작", desc: "주 3회 스트레스 체크인 권장" },
    { icon: "🧘", title: "팀 단위 스트레칭 프로그램", desc: "주 1회 15분 · 출장 강사 연결 가능" },
  ];
  if (score < 75) return [
    { icon: "💬", title: "비대면 심리상담 1회 연결", desc: "익명 처리 · 50분 · 즉시 예약 가능" },
    { icon: "🧘", title: "출장 명상/요가 강사 매칭", desc: "팀 단위 그룹 케어 프로그램 추천" },
    { icon: "📅", title: "연차 사용 권고 알림 발송", desc: "HR 담당자에게 자동 리포트 전송" },
  ];
  return [
    { icon: "🚨", title: "긴급 심리상담 즉시 연결", desc: "당일 예약 · 전담 상담사 배정" },
    { icon: "📅", title: "강제 연차 사용 권고", desc: "관리자 알림 + 일정 조율 지원" },
    { icon: "🧘", title: "1:1 전담 웰니스 코치 매칭", desc: "2주 집중 케어 프로그램" },
    { icon: "👥", title: "팀장 면담 자동 일정 요청", desc: "번아웃 원인 파악 및 업무 재조정" },
  ];
}

function getRiskLevel(score) {
  if (score < 30) return { level: "low", label: "관심 — NORMAL", color: "var(--accent)" };
  if (score < 55) return { level: "mid", label: "주의 — CAUTION", color: "var(--yellow)" };
  if (score < 75) return { level: "high", label: "경고 — WARNING", color: "var(--orange)" };
  return { level: "crit", label: "위험 — CRITICAL", color: "var(--red)" };
}

function ChatDemo() {
  const [company, setCompany] = useState("쓰리더블유");
  const [role, setRole] = useState("개발자");
  const [messages, setMessages] = useState([
    { role: "bot", text: "안녕하세요 👋 저는 쓰리더블유 AI 온보딩 어시스턴트입니다.\n입사 첫날 궁금한 것들을 편하게 물어보세요!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const systemPrompt = `당신은 ${company}의 AI 온보딩 어시스턴트입니다. 신규 입사자(직군: ${role})를 돕는 역할입니다.
회사 정보: HR SaaS 업종 / 근무 09~18시 탄력근무 / 점심 12~13시 식대 월 10만원 / 연차 월 1일 발생(HR 시스템에서 신청) / 슬랙 채널: #general #dev #design #hr #lunch / 코드리뷰: PR에 2명 이상 approve 필요 / 복지: 노트북 선택 지원·도서비 월 3만원·야근 야식 지원 / 툴: Notion·Slack·Figma·GitHub·Jira
친절하고 명확하게, 한국어로, 3~5문장 이내로 답변하세요. 불확실한 정보는 HR 담당자 확인을 권유하세요.`;

  async function send(text) {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    const history = messages.map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text }));

    try {
      // ✅ Vercel 서버리스 함수로 요청 — API 키는 서버에만 존재
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: systemPrompt, messages: [...history, { role: "user", content: userMsg }] }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "죄송해요, 잠시 오류가 발생했어요.";
      setMessages(prev => [...prev, { role: "bot", text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "bot", text: "연결 오류가 발생했어요. 잠시 후 다시 시도해주세요." }]);
    }
    setLoading(false);
  }

  return (
    <div className="panel">
      <div className="chat-setup">
        <div className="chat-setup-label">COMPANY SETUP</div>
        <div className="setup-grid">
          <div className="setup-field">
            <label>회사명</label>
            <input value={company} onChange={e => setCompany(e.target.value)} placeholder="쓰리더블유" />
          </div>
          <div className="setup-field">
            <label>내 직군</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              {["개발자","디자이너","PM / 기획자","마케터","세일즈","HR 담당자"].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role === "user" ? "user" : "bot"}`}>
            <span className="msg-label">{m.role === "user" ? "입사자" : "AI 어시스턴트"}</span>
            <div className="msg-bubble" style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
          </div>
        ))}
        {loading && <div className="msg bot"><span className="msg-label">AI 어시스턴트</span><div className="msg-bubble typing">답변 생성 중...</div></div>}
        <div ref={bottomRef} />
      </div>
      <div className="quick-btns">
        {QUICK.map(q => <button key={q} className="quick-btn" onClick={() => send(q)}>{q}</button>)}
      </div>
      <div className="chat-input-row">
        <input className="chat-input" placeholder="궁금한 것을 입력하세요..." value={input}
          onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} disabled={loading} />
        <button className="send-btn" onClick={() => send()} disabled={loading || !input.trim()}>전송</button>
      </div>
    </div>
  );
}

function ScorerDemo() {
  const [overtime, setOvertime] = useState(8);
  const [consecutive, setConsecutive] = useState(2);
  const [leaveRate, setLeaveRate] = useState(40);
  const [holiday, setHoliday] = useState(1);
  const [result, setResult] = useState(null);

  function handleCalc() {
    const score = Math.round(Math.min(
      Math.min(overtime / 20 * 35, 35) +
      Math.min(consecutive / 7 * 25, 25) +
      (leaveRate / 100) * 25 +
      Math.min(holiday / 4 * 15, 15), 100
    ));
    setResult(score);
  }

  const risk = result !== null ? getRiskLevel(result) : null;
  const careItems = result !== null ? getCareItems(result) : [];

  return (
    <div className="panel">
      <div className="scorer-grid">
        <div className="scorer-input-card">
          <h3>근태 데이터 입력</h3>
          {[
            { label: "주간 초과 근무", val: overtime, set: setOvertime, min: 0, max: 20, unit: "h", desc: "법정 40시간 초과분 (주 기준)" },
            { label: "연속 야근 일수", val: consecutive, set: setConsecutive, min: 0, max: 7, unit: "일", desc: "최근 연속으로 야근한 일수" },
            { label: "연차 미소진율", val: leaveRate, set: setLeaveRate, min: 0, max: 100, unit: "%", desc: "분기 기준 사용 안 한 연차 비율" },
            { label: "월 휴일 근무", val: holiday, set: setHoliday, min: 0, max: 4, unit: "회", desc: "이번 달 주말/공휴일 출근 횟수" },
          ].map(s => (
            <div className="slider-row" key={s.label}>
              <div className="slider-row-header">
                <span className="slider-label">{s.label}</span>
                <span className="slider-val">{s.val}{s.unit}</span>
              </div>
              <div className="slider-desc">{s.desc}</div>
              <input type="range" min={s.min} max={s.max} value={s.val} onChange={e => s.set(+e.target.value)} />
            </div>
          ))}
          <button className="calc-btn" onClick={handleCalc}>리스크 스코어 계산</button>
        </div>
        <div className="result-card">
          <h3>번아웃 리스크 진단</h3>
          {result === null ? (
            <div className="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
              <p>슬라이더를 조정하고<br/>버튼을 눌러 리스크를 진단하세요</p>
            </div>
          ) : (
            <>
              <div className="risk-display">
                <div className="risk-score-label">BURNOUT RISK SCORE</div>
                <div className={`risk-score-num ${risk.level}`}>{result}</div>
                <div className={`risk-badge ${risk.level}`}>{risk.label}</div>
              </div>
              <div className="score-bar-wrap">
                <div className="score-bar-bg">
                  <div className="score-bar-fill" style={{ width: `${result}%`, background: risk.color }} />
                </div>
              </div>
              <div className="care-section-label">추천 케어 수단</div>
              <div className="care-items">
                {careItems.map((item, i) => (
                  <div className="care-item" key={i} style={{ animationDelay: `${i * 0.07}s` }}>
                    <span className="care-icon">{item.icon}</span>
                    <div className="care-text"><strong>{item.title}</strong><span>{item.desc}</span></div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState(0);
  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="header">
          <div className="header-badge"><div className="badge-dot" />LIVE DEMO — 3W HR SAAS</div>
          <h1>실시간 <em>기능 시연</em></h1>
          <p>AI 온보딩 챗봇과 번아웃 리스크 스코어러를<br/>직접 체험해보세요.</p>
        </div>
        <div className="tabs">
          <div className={`tab ${tab === 0 ? "active" : ""}`} onClick={() => setTab(0)}>
            <span className="tab-icon">🤖</span>
            <div>AI 온보딩 챗봇<span className="tab-sub">입사자 Q&A · 실시간 응답</span></div>
          </div>
          <div className={`tab ${tab === 1 ? "active" : ""}`} onClick={() => setTab(1)}>
            <span className="tab-icon">🔥</span>
            <div>번아웃 리스크 스코어러<span className="tab-sub">근태 데이터 → 케어 수단 추천</span></div>
          </div>
        </div>
        {tab === 0 ? <ChatDemo /> : <ScorerDemo />}
      </div>
    </>
  );
}
