import { start as startFreecul, stop as stopFreecul } from './freecul/game.js';
import { start as startSudocul, stop as stopSudocul } from './sudocul/game.js';

const menu = document.getElementById('menu');
const appSudocul = document.getElementById('app-sudocul');
const appFreecul = document.getElementById('app-freecul');
const menuBtnSudocul = document.getElementById('menu-btn-sudocul');
const menuBtnFreecul = document.getElementById('menu-btn-freecul');
const gotoMenuSudocul = document.getElementById('goto-menu-sudocul');
const gotoMenuFreecul = document.getElementById('goto-menu-freecul');

// ── NAVIGATION ────────────────────────────────────────────────────────────────
function showMenu() {
  stopSudocul();
  stopFreecul();
  appSudocul.classList.add('hidden');
  appFreecul.classList.add('hidden');
  menu.classList.remove('hidden');
}

function launchSudocul() {
  menu.classList.add('hidden');
  appSudocul.classList.remove('hidden');
  startSudocul();
}

function launchFreecul() {
  menu.classList.add('hidden');
  appFreecul.classList.remove('hidden');
  startFreecul();
}

// ── EVENT LISTENERS ───────────────────────────────────────────────────────────
document
  .getElementById('tile-sudocul')
  .addEventListener('click', launchSudocul);
document
  .getElementById('tile-freecul')
  .addEventListener('click', launchFreecul);
menuBtnSudocul.addEventListener('click', showMenu);
menuBtnFreecul.addEventListener('click', showMenu);
gotoMenuSudocul.addEventListener('click', showMenu);
gotoMenuFreecul.addEventListener('click', showMenu);

// ── BOOT ──────────────────────────────────────────────────────────────────────
showMenu();
