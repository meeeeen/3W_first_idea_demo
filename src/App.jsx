import { useState, useRef, useEffect } from "react";

// ── 데이터 ────────────────────────────────────────────────
const TASK_GROUPS = {
  공통: [
    { id: "t01", label: "출입증 수령",                  desc: "HR 데스크에서 수령" },
    { id: "t02", label: "노트북 · 장비 수령",            desc: "IT 담당자에게 수령 확인" },
    { id: "t03", label: "Google Workspace 계정 설정",   desc: "회사 이메일·캘린더 세팅" },
    { id: "t04", label: "Slack 가입 및 채널 구독",       desc: "#general #hr #lunch 등 필수 채널" },
    { id: "t05", label: "Notion 접속 및 사내 위키 열람", desc: "취업규칙·복지 가이드 확인" },
    { id: "t06", label: "팀 온보딩 미팅 참석",           desc: "팀장 주관 1:1 또는 팀 미팅" },
    { id: "t07", label: "인사 서류 제출",                desc: "근로계약서·개인정보 동의서 등" },
    { id: "t08", label: "보안 교육 이수",                desc: "정보보안 서약서 서명 포함" },
  ],
  개발자: [
    { id: "d01", label: "GitHub 조직 초대 수락",  desc: "개발팀 Org 접근 권한 확인" },
    { id: "d02", label: "로컬 개발 환경 세팅",    desc: "README 기준으로 환경 구성" },
    { id: "d03", label: "Jira 프로젝트 접근 설정", desc: "스프린트 보드 접근 확인" },
    { id: "d04", label: "첫 PR 코드 리뷰 참여",   desc: "기존 PR에 리뷰어로 참여" },
  ],
  디자이너: [
    { id: "ds01", label: "Figma 팀 접근 권한 요청", desc: "디자인팀 Figma 조직 초대" },
    { id: "ds02", label: "디자인 시스템 열람",      desc: "컴포넌트·토큰 구조 파악" },
  ],
  PM: [
    { id: "p01", label: "Jira 프로젝트 전체 열람",        desc: "로드맵·백로그·스프린트 현황" },
    { id: "p02", label: "PRD 템플릿 확인",                desc: "Notion 기획 문서 형식 숙지" },
    { id: "p03", label: "주요 이해관계자 미팅 일정 잡기", desc: "개발·디자인 팀장 1:1 예약" },
  ],
  마케터: [
    { id: "m01", label: "마케팅 채널 접근 권한 획득", desc: "GA·Meta·검색광고 계정 추가" },
    { id: "m02", label: "브랜드 가이드라인 열람",     desc: "Notion 브랜드 에셋 폴더 확인" },
  ],
};

const MOCK_EMPLOYEES = [
  { id:1, name:"김지훈", role:"개발자", dept:"개발팀",    startDate:"2026-02-03", avatar:"김", status:"완료",  doneIds:["t01","t02","t03","t04","t05","t06","t07","t08","d01","d02","d03","d04"], taskKeys:["공통","개발자"] },
  { id:2, name:"이수진", role:"디자이너", dept:"디자인팀", startDate:"2026-02-03", avatar:"이", status:"진행중", doneIds:["t01","t02","t03","t04","t05","t06","ds01"],                            taskKeys:["공통","디자이너"] },
  { id:3, name:"박현우", role:"PM",      dept:"프로덕트팀",startDate:"2026-02-10", avatar:"박", status:"지연",  doneIds:["t01","t02","t03"],                                                      taskKeys:["공통","PM"] },
  { id:4, name:"최아름", role:"마케터",  dept:"마케팅팀",  startDate:"2026-02-17", avatar:"최", status:"완료",  doneIds:["t01","t02","t03","t04","t05","t06","t07","t08","m01","m02"],            taskKeys:["공통","마케터"] },
  { id:5, name:"정도윤", role:"개발자",  dept:"개발팀",    startDate:"2026-03-03", avatar:"정", status:"진행중", doneIds:["t01","t02"],                                                            taskKeys:["공통","개발자"] },
].map(e => {
  const allTasks = e.taskKeys.flatMap(k => TASK_GROUPS[k]);
  return { ...e, tasks: { total: allTasks.length, done: e.doneIds.length } };
});

const MOCK_BURNOUT = [
  { id:1, name:"박성민", dept:"개발팀",   role:"개발자",  overtime:16, consecutive:5, leaveRate:85, holiday:3 },
  { id:2, name:"김나연", dept:"디자인팀", role:"디자이너", overtime:4,  consecutive:1, leaveRate:20, holiday:0 },
  { id:3, name:"이준혁", dept:"프로덕트팀",role:"PM",     overtime:10, consecutive:3, leaveRate:60, holiday:2 },
  { id:4, name:"최민서", dept:"마케팅팀", role:"마케터",  overtime:2,  consecutive:0, leaveRate:10, holiday:0 },
  { id:5, name:"한소희", dept:"개발팀",   role:"개발자",  overtime:18, consecutive:6, leaveRate:90, holiday:4 },
  { id:6, name:"오지훈", dept:"세일즈팀", role:"세일즈",  overtime:7,  consecutive:2, leaveRate:45, holiday:1 },
];

const QUICK_CATEGORIES = [
  { label:"🏢 회사 생활",    questions:["점심시간이 몇 시야?","탄력근무제 어떻게 써?","야근하면 뭐 지원돼?","재택근무 가능해?"] },
  { label:"🛠️ 업무 도구",   questions:["슬랙 채널 구조 알려줘","노션 어떻게 접속해?","지라 이슈 어떻게 만들어?","피그마 권한은 어떻게 받아?"] },
  { label:"📋 인사 / 복지",  questions:["연차는 어떻게 신청해?","복지 제도가 뭐가 있어?","도서 지원 어떻게 받아?","장비 신청 어떻게 해?"] },
  { label:"💻 개발 프로세스", questions:["코드 리뷰 프로세스가 어떻게 돼?","브랜치 전략이 어떻게 돼?","배포는 누가 해?","스프린트 사이클이 어떻게 돼?"] },
];

const DEFAULT_SETTINGS = {
  company:      "쓰리더블유",
  industry:     "HR SaaS (인사관리 소프트웨어)",
  workHours:    "09:00~18:00 (탄력근무 가능, 코어타임 10~16시)",
  lunch:        "12:00~13:00 / 식대 월 10만원",
  leave:        "월 1일 발생, HR 시스템에서 신청",
  welfare:      "노트북 선택 지원, 도서비 월 3만원, 야근 야식 지원, 건강검진 연 1회",
  slackChannels:"#general #dev #design #product #hr #lunch #random #help-it",
  tools:        "Notion, Slack, Figma, GitHub, Jira, Google Workspace",
  devProcess:   "Git Flow, PR 2명 이상 Approve, 2주 스프린트",
};

// ── 유틸 ────────────────────────────────────────────────
function calcScore({ overtime, consecutive, leaveRate, holiday }) {
  return Math.round(Math.min(
    Math.min(overtime / 20 * 35, 35) +
    Math.min(consecutive / 7 * 25, 25) +
    (leaveRate / 100) * 25 +
    Math.min(holiday / 4 * 15, 15),
    100
  ));
}

// 리스크 등급 → 색상 토큰 (동적이라 inline style로 사용)
function getRisk(score) {
  if (score < 30) return { label:"정상", color:"#00e5a0", bg:"rgba(0,229,160,0.1)" };
  if (score < 55) return { label:"주의", color:"#ffd740", bg:"rgba(255,215,64,0.1)" };
  if (score < 75) return { label:"경고", color:"#ff9a3c", bg:"rgba(255,154,60,0.1)" };
  return             { label:"위험", color:"#ff4d4d", bg:"rgba(255,77,77,0.1)" };
}

function getCare(score) {
  if (score < 30) return [{ icon:"📱", t:"AI 힐링 앱 추천",          d:"명상 가이드 5분 · 수면 루틴 설정" }];
  if (score < 55) return [
    { icon:"📱", t:"AI 힐링 앱 — 감정 일기 시작", d:"주 3회 스트레스 체크인 권장" },
    { icon:"🧘", t:"팀 단위 스트레칭 프로그램",   d:"주 1회 15분 · 출장 강사 연결" },
  ];
  if (score < 75) return [
    { icon:"💬", t:"비대면 심리상담 1회 연결",   d:"익명 처리 · 50분 · 즉시 예약" },
    { icon:"🧘", t:"출장 명상/요가 강사 매칭",   d:"팀 단위 그룹 케어 프로그램" },
    { icon:"📅", t:"연차 사용 권고 알림 발송",   d:"HR 담당자에게 자동 리포트 전송" },
  ];
  return [
    { icon:"🚨", t:"긴급 심리상담 즉시 연결",        d:"당일 예약 · 전담 상담사 배정" },
    { icon:"📅", t:"강제 연차 사용 권고",            d:"관리자 알림 + 일정 조율 지원" },
    { icon:"🧘", t:"1:1 전담 웰니스 코치 매칭",      d:"2주 집중 케어 프로그램" },
    { icon:"👥", t:"팀장 면담 자동 일정 요청",       d:"번아웃 원인 파악 및 업무 재조정" },
  ];
}

// 온보딩 상태 → Tailwind 클래스
function statusCls(status) {
  return {
    완료:  "bg-accent/10 text-accent",
    진행중: "bg-yellow-400/10 text-yellow-400",
    지연:  "bg-red-500/10 text-red-400",
  }[status] ?? "bg-white/5 text-muted";
}

// 온보딩 진행률 바 색상
function progressColor(status) {
  return { 완료:"#00e5a0", 지연:"#ff4d4d", 진행중:"#ffd740" }[status] ?? "#ffd740";
}

// ── 공통 UI 조각 ─────────────────────────────────────────
function MonoLabel({ children, className = "" }) {
  return (
    <p className={`font-mono text-[9px] text-accent tracking-[0.2em] ${className}`}>
      {children}
    </p>
  );
}

function EmptyState({ icon, children }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted text-center">
      <div className="opacity-30">{icon}</div>
      <p className="text-xs leading-relaxed">{children}</p>
    </div>
  );
}

function CareItem({ icon, t, d }) {
  return (
    <div className="flex items-center gap-2.5 bg-card2 border border-white/5 px-3 py-2.5 animate-fadeSlideIn">
      <span className="text-sm shrink-0">{icon}</span>
      <div>
        <div className="text-[11px] font-semibold text-cream">{t}</div>
        <div className="text-[10px] text-muted mt-0.5">{d}</div>
      </div>
    </div>
  );
}

// ── 설정 패널 ────────────────────────────────────────────
function SettingsPanel({ settings, onSave }) {
  const [open,  setOpen]  = useState(false);
  const [local, setLocal] = useState(settings);
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setLocal(p => ({ ...p, [k]: v }));
  const handleSave = () => {
    onSave(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setOpen(false);
  };

  const fields = [
    ["company",       "회사명"],
    ["industry",      "업종"],
    ["workHours",     "근무 시간"],
    ["lunch",         "점심 / 식대"],
    ["leave",         "연차 정책"],
    ["welfare",       "복지 항목"],
    ["slackChannels", "슬랙 채널"],
    ["tools",         "주요 툴"],
    ["devProcess",    "개발 프로세스"],
  ];

  return (
    <div className="mb-5">
      {/* 토글 헤더 */}
      <div
        onClick={() => setOpen(p => !p)}
        className="flex items-center justify-between bg-card border border-white/5 px-4 py-3 cursor-pointer mb-px transition-colors hover:bg-card2 select-none"
      >
        <span className="flex items-center gap-2.5 text-xs font-semibold text-muted-light">
          🏢 회사 정보 커스텀 설정 — 챗봇이 이 정보를 기반으로 답변합니다
        </span>
        <span className={`text-[10px] text-muted transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </div>

      {/* 설정 본문 */}
      {open && (
        <div className="bg-card border border-white/5 border-t-0 p-5 animate-fadeSlideIn">
          <div className="grid grid-cols-2 gap-3">
            {fields.map(([k, label]) => (
              <div key={k}>
                <label className="block font-mono text-[10px] text-muted tracking-widest mb-1.5">{label}</label>
                <input
                  value={local[k]}
                  onChange={e => set(k, e.target.value)}
                  className="w-full bg-bg border border-white/5 text-cream px-2.5 py-2 text-xs font-sans outline-none focus:border-accent transition-colors"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleSave}
              className="bg-accent text-bg text-xs font-bold px-5 py-2 hover:opacity-85 transition-opacity"
            >
              저장하기
            </button>
            {saved && (
              <span className="text-[11px] text-accent animate-fadeSlideIn">
                ✓ 저장됐어요! 챗봇에 즉시 반영됩니다
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 챗봇 ─────────────────────────────────────────────────
function ChatDemo({ settings }) {
  const [role,     setRole]     = useState("개발자");
  const [messages, setMessages] = useState([
    { role:"bot", text:`안녕하세요 👋 저는 ${settings.company} AI 온보딩 어시스턴트입니다.\n입사 첫날 궁금한 것들을 편하게 물어보세요!` }
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

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
    setMessages(prev => [...prev, { role:"user", text:userMsg }, { role:"bot", text:"", streaming:true }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ system: buildPrompt(), messages: [...history, { role:"user", content:userMsg }] }),
      });
      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "", full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream:true });
        const lines = buffer.split("\n"); buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "content_block_delta" && parsed.delta?.text) {
              full += parsed.delta.text;
              setMessages(prev => { const n=[...prev]; n[n.length-1]={ role:"bot", text:full, streaming:true }; return n; });
            }
          } catch {}
        }
      }
      setMessages(prev => { const n=[...prev]; n[n.length-1]={ role:"bot", text:full }; return n; });
    } catch {
      setMessages(prev => { const n=[...prev]; n[n.length-1]={ role:"bot", text:"연결 오류가 발생했어요. 잠시 후 다시 시도해주세요." }; return n; });
    }
    setLoading(false);
  }

  return (
    <div className="animate-fadeSlideIn">
      {/* 셋업 바 */}
      <div className="bg-card border border-accent/10 px-5 py-4 mb-3">
        <MonoLabel className="mb-3">ONBOARDING CHATBOT</MonoLabel>
        <div className="flex items-end gap-4">
          <div>
            <label className="block text-[10px] text-muted mb-1.5">내 직군</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="bg-bg border border-white/5 text-cream px-2.5 py-2 text-sm font-sans outline-none focus:border-accent transition-colors"
            >
              {["개발자","디자이너","PM / 기획자","마케터","세일즈","HR 담당자","데이터 분석가"].map(r =>
                <option key={r} style={{ background:"#0f1510" }}>{r}</option>
              )}
            </select>
          </div>
          <span className="text-[11px] text-muted pb-0.5">← 직군 선택 시 관련 내용을 우선 안내해요</span>
        </div>
      </div>

      {/* 채팅 창 */}
      <div className="bg-surface border border-white/5 h-[340px] overflow-y-auto p-3.5 flex flex-col gap-2.5 scrollbar-thin">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col gap-1 max-w-[80%] ${m.role === "user" ? "self-end items-end" : "self-start"}`}>
            <span className="font-mono text-[8px] text-muted tracking-wider">
              {m.role === "user" ? "입사자" : "AI 어시스턴트"}
            </span>
            <div className={`px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-accent/10 border border-accent/10"
                : "bg-card2 border border-white/5"
            }`}>
              {m.text}
              {m.streaming && <span className="chat-cursor" />}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 퀵 버튼 */}
      <div className="mt-2.5 flex flex-col gap-2">
        {QUICK_CATEGORIES.map(cat => (
          <div key={cat.label}>
            <p className="font-mono text-[9px] text-muted tracking-[0.12em] mb-1">{cat.label}</p>
            <div className="flex gap-1.5 flex-wrap">
              {cat.questions.map(q => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  disabled={loading}
                  className="border border-white/5 text-muted-light px-2.5 py-1.5 text-[11px] font-sans bg-transparent
                             hover:border-accent hover:text-accent transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 입력 */}
      <div className="flex gap-2 mt-2">
        <input
          className="flex-1 bg-card border border-white/5 text-cream px-3.5 py-2.5 text-[13px] font-sans
                     outline-none focus:border-accent transition-colors placeholder:text-muted"
          placeholder="궁금한 것을 입력하세요..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          disabled={loading}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="bg-accent text-bg px-5 text-[13px] font-bold font-sans hover:opacity-85
                     transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
        >
          전송
        </button>
      </div>
    </div>
  );
}

// ── HR 대시보드 ───────────────────────────────────────────
function HRDashboard() {
  const [selectedId, setSelectedId] = useState(null);
  const avgRate = Math.round(
    MOCK_EMPLOYEES.reduce((a, e) => a + e.tasks.done / e.tasks.total, 0) / MOCK_EMPLOYEES.length * 100
  );
  const sel = MOCK_EMPLOYEES.find(e => e.id === selectedId) ?? null;

  const kpis = [
    { val: MOCK_EMPLOYEES.length,                                   label:"이번 달 신규 입사자" },
    { val: `${avgRate}%`,                                           label:"평균 온보딩 완료율" },
    { val: MOCK_EMPLOYEES.filter(e => e.status === "완료").length,  label:"온보딩 완료" },
    { val: MOCK_EMPLOYEES.filter(e => e.status === "지연").length,  label:"지연 — 관리 필요", danger:true },
  ];

  return (
    <div className="animate-fadeSlideIn">
      {/* KPI 카드 */}
      <div className="grid grid-cols-4 gap-px bg-accent/10 border border-accent/10 mb-4">
        {kpis.map((k, i) => (
          <div key={i} className="bg-card px-4 py-4">
            <div className={`font-mono text-3xl font-bold leading-none mb-1 ${k.danger ? "text-[#ff9a3c]" : "text-accent"}`}>
              {k.val}
            </div>
            <div className="text-[11px] text-muted">{k.label}</div>
          </div>
        ))}
      </div>

      {/* 목록 + 상세 */}
      <div className="grid gap-4" style={{ gridTemplateColumns:"1fr 380px" }}>
        {/* 직원 테이블 */}
        <div className="bg-card border border-white/5 overflow-hidden">
          {/* 헤더 */}
          <div className="grid bg-surface border-b border-white/5"
               style={{ gridTemplateColumns:"36px 1fr 90px 95px 1fr 80px" }}>
            {["","입사자","부서","입사일","온보딩 진행률","상태"].map((h, i) => (
              <div key={i} className="px-3 py-2.5 font-mono text-[9px] text-muted tracking-[0.1em]">{h}</div>
            ))}
          </div>
          {/* 행 */}
          {MOCK_EMPLOYEES.map(e => {
            const pct = Math.round(e.tasks.done / e.tasks.total * 100);
            const isSelected = selectedId === e.id;
            return (
              <div
                key={e.id}
                onClick={() => setSelectedId(p => p === e.id ? null : e.id)}
                className={`grid items-center border-b border-white/[0.03] last:border-b-0 cursor-pointer transition-colors
                            ${isSelected ? "bg-accent/5 border-l-2 border-l-accent" : "hover:bg-white/[0.02]"}`}
                style={{ gridTemplateColumns:"36px 1fr 90px 95px 1fr 80px" }}
              >
                {/* 아바타 */}
                <div className="px-3 py-3">
                  <div className="w-[26px] h-[26px] rounded-full bg-accent/10 border border-accent/10 flex items-center justify-center text-[10px] font-bold text-accent">
                    {e.avatar}
                  </div>
                </div>
                {/* 이름 */}
                <div className="px-3 py-3">
                  <div className="text-[13px] font-semibold text-cream">{e.name}</div>
                  <div className="text-[10px] text-muted mt-0.5">{e.role}</div>
                </div>
                {/* 부서 */}
                <div className="px-3 py-3 text-xs text-muted-light">{e.dept}</div>
                {/* 입사일 */}
                <div className="px-3 py-3 font-mono text-[11px] text-muted">{e.startDate}</div>
                {/* 진행률 */}
                <div className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-[3px] bg-white/5 relative">
                      <div
                        className="h-[3px] absolute top-0 left-0 progress-fill"
                        style={{ width:`${pct}%`, background: progressColor(e.status) }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-muted-light w-7">{pct}%</span>
                  </div>
                  <div className="text-[10px] text-muted mt-0.5">{e.tasks.done}/{e.tasks.total} 완료</div>
                </div>
                {/* 상태 */}
                <div className="px-3 py-3">
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold ${statusCls(e.status)}`}>
                    {e.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 상세 패널 */}
        <div className="bg-card border border-white/5 flex flex-col overflow-hidden">
          {!sel ? (
            <EmptyState
              icon={
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="1"/>
                  <path d="M9 12h6M9 16h4"/>
                </svg>
              }
            >
              왼쪽에서 입사자를 클릭하면<br/>온보딩 태스크 상세를 확인할 수 있어요
            </EmptyState>
          ) : (
            <>
              {/* 상세 헤더 */}
              <div className="px-4 py-4 border-b border-white/5">
                <MonoLabel className="mb-2.5">ONBOARDING DETAIL</MonoLabel>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/10 flex items-center justify-center text-sm font-bold text-accent shrink-0">
                    {sel.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-black text-cream">{sel.name}</div>
                    <div className="text-[11px] text-muted mt-0.5">{sel.dept} · {sel.role} · 입사 {sel.startDate}</div>
                  </div>
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold ${statusCls(sel.status)}`}>
                    {sel.status}
                  </span>
                </div>
                {/* 진행률 바 */}
                <div className="mt-3.5">
                  <div className="flex justify-between text-[11px] text-muted mb-1.5">
                    <span>진행률</span>
                    <span><strong className="text-cream">{sel.tasks.done}</strong> / {sel.tasks.total} 완료</span>
                  </div>
                  <div className="h-[5px] bg-white/5 relative rounded-sm">
                    <div
                      className="h-[5px] absolute top-0 left-0 rounded-sm progress-fill"
                      style={{ width:`${Math.round(sel.tasks.done / sel.tasks.total * 100)}%`, background: progressColor(sel.status) }}
                    />
                  </div>
                </div>
              </div>

              {/* 태스크 목록 */}
              <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
                {sel.taskKeys.map(groupKey => (
                  <div key={groupKey}>
                    <p className="font-mono text-[9px] text-muted tracking-[0.15em] mt-3.5 mb-2 first:mt-0">
                      {groupKey === "공통" ? "📋 공통 온보딩" : `🔧 ${groupKey} 직군`}
                    </p>
                    {TASK_GROUPS[groupKey].map(task => {
                      const isDone = sel.doneIds.includes(task.id);
                      return (
                        <div
                          key={task.id}
                          className={`flex items-start gap-2.5 px-2.5 py-2 mb-1 border transition-colors ${
                            isDone
                              ? "bg-accent/[0.04] border-accent/10"
                              : "bg-white/[0.02] border-white/5"
                          }`}
                        >
                          {/* 체크 */}
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0 mt-0.5 ${
                            isDone ? "bg-accent text-bg" : "border border-muted"
                          }`}>
                            {isDone && "✓"}
                          </div>
                          <div>
                            <div className={`text-xs font-semibold ${isDone ? "text-cream" : "text-muted-light"}`}>
                              {task.label}
                            </div>
                            <div className="text-[10px] text-muted mt-0.5">{task.desc}</div>
                          </div>
                        </div>
                      );
                    })}
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

// ── 번아웃 패널 ───────────────────────────────────────────
function BurnoutPanel() {
  const [selected,     setSelected]     = useState(null);
  const [overtime,     setOvertime]     = useState(8);
  const [consecutive,  setConsecutive]  = useState(2);
  const [leaveRate,    setLeaveRate]    = useState(40);
  const [holiday,      setHoliday]      = useState(1);
  const [scorerResult, setScorerResult] = useState(null);

  const employees = MOCK_BURNOUT.map(e => ({ ...e, score: calcScore(e) }));
  const sel        = selected !== null ? employees.find(e => e.id === selected) : null;
  const selRisk    = sel ? getRisk(sel.score) : null;

  const sliders = [
    { label:"주간 초과 근무", val:overtime,    set:setOvertime,    min:0, max:20,  unit:"h",  desc:"법정 40시간 초과분" },
    { label:"연속 야근 일수", val:consecutive, set:setConsecutive, min:0, max:7,   unit:"일", desc:"최근 연속 야근" },
    { label:"연차 미소진율",  val:leaveRate,   set:setLeaveRate,   min:0, max:100, unit:"%",  desc:"분기 기준 미사용 비율" },
    { label:"월 휴일 근무",   val:holiday,     set:setHoliday,     min:0, max:4,   unit:"회", desc:"주말/공휴일 출근 횟수" },
  ];

  return (
    <div className="animate-fadeSlideIn">
      {/* 상단: 직원 목록 + 케어 상세 */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns:"1.1fr 0.9fr" }}>
        {/* 직원 목록 */}
        <div className="bg-card border border-white/5">
          <div className="px-4 py-3.5 border-b border-white/5">
            <MonoLabel>직원 번아웃 리스크 현황 — 클릭 시 케어 플랜 확인</MonoLabel>
          </div>
          {employees.map(e => {
            const r = getRisk(e.score);
            return (
              <div
                key={e.id}
                onClick={() => setSelected(e.id)}
                className={`flex items-center gap-3 px-4 py-3 border-b border-white/[0.03] last:border-b-0 cursor-pointer transition-colors
                            ${selected === e.id ? "bg-accent/[0.04] border-l-2 border-l-accent" : "hover:bg-white/[0.02]"}`}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                     style={{ background: r.bg, color: r.color }}>
                  {e.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-cream">{e.name}</div>
                  <div className="text-[10px] text-muted">{e.dept} · {e.role}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-mono text-base font-bold" style={{ color: r.color }}>{e.score}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5" style={{ background: r.bg, color: r.color }}>{r.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 케어 상세 */}
        <div className="bg-card border border-white/5 p-5">
          <MonoLabel className="mb-4">케어 플랜 상세</MonoLabel>
          {!sel ? (
            <EmptyState
              icon={<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>}
            >
              왼쪽에서 직원을 선택하면<br/>리스크 분석과 케어 수단이 표시됩니다
            </EmptyState>
          ) : (
            <>
              <div className="text-xl font-black text-cream mb-1">{sel.name}</div>
              <div className="text-[11px] text-muted mb-4">{sel.dept} · {sel.role}</div>
              <div className="flex items-baseline gap-2.5 mb-1">
                <div className="text-[56px] font-black leading-none" style={{ color: selRisk.color }}>{sel.score}</div>
                <span className="text-[11px] font-bold px-2 py-0.5" style={{ background: selRisk.bg, color: selRisk.color }}>{selRisk.label}</span>
              </div>
              {/* 스코어 바 */}
              <div className="h-[3px] bg-white/5 relative mt-2.5 mb-3.5">
                <div className="h-[3px] absolute top-0 left-0 progress-fill-slow" style={{ width:`${sel.score}%`, background: selRisk.color }} />
              </div>
              {/* 수치 그리드 */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-4">
                {[["주간 초과 근무",`${sel.overtime}h`],["연속 야근",`${sel.consecutive}일`],["연차 미소진율",`${sel.leaveRate}%`],["월 휴일 근무",`${sel.holiday}회`]].map(([k, v]) => (
                  <div key={k} className="text-[11px]">
                    <span className="text-muted">{k}: </span>
                    <span className="text-cream font-mono">{v}</span>
                  </div>
                ))}
              </div>
              <MonoLabel className="mb-2">추천 케어 수단</MonoLabel>
              <div className="flex flex-col gap-1.5">
                {getCare(sel.score).map((c, i) => <CareItem key={i} {...c} />)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 개인 스코어러 */}
      <div className="bg-card border border-white/5 p-4">
        <MonoLabel className="mb-4">직접 계산 — 개인 리스크 스코어러</MonoLabel>
        <div className="grid grid-cols-2 gap-5">
          {/* 슬라이더 */}
          <div>
            {sliders.map(s => (
              <div key={s.label} className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-cream">{s.label}</span>
                  <span className="font-mono text-xs text-accent">{s.val}{s.unit}</span>
                </div>
                <div className="text-[10px] text-muted mb-1.5">{s.desc}</div>
                <input type="range" min={s.min} max={s.max} value={s.val} onChange={e => s.set(+e.target.value)} />
              </div>
            ))}
            <button
              onClick={() => setScorerResult(calcScore({ overtime, consecutive, leaveRate, holiday }))}
              className="w-full bg-accent text-bg py-2.5 text-sm font-black font-sans hover:opacity-85 transition-opacity mt-1"
            >
              리스크 스코어 계산
            </button>
          </div>

          {/* 결과 */}
          <div>
            {scorerResult === null ? (
              <EmptyState
                icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>}
              >
                슬라이더를 조정하고<br/>버튼을 눌러 진단하세요
              </EmptyState>
            ) : (() => {
              const r = getRisk(scorerResult);
              return (
                <div>
                  <div className="text-center py-4 pb-3">
                    <p className="font-mono text-[9px] text-muted tracking-[0.15em] mb-1.5">BURNOUT RISK SCORE</p>
                    <div className="text-[60px] font-black leading-none" style={{ color: r.color }}>{scorerResult}</div>
                    <span className="inline-block px-3 py-1 text-[11px] font-bold mt-2" style={{ background: r.bg, color: r.color }}>{r.label}</span>
                  </div>
                  <div className="h-[3px] bg-white/5 relative mb-3">
                    <div className="h-[3px] absolute top-0 left-0 progress-fill-slow" style={{ width:`${scorerResult}%`, background: r.color }} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {getCare(scorerResult).map((c, i) => <CareItem key={i} {...c} />)}
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

// ── 앱 루트 ───────────────────────────────────────────────
const TABS = [
  { icon:"🤖", title:"AI 온보딩 챗봇",  sub:"입사자 Q&A · 실시간 스트리밍" },
  { icon:"📊", title:"HR 온보딩 현황",  sub:"입사자별 진행률 모니터링" },
  { icon:"🔥", title:"번아웃 리스크",   sub:"직원 위험군 감지 · 케어 추천" },
];

export default function App() {
  const [tab,      setTab]      = useState(0);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  return (
    <div className="relative z-10 max-w-[1000px] mx-auto px-6 pt-7 pb-16">
      {/* 헤더 */}
      <div className="text-center py-8 pb-7">
        <div className="inline-flex items-center gap-2 bg-accent/5 border border-accent/10 px-3.5 py-1.5 mb-4 font-mono text-[10px] text-accent tracking-widest2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-blink" />
          LIVE DEMO — 3W HR SAAS
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          실시간 <em className="not-italic text-accent">기능 시연</em>
        </h1>
        <p className="text-[13px] text-muted leading-relaxed">
          AI 온보딩 챗봇 · HR 대시보드 · 번아웃 리스크 스코어러
        </p>
      </div>

      {/* 설정 */}
      <SettingsPanel settings={settings} onSave={setSettings} />

      {/* 탭 */}
      <div className="grid grid-cols-3 gap-px bg-accent/10 border border-accent/10 mb-6">
        {TABS.map((t, i) => (
          <div
            key={i}
            onClick={() => setTab(i)}
            className={`flex items-center gap-2 px-4 py-3.5 cursor-pointer transition-colors text-sm font-semibold border-b-2
                        ${tab === i
                          ? "bg-card text-cream border-accent"
                          : "bg-surface text-muted border-transparent hover:bg-card"}`}
          >
            <span className="text-base">{t.icon}</span>
            <div>
              {t.title}
              <span className="block text-[10px] font-normal text-muted mt-0.5">{t.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 패널 */}
      {tab === 0 && <ChatDemo settings={settings} />}
      {tab === 1 && <HRDashboard />}
      {tab === 2 && <BurnoutPanel />}
    </div>
  );
}
