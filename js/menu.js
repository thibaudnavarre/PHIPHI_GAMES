import { start as startFreecul, stop as stopFreecul } from './freecul/game.js';
import {
  start as startLightcul,
  stop as stopLightcul,
} from './lightcul/game.js';
import { start as startSudocul, stop as stopSudocul } from './sudocul/game.js';

const menu = document.getElementById('menu');
const appSudocul = document.getElementById('app-sudocul');
const appFreecul = document.getElementById('app-freecul');
const appLightcul = document.getElementById('app-lightcul');
const menuBtnSudocul = document.getElementById('menu-btn-sudocul');
const menuBtnFreecul = document.getElementById('menu-btn-freecul');
const menuBtnLightcul = document.getElementById('menu-btn-lightcul');
const gotoMenuSudocul = document.getElementById('goto-menu-sudocul');
const gotoMenuFreecul = document.getElementById('goto-menu-freecul');
const gotoMenuLightcul = document.getElementById('goto-menu-lightcul');
const updateBtn = document.getElementById('update-btn');

// ── SERVICE WORKER & UPDATE ───────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then((reg) => {
    // A new SW is already waiting (page was opened after an update installed)
    if (reg.waiting) showUpdateBtn(reg.waiting);

    // A new SW finishes installing while the page is open
    reg.addEventListener('updatefound', () => {
      const newSW = reg.installing;
      newSW.addEventListener('statechange', () => {
        if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdateBtn(newSW);
        }
      });
    });
  });

  // When the new SW takes control, reload to serve fresh files
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

function showUpdateBtn(swWaiting) {
  updateBtn.classList.remove('hidden');
  updateBtn.addEventListener(
    'click',
    () => {
      swWaiting.postMessage({ type: 'SKIP_WAITING' });
    },
    { once: true },
  );
}

// ── NAVIGATION ────────────────────────────────────────────────────────────────
function showMenu() {
  stopSudocul();
  stopFreecul();
  stopLightcul();
  appSudocul.classList.add('hidden');
  appFreecul.classList.add('hidden');
  appLightcul.classList.add('hidden');
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

function launchLightcul() {
  menu.classList.add('hidden');
  appLightcul.classList.remove('hidden');
  startLightcul();
}

// ── EVENT LISTENERS ───────────────────────────────────────────────────────────
document
  .getElementById('tile-sudocul')
  .addEventListener('click', launchSudocul);
document
  .getElementById('tile-freecul')
  .addEventListener('click', launchFreecul);
document
  .getElementById('tile-lightcul')
  .addEventListener('click', launchLightcul);
menuBtnSudocul.addEventListener('click', showMenu);
menuBtnFreecul.addEventListener('click', showMenu);
menuBtnLightcul.addEventListener('click', showMenu);
gotoMenuSudocul.addEventListener('click', showMenu);
gotoMenuFreecul.addEventListener('click', showMenu);
gotoMenuLightcul.addEventListener('click', showMenu);

// ── BOOT ──────────────────────────────────────────────────────────────────────
showMenu();
