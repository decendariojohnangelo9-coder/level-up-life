/* ===========================
   LEVEL UP LIFE - script.js
   =========================== */

// ========================
// THEME (Dark/Light Mode)
// ========================
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
    if (themeIcon) themeIcon.className = 'fas fa-sun';
  } else {
    document.body.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
    if (themeIcon) themeIcon.className = 'fas fa-moon';
  }
}

const savedTheme = localStorage.getItem('lul_theme') || 'dark';
applyTheme(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.contains('light-mode');
    const newTheme = isLight ? 'dark' : 'light';
    localStorage.setItem('lul_theme', newTheme);
    applyTheme(newTheme);
  });
}

// ========================
// HAMBURGER MENU
// ========================
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const sidebar = document.getElementById('sidebar');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    if (navLinks) navLinks.classList.toggle('open');
    if (sidebar) sidebar.classList.toggle('open');
  });
}

// Close nav when link clicked (mobile)
if (navLinks) {
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// ========================
// XP & LEVEL SYSTEM
// ========================
function getPlayerData() {
  return JSON.parse(localStorage.getItem('lul_player') || JSON.stringify({
    xp: 0,
    level: 1,
    totalTasks: 0,
    totalHabits: 0,
    streak: 0,
    lastLogin: null,
    achievementsUnlocked: []
  }));
}

function savePlayerData(data) {
  localStorage.setItem('lul_player', JSON.stringify(data));
}

function xpForLevel(level) { return level * 100; }

function addXP(amount, reason) {
  const data = getPlayerData();
  data.xp += amount;

  const needed = xpForLevel(data.level);
  if (data.xp >= needed) {
    data.xp -= needed;
    data.level += 1;
    showToast(`🎉 LEVEL UP! You are now Level ${data.level}!`, 'xp');
    checkAchievements(data);
  }

  savePlayerData(data);
  updateXPBar();
  showToast(`⚡ +${amount} XP — ${reason}`, 'xp');
}

function updateXPBar() {
  const data = getPlayerData();
  const needed = xpForLevel(data.level);
  const pct = Math.min((data.xp / needed) * 100, 100);

  const xpBarEl = document.getElementById('xpBar');
  const xpTextEl = document.getElementById('xpText');
  const levelEl = document.getElementById('levelNum');
  const levelTitleEl = document.getElementById('levelTitle');

  if (xpBarEl) xpBarEl.style.width = pct + '%';
  if (xpTextEl) xpTextEl.textContent = `${data.xp} / ${needed} XP`;
  if (levelEl) levelEl.textContent = data.level;
  if (levelTitleEl) levelTitleEl.textContent = getLevelTitle(data.level);
}

function getLevelTitle(level) {
  if (level <= 1) return 'Novice';
  if (level <= 3) return 'Apprentice';
  if (level <= 5) return 'Warrior';
  if (level <= 8) return 'Quest Seeker';
  if (level <= 12) return 'Champion';
  if (level <= 20) return 'Hero';
  return 'Legendary';
}

// ========================
// STREAK SYSTEM
// ========================
function updateStreak() {
  const data = getPlayerData();
  const today = new Date().toDateString();
  if (data.lastLogin !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (data.lastLogin === yesterday) {
      data.streak += 1;
    } else if (data.lastLogin !== today) {
      data.streak = 1;
    }
    data.lastLogin = today;
    savePlayerData(data);
  }
  const streakEl = document.getElementById('streakNum');
  if (streakEl) streakEl.textContent = data.streak;
}

// ========================
// ACHIEVEMENTS CHECK
// ========================
const ACHIEVEMENTS = [
  { id: 'first_task', name: 'First Step', condition: d => d.totalTasks >= 1 },
  { id: 'task5', name: 'Beginner', condition: d => d.totalTasks >= 5 },
  { id: 'task20', name: 'Achiever', condition: d => d.totalTasks >= 20 },
  { id: 'habit5', name: 'Habitual', condition: d => d.totalHabits >= 5 },
  { id: 'streak7', name: 'Warrior', condition: d => d.streak >= 7 },
  { id: 'level5', name: 'Rising Star', condition: d => d.level >= 5 },
  { id: 'level10', name: 'Master', condition: d => d.level >= 10 },
];

function checkAchievements(data) {
  ACHIEVEMENTS.forEach(ach => {
    if (!data.achievementsUnlocked.includes(ach.id) && ach.condition(data)) {
      data.achievementsUnlocked.push(ach.id);
      showToast(`🏆 Achievement Unlocked: ${ach.name}!`, 'xp');
    }
  });
  savePlayerData(data);
}

// ========================
// TOAST NOTIFICATIONS
// ========================
function showToast(msg, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: 'fa-circle-check', xp: 'fa-bolt', warning: 'fa-triangle-exclamation' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${icons[type] || icons.success}"></i> ${msg}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = '0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ========================
// MODAL
// ========================
function showModal(icon, title, msg, onConfirm) {
  let overlay = document.getElementById('modalOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modalOverlay';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-icon" id="modalIcon"></div>
        <h2 id="modalTitle"></h2>
        <p id="modalMsg"></p>
        <div style="display:flex;gap:.8rem;justify-content:center">
          <button class="btn-primary btn-sm" id="modalConfirm">Confirm</button>
          <button class="btn-ghost btn-sm" id="modalCancel">Cancel</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }

  document.getElementById('modalIcon').textContent = icon;
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalMsg').textContent = msg;
  overlay.classList.add('show');

  document.getElementById('modalConfirm').onclick = () => {
    overlay.classList.remove('show');
    if (onConfirm) onConfirm();
  };
  document.getElementById('modalCancel').onclick = () => overlay.classList.remove('show');
}

// ========================
// SCROLL FADE-IN
// ========================
function initScrollAnimations() {
  const targets = document.querySelectorAll('.feat-card, .stat-card, .badge-card, .panel, .xp-step, .hcard');
  targets.forEach(el => el.classList.add('fade-in'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(el => observer.observe(el));
}

// ========================
// COUNTER ANIMATION
// ========================
function animateCounters() {
  document.querySelectorAll('.hstat-num').forEach(el => {
    const target = parseInt(el.dataset.target);
    let count = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      count = Math.min(count + step, target);
      el.textContent = count;
      if (count >= target) clearInterval(timer);
    }, 40);
  });
}

// ========================
// LOADING SCREEN
// ========================
function initLoader() {
  const loader = document.querySelector('.loader');
  if (!loader) return;
  setTimeout(() => loader.classList.add('hidden'), 1500);
}

// ========================
// INIT
// ========================
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  updateXPBar();
  updateStreak();
  initScrollAnimations();
  animateCounters();

  // Highlight active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .sidebar a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Dashboard stats sync
  const data = getPlayerData();
  const totalTasksEl = document.getElementById('totalTasksNum');
  const totalHabitsEl = document.getElementById('totalHabitsNum');
  if (totalTasksEl) totalTasksEl.textContent = data.totalTasks;
  if (totalHabitsEl) totalHabitsEl.textContent = data.totalHabits;
});