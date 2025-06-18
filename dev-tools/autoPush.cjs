// dev-tools/autoPush.cjs

const chokidar = require("chokidar");
const notifier = require("node-notifier");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
require("dotenv").config();
const { generateCommitMessage } = require("./gemini.cjs");

const logFile = path.join(__dirname, "auto-push.log");
const ignorePaths = /node_modules|\.git|dist|build|\.next|\.vercel\.cache/;

let isPushing = false;
let debounceTimer = null;

const pushToGitSmart = async () => {
  if (isPushing) return;
  isPushing = true;

  const timestamp = new Date().toLocaleString();

  try {
    console.log("📦 Staging changes...");
    execSync("git add .", { stdio: "inherit" });

    const diffSummary = execSync("git diff --cached --shortstat").toString();

    if (!diffSummary.trim()) {
      console.log("✅ No changes to commit.");
      isPushing = false;
      return;
    }

    console.log("🤖 Asking CtroBot (Gemini) for commit message...");
    const commitMessage = await generateCommitMessage(diffSummary);
    console.log(`💬 CtroBot commit: "${commitMessage}"`);

    execSync(`git commit -m "${commitMessage}"`, { stdio: "inherit" });
    execSync("git push origin main", { stdio: "inherit" });

    // Notify success
    notifier.notify({
      title: "✅ Smart Git AutoPush",
      message: commitMessage,
      sound: true,
    });

    fs.appendFileSync(logFile, `[${timestamp}] ${commitMessage}\n`);
  } catch (error) {
    const message = error.message || String(error);
    console.error("❌ Push Error:", message);

    notifier.notify({
      title: "❌ AutoPush Error",
      message: message.slice(0, 80),
      sound: true,
    });

    fs.appendFileSync(logFile, `[${timestamp}] ERROR: ${message}\n`);
  }

  setTimeout(() => {
    isPushing = false;
  }, 3000);
};

// Start watching for file changes
chokidar
  .watch(".", {
    ignored: ignorePaths,
    ignoreInitial: true,
  })
  .on("change", (changedPath) => {
    console.log(`📝 File changed: ${changedPath}`);
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(pushToGitSmart, 3000);
  });

console.log("🚀 Smart AutoPush is now watching your files...");