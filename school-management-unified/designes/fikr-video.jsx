// FIKR marketing video v2 — "one system" story, 1920x1080, Arabic.
const NAVY = '#0b2a4a', TEAL = '#0e9c8c', INK = '#c9d6e3', FONT = "'IBM Plex Sans Arabic', sans-serif";
const MOTION = {
  enter: (start, dur = 0.7) => (T) => ({ o: animate({ from: 0, to: 1, start, end: start + dur, ease: Easing.easeOutCubic })(T), y: animate({ from: 40, to: 0, start, end: start + dur, ease: Easing.easeOutCubic })(T) }),
  pop: (start, dur = 0.6) => (T) => animate({ from: 0, to: 1, start, end: start + dur, ease: Easing.easeOutBack })(T),
  draw: (start, end) => (T) => animate({ from: 0, to: 1, start, end, ease: Easing.easeInOutCubic })(T),
};
const rnd = (i, k = 1) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const NOTES = [
  { t: 'جدول الحضور', x: 1380, y: 420, r: -7, c: '#fff' }, { t: 'ملفات الدرجات', x: 1080, y: 560, r: 5, c: '#fdf3c4' },
  { t: 'سجل الرسوم', x: 1500, y: 720, r: 4, c: '#fff' }, { t: 'مجموعات واتساب', x: 760, y: 380, r: -4, c: '#e5f7f3' },
  { t: 'التقارير الأسبوعية', x: 480, y: 640, r: 3, c: '#fdf3c4' }, { t: 'ملف إكسل للطلاب', x: 900, y: 800, r: -3, c: '#fff' },
  { t: 'رسائل نصية', x: 300, y: 380, r: 6, c: '#e5f7f3' },
];
// 7x12 bitmap of "1"
const ONE = ['0001100','0011100','0111100','1101100','0001100','0001100','0001100','0001100','0001100','0001100','1111111','1111111'];
const ONE_CELLS = []; ONE.forEach((row, r) => [...row].forEach((v, c) => { if (v === '1') ONE_CELLS.push([r, c]); }));
const arDigits = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);

function Phone({ src, style, children }) {
  return <div style={{ position: 'absolute', width: 400, aspectRatio: '1170/2532', background: '#0b1a2e', borderRadius: 52, padding: 13, boxShadow: '0 40px 80px rgba(0,0,0,.4)', ...style }}>
    <div style={{ width: '100%', height: '100%', borderRadius: 40, overflow: 'hidden', background: '#f5f6f8', position: 'relative' }}>
      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
      {children}
    </div>
  </div>;
}
function Toast({ style }) {
  return <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', gap: 14, background: '#fff', color: NAVY, borderRadius: 16, padding: '14px 22px', fontSize: 24, fontWeight: 600, boxShadow: '0 20px 50px rgba(0,0,0,.35)', whiteSpace: 'nowrap', ...style }}>
    <span style={{ width: 34, height: 34, borderRadius: 10, background: TEAL, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 22 }}>✓</span>تم تسجيل الحضور
  </div>;
}

function Piece() {
  const { T, CUES, authoredTotal } = useComposition();
  const C = CUES;
  // ---- Problem
  const words = 'كم نظامًا تحتاج مدرستك لتدير يومها؟'.split(' ');
  const clockMin = Math.floor(clamp((T - C.Problem) / (C.One - C.Problem), 0, 1) * 60);
  const headOut = animate({ from: 1, to: 0, start: C.One - 0.2, end: C.One + 0.5, ease: Easing.easeInCubic })(T);
  // ---- One: wipe + pixel assembly
  const wipe = animate({ from: 2100, to: -400, start: C.One, end: C.One + 1.1, ease: Easing.easeInOutCubic })(T); // bar x (from right to left)
  const assemble = MOTION.draw(C.One + 0.7, C.One + 2.3)(T);
  const badge = MOTION.enter(C.One + 2.8)(T);
  const oneOut = animate({ from: 1, to: 0, start: C.Admin - 0.4, end: C.Admin, ease: Easing.easeInCubic })(T);
  const tealBg = animate({ from: 0, to: 1, start: C.One + 0.3, end: C.One + 1.1, ease: Easing.linear })(T) * animate({ from: 1, to: 0, start: C.Admin - 0.4, end: C.Admin, ease: Easing.easeInOutCubic })(T);
  // ---- Admin: 3D dashboard
  const dashIn = MOTION.enter(C.Admin, 0.9)(T);
  const tilt = animate({ from: -22, to: -6, start: C.Admin, end: C.Teacher, ease: Easing.easeOutCubic })(T);
  const dashZoom = animate({ from: 1, to: 1.25, start: C.Admin + 1, end: C.Teacher, ease: Easing.easeInOutSine })(T);
  const dashOut = animate({ from: 1, to: 0, start: C.Teacher - 0.4, end: C.Teacher, ease: Easing.easeInCubic })(T);
  // ---- Teacher / Parent phones
  const p1y = animate({ from: 1100, to: 90, start: C.Teacher, end: C.Teacher + 0.9, ease: Easing.easeOutCubic })(T);
  const p1x = animate({ from: 760, to: 700, start: C.Parent - 0.2, end: C.Parent + 0.7, ease: Easing.easeInOutCubic })(T);
  const p2x = animate({ from: -600, to: 220, start: C.Parent, end: C.Parent + 0.9, ease: Easing.easeOutCubic })(T);
  const tap = MOTION.pop(C.Teacher + 1.4, 0.5)(T);
  const ripple = MOTION.draw(C.Teacher + 1.5, C.Teacher + 2.4)(T);
  const toastIn = MOTION.pop(C.Teacher + 2.1, 0.6)(T);
  const travel = MOTION.draw(C.Parent + 1.0, C.Parent + 2.0)(T);
  const land = MOTION.pop(C.Parent + 2.0, 0.5)(T);
  const capT = MOTION.enter(C.Teacher + 0.2)(T);
  const capP = MOTION.enter(C.Parent + 0.3)(T);
  const phonesOut = animate({ from: 0, to: 1100, start: C.Proof - 0.5, end: C.Proof, ease: Easing.easeInCubic })(T);
  const capOut = animate({ from: 1, to: 0, start: C.Proof - 0.5, end: C.Proof, ease: Easing.easeInCubic })(T);
  // ---- Proof: clock
  const clockIn = MOTION.pop(C.Proof + 0.1, 0.7)(T);
  const sweep = MOTION.draw(C.Proof + 0.6, C.Proof + 2.2)(T); // 7 -> 8
  const snap = MOTION.pop(C.Proof + 2.3, 0.5)(T);
  const quote = MOTION.enter(C.Proof + 0.4)(T);
  const proofOut = animate({ from: 1, to: 0, start: C.Demo - 0.4, end: C.Demo, ease: Easing.easeInCubic })(T);
  // ---- Demo
  const logo = MOTION.pop(C.Demo + 0.1, 0.9)(T);
  const cta = MOTION.enter(C.Demo + 0.8)(T);
  const card = MOTION.enter(C.Demo + 1.3)(T);
  const scan = (T - C.Demo - 1.8) % 1.6 / 1.6; // repeating laser
  // toast position: teacher phone (left p1x, top p1y) → parent phone (left p2x)
  const t1 = { x: p1x + 200, y: p1y + 250 }, t2 = { x: p2x + 200, y: 90 + 110 };
  const arc = Math.sin(travel * Math.PI) * -220;
  const toastX = t1.x + (t2.x - t1.x) * travel, toastY = t1.y + (t2.y - t1.y) * travel + arc;

  return <div data-screen-label={`${Math.floor(T)}s`} dir="rtl" lang="ar" style={{ position: 'absolute', inset: 0, background: NAVY, color: '#fff', fontFamily: FONT, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', inset: 0, background: TEAL, opacity: tealBg }} />

    {/* ---------- Problem ---------- */}
    <Shot from={C.Problem} to={C.One + 1.2}>
      <div style={{ position: 'absolute', left: 90, top: 70, display: 'flex', alignItems: 'center', gap: 18, opacity: headOut }}>
        <div dir="ltr" style={{ fontSize: 56, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '.04em' }}>{arDigits('0' + (7 + Math.floor(clockMin / 60)))}:{arDigits(String(clockMin % 60).padStart(2, '0'))}</div>
        <div style={{ fontSize: 22, color: INK, lineHeight: 1.3 }}>الساعة الأولى<br />من كل يوم</div>
      </div>
      <h1 style={{ position: 'absolute', right: 120, top: 90, margin: 0, fontSize: 84, lineHeight: 1.15, fontWeight: 700, opacity: headOut, display: 'flex', gap: 22, flexWrap: 'wrap', maxWidth: 1100 }}>
        {words.map((w, i) => { const e = MOTION.enter(C.Problem + 0.2 + i * 0.18, 0.5)(T); return <span key={i} style={{ opacity: e.o, transform: `translateY(${e.y}px)`, display: 'inline-block' }}>{w}</span>; })}
      </h1>
      {NOTES.map((n, i) => {
        const drop = animate({ from: -500, to: 0, start: C.Problem + 1.2 + i * 0.3, end: C.Problem + 1.9 + i * 0.3, ease: Easing.easeOutBack })(T);
        const vis = T >= C.Problem + 1.2 + i * 0.3 ? 1 : 0;
        const jit = Math.sin(T * 6 + i * 2) * 3 * clamp((T - C.Problem - 3) / 1, 0, 1);
        const pushed = wipe < n.x ? (n.x - wipe) * 4 : 0; // swept off to the right after bar passes
        return <div key={i} style={{ position: 'absolute', left: n.x + pushed, top: n.y + drop, transform: `translate(-50%,-50%) rotate(${n.r + jit}deg)`, opacity: vis, background: n.c, color: NAVY, fontSize: 34, fontWeight: 600, padding: '22px 36px', boxShadow: '0 24px 44px rgba(0,0,0,.35)', whiteSpace: 'nowrap', borderTop: `6px solid ${TEAL}` }}>{n.t}</div>;
      })}
    </Shot>
    {/* wipe bar */}
    <div style={{ position: 'absolute', top: 0, bottom: 0, left: wipe, width: 60, background: '#fff', opacity: wipe > -300 && wipe < 2000 ? 0.9 : 0, boxShadow: '0 0 80px rgba(255,255,255,.6)' }} />

    {/* ---------- One ---------- */}
    <Shot from={C.One + 0.6} to={C.Admin}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 90, opacity: oneOut }}>
        <div style={{ position: 'relative', width: 7 * 60, height: 12 * 60 }}>
          {ONE_CELLS.map(([r, c], i) => {
            const k = clamp((assemble - i / ONE_CELLS.length * 0.6) / 0.4, 0, 1);
            const e = Easing.easeOutCubic(k);
            const sx = (rnd(i) - 0.5) * 1600, sy = (rnd(i, 2) - 0.5) * 1000;
            return <span key={i} style={{ position: 'absolute', left: c * 60 + (1 - e) * sx, top: r * 60 + (1 - e) * sy, width: 54, height: 54, background: NAVY, opacity: e, transform: `rotate(${(1 - e) * 180}deg)` }} />;
          })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, opacity: badge.o, transform: `translateY(${badge.y}px)` }}>
          <div style={{ background: NAVY, color: '#fff', fontSize: 64, fontWeight: 700, padding: '18px 40px', alignSelf: 'flex-start' }}>واحد. فكر.</div>
          <div style={{ fontSize: 30, lineHeight: 1.5, maxWidth: 520 }}>الحضور، والدرجات، والرسوم، والرسائل، والتقارير — نظام واحد للمدرسة كلها.</div>
        </div>
      </div>
    </Shot>

    {/* ---------- Admin ---------- */}
    <Shot from={C.Admin} to={C.Teacher}>
      <div style={{ position: 'absolute', right: 120, top: 100, width: 640, opacity: dashIn.o * dashOut, transform: `translateY(${dashIn.y}px)` }}>
        <div style={{ fontSize: 26, color: TEAL, fontWeight: 600, letterSpacing: '.08em' }}>للإدارة</div>
        <h2 style={{ margin: '16px 0 0', fontSize: 64, lineHeight: 1.2, fontWeight: 700 }}>لوحة واحدة ترى منها كل صف وكل معلم.</h2>
      </div>
      <div style={{ position: 'absolute', left: 40, top: 140, width: 1120, height: 900, perspective: 2400, opacity: dashIn.o * dashOut }}>
        <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: 18, boxShadow: '0 60px 120px rgba(0,0,0,.5)', transform: `rotateY(${tilt}deg) translateY(${dashIn.y * 2}px)`, transformOrigin: 'left center', background: '#fff' }}>
          <img src="assets/fikr-ui/dashboard.png" alt="" style={{ width: '100%', display: 'block', transform: `scale(${dashZoom})`, transformOrigin: 'top right' }} />
        </div>
      </div>
    </Shot>

    {/* ---------- Teacher + Parent ---------- */}
    <Shot from={C.Teacher} to={C.Proof}>
      <Phone src="assets/fikr-ui/attendance-phone.png" style={{ left: p1x, top: p1y + phonesOut }}>
        {/* tap ripple on the "present" tile */}
        <div style={{ position: 'absolute', left: '72%', top: '35%', width: 24, height: 24, marginLeft: -12, marginTop: -12, borderRadius: '50%', background: TEAL, opacity: tap * (1 - ripple), transform: `scale(${1 + ripple * 9})` }} />
        <div style={{ position: 'absolute', left: '72%', top: '35%', width: 20, height: 20, marginLeft: -10, marginTop: -10, borderRadius: '50%', background: '#fff', border: `4px solid ${TEAL}`, opacity: tap * (1 - ripple), transform: `scale(${tap})` }} />
      </Phone>
      <Phone src="assets/fikr-ui/fees-phone.png" style={{ left: p2x, top: 90 + phonesOut, opacity: T >= C.Parent ? 1 : 0 }}>
        <div style={{ position: 'absolute', left: 16, right: 16, top: 16, background: '#fff', borderRadius: 14, padding: '12px 14px', boxShadow: '0 10px 30px rgba(0,0,0,.25)', display: 'flex', gap: 10, alignItems: 'center', opacity: land, transform: `translateY(${(1 - land) * -40}px)` }}>
          <span style={{ width: 26, height: 26, borderRadius: 8, background: TEAL, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 16 }}>✓</span>
          <div style={{ color: NAVY, fontSize: 15, lineHeight: 1.3 }}><b>فكر</b> · صالح حاضر اليوم ٠٧:٤٢</div>
        </div>
      </Phone>
      <Toast style={{ left: toastX, top: toastY + phonesOut, transform: `translate(-50%,-50%) scale(${toastIn * (1 - land)})`, opacity: toastIn * (1 - land) }} />
      <div style={{ position: 'absolute', right: 120, top: 220, width: 620, opacity: capOut }}>
        <Shot from={C.Teacher} to={C.Parent}>
          <div style={{ opacity: capT.o, transform: `translateY(${capT.y}px)` }}>
            <div style={{ fontSize: 26, color: TEAL, fontWeight: 600, letterSpacing: '.08em' }}>للمعلم</div>
            <h2 style={{ margin: '16px 0 0', fontSize: 62, lineHeight: 1.2, fontWeight: 700 }}>لمسة واحدة،<br />وانتهى الحضور.</h2>
          </div>
        </Shot>
        <Shot from={C.Parent} to={C.Proof}>
          <div style={{ opacity: capP.o, transform: `translateY(${capP.y}px)` }}>
            <div style={{ fontSize: 26, color: TEAL, fontWeight: 600, letterSpacing: '.08em' }}>لولي الأمر</div>
            <h2 style={{ margin: '16px 0 0', fontSize: 58, lineHeight: 1.25, fontWeight: 700 }}>وفي اللحظة نفسها،<br />يعرف ولي الأمر.</h2>
            <p style={{ margin: '20px 0 0', fontSize: 30, lineHeight: 1.5, color: INK }}>الحضور، والتقدم، والرسوم — إشعار واحد.</p>
          </div>
        </Shot>
      </div>
    </Shot>

    {/* ---------- Proof: clock ---------- */}
    <Shot from={C.Proof} to={C.Demo}>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', padding: '0 140px', opacity: proofOut }}>
        <div style={{ opacity: quote.o, transform: `translateY(${quote.y}px)` }}>
          <div style={{ fontSize: 26, color: TEAL, fontWeight: 600, letterSpacing: '.08em' }}>من مدرسة تعمل على فكر</div>
          <blockquote style={{ margin: '20px 0 0', fontSize: 50, lineHeight: 1.45, fontWeight: 600 }}>«كنا نقضي أول ساعة من كل يوم في جمع الحضور. الآن كل شيء يتم تلقائيًا.»</blockquote>
          <p style={{ margin: '24px 0 0', fontSize: 26, color: INK }}>مديرة روضة زينة الحياة</p>
        </div>
        <div style={{ justifySelf: 'center', position: 'relative', width: 560, height: 560, transform: `scale(${clockIn})` }}>
          <svg viewBox="0 0 200 200" width="560" height="560">
            <circle cx="100" cy="100" r="92" fill="none" stroke="#fff" strokeWidth="3" opacity=".25" />
            {[...Array(12)].map((_, i) => <line key={i} x1="100" y1="14" x2="100" y2={i % 3 === 0 ? 26 : 20} stroke="#fff" strokeWidth={i % 3 === 0 ? 3 : 1.5} transform={`rotate(${i * 30} 100 100)`} />)}
            <path d={`M100 100 L100 100`} />
            <circle cx="100" cy="100" r="92" fill="none" stroke={TEAL} strokeWidth="8" strokeDasharray={`${sweep * 48.2} 600`} strokeLinecap="round" transform="rotate(120 100 100)" opacity=".9" />
            <line x1="100" y1="100" x2="100" y2="40" stroke="#fff" strokeWidth="6" strokeLinecap="round" transform={`rotate(${210 + sweep * 30} 100 100)`} />
            <line x1="100" y1="100" x2="100" y2="24" stroke={TEAL} strokeWidth="3" strokeLinecap="round" transform={`rotate(${sweep * 360} 100 100)`} />
            <circle cx="100" cy="100" r="6" fill="#fff" />
          </svg>
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) scale(${snap})`, background: TEAL, color: '#fff', padding: '14px 26px', fontSize: 30, fontWeight: 700, borderRadius: 12, whiteSpace: 'nowrap', boxShadow: '0 20px 50px rgba(0,0,0,.4)' }}>٠٨:٠٠ · اكتمل الحضور ✓</div>
        </div>
      </div>
    </Shot>

    {/* ---------- Demo ---------- */}
    <Shot from={C.Demo} to={authoredTotal + 1}>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', padding: '0 140px', gap: 80 }}>
        <div>
          <img src="assets/fikr-logo-white-v2.png" alt="FIKR" style={{ height: 150, width: 'auto', display: 'block', transform: `scale(${logo})`, transformOrigin: 'right center' }} />
          <h2 style={{ margin: '50px 0 0', fontSize: 78, lineHeight: 1.15, fontWeight: 700, opacity: cta.o, transform: `translateY(${cta.y}px)` }}>اطلب عرضًا توضيحيًا.<br />٣٠ دقيقة.</h2>
        </div>
        <div style={{ background: '#fff', color: NAVY, padding: 50, display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'center', opacity: card.o, transform: `translateY(${card.y}px)`, justifySelf: 'end', width: 700 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontSize: 34, fontWeight: 600 }}>
            <span dir="ltr" style={{ textAlign: 'right' }}>www.fikr.om</span>
            <span dir="ltr" style={{ textAlign: 'right' }}>demo@fikr.om</span>
            <span dir="ltr" style={{ textAlign: 'right' }}>+968 99788677</span>
          </div>
          <div style={{ position: 'relative', width: 220, height: 220, overflow: 'hidden' }}>
            <img src="assets/fikr-qr.png" alt="QR" style={{ width: 220, height: 220, display: 'block' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: `${clamp(scan, 0, 1) * 100}%`, height: 4, background: TEAL, boxShadow: `0 0 18px ${TEAL}`, opacity: T > C.Demo + 1.8 ? 0.9 : 0 }} />
          </div>
        </div>
      </div>
    </Shot>
  </div>;
}
function FikrVideoApp() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return <div style={{ width: '100%', height: '100%', minHeight: 600, background: '#e6e9ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <CompositionStage width={1920} height={1080} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={NAVY}>
      <Piece />
    </CompositionStage>
    <TweaksPanel>
      <TweakSection label="Editor" />
      <TweakToggle label="Motion editor" value={t.motionEditor} onChange={(v) => setTweak('motionEditor', v)} />
    </TweaksPanel>
  </div>;
}
window.FikrVideoApp = FikrVideoApp;
