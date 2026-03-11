import { useState, useRef, useEffect } from "react";

// ── 데이터 ────────────────────────────────────────────────
const TASK_GROUPS = {
  공통: [
    { id: "t01", label: "출입증 및 사원증 발급",        desc: "원무과·총무팀에서 수령, 출입 가능 구역 확인" },
    { id: "t02", label: "노트북·업무 장비 수령",         desc: "IT 담당자에게 수령 확인, 초기 세팅 요청" },
    { id: "t03", label: "병원 그룹웨어 계정 설정",       desc: "이메일·전자결재·인트라넷 계정 활성화" },
    { id: "t04", label: "메신저·협업 툴 가입",           desc: "병원 내 채널 구독 및 프로필 설정" },
    { id: "t05", label: "사내 위키·규정집 열람",         desc: "취업규칙·복지 가이드·의료 보안 정책 확인" },
    { id: "t06", label: "팀 온보딩 미팅 참석",           desc: "진료과장·팀장 주관 1:1 또는 팀 오리엔테이션" },
    { id: "t07", label: "인사 서류 제출",                desc: "근로계약서·개인정보 동의·면허 사본 제출" },
    { id: "t08", label: "의료 정보보안 교육 이수",       desc: "환자 개인정보 보호·보안 서약서 서명" },
  ],
  의사: [
    { id: "dr01", label: "EMR 시스템 사용법 교육",        desc: "전자의무기록 작성·처방·조회 실습" },
    { id: "dr02", label: "의사 면허 및 자격 등록",        desc: "의무기록부·면허번호 시스템 등록" },
    { id: "dr03", label: "진료과 프로세스 숙지",          desc: "진료 흐름·협진 요청·수술 신청 절차" },
    { id: "dr04", label: "당직 스케줄 확인 및 동의",      desc: "당직표 수령·당직 수당 산정 방식 확인" },
    { id: "dr05", label: "의료 컴플라이언스 교육",        desc: "의료법·진료기록 보관·환자 동의 절차" },
  ],
  간호사: [
    { id: "nu01", label: "간호 기록 시스템(NIS) 교육",   desc: "간호 기록 작성·투약 기록·활력징후 입력" },
    { id: "nu02", label: "당직·야간 근무 스케줄 확인",   desc: "교대근무표 수령·인수인계 프로세스 숙지" },
    { id: "nu03", label: "의약품 관리 교육",             desc: "마약류 관리·투약 오류 보고 절차 교육" },
    { id: "nu04", label: "응급 대응 매뉴얼 숙지",        desc: "코드 블루·화재 대피·환자 낙상 보고 절차" },
  ],
  의료기사: [
    { id: "mt01", label: "의료 장비 사용 교육",           desc: "담당 장비 조작·유지보수·안전 교육" },
    { id: "mt02", label: "자격증·면허 시스템 등록",       desc: "해당 자격증 번호·발급일 시스템 등록" },
    { id: "mt03", label: "검사 결과 보고 절차 숙지",      desc: "검사지 발행·이상 수치 보고 프로세스" },
  ],
  원무행정: [
    { id: "ad01", label: "원무 시스템(OCS) 교육",         desc: "접수·수납·예약 관리 시스템 실습" },
    { id: "ad02", label: "건강보험 청구 프로세스 교육",   desc: "급여·비급여 항목·심사 청구 절차 숙지" },
    { id: "ad03", label: "환자 민원 대응 매뉴얼 숙지",   desc: "불만 접수·에스컬레이션 절차 확인" },
  ],
};

const MOCK_EMPLOYEES = [
  { id:1, name:"김민준", role:"내과 전공의", dept:"내과",    startDate:"2026-02-03", avatar:"김", status:"완료",
    doneIds:["t01","t02","t03","t04","t05","t06","t07","t08","dr01","dr02","dr03","dr04","dr05"],
    taskKeys:["공통","의사"] },
  { id:2, name:"이지은", role:"수술실 간호사", dept:"수술실", startDate:"2026-02-03", avatar:"이", status:"진행중",
    doneIds:["t01","t02","t03","t04","t05","t06","nu01"],
    taskKeys:["공통","간호사"] },
  { id:3, name:"박서준", role:"영상의학과 의사", dept:"영상의학과", startDate:"2026-02-10", avatar:"박", status:"지연",
    doneIds:["t01","t02","t03"],
    taskKeys:["공통","의사"] },
  { id:4, name:"최수아", role:"원무팀 주임", dept:"원무팀",  startDate:"2026-02-17", avatar:"최", status:"완료",
    doneIds:["t01","t02","t03","t04","t05","t06","t07","t08","ad01","ad02","ad03"],
    taskKeys:["공통","원무행정"] },
  { id:5, name:"정하늘", role:"응급실 간호사", dept:"응급실", startDate:"2026-03-03", avatar:"정", status:"진행중",
    doneIds:["t01","t02"],
    taskKeys:["공통","간호사"] },
].map(e => {
  const allTasks = e.taskKeys.flatMap(k => TASK_GROUPS[k]);
  return { ...e, tasks: { total: allTasks.length, done: e.doneIds.length } };
});

const MOCK_BURNOUT = [
  { id:1, name:"박성훈", dept:"응급의학과", role:"응급의학과 전문의", overtime:18, consecutive:6, leaveRate:85, holiday:3, onCall:8 },
  { id:2, name:"김다은", dept:"외과",       role:"외과 수석간호사",   overtime:14, consecutive:5, leaveRate:70, holiday:2, onCall:6 },
  { id:3, name:"이재원", dept:"내과",       role:"내과 전공의",       overtime:10, consecutive:3, leaveRate:60, holiday:2, onCall:5 },
  { id:4, name:"최유진", dept:"소아과",     role:"소아과 간호사",     overtime:4,  consecutive:1, leaveRate:20, holiday:0, onCall:2 },
  { id:5, name:"한수민", dept:"수술실",     role:"수술실 간호사",     overtime:16, consecutive:5, leaveRate:80, holiday:3, onCall:7 },
  { id:6, name:"오태양", dept:"원무팀",     role:"원무 행정원",       overtime:3,  consecutive:0, leaveRate:10, holiday:0, onCall:0 },
];

const QUICK_CATEGORIES = [
  { label:"🏥 병원 생활",    questions:["점심시간은 언제야?","당직 수당은 어떻게 받아?","교대근무 패턴이 어떻게 돼?","재택근무 가능한 업무 있어?"] },
  { label:"🛠️ 업무 시스템", questions:["EMR 로그인은 어떻게 해?","원무 시스템 어떻게 접속해?","당직표는 어디서 확인해?","검사 결과 조회는 어디서 해?"] },
  { label:"📋 인사 / 복지",  questions:["연차는 어떻게 신청해?","건강검진은 언제 받아?","의료비 할인 혜택이 있어?","면허 갱신 지원 받을 수 있어?"] },
  { label:"💊 의료 프로세스", questions:["처방 오류 발생 시 어떻게 해?","환자 동의서는 어디서 받아?","협진 요청 절차가 어떻게 돼?","의료 사고 보고는 어떻게 해?"] },
];

const DEFAULT_SETTINGS = {
  hospital:     "3W 의료 통합 플랫폼 데모 병원",
  type:         "종합병원 (의료 통합 플랫폼 — CRM·EMR·근태·그룹웨어 연동)",
  workHours:    "3교대 (주간 08:00~16:00 / 저녁 16:00~24:00 / 야간 00:00~08:00)",
  lunch:        "12:00~13:00 / 구내식당 이용 또는 식대 월 15만원",
  leave:        "월 1.5일 발생, 그룹웨어 전자결재로 신청",
  welfare:      "의료비 할인 50%, 건강검진 연 1회, 면허 갱신 지원, 직원 식당 운영",
  system:       "EMR(전자의무기록), OCS(처방전달), NIS(간호정보), PACS(영상), 그룹웨어",
  compliance:   "의료법 준수, 환자 개인정보보호법, 의료기기 안전관리, 감염관리 지침",
  process:      "진료 → EMR 기록 → 처방(OCS) → 검사(PACS/NIS) → 수납(원무) → 보험청구",
};

// ── 유틸 ────────────────────────────────────────────────
// 번아웃 스코어: 초과근무(30) + 연속당직(25) + 연차미소진(20) + 휴일근무(10) + 온콜(15)
function calcScore({ overtime, consecutive, leaveRate, holiday, onCall }) {
  return Math.round(Math.min(
    Math.min(overtime / 20 * 30, 30) +
    Math.min(consecutive / 7 * 25, 25) +
    (leaveRate / 100) * 20 +
    Math.min(holiday / 4 * 10, 10) +
    Math.min((onCall || 0) / 8 * 15, 15),
    100
  ));
}

function getRisk(score) {
  if (score < 30) return { label:"정상", color:"#00e5a0", bg:"rgba(0,229,160,0.1)" };
  if (score < 55) return { label:"주의", color:"#ffd740", bg:"rgba(255,215,64,0.1)" };
  if (score < 75) return { label:"경고", color:"#ff9a3c", bg:"rgba(255,154,60,0.1)" };
  return             { label:"위험", color:"#ff4d4d",  bg:"rgba(255,77,77,0.1)" };
}

function getCare(score) {
  if (score < 30) return [
    { icon:"📱", t:"의료진 전용 AI 힐링 앱", d:"교대근무 맞춤 수면 루틴 · 5분 명상 가이드" },
  ];
  if (score < 55) return [
    { icon:"📱", t:"AI 힐링 앱 — 감정 일기 시작",  d:"주 3회 스트레스 체크인 · 수면 패턴 분석" },
    { icon:"🧘", t:"병원 현장 출장 스트레칭 강사", d:"진료과 단위 주 1회 15분 · 출장 강사 파견" },
  ];
  if (score < 75) return [
    { icon:"💬", t:"비대면 심리상담 1회 연결",      d:"익명 처리 · 50분 · 병원 복지 예산 연동" },
    { icon:"🧘", t:"출장 명상/요가 강사 매칭",      d:"진료과 단위 그룹 케어 프로그램" },
    { icon:"📅", t:"연차·당직 패턴 조정 권고",      d:"관리자(수간호사·과장) 자동 리포트 전송" },
  ];
  return [
    { icon:"🚨", t:"긴급 심리상담 즉시 연결",       d:"당일 예약 · 전담 상담사 배정 · 익명 처리" },
    { icon:"📅", t:"당직 면제 및 연차 사용 권고",   d:"진료과장 알림 + 스케줄 재조정 지원" },
    { icon:"🧘", t:"1:1 전담 웰니스 코치 매칭",     d:"2주 집중 케어 · 당직 후 회복 프로그램" },
    { icon:"👥", t:"진료과장·수간호사 면담 연결",   d:"번아웃 원인 파악 및 업무 강도 재조정" },
  ];
}

function statusCls(status) {
  return {
    완료:  "bg-accent/10 text-accent",
    진행중: "bg-yellow-400/10 text-yellow-400",
    지연:  "bg-red-500/10 text-red-400",
  }[status] ?? "bg-white/5 text-muted";
}

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
    ["hospital",    "병원/기관명"],
    ["type",        "기관 유형"],
    ["workHours",   "근무 형태"],
    ["lunch",       "점심 / 식대"],
    ["leave",       "연차 정책"],
    ["welfare",     "복지 항목"],
    ["system",      "주요 시스템"],
    ["compliance",  "컴플라이언스"],
    ["process",     "진료 프로세스"],
  ];

  return (
    <div className="mb-5">
      <div
        onClick={() => setOpen(p => !p)}
        className="flex items-center justify-between bg-card border border-white/5 px-4 py-3 cursor-pointer mb-px transition-colors hover:bg-card2 select-none"
      >
        <span className="flex items-center gap-2.5 text-xs font-semibold text-muted-light">
          🏥 병원·기관 정보 커스텀 설정 — 챗봇이 이 정보를 기반으로 답변합니다
        </span>
        <span className={`text-[10px] text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▼</span>
      </div>

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
  const [role,     setRole]     = useState("내과 전공의");
  const [messages, setMessages] = useState([
    { role:"bot", text:`안녕하세요 👋 저는 ${settings.hospital} AI 온보딩 어시스턴트입니다.\n입사 첫날 궁금한 것들을 편하게 물어보세요!` }
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const buildPrompt = () =>
    `당신은 ${settings.hospital}의 AI 온보딩 어시스턴트입니다. 신규 의료진/직원(직종: ${role})을 돕습니다.

기관명: ${settings.hospital} / 기관 유형: ${settings.type}
근무 형태: ${settings.workHours}
점심/식대: ${settings.lunch}
연차 정책: ${settings.leave}
복지: ${settings.welfare}
주요 시스템: ${settings.system}
컴플라이언스: ${settings.compliance}
진료 프로세스: ${settings.process}

첫 주 필수 체크리스트:
- 출입증·사원증 수령
- 노트북·업무 장비 수령
- 그룹웨어·EMR·OCS 계정 활성화
- 의료 정보보안 교육 이수
- 팀 온보딩 미팅 참석
- 인사 서류 및 면허 서류 제출

중요 규정: 환자 개인정보는 철저히 보호, 의료 기록은 반드시 EMR에 기재, 오류 발생 시 즉시 보고.

한국어로, 친절하고 명확하게, 3~6문장 이내로 답변하세요.
직종(${role})에 맞는 내용을 우선 안내하고, 불확실하면 원무팀·HR 담당자 또는 수간호사에게 확인을 권유하세요.`;

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
        <MonoLabel className="mb-3">MEDICAL ONBOARDING CHATBOT</MonoLabel>
        <div className="flex items-end gap-4">
          <div>
            <label className="block text-[10px] text-muted mb-1.5">내 직종</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="bg-bg border border-white/5 text-cream px-2.5 py-2 text-sm font-sans outline-none focus:border-accent transition-colors"
            >
              {["내과 전공의","외과 전공의","응급의학과 전문의","수술실 간호사","응급실 간호사","병동 간호사","방사선사","임상병리사","원무 행정","의료 사무직"].map(r =>
                <option key={r} style={{ background:"#0f1510" }}>{r}</option>
              )}
            </select>
          </div>
          <span className="text-[11px] text-muted pb-0.5">← 직종 선택 시 EMR·시스템·당직 등 맞춤 안내</span>
        </div>
      </div>

      {/* 채팅 창 */}
      <div className="bg-surface border border-white/5 h-[340px] overflow-y-auto p-3.5 flex flex-col gap-2.5 scrollbar-thin">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col gap-1 max-w-[80%] ${m.role === "user" ? "self-end items-end" : "self-start"}`}>
            <span className="font-mono text-[8px] text-muted tracking-wider">
              {m.role === "user" ? "신규 의료진" : "AI 온보딩 어시스턴트"}
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
          placeholder="EMR 사용법, 당직 수당, 연차 신청 등 궁금한 것을 물어보세요..."
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
        {/* 의료진 테이블 */}
        <div className="bg-card border border-white/5 overflow-hidden">
          <div className="grid bg-surface border-b border-white/5"
               style={{ gridTemplateColumns:"36px 1fr 90px 95px 1fr 80px" }}>
            {["","의료진","진료과","입사일","온보딩 진행률","상태"].map((h, i) => (
              <div key={i} className="px-3 py-2.5 font-mono text-[9px] text-muted tracking-[0.1em]">{h}</div>
            ))}
          </div>
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
                <div className="px-3 py-3">
                  <div className="w-[26px] h-[26px] rounded-full bg-accent/10 border border-accent/10 flex items-center justify-center text-[10px] font-bold text-accent">
                    {e.avatar}
                  </div>
                </div>
                <div className="px-3 py-3">
                  <div className="text-[13px] font-semibold text-cream">{e.name}</div>
                  <div className="text-[10px] text-muted mt-0.5">{e.role}</div>
                </div>
                <div className="px-3 py-3 text-xs text-muted-light">{e.dept}</div>
                <div className="px-3 py-3 font-mono text-[11px] text-muted">{e.startDate}</div>
                <div className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-[3px] bg-white/5 relative">
                      <div className="h-[3px] absolute top-0 left-0 progress-fill"
                           style={{ width:`${pct}%`, background: progressColor(e.status) }} />
                    </div>
                    <span className="font-mono text-[10px] text-muted-light w-7">{pct}%</span>
                  </div>
                  <div className="text-[10px] text-muted mt-0.5">{e.tasks.done}/{e.tasks.total} 완료</div>
                </div>
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
              왼쪽에서 의료진을 클릭하면<br/>온보딩 태스크 상세를 확인할 수 있어요
            </EmptyState>
          ) : (
            <>
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
                <div className="mt-3.5">
                  <div className="flex justify-between text-[11px] text-muted mb-1.5">
                    <span>진행률</span>
                    <span><strong className="text-cream">{sel.tasks.done}</strong> / {sel.tasks.total} 완료</span>
                  </div>
                  <div className="h-[5px] bg-white/5 relative rounded-sm">
                    <div className="h-[5px] absolute top-0 left-0 rounded-sm progress-fill"
                         style={{ width:`${Math.round(sel.tasks.done / sel.tasks.total * 100)}%`, background: progressColor(sel.status) }} />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
                {sel.taskKeys.map(groupKey => (
                  <div key={groupKey}>
                    <p className="font-mono text-[9px] text-muted tracking-[0.15em] mt-3.5 mb-2 first:mt-0">
                      {groupKey === "공통" ? "📋 공통 온보딩" : `🔧 ${groupKey} 직종`}
                    </p>
                    {TASK_GROUPS[groupKey].map(task => {
                      const isDone = sel.doneIds.includes(task.id);
                      return (
                        <div key={task.id}
                             className={`flex items-start gap-2.5 px-2.5 py-2 mb-1 border transition-colors ${
                               isDone ? "bg-accent/[0.04] border-accent/10" : "bg-white/[0.02] border-white/5"
                             }`}>
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
  const [onCall,       setOnCall]       = useState(3);
  const [scorerResult, setScorerResult] = useState(null);

  const employees = MOCK_BURNOUT.map(e => ({ ...e, score: calcScore(e) }));
  const sel        = selected !== null ? employees.find(e => e.id === selected) : null;
  const selRisk    = sel ? getRisk(sel.score) : null;

  const sliders = [
    { label:"주간 초과·당직 근무", val:overtime,    set:setOvertime,    min:0, max:20,  unit:"h",  desc:"법정 40시간 초과분 + 당직 시간" },
    { label:"연속 야간 근무 일수", val:consecutive, set:setConsecutive, min:0, max:7,   unit:"일", desc:"3일 이상 연속 시 위험 플래그" },
    { label:"연차 미소진율",       val:leaveRate,   set:setLeaveRate,   min:0, max:100, unit:"%",  desc:"분기 기준 미사용 비율" },
    { label:"월 휴일·공휴일 근무", val:holiday,     set:setHoliday,     min:0, max:4,   unit:"회", desc:"주말/공휴일 당직 출근 횟수" },
    { label:"월 온콜(On-Call) 횟수", val:onCall,    set:setOnCall,      min:0, max:8,   unit:"회", desc:"호출 대기 포함 실질 대응 횟수" },
  ];

  return (
    <div className="animate-fadeSlideIn">
      {/* 상단: 의료진 목록 + 케어 상세 */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns:"1.1fr 0.9fr" }}>
        <div className="bg-card border border-white/5">
          <div className="px-4 py-3.5 border-b border-white/5">
            <MonoLabel>의료진 번아웃 리스크 현황 — 클릭 시 케어 플랜 확인</MonoLabel>
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

        <div className="bg-card border border-white/5 p-5">
          <MonoLabel className="mb-4">케어 플랜 상세</MonoLabel>
          {!sel ? (
            <EmptyState
              icon={<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>}
            >
              왼쪽에서 의료진을 선택하면<br/>리스크 분석과 케어 수단이 표시됩니다
            </EmptyState>
          ) : (
            <>
              <div className="text-xl font-black text-cream mb-1">{sel.name}</div>
              <div className="text-[11px] text-muted mb-4">{sel.dept} · {sel.role}</div>
              <div className="flex items-baseline gap-2.5 mb-1">
                <div className="text-[56px] font-black leading-none" style={{ color: selRisk.color }}>{sel.score}</div>
                <span className="text-[11px] font-bold px-2 py-0.5" style={{ background: selRisk.bg, color: selRisk.color }}>{selRisk.label}</span>
              </div>
              <div className="h-[3px] bg-white/5 relative mt-2.5 mb-3.5">
                <div className="h-[3px] absolute top-0 left-0 progress-fill-slow" style={{ width:`${sel.score}%`, background: selRisk.color }} />
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-4">
                {[
                  ["초과·당직 근무", `${sel.overtime}h`],
                  ["연속 야간 근무", `${sel.consecutive}일`],
                  ["연차 미소진율",  `${sel.leaveRate}%`],
                  ["휴일 근무",      `${sel.holiday}회`],
                  ["온콜(On-Call)", `${sel.onCall}회`],
                ].map(([k, v]) => (
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
        <MonoLabel className="mb-4">직접 계산 — 의료진 번아웃 리스크 스코어러</MonoLabel>
        <div className="grid grid-cols-2 gap-5">
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
              onClick={() => setScorerResult(calcScore({ overtime, consecutive, leaveRate, holiday, onCall }))}
              className="w-full bg-accent text-bg py-2.5 text-sm font-black font-sans hover:opacity-85 transition-opacity mt-1"
            >
              리스크 스코어 계산
            </button>
          </div>

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
                    <p className="font-mono text-[9px] text-muted tracking-[0.15em] mb-1.5">MEDICAL BURNOUT RISK SCORE</p>
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
  { icon:"🤖", title:"AI 온보딩 챗봇",   sub:"의료진 Q&A · 실시간 스트리밍" },
  { icon:"📊", title:"의료진 온보딩 현황", sub:"직종별 진행률 · 태스크 상세" },
  { icon:"🔥", title:"번아웃 리스크",     sub:"의료진 위험군 감지 · 케어 추천" },
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
          LIVE DEMO — 3W MEDICAL PLATFORM
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          실시간 <em className="not-italic text-accent">기능 시연</em>
        </h1>
        <p className="text-[13px] text-muted leading-relaxed">
          의료기관 AI 온보딩 · 의료진 온보딩 현황 · 번아웃 리스크 스코어러
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
