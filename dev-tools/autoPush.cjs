const chokidar = require("chokidar");
const notifier = require("node-notifier");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
require("dotenv").config();
const { generateCommitMessage } = require("./gemini.cjs");

let isPushing = false;
let debounceTimer = null;

const logFile = path.join(__dirname, "auto-push.log");

const ignorePaths = /node_modules|\.git|dist|build|\.next|\.vercel\.cache/;

const pushToGitSmart = async () => {
    if (isPushing) return;
    isPushing = true;

    const timestamp = new Date().toLocaleString();

    try {
        console.log("📦 Staging changes...");
        execSync("git add .", { stdio: "inherit" });

        const diff = execSync("git diff --cached --shortstat").toString();
        if (!diff.trim()) {
            console.log("✅ Nothing to commit.");
            isPushing = false;
            return;
        }

        console.log("🤖 Asking CtroBot (Gemini) for commit message...");
        const commitMessage = await generateCommitMessage(diff);
        console.log(`💬 CtroBot commit: "${commitMessage}"`);

        execSync(`git commit -m "${commitMessage}"`, { stdio: "inherit" });
        execSync("git push origin main", { stdio: "inherit" });

        notifier.notify({
            title: "✅ Smart Git AutoPush",
            message: commitMessage,
            sound: true,
        });

        fs.appendFileSync(logFile, `[${timestamp}] ${commitMessage}\n`);
    } catch (err) {
        console.error("❌ Error:", err.message);
        notifier.notify({
            title: "AutoPush Error",
            message: err.message.slice(0, 50) + "...",
            sound: true,
        });
        fs.appendFileSync(logFile, `[${timestamp}] ERROR: ${err.message}\n`);
    }

    setTimeout(() => {
        isPushing = false;
    }, 3000);
};

chokidar.watch(".", {
    ignored: ignorePaths,
    ignoreInitial: true,
}).on("change", (changedPath) => {
    console.log(`📝 File changed: ${changedPath}`);
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(pushToGitSmart, 3000);
});

console.log("🚀 Smart AutoPush is now watching your files...");
