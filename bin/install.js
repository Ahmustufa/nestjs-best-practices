#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');

// ── Colors (ANSI) ──────────────────────────────────────────────
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  bgCyan: '\x1b[46m',
  bgGreen: '\x1b[42m',
  black: '\x1b[30m',
};

// ── Config ─────────────────────────────────────────────────────
const SKILL_NAME = 'nestjs-best-practices';
const PACKAGE_DIR = path.resolve(__dirname, '..');
const FILES_TO_COPY = ['SKILL.md', 'AGENTS.md'];
const RULES_DIR = 'rules';

const IDE_OPTIONS = [
  { name: 'Claude Code', icon: '◆', path: path.join(os.homedir(), '.claude', 'skills', SKILL_NAME) },
  { name: 'Cursor', icon: '⬡', path: path.join(os.homedir(), '.cursor', 'skills', SKILL_NAME) },
  { name: 'Windsurf', icon: '◈', path: path.join(os.homedir(), '.windsurf', 'skills', SKILL_NAME) },
  { name: 'All supported tools', icon: '★', path: '__ALL__' },
  { name: 'Custom path', icon: '…', path: null },
];

const SCOPE_OPTIONS = [
  { name: 'Global (available in all projects)', icon: '🌐' },
  { name: 'Local (current project only)', icon: '📁' },
];

// ── Helpers ────────────────────────────────────────────────────
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

function installTo(destDir) {
  if (fs.existsSync(destDir)) fs.rmSync(destDir, { recursive: true, force: true });
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of FILES_TO_COPY) {
    const src = path.join(PACKAGE_DIR, file);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(destDir, file));
  }
  const rulesSource = path.join(PACKAGE_DIR, RULES_DIR);
  if (fs.existsSync(rulesSource)) copyDir(rulesSource, path.join(destDir, RULES_DIR));
}

function hideCursor() { process.stdout.write('\x1b[?25l'); }
function showCursor() { process.stdout.write('\x1b[?25h'); }
function clearLines(n) {
  for (let i = 0; i < n; i++) {
    process.stdout.write('\x1b[1A\x1b[2K');
  }
}

// ── Shared readline for non-TTY ────────────────────────────────
let _rl = null;
function getRL() {
  if (!_rl) _rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return _rl;
}
function closeRL() { if (_rl) { _rl.close(); _rl = null; } }

// ── Fallback Select (non-TTY) ──────────────────────────────────
function selectFallback(title, options) {
  return new Promise((resolve) => {
    const rl = getRL();
    console.log(`\n  ${c.bold}${c.cyan}${title}${c.reset}\n`);
    options.forEach((opt, i) => {
      console.log(`    ${c.cyan}${i + 1})${c.reset} ${opt.icon}  ${opt.name}`);
    });
    console.log();
    rl.question(`  ${c.bold}Enter number:${c.reset} `, (answer) => {
      const idx = parseInt(answer.trim(), 10) - 1;
      if (isNaN(idx) || idx < 0 || idx >= options.length) {
        console.log(`\n  ${c.red}✗${c.reset} Invalid choice. Exiting.\n`);
        closeRL();
        process.exit(1);
      }
      console.log();
      resolve(idx);
    });
  });
}

// ── Interactive Select ─────────────────────────────────────────
function select(title, options) {
  // Fallback for non-TTY (piped input, CI, etc.)
  if (!process.stdin.isTTY) {
    return selectFallback(title, options);
  }

  return new Promise((resolve) => {
    let selected = 0;
    const { stdin, stdout } = process;

    function render() {
      const lines = [];
      lines.push(`  ${c.bold}${c.cyan}${title}${c.reset}\n`);
      options.forEach((opt, i) => {
        if (i === selected) {
          lines.push(`  ${c.bgCyan}${c.black}${c.bold} ${opt.icon}  ${opt.name} ${c.reset}`);
        } else {
          lines.push(`  ${c.dim}   ${opt.icon}  ${opt.name}${c.reset}`);
        }
      });
      lines.push(`\n  ${c.dim}↑/↓ navigate  ⏎ select${c.reset}`);
      return lines;
    }

    hideCursor();
    let rendered = render();
    stdout.write(rendered.join('\n') + '\n');

    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    function onKey(key) {
      // Ctrl+C
      if (key === '\u0003') {
        showCursor();
        stdin.setRawMode(false);
        stdin.removeListener('data', onKey);
        process.exit(0);
      }
      // Up arrow
      if (key === '\x1b[A' || key === 'k') {
        selected = (selected - 1 + options.length) % options.length;
      }
      // Down arrow
      if (key === '\x1b[B' || key === 'j') {
        selected = (selected + 1) % options.length;
      }
      // Enter
      if (key === '\r' || key === '\n') {
        showCursor();
        stdin.setRawMode(false);
        stdin.removeListener('data', onKey);
        stdin.pause();
        clearLines(rendered.length);
        stdout.write(`  ${c.bold}${c.cyan}${title}${c.reset} ${c.green}${options[selected].icon}  ${options[selected].name}${c.reset}\n\n`);
        resolve(selected);
        return;
      }

      clearLines(rendered.length);
      rendered = render();
      stdout.write(rendered.join('\n') + '\n');
    }

    stdin.on('data', onKey);
  });
}

// ── Text Input ─────────────────────────────────────────────────
function textInput(prompt) {
  return new Promise((resolve) => {
    const rl = process.stdin.isTTY
      ? readline.createInterface({ input: process.stdin, output: process.stdout })
      : getRL();
    rl.question(`  ${c.bold}${c.cyan}${prompt}${c.reset} ${c.yellow}`, (answer) => {
      process.stdout.write(c.reset);
      if (process.stdin.isTTY) rl.close();
      resolve(answer.trim());
    });
  });
}

// ── Progress Animation ─────────────────────────────────────────
function showProgress(text) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  hideCursor();
  const id = setInterval(() => {
    process.stdout.write(`\r  ${c.cyan}${frames[i % frames.length]}${c.reset} ${text}`);
    i++;
  }, 80);
  return {
    stop(result) {
      clearInterval(id);
      process.stdout.write(`\r\x1b[2K`);
      process.stdout.write(`  ${c.green}✓${c.reset} ${result}\n`);
      showCursor();
    },
    fail(result) {
      clearInterval(id);
      process.stdout.write(`\r\x1b[2K`);
      process.stdout.write(`  ${c.red}✗${c.reset} ${result}\n`);
      showCursor();
    },
  };
}

// ── Banner ─────────────────────────────────────────────────────
function banner() {
  console.log();
  console.log(`  ${c.cyan}${c.bold}╔═══════════════════════════════════════════════════╗${c.reset}`);
  console.log(`  ${c.cyan}${c.bold}║${c.reset}  ${c.magenta}${c.bold}⚡ NestJS Best Practices${c.reset}  ${c.dim}Skill Installer${c.reset}      ${c.cyan}${c.bold}║${c.reset}`);
  console.log(`  ${c.cyan}${c.bold}║${c.reset}  ${c.dim}24 production-ready rules for your AI editor${c.reset}    ${c.cyan}${c.bold}║${c.reset}`);
  console.log(`  ${c.cyan}${c.bold}╚═══════════════════════════════════════════════════╝${c.reset}`);
  console.log();
}

// ── Main ───────────────────────────────────────────────────────
async function main() {
  banner();

  // Step 1: Select IDE
  const ideIndex = await select('Select your AI code editor:', IDE_OPTIONS);
  const ide = IDE_OPTIONS[ideIndex];

  // Step 2: Handle custom path
  let targetPaths = [];
  let targetNames = [];

  if (ide.path === '__ALL__') {
    for (const opt of IDE_OPTIONS) {
      if (opt.path && opt.path !== '__ALL__') {
        targetPaths.push(opt.path);
        targetNames.push(opt.name);
      }
    }
  } else if (ide.path === null) {
    const customPath = await textInput('Enter the full path to your skills directory:');
    if (!customPath) {
      console.log(`\n  ${c.red}✗${c.reset} No path provided. Exiting.\n`);
      process.exit(1);
    }
    targetPaths.push(path.join(customPath, SKILL_NAME));
    targetNames.push('Custom');
  } else {
    targetPaths.push(ide.path);
    targetNames.push(ide.name);
  }

  // Step 3: Local or Global (only for single IDE, not "All" or "Custom")
  if (ide.path !== '__ALL__' && ide.path !== null) {
    const scopeIndex = await select('Install scope:', SCOPE_OPTIONS);
    if (scopeIndex === 1) {
      // Local: install to current project directory
      const localDir = path.join(process.cwd(), '.ai', 'skills', SKILL_NAME);
      targetPaths = [localDir];
      targetNames = [`${ide.name} (local)`];
    }
  }

  console.log();

  // Step 4: Install with progress
  let successCount = 0;
  for (let i = 0; i < targetPaths.length; i++) {
    const spinner = showProgress(`Installing for ${c.bold}${targetNames[i]}${c.reset}...`);
    try {
      // Small delay so the spinner is visible
      await new Promise((r) => setTimeout(r, 400));
      installTo(targetPaths[i]);
      spinner.stop(`Installed for ${c.bold}${targetNames[i]}${c.reset} ${c.dim}→ ${targetPaths[i]}${c.reset}`);
      successCount++;
    } catch (err) {
      spinner.fail(`Failed for ${targetNames[i]}: ${err.message}`);
    }
  }

  // Step 5: Summary
  console.log();
  if (successCount > 0) {
    console.log(`  ${c.green}${c.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`);
    console.log(`  ${c.green}${c.bold}✓ Installation complete!${c.reset}`);
    console.log(`  ${c.dim}Restart your editor to activate the skill.${c.reset}`);
    console.log(`  ${c.green}${c.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`);
    console.log();
    console.log(`  ${c.dim}What's included:${c.reset}`);
    console.log(`  ${c.cyan}24${c.reset} best practice categories`);
    console.log(`  ${c.cyan}24${c.reset} individual rule files with code examples`);
    console.log(`  ${c.cyan} 1${c.reset} compiled AGENTS.md reference`);
    console.log();
    console.log(`  ${c.dim}GitHub: ${c.cyan}https://github.com/Ahmustufa/nestjs-best-practices-skill${c.reset}`);
  } else {
    console.log(`  ${c.red}${c.bold}✗ Installation failed.${c.reset}`);
    console.log(`  ${c.dim}Please check permissions and try again.${c.reset}`);
  }
  console.log();
  closeRL();
}

main().catch((err) => {
  showCursor();
  console.error(`\n  ${c.red}Error: ${err.message}${c.reset}\n`);
  process.exit(1);
});

// Always show cursor on exit
process.on('exit', showCursor);
process.on('SIGINT', () => { showCursor(); process.exit(0); });
