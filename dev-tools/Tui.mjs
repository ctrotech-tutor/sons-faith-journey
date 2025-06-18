// dev-tools/tui.mjs

import blessed from 'blessed';
import contrib from 'blessed-contrib';
import chalk from 'chalk';
import { execSync } from 'child_process';
import chokidar from 'chokidar';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import si from 'systeminformation';
import { generateCommitMessage } from './gemini.cjs';

dotenv.config();

// Create screen and layout
const screen = blessed.screen();
const grid = new contrib.grid({ rows: 12, cols: 12, screen });

const logBox = grid.set(0, 0, 10, 12, contrib.log, {
  label: 'AutoPush Logs',
  tags: true,
  border: { type: 'line' },
});

const statusBar = grid.set(10, 0, 1, 12, blessed.box, {
  content: '{center}Status: Ready{/center}',
  tags: true,
  style: { fg: 'white', bg: 'blue' },
});

const helpBar = grid.set(11, 0, 1, 12, blessed.box, {
  content: 'Keys: [q] Quit | [t] Toggle AutoPush | [p] Push Now | [b] Battery Check',
  tags: true,
  style: { fg: 'black', bg: 'green' },
});

let autoPush = true;
let debounceTimer = null;
let isPushing = false;

const isBatterySafe = async (threshold = 20) => {
  try {
    const battery = await si.battery();
    return battery.hasBattery ? battery.percent > threshold : true;
  } catch (err) {
    logBox.log(`{red-fg}Battery check failed:{/red-fg} ${err.message}`);
    return true;
  }
};

const pushToGit = async () => {
  if (isPushing) return;
  isPushing = true;

  const timestamp = new Date().toLocaleTimeString();
  const batteryOkay = await isBatterySafe();

  if (!batteryOkay) {
    logBox.log(`{yellow-fg}[${timestamp}] Battery too low. Push skipped{/yellow-fg}`);
    isPushing = false;
    return;
  }

  try {
    execSync('git add .');
    const diff = execSync('git diff --cached --shortstat').toString();
    if (!diff.trim()) {
      logBox.log(`{gray-fg}[${timestamp}] No changes to commit{/gray-fg}`);
      isPushing = false;
      return;
    }

    logBox.log(`{cyan-fg}[${timestamp}] Generating commit message...{/cyan-fg}`);
    const msg = await generateCommitMessage(diff);

    execSync(`git commit -m "${msg}"`);
    execSync('git push origin main');

    logBox.log(`{green-fg}[${timestamp}] Commit pushed: ${msg}{/green-fg}`);
  } catch (err) {
    logBox.log(`{red-fg}[${timestamp}] Push failed: ${err.message}{/red-fg}`);
  }

  isPushing = false;
};

chokidar.watch('.', { ignored: /node_modules|\.git|dist|build|\.next|\.vercel\.cache/, ignoreInitial: true })
  .on('change', (filePath) => {
    logBox.log(`{blue-fg}File changed:{/blue-fg} ${filePath}`);
    if (!autoPush) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(pushToGit, 3000);
  });

screen.key(['q', 'C-c'], () => process.exit(0));
screen.key('t', () => {
  autoPush = !autoPush;
  statusBar.setContent(`{center}Status: ${autoPush ? 'AutoPush ON' : 'AutoPush OFF'}{/center}`);
  screen.render();
});
screen.key('p', pushToGit);
screen.key('b', async () => {
  const battery = await si.battery();
  const msg = battery.hasBattery ? `Battery: ${battery.percent}%` : 'No battery detected';
  logBox.log(`{yellow-fg}${msg}{/yellow-fg}`);
});

screen.render();