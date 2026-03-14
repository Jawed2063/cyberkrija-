/* global state */
let ALL_TOOLS = [];
let ALL_LABS  = [];
let filtered  = [];
let activeCategory = 'All';
let currentPage = 0;
const PAGE_SIZE = 30;

/* ── bootstrap ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const [t, l] = await Promise.all([
      fetch('data/tools.json').then(r => r.json()),
      fetch('data/labs.json').then(r => r.json())
    ]);
    ALL_TOOLS = t;
    ALL_LABS  = l;
  } catch (e) {
    ALL_TOOLS = [];
    ALL_LABS  = [];
  }

  buildSidebar();
  renderStats();
  renderFeatured();
  applyFilter();
  renderLabs();
  renderResources();
  initTyping();
  initSearch();
  registerSW();

  // default page
  showPage('home');
});

/* ── navigation ─────────────────────────────────────────── */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pg = document.getElementById('page-' + id);
  if (pg) pg.classList.add('active');
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === id);
  });
}

document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
  a.addEventListener('click', e => { e.preventDefault(); showPage(a.dataset.page); });
});

document.querySelectorAll('[data-goto]').forEach(el => {
  el.addEventListener('click', () => showPage(el.dataset.goto));
});

/* ── sidebar categories ─────────────────────────────────── */
function buildSidebar() {
  const counts = {};
  ALL_TOOLS.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
  const cats = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  const sb = document.getElementById('sidebar-cats');
  if (!sb) return;
  sb.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.className = 'cat-btn active';
  allBtn.dataset.cat = 'All';
  allBtn.innerHTML = 'All <span class="cat-count">' + ALL_TOOLS.length + '</span>';
  allBtn.addEventListener('click', () => selectCategory('All', allBtn));
  sb.appendChild(allBtn);

  cats.forEach(([name, count]) => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn';
    btn.dataset.cat = name;
    btn.innerHTML = name + ' <span class="cat-count">' + count + '</span>';
    btn.addEventListener('click', () => selectCategory(name, btn));
    sb.appendChild(btn);
  });
}

function selectCategory(cat, btn) {
  activeCategory = cat;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentPage = 0;
  applyFilter();
  showPage('tools');
}

/* ── filter + render tools ──────────────────────────────── */
function applyFilter(query) {
  const q = (query || document.getElementById('main-search')?.value || '').toLowerCase().trim();
  filtered = ALL_TOOLS.filter(t => {
    const catOk = activeCategory === 'All' || t.category === activeCategory;
    if (!q) return catOk;
    return catOk && (
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      (t.tags || []).some(tg => tg.toLowerCase().includes(q))
    );
  });
  currentPage = 0;
  renderToolsGrid();
}

function renderToolsGrid() {
  const grid = document.getElementById('tools-grid');
  const countEl = document.getElementById('tools-count');
  if (!grid) return;

  if (countEl) countEl.textContent = filtered.length + ' tools';

  const slice = filtered.slice(0, (currentPage + 1) * PAGE_SIZE);
  grid.innerHTML = slice.map(toolCard).join('');
  grid.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('click', () => openModal(+card.dataset.id));
  });

  const loadBtn = document.getElementById('load-more');
  if (loadBtn) {
    loadBtn.style.display = slice.length < filtered.length ? 'inline-block' : 'none';
  }
}

document.getElementById('load-more')?.addEventListener('click', () => {
  currentPage++;
  renderToolsGrid();
});

document.getElementById('main-search')?.addEventListener('input', e => applyFilter(e.target.value));

function toolCard(t) {
  return `<div class="tool-card" data-id="${t.id}">
    <div class="tool-card-name">⚙ ${esc(t.name)}</div>
    <div class="tool-card-cat">${esc(t.category)}</div>
    <div class="tool-card-desc">${esc(t.description)}</div>
    <div style="margin-top:.5rem">
      <span class="difficulty-badge diff-${t.difficulty}">${t.difficulty}</span>
    </div>
  </div>`;
}

/* ── modal ──────────────────────────────────────────────── */
function openModal(id) {
  const t = ALL_TOOLS.find(x => x.id === id);
  if (!t) return;

  const m = document.getElementById('tool-modal');
  const content = document.getElementById('modal-content');
  content.innerHTML = `
    <button class="modal-close" id="modal-close-btn">✕</button>
    <div class="modal-title">⚙ ${esc(t.name)}</div>
    <div class="modal-meta">
      <span class="tool-card-cat">${esc(t.category)}</span>
      <span class="difficulty-badge diff-${t.difficulty}">${t.difficulty}</span>
      ${t.license ? '<span>📄 ' + esc(t.license) + '</span>' : ''}
      ${t.url ? '<a href="' + esc(t.url) + '" target="_blank" rel="noopener" style="color:var(--cyan)">🔗 Website</a>' : ''}
    </div>
    <p style="color:var(--text2);line-height:1.7">${esc(t.description)}</p>
    ${t.commands && t.commands.length ? `
    <div class="modal-section">
      <h4>Example Commands</h4>
      ${t.commands.map(cmd => `
        <div class="cmd-block">
          <span style="flex:1">${esc(cmd)}</span>
          <button class="cmd-copy" data-cmd="${esc(cmd)}">Copy</button>
        </div>`).join('')}
    </div>` : ''}
    ${t.tags && t.tags.length ? `
    <div class="modal-section">
      <h4>Tags</h4>
      <div class="related-tags">${t.tags.map(tg => `<span class="tag">${esc(tg)}</span>`).join('')}</div>
    </div>` : ''}
    ${t.platform && t.platform.length ? `
    <div class="modal-section">
      <h4>Platforms</h4>
      <div class="related-tags">${t.platform.map(p => `<span class="tag">💻 ${esc(p)}</span>`).join('')}</div>
    </div>` : ''}
  `;
  m.classList.add('open');
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  m.querySelectorAll('.cmd-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.cmd).then(() => toast('Copied!'));
    });
  });
  m.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', () => {
      closeModal();
      document.getElementById('main-search').value = tag.textContent;
      applyFilter(tag.textContent);
      showPage('tools');
    });
  });
}

function closeModal() {
  document.getElementById('tool-modal').classList.remove('open');
}
document.getElementById('tool-modal')?.addEventListener('click', e => {
  if (e.target === document.getElementById('tool-modal')) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ── stats ──────────────────────────────────────────────── */
function renderStats() {
  const cats = new Set(ALL_TOOLS.map(t => t.category)).size;
  animateCount('stat-tools', ALL_TOOLS.length);
  animateCount('stat-labs', ALL_LABS.length);
  animateCount('stat-cats', cats);
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let n = 0;
  const step = Math.ceil(target / 40);
  const iv = setInterval(() => {
    n = Math.min(n + step, target);
    el.textContent = n + '+';
    if (n >= target) clearInterval(iv);
  }, 30);
}

/* ── featured tools on home page ───────────────────────── */
function renderFeatured() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  const picks = ALL_TOOLS.slice(0, 6);
  grid.innerHTML = picks.map(toolCard).join('');
  grid.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('click', () => openModal(+card.dataset.id));
  });
}

/* ── labs ───────────────────────────────────────────────── */
function renderLabs() {
  const grid = document.getElementById('labs-grid');
  if (!grid) return;
  grid.innerHTML = ALL_LABS.map((lab, i) => `
    <div class="lab-card" data-lab="${i}">
      <div class="lab-card-title">🔬 ${esc(lab.title)}</div>
      <div class="lab-card-meta">${lab.category} · ${lab.difficulty} · ${lab.duration}</div>
      <p style="font-size:.8rem;color:var(--text2);margin-top:.5rem">${esc(lab.description)}</p>
    </div>`).join('');
  grid.querySelectorAll('.lab-card').forEach(card => {
    card.addEventListener('click', () => openLab(+card.dataset.lab));
  });
}

function openLab(idx) {
  const lab = ALL_LABS[idx];
  if (!lab) return;
  const panel = document.getElementById('lab-panel');
  const title = document.getElementById('lab-title');
  const term  = document.getElementById('lab-terminal');
  if (!panel) return;

  panel.style.display = 'block';
  title.textContent = '🔬 ' + lab.title;
  term.innerHTML = '';
  let stepIndex = 0;

  function renderStep(step) {
    appendLine('prompt', '$ ' + step.command.split('\n')[0]);
    appendLine('output', step.output);
    if (step.explanation) appendLine('output', '  ℹ  ' + step.explanation);
  }

  function appendLine(cls, text) {
    const span = document.createElement('span');
    span.className = 'term-line term-' + cls;
    span.textContent = text;
    term.appendChild(span);
    term.scrollTop = term.scrollHeight;
  }

  appendLine('output', '# Lab: ' + lab.title);
  appendLine('output', '# Difficulty: ' + lab.difficulty + '  |  Duration: ' + lab.duration);
  appendLine('output', '# Type "next" to proceed through steps, "reset" to start over.');
  appendLine('output', '');

  const input = document.getElementById('lab-cmd-input');
  const runBtn = document.getElementById('lab-run-btn');
  if (input) input.value = '';

  function handleCmd(val) {
    const v = val.trim().toLowerCase();
    appendLine('prompt', '$ ' + val.trim());
    if (v === 'next' || v === '') {
      if (stepIndex < lab.steps.length) {
        renderStep(lab.steps[stepIndex++]);
      } else {
        appendLine('output', '✅ Lab complete! All steps done.');
      }
    } else if (v === 'reset') {
      openLab(idx);
    } else if (v === 'help') {
      appendLine('output', 'Commands: next | reset | help');
    } else {
      appendLine('output', 'Type "next" to show the next step.');
    }
    if (input) input.value = '';
  }

  if (runBtn) {
    runBtn.onclick = () => handleCmd(input ? input.value : 'next');
  }
  if (input) {
    input.onkeydown = e => { if (e.key === 'Enter') handleCmd(input.value); };
  }
}

document.getElementById('lab-close-btn')?.addEventListener('click', () => {
  document.getElementById('lab-panel').style.display = 'none';
});

/* ── resources ──────────────────────────────────────────── */
function renderResources() {
  const grid = document.getElementById('resources-grid');
  if (!grid) return;
  const resources = [
    { title: '📚 Learning Platforms', links: [
      { name: 'TryHackMe', url: 'https://tryhackme.com' },
      { name: 'HackTheBox', url: 'https://hackthebox.com' },
      { name: 'PentesterLab', url: 'https://pentesterlab.com' },
      { name: 'PortSwigger Web Academy', url: 'https://portswigger.net/web-security' },
      { name: 'VulnHub', url: 'https://vulnhub.com' }
    ]},
    { title: '📜 Certifications', links: [
      { name: 'OSCP (Offensive Security)', url: 'https://offensive-security.com/pwk-oscp/' },
      { name: 'CEH (EC-Council)', url: 'https://eccouncil.org/train-certify/certified-ethical-hacker-ceh/' },
      { name: 'PNPT (TCM Security)', url: 'https://certifications.tcm-sec.com/pnpt/' },
      { name: 'CompTIA Security+', url: 'https://comptia.org/certifications/security' },
      { name: 'eJPT (eLearnSecurity)', url: 'https://elearnsecurity.com/product/ejpt-certification/' }
    ]},
    { title: '🔗 Reference Sites', links: [
      { name: 'OWASP Top 10', url: 'https://owasp.org/Top10/' },
      { name: 'GTFOBins', url: 'https://gtfobins.github.io' },
      { name: 'LOLBAS Project', url: 'https://lolbas-project.github.io' },
      { name: 'PayloadsAllTheThings', url: 'https://github.com/swisskyrepo/PayloadsAllTheThings' },
      { name: 'HackTricks', url: 'https://book.hacktricks.xyz' }
    ]},
    { title: '🛠 Vulnerable Labs', links: [
      { name: 'DVWA', url: 'https://dvwa.co.uk' },
      { name: 'WebGoat (OWASP)', url: 'https://owasp.org/www-project-webgoat/' },
      { name: 'Metasploitable', url: 'https://sourceforge.net/projects/metasploitable/' },
      { name: 'OWASP Juice Shop', url: 'https://owasp.org/www-project-juice-shop/' },
      { name: 'bWAPP', url: 'http://www.itsecgames.com' }
    ]},
    { title: '📰 News & Blogs', links: [
      { name: 'Krebs on Security', url: 'https://krebsonsecurity.com' },
      { name: 'The Hacker News', url: 'https://thehackernews.com' },
      { name: 'Bleeping Computer', url: 'https://bleepingcomputer.com' },
      { name: 'Threatpost', url: 'https://threatpost.com' },
      { name: 'Dark Reading', url: 'https://darkreading.com' }
    ]},
    { title: '📄 CVE & Exploits', links: [
      { name: 'NVD (NIST)', url: 'https://nvd.nist.gov' },
      { name: 'Exploit-DB', url: 'https://exploit-db.com' },
      { name: 'CVE Details', url: 'https://cvedetails.com' },
      { name: 'Packet Storm', url: 'https://packetstormsecurity.com' },
      { name: 'VulDB', url: 'https://vuldb.com' }
    ]}
  ];

  grid.innerHTML = resources.map(r => `
    <div class="resource-card">
      <h4>${r.title}</h4>
      ${r.links.map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.name)} ↗</a>`).join('')}
    </div>`).join('');
}

/* ── navbar search ──────────────────────────────────────── */
function initSearch() {
  const input = document.getElementById('nav-search');
  const dd    = document.getElementById('search-dropdown');
  if (!input || !dd) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { dd.classList.remove('open'); return; }
    const hits = ALL_TOOLS.filter(t =>
      t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    ).slice(0, 8);
    dd.innerHTML = hits.map(t =>
      `<div class="search-result-item" data-id="${t.id}"><strong>${esc(t.name)}</strong> <span>${esc(t.category)}</span></div>`
    ).join('') || '<div class="search-result-item"><span>No results</span></div>';
    dd.classList.add('open');
    dd.querySelectorAll('[data-id]').forEach(item => {
      item.addEventListener('click', () => {
        openModal(+item.dataset.id);
        dd.classList.remove('open');
        input.value = '';
        showPage('tools');
      });
    });
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !dd.contains(e.target)) dd.classList.remove('open');
  });
}

/* ── typing effect ──────────────────────────────────────── */
function initTyping() {
  const el = document.getElementById('typing-text');
  if (!el) return;
  const lines = [
    'nmap -sV -sC -A 192.168.1.0/24',
    'sqlmap -u "http://target.com/?id=1" --dbs',
    'hydra -l admin -P rockyou.txt ssh://192.168.1.1',
    'msfconsole -x "use exploit/multi/handler"',
    'hashcat -m 0 -a 0 hashes.txt rockyou.txt',
    'gobuster dir -u http://target.com -w common.txt',
    'volatility -f memory.dmp imageinfo'
  ];
  let li = 0, ci = 0, deleting = false;
  setInterval(() => {
    const line = lines[li % lines.length];
    if (!deleting) {
      el.textContent = line.slice(0, ++ci);
      if (ci >= line.length) { deleting = true; }
    } else {
      el.textContent = line.slice(0, --ci);
      if (ci === 0) { deleting = false; li++; }
    }
  }, 60);
}

/* ── theme toggle ───────────────────────────────────────── */
document.getElementById('theme-btn')?.addEventListener('click', () => {
  const cur = document.documentElement.dataset.theme;
  document.documentElement.dataset.theme = cur === 'light' ? '' : 'light';
  document.getElementById('theme-btn').textContent = cur === 'light' ? '🌙' : '☀️';
});

/* ── toast ──────────────────────────────────────────────── */
function toast(msg) {
  const tc = document.getElementById('toast-container');
  if (!tc) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  tc.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

/* ── service worker ─────────────────────────────────────── */
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

/* ── helper ─────────────────────────────────────────────── */
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
