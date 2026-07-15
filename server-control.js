const http = require("http");
const { spawn } = require("child_process");
const path = require("path");
const net = require("net");

const CONTROL_PORT = 8000;
const APP_PORT = 8001;
const PROJECT_DIR = path.resolve(__dirname);

let appProcess = null;
let logs = [];
const MAX_LOGS = 300;

function log(line) {
  const entry = { t: Date.now(), text: String(line).trim() };
  logs.push(entry);
  if (logs.length > MAX_LOGS) logs.shift();
  process.stdout.write(`  [app] ${entry.text}\n`);
}

function getStatus() {
  const alive = appProcess !== null && !appProcess.killed;
  return { running: alive, pid: alive ? appProcess.pid : null, port: APP_PORT, logs: logs.slice(-80) };
}

function startApp() {
  if (appProcess && !appProcess.killed) { log("Already running (PID " + appProcess.pid + ")"); return; }
  log("Starting Next.js dev server on port " + APP_PORT + "...");
  appProcess = spawn("npx", ["next", "dev", "-p", String(APP_PORT)], {
    cwd: PROJECT_DIR,
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });
  appProcess.stdout.on("data", (d) => d.toString().split("\n").filter(Boolean).forEach(log));
  appProcess.stderr.on("data", (d) => d.toString().split("\n").filter(Boolean).forEach(log));
  appProcess.on("error", (e) => { log("Error: " + e.message); appProcess = null; });
  appProcess.on("close", (c) => { log("Exited with code " + c); appProcess = null; });
  appProcess.unref();
}

function stopApp() {
  if (!appProcess || appProcess.killed) { log("Not running"); return; }
  log("Stopping PID " + appProcess.pid + "...");
  const pid = appProcess.pid;
  try { process.kill(-pid, "SIGTERM"); } catch {}
  try { appProcess.kill("SIGTERM"); } catch {}
  setTimeout(() => {
    try { process.kill(-pid, "SIGKILL"); } catch {}
    try { appProcess.kill("SIGKILL"); } catch {}
  }, 4000);
}

function checkPort(port) {
  return new Promise((resolve) => {
    const s = net.createConnection({ port }, () => { s.end(); resolve(true); });
    s.on("error", () => resolve(false));
    s.setTimeout(1000, () => { s.destroy(); resolve(false); });
  });
}

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PI Hub — Control Panel</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;background:#0f1117;color:#e2e8f0;min-height:100vh}
.c{max-width:860px;margin:0 auto;padding:24px}
h1{font-size:22px;font-weight:700}
.sub{color:#64748b;font-size:13px;margin-top:2px;margin-bottom:20px}
.bar{display:flex;align-items:center;gap:12px;padding:14px 18px;background:#1e293b;border-radius:10px;margin-bottom:16px;border:1px solid #334155}
.dot{width:12px;height:12px;border-radius:50%;flex-shrink:0;transition:all .3s}
.dot.on{background:#22c55e;box-shadow:0 0 10px #22c55e80}
.dot.off{background:#ef4444;box-shadow:0 0 10px #ef444480}
.dot.starting{background:#f59e0b;box-shadow:0 0 10px #f59e0b80;animation:pulse 1s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.st{font-size:15px;font-weight:600}
.meta{color:#64748b;font-size:12px;margin-left:auto;font-family:monospace}
.btns{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
button{padding:9px 20px;border:none;border-radius:7px;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s}
button:disabled{opacity:.35;cursor:not-allowed}
.b1{background:#22c55e;color:#000}.b1:hover:not(:disabled){background:#16a34a}
.b2{background:#ef4444;color:#fff}.b2:hover:not(:disabled){background:#dc2626}
.b3{background:#334155;color:#e2e8f0}.b3:hover{background:#475569}
.b4{background:#6366f1;color:#fff;text-decoration:none;display:inline-flex;align-items:center;gap:6px}
.b4:hover{background:#4f46e5}
.b4.hidden{display:none}
.logs{background:#1e293b;border:1px solid #334155;border-radius:10px;padding:12px;height:380px;overflow-y:auto;font-family:'Cascadia Code','Fira Code',monospace;font-size:11.5px;line-height:1.7}
.ln{color:#94a3b8;white-space:pre-wrap;word-break:break-all}
.ln.er{color:#f87171}.ln.ok{color:#4ade80}.ln.inf{color:#60a5fa}
.ln .ts{color:#475569;margin-right:6px}
.links{margin-top:14px;display:flex;gap:6px;flex-wrap:wrap}
.links a{color:#818cf8;font-size:12px;text-decoration:none;padding:4px 8px;border-radius:4px;background:#1e293b;border:1px solid #334155}
.links a:hover{background:#334155}
</style>
</head>
<body>
<div class="c">
<h1>PI Planning Hub</h1>
<p class="sub">Server Control Panel</p>
<div class="bar">
  <div class="dot off" id="dot"></div>
  <span class="st" id="stxt">Checking...</span>
  <span class="meta" id="meta"></span>
</div>
<div class="btns">
  <button class="b1" id="bS" onclick="act('start')">Start Server</button>
  <button class="b2" id="bX" onclick="act('stop')" disabled>Stop Server</button>
  <button class="b3" onclick="poll()">Refresh</button>
  <a class="b4 hidden" id="bO" href="http://localhost:${APP_PORT}/dashboard" target="_blank">Open Dashboard</a>
</div>
<div class="logs" id="lg"></div>
<div class="links">
  <a href="http://localhost:${APP_PORT}/dashboard" target="_blank">/dashboard</a>
  <a href="http://localhost:${APP_PORT}/backlog" target="_blank">/backlog</a>
  <a href="http://localhost:${APP_PORT}/board" target="_blank">/board</a>
  <a href="http://localhost:${APP_PORT}/teams" target="_blank">/teams</a>
  <a href="http://localhost:${APP_PORT}/objectives" target="_blank">/objectives</a>
  <a href="http://localhost:${APP_PORT}/dependencies" target="_blank">/dependencies</a>
  <a href="http://localhost:${APP_PORT}/capacity" target="_blank">/capacity</a>
  <a href="http://localhost:${APP_PORT}/risks" target="_blank">/risks</a>
  <a href="http://localhost:${APP_PORT}/settings" target="_blank">/settings</a>
  <a href="http://localhost:${APP_PORT}/confidence" target="_blank">/confidence</a>
</div>
</div>
<script>
let starting=false;
function h(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
async function poll(){
  try{
    const r=await fetch("/api/status");const s=await r.json();
    const d=document.getElementById("dot"),t=document.getElementById("stxt"),
          m=document.getElementById("meta"),bs=document.getElementById("bS"),
          bx=document.getElementById("bX"),bo=document.getElementById("bO");
    if(s.running){d.className="dot on";t.textContent="Server Running";m.textContent="PID:"+s.pid+" | Port:"+s.port;bs.disabled=true;bx.disabled=false;bo.className="b4";starting=false}
    else if(starting){d.className="dot starting";t.textContent="Starting...";bs.disabled=true;bx.disabled=true;bo.className="b4 hidden"}
    else{d.className="dot off";t.textContent="Server Stopped";m.textContent="";bs.disabled=false;bx.disabled=true;bo.className="b4 hidden"}
    const el=document.getElementById("lg");
    el.innerHTML=s.logs.map(l=>{let c="ln";if(/error|Error|ERR/.test(l.text))c+=" er";else if(/Ready|success|200/.test(l.text))c+=" ok";else if(/Compiling|GET|POST/.test(l.text))c+=" inf";return'<div class="'+c+'"><span class="ts">'+new Date(l.t).toLocaleTimeString()+"</span>"+h(l.text)+"</div>"}).join("");
    el.scrollTop=el.scrollHeight;
  }catch(e){}
}
async function act(a){
  if(a==="start")starting=true;
  await fetch("/api/"+a,{method:"POST"});
  setTimeout(poll,800);
}
poll();setInterval(poll,2500);
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  const url = req.url || "";
  if (req.method === "GET" && (url === "/" || url === "/index.html")) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(HTML); return;
  }
  if (url === "/api/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(getStatus())); return;
  }
  if (req.method === "POST" && url === "/api/start") {
    startApp(); res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true })); return;
  }
  if (req.method === "POST" && url === "/api/stop") {
    stopApp(); res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true })); return;
  }
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

// Check if port is available
const tester = net.createServer();
tester.once("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`\n  Port ${CONTROL_PORT} is already in use.\n`);
    process.exit(1);
  }
});
tester.once("listening", () => {
  tester.close(() => {
    server.listen(CONTROL_PORT, "0.0.0.0", () => {
      console.log("");
      console.log("  ============================================");
      console.log("    PI Planning Hub — Control Panel");
      console.log("  ============================================");
      console.log("");
      console.log("  Control Panel:  http://localhost:" + CONTROL_PORT);
      console.log("  App (when on):  http://localhost:" + APP_PORT);
      console.log("");
      console.log("  Open the control panel in your browser to");
      console.log("  start/stop the Next.js dev server.");
      console.log("");
    });
  });
});
tester.listen(CONTROL_PORT);
