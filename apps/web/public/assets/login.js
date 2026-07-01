/* ───── i18n ───── */
/* registers strings into shared runtime (assets/i18n.js) */
AxiomI18n.register({
  zh: {
    'plate.meta': 'Vol.\u2009I · Issue 01',
    'plate.label': '§ 论旨',
    'plate.hero1': '一把钥匙，',
    'plate.hero2': '通往所有值得调用的',
    'plate.hero3': '语言模型',
    'plate.sub': '欧几里得的几何中，公理是被直接接受为真的命题——一切证明从此出发。Axiom 把这种结构带入 AI 时代：一个<strong>统一的 endpoint</strong>，让一切调用<em>从此恒等</em>。',
    'status.status': '状态', 'status.operational': '正常运行',
    'status.latency': '延迟', 'status.updated': '更新于',
    'top.new': '还没有账号？', 'top.signup': '创建账号',
    'form.eyebrow': '§ 登录',
    'form.title': '欢迎<em>回来</em>。',
    'form.lede': '输入你的凭证，进入控制台。',
    'sso.google': 'Google', 'sso.github': 'GitHub',
    'divider': '或使用账号',
    'field.email': '邮箱或用户名',
    'field.password': '密码',
    'field.forgot': '忘记密码？',
    'field.show': '显示', 'field.hide': '隐藏',
    'field.caps': '⇧ 大写锁定',
    'field.remember': '保持登录状态',
    'form.submit': '登录 Axiom',
    'form.no-account': '还没有账号？', 'form.go-signup': '创建账号',
    'form.kbd': '按', 'form.kbd2': '快捷登录',
    'trust.compliance': 'SOC 2 Type II',
    'trust.encryption': '端对端加密',
    'trust.uptime': '99.99% 可用性',
    'legal.body': '登录即表示你同意',
    'legal.terms': '用户协议', 'legal.and': '与', 'legal.privacy': '隐私政策',
    'colophon.seal': 'AXIOM · MMXXVI',
    'colophon.set': 'AXIOM CODE',
    'colophon.edition': '第 0001 号 / 卷 I',
    /* ── SIGNUP ── */
    'top.have': '已有账号？', 'top.signin': '登录',
    'signup.eyebrow': '§ 注册',
    'signup.title': '立此<em>存照</em>。',
    'signup.lede': '三十秒，加入 Axiom，开启你的统一调用。',
    'signup.divider': '或自行注册',
    'signup.field.username': '用户名',
    'signup.field.username.hint': '3–20 位字符，不含空格',
    'signup.field.username.ph': '输入您的用户名',
    'signup.field.username.invalid': '3–20 位字符，不含空格',
    'signup.field.username.tooshort': '至少 3 个字符',
    'signup.field.password': '密码',
    'signup.field.password.ph': '输入密码（8–20 个字符）',
    'signup.field.password.tooshort': '密码至少 8 个字符',
    'signup.pwd.weak':   '弱',
    'signup.pwd.medium': '中',
    'signup.pwd.strong': '强',
    'signup.field.confirm': '确认密码',
    'signup.field.confirm.ph': '再次输入密码',
    'signup.match.no': '两次输入不一致',
    'signup.match.ok': '两次输入一致',
    'signup.field.email': '电子邮件',
    'signup.field.email.hint': '需验证',
    'signup.field.email.invalid': '邮箱格式不正确',
    'signup.field.code': '验证码',
    'signup.field.code.ph': '6 位（数字+字母）',
    'signup.field.send': '发送验证码',
    'signup.field.resend': '重新发送',
    'signup.field.invite': '邀请码',
    'signup.field.invite.hint': '通过邀请链接自动带入',
    'signup.field.invite.ph': '邀请链接已自动填写',
    'signup.code.sent': '已发送至 {email}，请查收邮箱（含垃圾箱）',
    'signup.code.frequent': '请求过于频繁，请 {n} 秒后重试',
    'signup.code.invalid': '请先填写有效邮箱',
    'signup.terms': '我已阅读并同意 <a href="/terms" target="_blank">用户协议</a> 与 <a href="/privacy" target="_blank">隐私政策</a>。',
    'signup.terms.required': '请先同意条款与政策',
    'signup.submit': '创建账户',
    'signup.submit.busy': '正在创建账户…',
    'signup.foot.have': '已有账户？',
    'signup.foot.signin': '登录',
    'signup.err.user.short': '用户名至少 3 个字符',
    'signup.err.user.format': '用户名不能含有空格',
    'signup.err.pwd.short': '密码至少 8 位',
    'signup.err.pwd.mismatch': '两次输入的密码不一致',
    'signup.err.pwd.confirm': '请确认密码',
    'signup.err.email.format': '邮箱格式不正确',
    'signup.err.email.empty': '请输入邮箱地址',
    'signup.err.code.format': '验证码为 6 位（数字 + 字母）',
    'signup.err.code.empty': '请输入验证码',
    'forgot.title': '找回<em>密码</em>。',
    'forgot.sub': '输入注册邮箱，我们将发送重置链接。',
    'forgot.field.email': '邮箱',
    'forgot.submit': '发送重置链接',
    'forgot.submit.busy': '发送中…',
    'forgot.sent.title': '邮件已发送',
    'forgot.sent.hint': '请查收邮箱（含垃圾箱），点击链接重置密码。',
    'forgot.foot.remember': '记起来了？',
    'forgot.foot.back': '返回登录',
  },
  en: {
    'plate.meta': 'Vol.\u2009I · Issue 01',
    'plate.label': '§ The Thesis',
    'plate.hero1': 'One key,',
    'plate.hero2': 'every language model',
    'plate.hero3': 'worth calling',
    'plate.sub': "In Euclid's geometry, an axiom is a proposition accepted as self-evidently true—all proofs depart from here. Axiom brings this structure to the age of AI: a single, <strong>unified endpoint</strong>, where invocation is <em>henceforth identical</em>.",
    'status.status': 'Status', 'status.operational': 'operational',
    'status.latency': 'Latency', 'status.updated': 'Updated',
    'top.new': 'New to Axiom?', 'top.signup': 'Create an account',
    'form.eyebrow': '§ Sign in',
    'form.title': 'Welcome <em>back.</em>',
    'form.lede': 'Enter your credentials to continue to the console.',
    'sso.google': 'Google', 'sso.github': 'GitHub',
    'divider': 'or with account',
    'field.email': 'Email or username',
    'field.password': 'Password',
    'field.forgot': 'Forgot?',
    'field.show': 'Show', 'field.hide': 'Hide',
    'field.caps': '⇧ Caps Lock',
    'field.remember': 'Keep me signed in',
    'form.submit': 'Sign in to Axiom',
    'form.no-account': 'No account yet?', 'form.go-signup': 'Create one',
    'form.kbd': 'Press', 'form.kbd2': 'to sign in',
    'trust.compliance': 'SOC 2 Type II',
    'trust.encryption': 'End-to-end encrypted',
    'trust.uptime': '99.99% Uptime',
    'legal.body': 'By signing in you agree to our',
    'legal.terms': 'User Agreement', 'legal.and': 'and', 'legal.privacy': 'Privacy Policy',
    'colophon.seal': 'AXIOM · MMXXVI',
    'colophon.set': 'AXIOM CODE',
    'colophon.edition': 'No. 0001 / Vol. I',
    /* ── SIGNUP ── */
    'top.have': 'Already an Axiom user?', 'top.signin': 'Sign in',
    'signup.eyebrow': '§ Join',
    'signup.title': 'Begin <em>here.</em>',
    'signup.lede': 'Thirty seconds. Join Axiom and unify every model call.',
    'signup.divider': 'or with email',
    'signup.field.username': 'Username',
    'signup.field.username.hint': '3–20 characters, no spaces',
    'signup.field.username.ph': 'Enter a username',
    'signup.field.username.invalid': '3–20 characters, no spaces',
    'signup.field.username.tooshort': 'At least 3 characters',
    'signup.field.password': 'Password',
    'signup.field.password.ph': 'Password (8–20 characters)',
    'signup.field.password.tooshort': 'At least 8 characters',
    'signup.pwd.weak':   'Weak',
    'signup.pwd.medium': 'Fair',
    'signup.pwd.strong': 'Strong',
    'signup.field.confirm': 'Confirm password',
    'signup.field.confirm.ph': 'Re-enter password',
    'signup.match.no': "Passwords don't match",
    'signup.match.ok': 'Passwords match',
    'signup.field.email': 'Email',
    'signup.field.email.hint': 'verification required',
    'signup.field.email.invalid': 'Invalid email address',
    'signup.field.code': 'Verification code',
    'signup.field.code.ph': '6 chars (letters+digits)',
    'signup.field.send': 'Send code',
    'signup.field.resend': 'Resend',
    'signup.field.invite': 'Invite code',
    'signup.field.invite.hint': 'Auto-filled from the invite link',
    'signup.field.invite.ph': 'Filled from the invite link',
    'signup.code.sent': 'Sent to {email}, check inbox (and spam)',
    'signup.code.frequent': 'Too frequent, please wait {n}s',
    'signup.code.invalid': 'Enter a valid email first',
    'signup.terms': 'I have read and agree to the <a href="/terms" target="_blank">User Agreement</a> and <a href="/privacy" target="_blank">Privacy Policy</a>.',
    'signup.terms.required': 'Please accept the Terms and Privacy Policy',
    'signup.submit': 'Create account',
    'signup.submit.busy': 'Creating account…',
    'signup.foot.have': 'Already have an account?',
    'signup.foot.signin': 'Sign in',
    'signup.err.user.short': 'At least 3 characters',
    'signup.err.user.format': 'No spaces allowed',
    'signup.err.pwd.short': 'At least 8 characters',
    'signup.err.pwd.mismatch': 'Passwords do not match',
    'signup.err.pwd.confirm': 'Please confirm your password',
    'signup.err.email.format': 'Invalid email format',
    'signup.err.email.empty': 'Please enter your email',
    'signup.err.code.format': 'Code must be 6 characters (letters + digits)',
    'signup.err.code.empty': 'Please enter the verification code',
    'forgot.title': 'Recover<em>.</em>',
    'forgot.sub': 'Enter your registered email and we\'ll send a reset link.',
    'forgot.field.email': 'Email',
    'forgot.submit': 'Send reset link',
    'forgot.submit.busy': 'Sending…',
    'forgot.sent.title': 'Email sent',
    'forgot.sent.hint': 'Check your inbox (and spam) for the reset link.',
    'forgot.foot.remember': 'Remember it?',
    'forgot.foot.back': 'Back to sign in',
  },
});

/* Stamp innerHTML mode on keys whose translation carries inline tags
   (form.title contains <em>; plate.sub contains <strong>/<em>). */
(function () {
  ['form.title', 'plate.sub'].forEach(function (k) {
    document.querySelectorAll('[data-i18n="' + k + '"]').forEach(function (el) {
      el.removeAttribute('data-i18n');
      el.setAttribute('data-i18n-html', k);
    });
  });
})();

/* Add submit busy strings (referenced in form.submit handler below) */
AxiomI18n.register({
  zh: { 'form.submit.busy': '正在登录…', 'form.error.generic': '操作失败，请重试' },
  en: { 'form.submit.busy': 'Signing in…', 'form.error.generic': 'Something went wrong, please try again' },
});

AxiomI18n.refresh();

/* ───── Password show/hide ───── */
const pwdInput  = document.getElementById('password');
const pwdToggle = document.getElementById('pwdToggle');
let pwdVisible = false;
pwdToggle.addEventListener('click', () => {
  pwdVisible = !pwdVisible;
  pwdInput.type = pwdVisible ? 'text' : 'password';
  pwdToggle.textContent = AxiomI18n.t(pwdVisible ? 'field.hide' : 'field.show');
});

/* ───── Form submit ───── */
document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const btn = form.querySelector('.submit-btn');
  const card = form.closest('.form-card') || form;
  if (!btn) return;

  const emailV = form.querySelector('#email');
  const pwdV = form.querySelector('#password');
  const emailMsg = document.getElementById('loginEmailMsg');
  const pwdMsg = document.getElementById('loginPwdMsg');
  const lang = (typeof AxiomI18n !== 'undefined') ? AxiomI18n.lang : 'zh';
  const accountValue = emailV && typeof emailV.value === 'string' ? emailV.value.trim() : '';

  if (emailMsg) { emailMsg.textContent = ''; emailMsg.className = 'field__sublabel'; }
  if (pwdMsg) { pwdMsg.textContent = ''; pwdMsg.className = 'field__sublabel'; }

  const emailEmpty = !emailV || !accountValue;
  const emailBad = !emailEmpty && /\s/.test(accountValue);
  const pwdEmpty = !pwdV || !pwdV.value;
  const pwdBad = !pwdEmpty && pwdV.value.length < 4;

  if (emailEmpty || emailBad || pwdEmpty || pwdBad) {
    const offenders = [];
    if (emailEmpty && emailV) {
      offenders.push(emailV.closest('.field'));
      if (emailMsg) { emailMsg.textContent = lang === 'zh' ? '请输入邮箱或用户名' : 'Please enter your email or username'; emailMsg.className = 'field__sublabel field__sublabel--err is-shown'; }
    } else if (emailBad && emailV) {
      offenders.push(emailV.closest('.field'));
      if (emailMsg) { emailMsg.textContent = lang === 'zh' ? '账号不能包含空格' : 'Account cannot contain spaces'; emailMsg.className = 'field__sublabel field__sublabel--err is-shown'; }
    }
    if (pwdEmpty && pwdV) {
      offenders.push(pwdV.closest('.field'));
      if (pwdMsg) { pwdMsg.textContent = lang === 'zh' ? '请输入密码' : 'Please enter your password'; pwdMsg.className = 'field__sublabel field__sublabel--err is-shown'; }
    } else if (pwdBad && pwdV) {
      offenders.push(pwdV.closest('.field'));
      if (pwdMsg) { pwdMsg.textContent = lang === 'zh' ? '密码至少 4 位' : 'Password too short'; pwdMsg.className = 'field__sublabel field__sublabel--err is-shown'; }
    }
    offenders.forEach((f) => {
      if (!f) return;
      f.classList.remove('is-error');
      void f.offsetWidth;
      f.classList.add('is-error');
      setTimeout(() => f.classList.remove('is-error'), 700);
    });
    if (offenders[0]) {
      const inp = offenders[0].querySelector('input');
      if (inp) inp.focus({ preventScroll: true });
    }
    const fig = document.querySelector('.plate__fig');
    if (fig) {
      fig.classList.add('is-tilting');
      fig.style.setProperty('--tilt-x', '-3deg');
      fig.style.setProperty('--tilt-y', '0deg');
      setTimeout(() => { fig.classList.remove('is-tilting'); fig.style.setProperty('--tilt-x', '0deg'); }, 480);
    }
    return;
  }

  const diamond = document.querySelector('.plate__brand-mark');
  if (diamond) diamond.style.setProperty('animation', 'ax-diamond-pulse 0.42s cubic-bezier(0.34,1.56,0.64,1) both', 'important');
  const fig = document.querySelector('.plate__fig');
  if (fig) { fig.style.transition = 'transform 0.6s cubic-bezier(0.22,0.61,0.36,1)'; fig.style.transform = 'perspective(800px) rotateX(3deg) rotateY(0deg) translateY(2px)'; }

  const submitLabel = btn.querySelector('[data-i18n="form.submit"]');
  if (submitLabel) submitLabel.textContent = AxiomI18n.t('form.submit.busy');
  btn.disabled = true;
  btn.style.opacity = 0.78;

  function resetBtn() {
    if (submitLabel) submitLabel.textContent = AxiomI18n.t('form.submit');
    btn.disabled = false;
    btn.style.opacity = '';
    if (fig) fig.style.transform = '';
  }

  var rememberInput = document.getElementById('remember');
  Promise.resolve().then(function() {
    if (!window.AxiomAuth || typeof window.AxiomAuth.login !== 'function') {
      throw new Error(AxiomI18n.t('form.error.generic'));
    }
    return window.AxiomAuth.login(accountValue, pwdV.value, !!(rememberInput && rememberInput.checked));
  }).then(function() {
    setTimeout(function() { window.location.href = '/dashboard'; }, 720);
  }).catch(function(err) {
    resetBtn();
    // Show error as a temporary banner above the form
    let errEl = form.querySelector('.form-error-msg');
    if (!errEl) {
      errEl = document.createElement('div');
      errEl.className = 'form-error-msg';
      errEl.style.cssText = 'color:var(--verm);font-size:0.82rem;text-align:center;padding:0.5em 0;margin:-0.2em 0 0.4em;';
      form.insertBefore(errEl, form.firstChild);
    }
    errEl.textContent = err && err.message ? err.message : AxiomI18n.t('form.error.generic');
    errEl.style.display = 'block';
    var clearOnInput = function() {
      errEl.style.display = 'none';
      if (emailMsg) { emailMsg.textContent = ''; emailMsg.className = 'field__sublabel'; }
      if (pwdMsg) { pwdMsg.textContent = ''; pwdMsg.className = 'field__sublabel'; }
      emailV.removeEventListener('input', clearOnInput);
      pwdV.removeEventListener('input', clearOnInput);
    };
    emailV.addEventListener('input', clearOnInput);
    pwdV.addEventListener('input', clearOnInput);
    const fig2 = document.querySelector('.plate__fig');
    if (fig2) {
      fig2.classList.add('is-tilting');
      fig2.style.setProperty('--tilt-x', '-3deg');
      fig2.style.setProperty('--tilt-y', '0deg');
      setTimeout(() => { fig2.classList.remove('is-tilting'); fig2.style.setProperty('--tilt-x', '0deg'); }, 480);
    }
  });
});

/* ───── Caps lock indicator ───── */
const pwdField = pwdInput.closest('.field--pwd');
function detectCaps(e) {
  if (!e.getModifierState) return;
  pwdField.classList.toggle('is-caps', !!e.getModifierState('CapsLock'));
}
pwdInput.addEventListener('keydown', detectCaps);
pwdInput.addEventListener('keyup',   detectCaps);
pwdInput.addEventListener('blur',    () => pwdField.classList.remove('is-caps'));

/* ───── Email validity tick ───── */
const emailInput = document.getElementById('email');
const emailField = emailInput.closest('.field');
emailInput.addEventListener('input', () => {
  const raw = (emailInput.value || '').trim();
  emailField.classList.toggle('is-valid', !!raw && !/\s/.test(raw));
});

/* ───── Mascot parallax tilt ───── */
(function () {
  const fig = document.querySelector('.plate__fig');
  const plate = document.querySelector('.plate');
  if (!fig || !plate) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let raf = 0;
  plate.addEventListener('mousemove', (e) => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = fig.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      const max = 5;
      fig.classList.add('is-tilting');
      fig.style.setProperty('--tilt-y', (dx * max).toFixed(2) + 'deg');
      fig.style.setProperty('--tilt-x', (-dy * max).toFixed(2) + 'deg');
    });
  });
  plate.addEventListener('mouseleave', () => {
    fig.classList.remove('is-tilting');
    fig.style.setProperty('--tilt-x', '0deg');
    fig.style.setProperty('--tilt-y', '0deg');
  });
})();

/* ───── ⌘/Ctrl + Enter to submit (mode-aware) ───── */
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    const card = document.getElementById('formCard');
    const id = card && card.getAttribute('data-mode') === 'signup' ? 'signupForm' : 'loginForm';
    const form = document.getElementById(id);
    if (form && form.requestSubmit) form.requestSubmit();
  }
});

/* ═══════════════════════════════════════════════════════════════
   ── SIGNUP MODE: toggle, validation, countdown, submit ──
   The whole signup affair is wired below so we can keep the
   above login logic untouched and easy to reason about.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  const card = document.getElementById('formCard');
  const goSignup   = document.getElementById('goSignupLink');
  const goLogin    = document.getElementById('goLoginLink');
  const preservedSearch = location.search || '';
  const initialRefCode = new URLSearchParams(preservedSearch).get('ref') || '';
  const inviteField = document.getElementById('suInviteField');
  const inviteInput = document.getElementById('suInviteCode');
  const codeField = document.getElementById('suCodeField');
  const sendCodeBtn = document.getElementById('suSendCode');
  let emailVerificationRequired = true;

  let _modeSwitchGen = 0;
  function syncInviteCodeUI() {
    if (!inviteField || !inviteInput) return;
    if (!initialRefCode) {
      inviteField.hidden = true;
      inviteInput.value = '';
      return;
    }
    inviteField.hidden = false;
    inviteInput.value = initialRefCode;
  }

  function buildModeUrl(mode) {
    if (mode === 'signup') return location.pathname + preservedSearch + '#signup';
    if (mode === 'forgot') return location.pathname + preservedSearch + '#forgot';
    return location.pathname + preservedSearch;
  }

  function syncVerificationUI() {
    if (!codeField) return;
    codeField.hidden = !emailVerificationRequired;
    if (!emailVerificationRequired) {
      var codeInput = document.getElementById('suCode');
      var codeMsg = document.getElementById('suCodeMsg');
      if (codeInput) codeInput.value = '';
      if (codeMsg) {
        codeMsg.textContent = '';
        codeMsg.className = 'field__sublabel';
      }
      if (sendCodeBtn) {
        sendCodeBtn.disabled = false;
        sendCodeBtn.classList.remove('is-counting', 'is-done');
        sendCodeBtn.style.removeProperty('--progress');
        sendCodeBtn.textContent = AxiomI18n.t('signup.field.send');
        sendCodeBtn.setAttribute('data-i18n', 'signup.field.send');
      }
    }
  }

  syncInviteCodeUI();
  syncVerificationUI();
  window.AxiomLoginSignupState = {
    setEmailVerificationRequired: function(value) {
      emailVerificationRequired = !!value;
      syncVerificationUI();
    }
  };

  function setMode(mode, opts) {
    opts = opts || {};
    const current = card.getAttribute('data-mode');
    if (current === mode) return;

    const direction = (current === 'login' && (mode === 'signup' || mode === 'forgot')) ? 'forward' : 'backward';

    // The actual state mutation — wrapped so we can run it inside startViewTransition.
    const applyState = () => {
      card.setAttribute('data-mode', mode);
      try {
        const target = buildModeUrl(mode);
        history.replaceState(null, '', target);
      } catch (_) { /* sandboxed iframe — no history access; ignore */ }
      const wrap = document.querySelector('.form-wrap');
      if (wrap) wrap.scrollTo({ top: 0 });
    };

    const supportsVT = typeof document.startViewTransition === 'function';
    const root = document.documentElement;

    const focusFirst = () => {
      if (opts.skipFocus) return;
      const sel = mode === 'signup' ? '#suUsername' : mode === 'forgot' ? '#forgotEmail' : '#email';
      const el = document.querySelector(sel);
      if (el) el.focus({ preventScroll: true });
    };

    // Trigger the title-em "seal stamp" on the REAL DOM (post view transition).
    // The em is the title's vermillion focal point — fading it softly with the
    // pane snapshot felt slow; stamping it independently feels decisive.
    const stampTitle = () => {
      const activePane = mode === 'signup'
        ? card.querySelector('.mode-pane--signup')
        : mode === 'forgot'
        ? card.querySelector('.mode-pane--forgot')
        : card.querySelector('.mode-pane--login');
      if (!activePane) return;
      const em = activePane.querySelector('.form__title em');
      if (!em) return;
      em.classList.remove('stamp-in');
      // Force reflow so removing + re-adding the class restarts the animation
      // on rapid consecutive switches.
      void em.offsetWidth;
      em.classList.add('stamp-in');
      const clean = (e) => {
        if (e.animationName !== 'ax-title-stamp') return;
        em.classList.remove('stamp-in');
        em.removeEventListener('animationend', clean);
      };
      em.addEventListener('animationend', clean);
    };

    if (supportsVT && !opts.skipAnimation) {
      // Mark direction BEFORE startViewTransition so the conditional
      // view-transition-name CSS applies to the OLD capture too.
      const gen = ++_modeSwitchGen;
      root.dataset.modeSwitching = direction;
      const t = document.startViewTransition(applyState);
      // Trigger stamp AFTER the view transition finishes — during the
      // transition the real DOM is hidden behind the snapshot pseudo-elements,
      // so the stamp would play invisibly. Once finished, the real em
      // surfaces and the stamp lands as the visual punctuation mark.
      t.finished.then(() => { stampTitle(); focusFirst(); }, focusFirst).finally(() => {
        // Only the most recent transition owns the cleanup — rapid clicks
        // abort earlier transitions and we must not yank the attribute
        // out from under a still-running newer one.
        if (_modeSwitchGen === gen) delete root.dataset.modeSwitching;
      });
    } else {
      applyState();
      stampTitle();
      focusFirst();
    }
  }

  if (goSignup) {
    goSignup.addEventListener('click', (e) => {
      e.preventDefault();
      setMode('signup');
    });
  }
  if (goLogin) {
    goLogin.addEventListener('click', (e) => {
      e.preventDefault();
      setMode('login');
    });
  }

  /* ── Forgot password link ── */
  var forgotLink = document.getElementById('forgotLink');
  if (forgotLink) forgotLink.addEventListener('click', function(e) { e.preventDefault(); setMode('forgot'); });
  var forgotBackLink = document.getElementById('forgotBackLink');
  if (forgotBackLink) forgotBackLink.addEventListener('click', function(e) { e.preventDefault(); setMode('login'); });

  /* ── Forgot password submit ── */
  var forgotForm = document.getElementById('forgotForm');
  if (forgotForm) forgotForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var email = document.getElementById('forgotEmail').value.trim();
    var msgEl = document.getElementById('forgotMsg');
    var btn = document.getElementById('forgotSubmit');
    var emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRx.test(email)) {
      if (msgEl) { msgEl.textContent = AxiomI18n.t(email ? 'signup.err.email.format' : 'signup.err.email.empty'); msgEl.className = 'field__sublabel field__sublabel--err is-shown'; }
      return;
    }
    if (msgEl) { msgEl.textContent = ''; msgEl.className = 'field__sublabel'; }
    btn.disabled = true;
    btn.querySelector('.submit-btn__text').textContent = AxiomI18n.t('forgot.submit.busy');
    AxiomHttp.get('/reset_password?email=' + encodeURIComponent(email)).then(function() {
      document.getElementById('forgotSuccess').hidden = false;
      document.getElementById('forgotFields').style.display = 'none';
      btn.style.display = 'none';
    }).catch(function() {
      document.getElementById('forgotSuccess').hidden = false;
      document.getElementById('forgotFields').style.display = 'none';
      btn.style.display = 'none';
    });
  });

  /* deep-link: page loaded directly at #signup or #forgot */
  if (location.hash === '#signup' || (initialRefCode && !location.hash)) {
    setMode('signup', { skipFocus: true });
  } else if (location.hash === '#forgot') {
    setMode('forgot', { skipFocus: true });
  }
  /* respond to back/forward */
  window.addEventListener('hashchange', () => {
    var h = location.hash;
    setMode(h === '#signup' ? 'signup' : h === '#forgot' ? 'forgot' : 'login', { skipFocus: true });
  });

  /* ── password show/hide on both signup password fields ── */
  function wirePwdToggle(inputId, btnId) {
    const inp = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (!inp || !btn) return;
    let visible = false;
    btn.addEventListener('click', () => {
      visible = !visible;
      inp.type = visible ? 'text' : 'password';
      btn.textContent = AxiomI18n.t(visible ? 'field.hide' : 'field.show');
    });
  }
  wirePwdToggle('suPassword', 'suPwdToggle');
  wirePwdToggle('suConfirm',  'suConfirmToggle');

  /* ── caps-lock on signup password fields ── */
  ['suPassword', 'suConfirm'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const wrap = el.closest('.field--pwd');
    const set = (e) => {
      if (!e.getModifierState) return;
      wrap.classList.toggle('is-caps', !!e.getModifierState('CapsLock'));
    };
    el.addEventListener('keydown', set);
    el.addEventListener('keyup',   set);
    el.addEventListener('blur',    () => wrap.classList.remove('is-caps'));
  });

  /* ── username live validation ── */
  const usernameRx = /^\S{3,20}$/;
  const suUser = document.getElementById('suUsername');
  const suUserMsg = document.getElementById('suUsernameMsg');
  suUser.addEventListener('input', () => {
    const v = suUser.value;
    if (!v) { suUserMsg.className = 'field__sublabel'; suUserMsg.textContent = ''; return; }
    if (v.length < 3) {
      suUserMsg.textContent = AxiomI18n.t('signup.field.username.tooshort');
      suUserMsg.className = 'field__sublabel field__sublabel--err is-shown';
    } else if (!usernameRx.test(v)) {
      suUserMsg.textContent = AxiomI18n.t('signup.field.username.invalid');
      suUserMsg.className = 'field__sublabel field__sublabel--err is-shown';
    } else {
      suUserMsg.className = 'field__sublabel';
      suUserMsg.textContent = '';
    }
  });

  /* ── password strength (0/1/2/3) + has-value class ── */
  const suPwd       = document.getElementById('suPassword');
  const suPwdField  = document.getElementById('suPwdField');
  const suStrength  = document.getElementById('suPwdStrength');
  const suConfirm   = document.getElementById('suConfirm');
  const suConfField = document.getElementById('suConfirmField');

  function computeStrength(p) {
    if (p.length < 8) return 0;
    let s = 1;
    const hasLetter = /[A-Za-z]/.test(p);
    const hasDigit  = /\d/.test(p);
    const hasSym    = /[^A-Za-z0-9]/.test(p);
    if (hasLetter && hasDigit) s = 2;
    if ((hasLetter && hasDigit && hasSym) || p.length >= 12) s = 3;
    return s;
  }

  function updateMatch() {
    const a = suPwd.value;
    const b = suConfirm.value;
    suConfField.classList.toggle('is-mismatch', b.length > 0 && a !== b);
    suConfField.classList.toggle('is-match',    b.length > 0 && a === b && b.length >= 8);
    /* The two static layers crossfade by themselves — no manual text rewrite. */
  }

  const suStrengthLabel = document.getElementById('suPwdStrengthLabel');
  const STRENGTH_KEY = ['signup.pwd.weak', 'signup.pwd.weak', 'signup.pwd.medium', 'signup.pwd.strong'];
  suPwd.addEventListener('input', () => {
    const v = suPwd.value;
    suPwdField.classList.toggle('has-value', v.length > 0);
    const lvl = computeStrength(v);
    suStrength.setAttribute('data-level', String(lvl));
    const k = STRENGTH_KEY[Math.max(1, lvl)];
    suStrengthLabel.setAttribute('data-i18n', k);
    suStrengthLabel.textContent = AxiomI18n.t(k);
    updateMatch();
  });
  suConfirm.addEventListener('input', updateMatch);

  /* ── email validity tick (mirrors login) ── */
  const suEmail = document.getElementById('suEmail');
  const suEmailField = suEmail.closest('.field');
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  suEmail.addEventListener('input', () => {
    suEmailField.classList.toggle('is-valid', emailRx.test(suEmail.value));
  });

  /* ── verification code: send + 60s countdown ── */
  const sendBtn = document.getElementById('suSendCode');
  const codeMsg = document.getElementById('suCodeMsg');
  let countdownTimer = null;

  function startCountdown(email) {
    let total = 60, n = total;
    sendBtn.classList.add('is-counting');
    sendBtn.classList.remove('is-done');
    sendBtn.disabled = true;
    sendBtn.style.setProperty('--progress', '0');

    var base = AxiomI18n.t('signup.field.resend');
    sendBtn.innerHTML = base + ' <span class="code-btn__count">' + n + 's</span>';
    var countEl = sendBtn.querySelector('.code-btn__count');

    function tick() {
      sendBtn.style.setProperty('--progress', ((total - n) / total).toFixed(4));
      if (countEl) {
        countEl.textContent = n + 's';
        countEl.classList.remove('is-tick');
        void countEl.offsetWidth;
        countEl.classList.add('is-tick');
      }
    }
    tick();

    countdownTimer = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        sendBtn.style.setProperty('--progress', '1');
        sendBtn.classList.remove('is-counting');
        sendBtn.classList.add('is-done');
        if (countEl) { countEl.textContent = '✓'; countEl.style.color = '#3D7A55'; }
        setTimeout(() => {
          sendBtn.classList.remove('is-done');
          sendBtn.style.removeProperty('--progress');
          sendBtn.disabled = false;
          sendBtn.textContent = AxiomI18n.t('signup.field.send');
          sendBtn.setAttribute('data-i18n', 'signup.field.send');
        }, 800);
      } else {
        tick();
      }
    }, 1000);
  }

  sendBtn.addEventListener('click', () => {
    if (sendBtn.disabled) return;
    const email = suEmail.value.trim();
    if (!emailRx.test(email)) {
      codeMsg.textContent = AxiomI18n.t('signup.code.invalid');
      codeMsg.className   = 'field__sublabel field__sublabel--err is-shown';
      /* nudge focus to the email field + per-field shake */
      suEmail.focus({ preventScroll: true });
      suEmailField.classList.remove('is-error');
      void suEmailField.offsetWidth;
      suEmailField.classList.add('is-error');
      setTimeout(() => suEmailField.classList.remove('is-error'), 700);
      return;
    }
    /* clear data-i18n so the language toggle doesn't overwrite our running label */
    sendBtn.removeAttribute('data-i18n');
    sendBtn.disabled = true;
    AxiomHttp.get('/verification?email=' + encodeURIComponent(email)).then(function(data) {
      codeMsg.textContent = AxiomI18n.t('signup.code.sent').replace('{email}', email);
      codeMsg.className = 'field__sublabel field__sublabel--ok is-shown';
      startCountdown(email);
    }).catch(function(err) {
      sendBtn.disabled = false;
      var msg = (err && err.message) ? err.message : '';
      if (msg.toLowerCase().indexOf('frequent') !== -1 || msg.toLowerCase().indexOf('wait') !== -1 || msg.indexOf('429') !== -1 || msg.indexOf('频繁') !== -1) {
        codeMsg.textContent = AxiomI18n.t('signup.code.frequent').replace('{n}', '60');
        codeMsg.className = 'field__sublabel field__sublabel--err is-shown';
        startCountdown(email);
      } else {
        codeMsg.textContent = msg || AxiomI18n.t('form.error.generic');
        codeMsg.className = 'field__sublabel field__sublabel--err is-shown';
      }
    });
  });

  /* ── signup submit ── */
  function shakeField(field) {
    if (!field) return;
    field.classList.remove('is-error');
    void field.offsetWidth;
    field.classList.add('is-error');
    setTimeout(() => field.classList.remove('is-error'), 700);
  }

  document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn  = document.getElementById('suSubmit');
    const u  = suUser.value.trim();
    const p  = suPwd.value;
    const c  = suConfirm.value;
    const em = suEmail.value.trim();
    const co = document.getElementById('suCode').value.trim();
    const terms = document.getElementById('suTerms').checked;

    const sl = (typeof AxiomI18n !== 'undefined') ? AxiomI18n.lang : 'zh';
    const suPwdMsgEl = document.getElementById('suPwdMsg');
    const suConfMsgEl = document.getElementById('suConfMsg');
    const suEmailMsgEl = document.getElementById('suEmailMsg');
    const suCodeMsgEl = document.getElementById('suCodeMsg');
    const suUserMsgEl = document.getElementById('suUsernameMsg');
    [suPwdMsgEl, suConfMsgEl, suEmailMsgEl, suCodeMsgEl, suUserMsgEl].forEach(function(el) {
      if (el) { el.textContent = ''; el.className = 'field__sublabel'; }
    });

    const offenders = [];
    function addErr(fieldId, msgEl, msg) {
      var field = typeof fieldId === 'string' ? document.getElementById(fieldId) : fieldId;
      if (field) offenders.push(field);
      if (msgEl) { msgEl.textContent = msg; msgEl.className = 'field__sublabel field__sublabel--err is-shown'; }
    }

    if (!usernameRx.test(u)) {
      addErr('suUserField', suUserMsgEl, AxiomI18n.t(u.length < 3 ? 'signup.err.user.short' : 'signup.err.user.format'), '');
    }
    if (p.length < 8) {
      addErr(suPwdField, suPwdMsgEl, AxiomI18n.t('signup.err.pwd.short'), '');
    }
    if (p !== c) {
      addErr(suConfField, suConfMsgEl, AxiomI18n.t('signup.err.pwd.mismatch'), '');
    } else if (c.length < 8 && p.length >= 8) {
      addErr(suConfField, suConfMsgEl, AxiomI18n.t('signup.err.pwd.confirm'), '');
    }
    if (!emailRx.test(em)) {
      addErr(suEmailField, suEmailMsgEl, AxiomI18n.t(em ? 'signup.err.email.format' : 'signup.err.email.empty'), '');
    }
    if (emailVerificationRequired && !/^[a-zA-Z0-9]{6}$/i.test(co)) {
      addErr('suCodeField', suCodeMsgEl, AxiomI18n.t(co ? 'signup.err.code.format' : 'signup.err.code.empty'), '');
    }

    if (!terms || offenders.length) {
      offenders.forEach(shakeField);
      const firstOffender = offenders[0];
      if (firstOffender) {
        const firstInput = firstOffender.querySelector('input');
        if (firstInput) firstInput.focus({ preventScroll: true });
      }
      if (!terms) {
        card.classList.add('terms-error');
        setTimeout(() => card.classList.remove('terms-error'), 750);
      }
      /* Mascot tilt stays — it's the global "something's off" cue. */
      const fig = document.querySelector('.plate__fig');
      if (fig) {
        fig.classList.add('is-tilting');
        fig.style.setProperty('--tilt-x', '-3deg');
        fig.style.setProperty('--tilt-y', '0deg');
        setTimeout(() => {
          fig.classList.remove('is-tilting');
          fig.style.setProperty('--tilt-x', '0deg');
        }, 480);
      }
      return;
    }

    /* success ceremony — diamond stamps, button locks, then dashboard */
    const diamond = document.querySelector('.plate__brand-mark');
    if (diamond) {
      diamond.style.setProperty('animation', 'ax-diamond-pulse 0.42s cubic-bezier(0.34,1.56,0.64,1) both', 'important');
    }
    const fig = document.querySelector('.plate__fig');
    if (fig) {
      fig.style.transition = 'transform 0.6s cubic-bezier(0.22,0.61,0.36,1)';
      fig.style.transform  = 'perspective(800px) rotateX(3deg) rotateY(0deg) translateY(2px)';
    }
    btn.classList.add('is-busy');
    btn.disabled = true;
    const orig = btn.querySelector('[data-i18n="signup.submit"]');
    if (orig) orig.textContent = AxiomI18n.t('signup.submit.busy');

    function resetSignupBtn() {
      btn.classList.remove('is-busy');
      btn.disabled = false;
      if (orig) orig.textContent = AxiomI18n.t('signup.submit');
      if (fig) fig.style.transform = '';
    }

    var refCode = initialRefCode;
    var regBody = {
      username: u,
      email: em,
      password: p
    };
    if (emailVerificationRequired) regBody.verification_code = co;
    if (refCode) regBody.aff_code = refCode;

    AxiomHttp.post('/user/register', regBody).then(function() {
      setTimeout(function() { window.location.href = '/login'; }, 720);
    }).catch(function(err) {
      resetSignupBtn();
      let errEl = document.getElementById('signupForm').querySelector('.form-error-msg');
      if (!errEl) {
        errEl = document.createElement('div');
        errEl.className = 'form-error-msg';
        errEl.style.cssText = 'color:var(--verm);font-size:0.82rem;text-align:center;padding:0.5em 0;margin:-0.2em 0 0.4em;';
        document.getElementById('signupForm').insertBefore(errEl, document.getElementById('signupForm').firstChild);
      }
      errEl.textContent = err && err.message ? err.message : AxiomI18n.t('form.error.generic');
      errEl.style.display = 'block';
      var signupForm = document.getElementById('signupForm');
      var clearSignupErr = function() { errEl.style.display = 'none'; };
      signupForm.querySelectorAll('input').forEach(function(inp) {
        inp.addEventListener('input', clearSignupErr, { once: true });
      });
      const fig2 = document.querySelector('.plate__fig');
      if (fig2) {
        fig2.classList.add('is-tilting');
        fig2.style.setProperty('--tilt-x', '-3deg');
        fig2.style.setProperty('--tilt-y', '0deg');
        setTimeout(() => { fig2.classList.remove('is-tilting'); fig2.style.setProperty('--tilt-x', '0deg'); }, 480);
      }
    });
  });
})();

/* ───── SSO buttons: hide/show + bind click ───── */
document.addEventListener('DOMContentLoaded', function() {
  if (typeof AxiomHttp === 'undefined') return;
  var ssoRows = document.querySelectorAll('.sso-row');
  var dividers = document.querySelectorAll('.divider');
  if (!ssoRows.length) return;

  AxiomHttp.get('/status').then(function(s) {
    var google = s.oidc_enabled;
    var github = s.github_oauth;
    if (typeof s.email_verification === 'boolean' &&
        window.AxiomLoginSignupState &&
        typeof window.AxiomLoginSignupState.setEmailVerificationRequired === 'function') {
      window.AxiomLoginSignupState.setEmailVerificationRequired(s.email_verification);
    }
    ssoRows.forEach(function(ssoRow) {
      if (!google) { var g = ssoRow.querySelector('[aria-label*="Google"]'); if (g) g.style.display = 'none'; }
      if (!github) { var h = ssoRow.querySelector('[aria-label*="GitHub"]'); if (h) h.style.display = 'none'; }
      if (!google && !github) ssoRow.style.display = 'none';
    });
    if (!google && !github) dividers.forEach(function(d) { d.style.display = 'none'; });
  }).catch(function(){});

  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.sso-btn');
    if (!btn) return;
    e.preventDefault();
    var label = btn.getAttribute('aria-label') || '';
    var provider = '';
    if (label.indexOf('Google') !== -1) provider = 'google';
    else if (label.indexOf('GitHub') !== -1) provider = 'github';
    if (!provider) return;
    sessionStorage.setItem('axiom_oauth_provider', provider);
    var oauthRefCode = new URLSearchParams(location.search).get('ref') || '';
    if (oauthRefCode) {
      sessionStorage.setItem('axiom_oauth_ref', oauthRefCode);
    } else {
      sessionStorage.removeItem('axiom_oauth_ref');
    }
    btn.style.pointerEvents = 'none';
    btn.style.opacity = '0.6';
    // Clear any existing session so new-api treats OAuth as LOGIN not BIND
    fetch('/api/user/logout', { credentials: 'same-origin' }).catch(function(){}).then(function() {
    return Promise.all([
      fetch('/api/oauth/state' + (oauthRefCode ? ('?aff=' + encodeURIComponent(oauthRefCode)) : ''), { credentials: 'same-origin' }).then(function(r) { return r.json(); }),
      fetch('/api/status', { credentials: 'same-origin' }).then(function(r) { return r.json(); })
    ]); }).then(function(results) {
      var stateJson = results[0];
      var statusResp = results[1];
      if (!stateJson.success || !stateJson.data) throw new Error('state');
      var state = stateJson.data;
      // /api/status wraps fields under .data
      var s = statusResp.data || statusResp;
      var url;
      if (provider === 'github') {
        var clientId = s.github_client_id;
        if (!clientId) throw new Error('GitHub OAuth not configured');
        url = 'https://github.com/login/oauth/authorize' +
          '?client_id=' + encodeURIComponent(clientId) +
          '&scope=user%3Aemail' +
          '&state=' + encodeURIComponent(state);
      } else {
        var authEndpoint = s.oidc_authorization_endpoint;
        var oidcClientId = s.oidc_client_id;
        if (!authEndpoint || !oidcClientId) throw new Error('OIDC not configured');
        var redirectUri = window.location.origin + '/oauth/oidc';
        url = authEndpoint +
          '?client_id=' + encodeURIComponent(oidcClientId) +
          '&redirect_uri=' + encodeURIComponent(redirectUri) +
          '&response_type=code' +
          '&scope=openid+email+profile' +
          '&state=' + encodeURIComponent(state);
      }
      window.location.href = url;
    }).catch(function() {
      btn.style.pointerEvents = '';
      btn.style.opacity = '';
    });
  });
});
