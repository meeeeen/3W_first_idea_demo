import { useState, useRef, useEffect } from "react";

const MOCK_EMPLOYEES = [
  { id: 1, name: "김지훈", role: "개발자", dept: "개발팀", startDate: "2026-02-03", avatar: "김", tasks: { total: 12, done: 11 }, status: "완료" },
  { id: 2, name: "이수진", role: "디자이너", dept: "디자인팀", startDate: "2026-02-03", avatar: "이", tasks: { total: 10, done: 7 }, status: "진행중" },
  { id: 3, name: "박현우", role: "PM", dept: "프로덕트팀", startDate: "2026-02-10", avatar: "박", tasks: { total: 11, done: 4 }, status: "지연" },
  { id: 4, name: "최아름", role: "마케터", dept: "마케팅팀", startDate: "2026-02-17", avatar: "최", tasks: { total: 9, done: 9 }, status: "완료" },
  { id: 5, name: "정도윤", role: "개발자", dept: "개발팀", startDate: "2026-03-03", avatar: "정", tasks: { total: 12, done: 2 }, status: "진행중" },
];

const MOCK_BURNOUT = [
  { id: 1, name: "박성민", dept: "개발팀", role: "개발자", overtime: 16, consecutive: 5, leaveRate: 85, holiday: 3 },
  { id: 2, name: "김나연", dept: "디자인팀", role: "디자이너", overtime: 4, consecutive: 1, leaveRate: 20, holiday: 0 },
  { id: 3, name: "이준혁", dept: "프로덕트팀", role: "PM", overtime: 10, consecutive: 3, leaveRate: 60, holiday: 2 },
  { id: 4, name: "최민서", dept: "마케팅팀", role: "마케터", overtime: 2, consecutive: 0, leaveRate: 10, holiday: 0 },
  { id: 5, name: "한소희", dept: "개발팀", role: "개발자", overtime: 18, consecutive: 6, leaveRate: 90, holiday: 4 },
  { id: 6, name: "오지훈", dept: "세일즈팀", role: "세일즈", overtime: 7, consecutive: 2, leaveRate: 45, holiday: 1 },
];

const QUICK_CATEGORIES = [
  { label: "🏢 회사 생활", questions: ["점심시간이 몇 시야?", "탄력근무제 어떻게 써?", "야근하면 뭐 지원돼?", "재택근무 가능해?"] },
  { label: "🛠️ 업무 도구", questions: ["슬랙 채널 구조 알려줘", "노션 어떻게 접속해?", "지라 이슈 어떻게 만들어?", "피그마 권한은 어떻게 받아?"] },
  { label: "📋 인사 / 복지", questions: ["연차는 어떻게 신청해?", "복지 제도가 뭐가 있어?", "도서 지원 어떻게 받아?", "장비 신청 어떻게 해?"] },
  { label: "💻 개발 프로세스", questions: ["코드 리뷰 프로세스가 어떻게 돼?", "브랜치 전략이 어떻게 돼?", "배포는 누가 해?", "스프린트 사이클이 어떻게 돼?"] },
];

const DEFAULT_SETTINGS = {
  company: "쓰리더블유",
  industry: "HR SaaS (인사관리 소프트웨어)",
  workHours: "09:00~18:00 (탄력근무 가능, 코어타임 10~16시)",
  lunch: "12:00~13:00 / 식대 월 10만원",
  leave: "월 1일 발생, HR 시스템에서 신청",
  welfare: "노트북 선택 지원, 도서비 월 3만원, 야근 야식 지원, 건강검진 연 1회",
  slackChannels: "#general #dev #design #product #hr #lunch #random #help-it",
  tools: "Notion, Slack, Figma, GitHub, Jira, Google Workspace",
  devProcess: "Git Flow, PR 2명 이상 Approve, 2주 스프린트",
};

function calcScore({ overtime, consecutive, leaveRate, holiday }) {
  return Math.round(Math.min(
    Math.min(overtime / 20 * 35, 35) +
    Math.min(consecutive / 7 * 25, 25) +
    (leaveRate / 100) * 25 +
    Math.min(holiday / 4 * 15, 15), 100
  ));
}

function getRisk(score) {
  if (score < 30) return { level: "low", label: "정상", color: "#00e5a0", bg: "rgba(0,229,160,0.1)" };
  if (score < 55) return { level: "mid", label: "주의", color: "#ffd740", bg: "rgba(255,215,64,0.1)" };
  if (score < 75) return { level: "high", label: "경고", color: "#ff9a3c", bg: "rgba(255,154,60,0.1)" };
  return { level: "crit", label: "위험", color: "#ff4d4d", bg: "rgba(255,77,77,0.1)" };
}

function getCare(score) {
  if (score < 30) return [{ icon: "📱", t: "AI 힐링 앱 추천", d: "명상 가이드 5분 · 수면 루틴 설정" }];
  if (score < 55) return [
    { icon: "📱", t: "AI 힐링 앱 — 감정 일기 시작", d: "주 3회 스트레스 체크인 권장" },
    { icon: "🧘", t: "팀 단위 스트레칭 프로그램", d: "주 1회 15분 · 출장 강사 연결" },
  ];
  if (score < 75) return [
    { icon: "💬", t: "비대면 심리상담 1회 연결", d: "익명 처리 · 50분 · 즉시 예약" },
    { icon: "🧘", t: "출장 명상/요가 강사 매칭", d: "팀 단위 그룹 케어 프로그램" },
    { icon: "📅", t: "연차 사용 권고 알림 발송", d: "HR 담당자에게 자동 리포트 전송" },
  ];
  return [
    { icon: "🚨", t: "긴급 심리상담 즉시 연결", d: "당일 예약 · 전담 상담사 배정" },
    { icon: "📅", t: "강제 연차 사용 권고", d: "관리자 알림 + 일정 조율 지원" },
    { icon: "🧘", t: "1:1 전담 웰니스 코치 매칭", d: "2주 집중 케어 프로그램" },
    { icon: "👥", t: "팀장 면담 자동 일정 요청", d: "번아웃 원인 파악 및 업무 재조정" },
  ];
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Pretendard:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #080c0a; --surface: #0f1510; --card: #131a14; --card2: #161e17;
    --accent: #00e5a0; --accent-dim: #00b87a;
    --accent-glow: rgba(0,229,160,0.12); --accent-glow2: rgba(0,229,160,0.05);
    --white: #eef5f0; --gray: #6b7c70; --gray-light: #9bb0a0;
    --border: rgba(0,229,160,0.1); --border-dim: rgba(255,255,255,0.05);
    --red: #ff4d4d; --orange: #ff9a3c; --yellow: #ffd740;
  }
  body { font-family: 'Pretendard', sans-serif; background: var(--bg); color: var(--white); min-height: 100vh; overflow-x: hidden; }
  body::after {
    content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image: linear-gradient(var(--border-dim) 1px, transparent 1px),linear-gradient(90deg, var(--border-dim) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  .app { position: relative; z-index: 1; max-width: 1000px; margin: 0 auto; padding: 28px 24px 64px; }
  .header { text-align: center; padding: 32px 0 28px; }
  .header-badge { display: inline-flex; align-items: center; gap: 8px; background: var(--accent-glow2); border: 1px solid var(--border); padding: 6px 14px; margin-bottom: 16px; font-family: 'DM Mono', monospace; font-size: 10px; color: var(--accent); letter-spacing: 0.18em; }
  .badge-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); animation: blink 2s infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
  .header h1 { font-size: 32px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 8px; }
  .header h1 em { font-style: normal; color: var(--accent); }
  .header p { font-size: 13px; color: var(--gray); line-height: 1.7; }

  .settings-toggle { display: flex; align-items: center; justify-content: space-between; background: var(--card); border: 1px solid var(--border-dim); padding: 12px 18px; cursor: pointer; margin-bottom: 1px; transition: background 0.2s; user-select: none; }
  .settings-toggle:hover { background: var(--card2); }
  .settings-toggle-left { display: flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 600; color: var(--gray-light); }
  .settings-toggle-arrow { font-size: 10px; color: var(--gray); transition: transform 0.2s; }
  .settings-toggle-arrow.open { transform: rotate(180deg); }
  .settings-panel { background: var(--card); border: 1px solid var(--border-dim); border-top: none; padding: 20px; margin-bottom: 20px; animation: fadeIn 0.2s ease; }
  .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .s-field label { font-size: 10px; color: var(--gray); font-family: 'DM Mono', monospace; letter-spacing: 0.1em; display: block; margin-bottom: 5px; }
  .s-field input { width: 100%; background: var(--bg); border: 1px solid var(--border-dim); color: var(--white); padding: 8px 10px; font-size: 12px; font-family: 'Pretendard', sans-serif; outline: none; transition: border-color 0.2s; }
  .s-field input:focus { border-color: var(--accent); }
  .settings-save { background: var(--accent); color: #000; padding: 9px 20px; font-size: 12px; font-weight: 700; font-family: 'Pretendard', sans-serif; border: none; cursor: pointer; transition: opacity 0.2s; }
  .settings-save:hover { opacity: 0.85; }
  .settings-saved { font-size: 11px; color: var(--accent); margin-left: 10px; animation: fadeIn 0.3s ease; }

  .tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); margin-bottom: 24px; }
  .tab { padding: 14px 16px; cursor: pointer; background: var(--surface); display: flex; align-items: center; gap: 8px; transition: background 0.2s; font-size: 13px; font-weight: 600; color: var(--gray); border-bottom: 2px solid transparent; }
  .tab:hover { background: var(--card); }
  .tab.active { background: var(--card); color: var(--white); border-bottom-color: var(--accent); }
  .tab-icon { font-size: 16px; }
  .tab-sub { font-size: 10px; font-weight: 400; color: var(--gray); margin-top: 1px; display: block; }
  .panel { animation: fadeIn 0.25s ease; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }

  .chat-setup { background: var(--card); border: 1px solid var(--border); padding: 16px 20px; margin-bottom: 12px; }
  .chat-setup-label { font-family: 'DM Mono', monospace; font-size: 9px; color: var(--accent); letter-spacing: 0.2em; margin-bottom: 12px; }
  .setup-row { display: flex; align-items: flex-end; gap: 14px; }
  .setup-field label { font-size: 10px; color: var(--gray); display: block; margin-bottom: 5px; }
  .setup-field select { background: var(--bg); border: 1px solid var(--border-dim); color: var(--white); padding: 8px 10px; font-size: 13px; font-family: 'Pretendard', sans-serif; outline: none; transition: border-color 0.2s; }
  .setup-field select:focus { border-color: var(--accent); }
  .setup-field select option { background: #0f1510; }
  .setup-hint { font-size: 11px; color: var(--gray); padding-bottom: 2px; }

  .chat-window { background: var(--surface); border: 1px solid var(--border-dim); height: 340px; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px; scroll-behavior: smooth; }
  .chat-window::-webkit-scrollbar { width: 3px; }
  .chat-window::-webkit-scrollbar-thumb { background: var(--border); }
  .msg { display: flex; flex-direction: column; gap: 3px; max-width: 80%; }
  .msg.user { align-self: flex-end; align-items: flex-end; }
  .msg.bot { align-self: flex-start; }
  .msg-label { font-family: 'DM Mono', monospace; font-size: 8px; color: var(--gray); letter-spacing: 0.1em; }
  .msg-bubble { padding: 10px 14px; font-size: 13px; line-height: 1.7; }
  .msg.user .msg-bubble { background: var(--accent-glow); border: 1px solid var(--border); }
  .msg.bot .msg-bubble { background: var(--card2); border: 1px solid var(--border-dim); }
  .cursor { display: inline-block; width: 2px; height: 13px; background: var(--accent); margin-left: 2px; animation: blink 0.7s infinite; vertical-align: middle; }

  .chat-input-row { display: flex; gap: 8px; margin-top: 8px; }
  .chat-input { flex: 1; background: var(--card); border: 1px solid var(--border-dim); color: var(--white); padding: 10px 13px; font-size: 13px; font-family: 'Pretendard', sans-serif; outline: none; transition: border-color 0.2s; }
  .chat-input:focus { border-color: var(--accent); }
  .chat-input::placeholder { color: var(--gray); }
  .send-btn { background: var(--accent); color: #000; padding: 0 18px; font-size: 13px; font-weight: 700; font-family: 'Pretendard', sans-serif; border: none; cursor: pointer; transition: opacity 0.2s; }
  .send-btn:hover { opacity: 0.85; }
  .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .quick-cats { margin-top: 10px; display: flex; flex-direction: column; gap: 7px; }
  .quick-cat-label { font-family: 'DM Mono', monospace; font-size: 9px; color: var(--gray); letter-spacing: 0.12em; margin-bottom: 4px; }
  .quick-cat-row { display: flex; gap: 5px; flex-wrap: wrap; }
  .quick-btn { background: transparent; border: 1px solid var(--border-dim); color: var(--gray-light); padding: 5px 10px; font-size: 11px; font-family: 'Pretendard', sans-serif; cursor: pointer; transition: all 0.2s; }
  .quick-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
  .quick-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .dash-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); margin-bottom: 16px; }
  .dash-stat { background: var(--card); padding: 18px 16px; }
  .dash-stat-val { font-family: 'DM Mono', monospace; font-size: 28px; font-weight: 700; color: var(--accent); line-height: 1; margin-bottom: 4px; }
  .emp-table { background: var(--card); border: 1px solid var(--border-dim); overflow: hidden; }
  .emp-table-header { display: grid; grid-template-columns: 36px 1fr 90px 95px 120px 80px; background: var(--surface); border-bottom: 1px solid var(--border-dim); }
  .emp-th { padding: 10px 12px; font-family: 'DM Mono', monospace; font-size: 9px; color: var(--gray); letter-spacing: 0.1em; }
  .emp-row { display: grid; grid-template-columns: 36px 1fr 90px 95px 120px 80px; border-bottom: 1px solid rgba(255,255,255,0.03); transition: background 0.15s; align-items: center; }
  .emp-row:last-child { border-bottom: none; }
  .emp-row:hover { background: rgba(255,255,255,0.02); }
  .emp-td { padding: 12px 12px; font-size: 12px; }
  .emp-avatar { width: 26px; height: 26px; border-radius: 50%; background: var(--accent-glow); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: var(--accent); }
  .emp-name { font-weight: 600; font-size: 13px; }
  .emp-role { font-size: 10px; color: var(--gray); margin-top: 1px; }
  .progress-wrap { display: flex; align-items: center; gap: 6px; }
  .progress-bg { flex: 1; height: 3px; background: var(--border-dim); position: relative; }
  .progress-fill { height: 3px; position: absolute; top: 0; left: 0; }
  .progress-pct { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--gray-light); min-width: 28px; }
  .status-badge { display: inline-block; padding: 3px 8px; font-size: 10px; font-weight: 600; }
  .s완료 { background: rgba(0,229,160,0.1); color: #00e5a0; }
  .s진행중 { background: rgba(255,215,64,0.1); color: #ffd740; }
  .s지연 { background: rgba(255,77,77,0.1); color: #ff4d4d; }

  .burnout-layout { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 16px; }
  .burnout-list { background: var(--card); border: 1px solid var(--border-dim); }
  .burnout-list-header { padding: 14px 16px; border-bottom: 1px solid var(--border-dim); font-family: 'DM Mono', monospace; font-size: 9px; color: var(--accent); letter-spacing: 0.2em; }
  .burnout-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.03); cursor: pointer; transition: background 0.15s; }
  .burnout-row:last-child { border-bottom: none; }
  .burnout-row:hover { background: rgba(255,255,255,0.02); }
  .burnout-row.selected { background: var(--accent-glow2); border-left: 2px solid var(--accent); }
  .b-avatar { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
  .b-info { flex: 1; min-width: 0; }
  .b-name { font-size: 13px; font-weight: 600; }
  .b-dept { font-size: 10px; color: var(--gray); }
  .b-score-wrap { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
  .b-score-num { font-family: 'DM Mono', monospace; font-size: 16px; font-weight: 700; }
  .b-risk-label { font-size: 9px; font-weight: 700; padding: 2px 6px; }
  .burnout-detail { background: var(--card); border: 1px solid var(--border-dim); padding: 20px; }
  .bd-header { font-family: 'DM Mono', monospace; font-size: 9px; color: var(--accent); letter-spacing: 0.2em; margin-bottom: 16px; }
  .bd-name { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
  .bd-dept { font-size: 11px; color: var(--gray); margin-bottom: 16px; }
  .score-big { font-size: 56px; font-weight: 900; line-height: 1; letter-spacing: -0.04em; }
  .score-bar-bg { height: 3px; background: var(--border-dim); position: relative; margin: 10px 0 14px; }
  .score-bar-fill { height: 3px; position: absolute; top: 0; left: 0; transition: width 0.6s cubic-bezier(0.34,1.56,0.64,1); }
  .care-label { font-family: 'DM Mono', monospace; font-size: 9px; color: var(--gray); letter-spacing: 0.15em; margin-bottom: 8px; }
  .care-list { display: flex; flex-direction: column; gap: 5px; }
  .care-item { display: flex; align-items: center; gap: 9px; background: var(--card2); border: 1px solid var(--border-dim); padding: 9px 11px; animation: fadeIn 0.25s ease; }
  .care-icon { font-size: 14px; flex-shrink: 0; }
  .care-title { font-size: 11px; font-weight: 600; }
  .care-desc { font-size: 10px; color: var(--gray); }
  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; margin-bottom: 14px; }
  .stat-item { font-size: 11px; }
  .stat-k { color: var(--gray); }
  .stat-v { color: var(--white); font-family: 'DM Mono', monospace; }

  .scorer-section { margin-top: 16px; background: var(--card); border: 1px solid var(--border-dim); padding: 18px; }
  .scorer-section-label { font-family: 'DM Mono', monospace; font-size: 9px; color: var(--accent); letter-spacing: 0.2em; margin-bottom: 16px; }
  .scorer-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .slider-row { margin-bottom: 16px; }
  .slider-row-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
  .slider-label { font-size: 12px; font-weight: 600; }
  .slider-val { font-family: 'DM Mono', monospace; font-size: 12px; color: var(--accent); }
  .slider-desc { font-size: 10px; color: var(--gray); margin-bottom: 6px; }
  input[type=range] { width: 100%; -webkit-appearance: none; height: 3px; background: var(--border-dim); outline: none; cursor: pointer; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; background: var(--accent); border-radius: 50%; cursor: pointer; transition: transform 0.15s; }
  input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.3); }
  .calc-btn { width: 100%; background: var(--accent); color: #000; padding: 11px; font-size: 13px; font-weight: 800; font-family: 'Pretendard', sans-serif; border: none; cursor: pointer; transition: opacity 0.2s; margin-top: 4px; }
  .calc-btn:hover { opacity: 0.85; }
  .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: var(--gray); padding: 28px; text-align: center; }
  .empty-state p { font-size: 12px; line-height: 1.6; }

  @media (max-width: 680px) {
    .tabs { grid-template-columns: 1fr; }
    .burnout-layout { grid-template-columns: 1fr; }
    .dash-stats { grid-template-columns: 1fr 1fr; }
    .emp-table-header, .emp-row { grid-template-columns: 36px 1fr 80px 80px; }
    .settings-grid { grid-template-columns: 1fr; }
    .scorer-cols { grid-template-columns: 1fr; }
  }
`;

// ── SETTINGS ─────────────────────────────────────────────
function SettingsPanel({ settings, onSave }) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState(settings);
  const [saved, setSaved] = useState(false);
  const set = (k, v) => setLocal(p => ({ ...p, [k]: v }));
  const handleSave = () => { onSave(local); setSaved(true); setTimeout(() => setSaved(false), 2000); setOpen(false); };
  return (
    <div style={{ marginBottom: open ? 0 : 20 }}>
      <div className="settings-toggle" onClick={() => setOpen(p => !p)}>
        <div className="settings-toggle-left"><span>🏢</span> 회사 정보 커스텀 설정 — 챗봇이 이 정보를 기반으로 답변합니다</div>
        <span className={`settings-toggle-arrow ${open ? "open" : ""}`}>▼</span>
      </div>
      {open && (
        <div className="settings-panel">
          <div className="settings-grid">
            {[
              ["company", "회사명"], ["industry", "업종"],
              ["workHours", "근무 시간"], ["lunch", "점심 / 식대"],
              ["leave", "연차 정책"], ["welfare", "복지 항목"],
              ["slackChannels", "슬랙 채널"], ["tools", "주요 툴"],
              ["devProcess", "개발 프로세스"],
            ].map(([k, label]) => (
              <div className="s-field" key={k}>
                <label>{label}</label>
                <input value={local[k]} onChange={e => set(k, e.target.value)} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 14 }}>
            <button className="settings-save" onClick={handleSave}>저장하기</button>
            {saved && <span className="settings-saved">✓ 저장됐어요! 챗봇에 즉시 반영됩니다</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── CHAT ─────────────────────────────────────────────────
function ChatDemo({ settings }) {
  const [role, setRole] = useState("개발자");
  const [messages, setMessages] = useState([
    { role: "bot", text: `안녕하세요 👋 저는 ${settings.company} AI 온보딩 어시스턴트입니다.\n입사 첫날 궁금한 것들을 편하게 물어보세요!` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const buildPrompt = () =>
    `당신은 ${settings.company}의 AI 온보딩 어시스턴트입니다. 신규 입사자(직군: ${role})를 돕습니다.

회사명: ${settings.company} / 업종: ${settings.industry}
근무: ${settings.workHours} / 점심: ${settings.lunch}
연차: ${settings.leave} / 복지: ${settings.welfare}
슬랙 채널: ${settings.slackChannels}
툴: ${settings.tools}
개발 프로세스: ${settings.devProcess}

입사 첫 주 체크리스트: Google·Slack·Notion·GitHub·Jira 계정 확인 → 노트북·장비 수령 → 출입증 수령 → 팀 온보딩 미팅 → 사내 규정 숙지
호칭: 영어 이름/닉네임 사용 / 의사결정: 데이터 기반, Notion에 기록 / 회의: 아젠다 없는 회의 지양

한국어로, 친절하고 명확하게, 3~6문장 이내로 답변하세요.
직군(${role})에 맞는 내용을 우선 안내하고, 불확실하면 HR 담당자(#hr 채널) 확인을 권유하세요.`;

  async function send(text) {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput("");
    const history = messages.map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text }));
    setMessages(prev => [...prev, { role: "user", text: userMsg }, { role: "bot", text: "", streaming: true }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: buildPrompt(), messages: [...history, { role: "user", content: userMsg }] }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "content_block_delta" && parsed.delta?.text) {
              full += parsed.delta.text;
              setMessages(prev => { const n = [...prev]; n[n.length-1] = { role: "bot", text: full, streaming: true }; return n; });
            }
          } catch {}
        }
      }
      setMessages(prev => { const n = [...prev]; n[n.length-1] = { role: "bot", text: full, streaming: false }; return n; });
    } catch {
      setMessages(prev => { const n = [...prev]; n[n.length-1] = { role: "bot", text: "연결 오류가 발생했어요. 잠시 후 다시 시도해주세요." }; return n; });
    }
    setLoading(false);
  }

  return (
    <div className="panel">
      <div className="chat-setup">
        <div className="chat-setup-label">ONBOARDING CHATBOT</div>
        <div className="setup-row">
          <div className="setup-field">
            <label>내 직군</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              {["개발자","디자이너","PM / 기획자","마케터","세일즈","HR 담당자","데이터 분석가"].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <span className="setup-hint">← 직군 선택 시 관련 내용을 우선 안내해요</span>
        </div>
      </div>
      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role === "user" ? "user" : "bot"}`}>
            <span className="msg-label">{m.role === "user" ? "입사자" : "AI 어시스턴트"}</span>
            <div className="msg-bubble" style={{ whiteSpace: "pre-wrap" }}>
              {m.text}{m.streaming && <span className="cursor" />}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="quick-cats">
        {QUICK_CATEGORIES.map(cat => (
          <div key={cat.label}>
            <div className="quick-cat-label">{cat.label}</div>
            <div className="quick-cat-row">
              {cat.questions.map(q => <button key={q} className="quick-btn" onClick={() => send(q)} disabled={loading}>{q}</button>)}
            </div>
          </div>
        ))}
      </div>
      <div className="chat-input-row">
        <input className="chat-input" placeholder="궁금한 것을 입력하세요..." value={input}
          onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} disabled={loading} />
        <button className="send-btn" onClick={() => send()} disabled={loading || !input.trim()}>전송</button>
      </div>
    </div>
  );
}

// ── HR DASHBOARD ─────────────────────────────────────────
function HRDashboard() {
  const avgRate = Math.round(MOCK_EMPLOYEES.reduce((a, e) => a + e.tasks.done / e.tasks.total, 0) / MOCK_EMPLOYEES.length * 100);
  return (
    <div className="panel">
      <div className="dash-stats">
        {[
          { val: MOCK_EMPLOYEES.length, label: "이번 달 신규 입사자" },
          { val: `${avgRate}%`, label: "평균 온보딩 완료율" },
          { val: MOCK_EMPLOYEES.filter(e => e.status === "완료").length, label: "온보딩 완료" },
          { val: MOCK_EMPLOYEES.filter(e => e.status === "지연").length, label: "지연 — 관리 필요", danger: true },
        ].map((s, i) => (
          <div className="dash-stat" key={i}>
            <div className="dash-stat-val" style={s.danger ? { color: "var(--orange)" } : {}}>{s.val}</div>
            <div style={{ fontSize: 11, color: "var(--gray)" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="emp-table">
        <div className="emp-table-header">
          <div className="emp-th"></div>
          <div className="emp-th">입사자</div>
          <div className="emp-th">부서</div>
          <div className="emp-th">입사일</div>
          <div className="emp-th">온보딩 진행률</div>
          <div className="emp-th">상태</div>
        </div>
        {MOCK_EMPLOYEES.map(e => {
          const pct = Math.round(e.tasks.done / e.tasks.total * 100);
          const barColor = e.status === "완료" ? "#00e5a0" : e.status === "지연" ? "#ff4d4d" : "#ffd740";
          return (
            <div className="emp-row" key={e.id}>
              <div className="emp-td"><div className="emp-avatar">{e.avatar}</div></div>
              <div className="emp-td"><div className="emp-name">{e.name}</div><div className="emp-role">{e.role}</div></div>
              <div className="emp-td" style={{ fontSize: 12, color: "var(--gray-light)" }}>{e.dept}</div>
              <div className="emp-td" style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "var(--gray)" }}>{e.startDate}</div>
              <div className="emp-td">
                <div className="progress-wrap">
                  <div className="progress-bg"><div className="progress-fill" style={{ width: `${pct}%`, background: barColor }} /></div>
                  <span className="progress-pct">{pct}%</span>
                </div>
                <div style={{ fontSize: 10, color: "var(--gray)", marginTop: 3 }}>{e.tasks.done}/{e.tasks.total} 완료</div>
              </div>
              <div className="emp-td"><span className={`status-badge s${e.status}`}>{e.status}</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── BURNOUT ───────────────────────────────────────────────
function BurnoutPanel() {
  const [selected, setSelected] = useState(null);
  const [overtime, setOvertime] = useState(8);
  const [consecutive, setConsecutive] = useState(2);
  const [leaveRate, setLeaveRate] = useState(40);
  const [holiday, setHoliday] = useState(1);
  const [scorerResult, setScorerResult] = useState(null);
  const employees = MOCK_BURNOUT.map(e => ({ ...e, score: calcScore(e) }));
  const sel = selected !== null ? employees.find(e => e.id === selected) : null;
  const selRisk = sel ? getRisk(sel.score) : null;

  return (
    <div className="panel">
      <div className="burnout-layout">
        <div className="burnout-list">
          <div className="burnout-list-header">직원 번아웃 리스크 현황 — 클릭 시 케어 플랜 확인</div>
          {employees.map(e => {
            const r = getRisk(e.score);
            return (
              <div key={e.id} className={`burnout-row ${selected === e.id ? "selected" : ""}`} onClick={() => setSelected(e.id)}>
                <div className="b-avatar" style={{ background: r.bg, color: r.color }}>{e.name[0]}</div>
                <div className="b-info">
                  <div className="b-name">{e.name}</div>
                  <div className="b-dept">{e.dept} · {e.role}</div>
                </div>
                <div className="b-score-wrap">
                  <span className="b-score-num" style={{ color: r.color }}>{e.score}</span>
                  <span className="b-risk-label" style={{ background: r.bg, color: r.color }}>{r.label}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="burnout-detail">
          <div className="bd-header">케어 플랜 상세</div>
          {!sel ? (
            <div className="empty-state">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
              <p>왼쪽에서 직원을 선택하면<br/>리스크 분석과 케어 수단이 표시됩니다</p>
            </div>
          ) : (
            <>
              <div className="bd-name">{sel.name}</div>
              <div className="bd-dept">{sel.dept} · {sel.role}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
                <div className="score-big" style={{ color: selRisk.color }}>{sel.score}</div>
                <span className="b-risk-label" style={{ background: selRisk.bg, color: selRisk.color, fontSize: 11 }}>{selRisk.label}</span>
              </div>
              <div className="score-bar-bg"><div className="score-bar-fill" style={{ width: `${sel.score}%`, background: selRisk.color }} /></div>
              <div className="stats-grid">
                {[["주간 초과 근무", `${sel.overtime}h`], ["연속 야근", `${sel.consecutive}일`], ["연차 미소진율", `${sel.leaveRate}%`], ["월 휴일 근무", `${sel.holiday}회`]].map(([k, v]) => (
                  <div key={k} className="stat-item"><span className="stat-k">{k}: </span><span className="stat-v">{v}</span></div>
                ))}
              </div>
              <div className="care-label">추천 케어 수단</div>
              <div className="care-list">
                {getCare(sel.score).map((c, i) => (
                  <div className="care-item" key={i}>
                    <span className="care-icon">{c.icon}</span>
                    <div><div className="care-title">{c.t}</div><div className="care-desc">{c.d}</div></div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="scorer-section">
        <div className="scorer-section-label">직접 계산 — 개인 리스크 스코어러</div>
        <div className="scorer-cols">
          <div>
            {[
              { label: "주간 초과 근무", val: overtime, set: setOvertime, min: 0, max: 20, unit: "h", desc: "법정 40시간 초과분" },
              { label: "연속 야근 일수", val: consecutive, set: setConsecutive, min: 0, max: 7, unit: "일", desc: "최근 연속 야근" },
              { label: "연차 미소진율", val: leaveRate, set: setLeaveRate, min: 0, max: 100, unit: "%", desc: "분기 기준 미사용 비율" },
              { label: "월 휴일 근무", val: holiday, set: setHoliday, min: 0, max: 4, unit: "회", desc: "주말/공휴일 출근 횟수" },
            ].map(s => (
              <div className="slider-row" key={s.label}>
                <div className="slider-row-header"><span className="slider-label">{s.label}</span><span className="slider-val">{s.val}{s.unit}</span></div>
                <div className="slider-desc">{s.desc}</div>
                <input type="range" min={s.min} max={s.max} value={s.val} onChange={e => s.set(+e.target.value)} />
              </div>
            ))}
            <button className="calc-btn" onClick={() => setScorerResult(calcScore({ overtime, consecutive, leaveRate, holiday }))}>리스크 스코어 계산</button>
          </div>
          <div>
            {scorerResult === null ? (
              <div className="empty-state" style={{ height: "100%" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
                <p>슬라이더를 조정하고<br/>버튼을 눌러 진단하세요</p>
              </div>
            ) : (() => {
              const r = getRisk(scorerResult);
              return (
                <div>
                  <div style={{ textAlign: "center", padding: "16px 0 12px" }}>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "var(--gray)", letterSpacing: "0.15em", marginBottom: 6 }}>BURNOUT RISK SCORE</div>
                    <div style={{ fontSize: 60, fontWeight: 900, color: r.color, lineHeight: 1 }}>{scorerResult}</div>
                    <div style={{ display: "inline-block", padding: "4px 12px", background: r.bg, color: r.color, fontSize: 11, fontWeight: 700, marginTop: 8 }}>{r.label}</div>
                  </div>
                  <div className="score-bar-bg"><div className="score-bar-fill" style={{ width: `${scorerResult}%`, background: r.color }} /></div>
                  <div className="care-list" style={{ marginTop: 10 }}>
                    {getCare(scorerResult).map((c, i) => (
                      <div className="care-item" key={i}>
                        <span className="care-icon">{c.icon}</span>
                        <div><div className="care-title">{c.t}</div><div className="care-desc">{c.d}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState(0);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="header">
          <div className="header-badge"><div className="badge-dot" />LIVE DEMO — 3W HR SAAS</div>
          <h1>실시간 <em>기능 시연</em></h1>
          <p>AI 온보딩 챗봇 · HR 대시보드 · 번아웃 리스크 스코어러</p>
        </div>
        <SettingsPanel settings={settings} onSave={setSettings} />
        <div className="tabs">
          {[
            { icon: "🤖", title: "AI 온보딩 챗봇", sub: "입사자 Q&A · 실시간 스트리밍" },
            { icon: "📊", title: "HR 온보딩 현황", sub: "입사자별 진행률 모니터링" },
            { icon: "🔥", title: "번아웃 리스크", sub: "직원 위험군 감지 · 케어 추천" },
          ].map((t, i) => (
            <div key={i} className={`tab ${tab === i ? "active" : ""}`} onClick={() => setTab(i)}>
              <span className="tab-icon">{t.icon}</span>
              <div>{t.title}<span className="tab-sub">{t.sub}</span></div>
            </div>
          ))}
        </div>
        {tab === 0 && <ChatDemo settings={settings} />}
        {tab === 1 && <HRDashboard />}
        {tab === 2 && <BurnoutPanel />}
      </div>
    </>
  );
}
