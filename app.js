const toastHolder = document.getElementById('toastHolder');
function toast(message, type = 'ok') {
  if (!toastHolder) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="t-dot"></span><span>${message}</span>`;
  toastHolder.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    el.addEventListener('animationend', () => el.remove());
  }, 2800);
}
window.toast = toast;

const enterScreen = document.getElementById('enterScreen');
if (enterScreen) {
  function dismiss() { enterScreen.classList.add('hidden'); }
  enterScreen.addEventListener('click', dismiss);
  enterScreen.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') dismiss();
  });
  setTimeout(dismiss, 4500);
}

const mobileBtn = document.getElementById('mobileMenuBtn');
if (mobileBtn) {
  mobileBtn.addEventListener('click', () => {
    document.querySelector('.topnav').classList.toggle('mobile-open');
  });
}

const inputCode = document.getElementById('inputCode');
if (inputCode) initWorkbench();

function initWorkbench() {
  const outputBody  = document.getElementById('outputBody');
  const outputEmpty = document.getElementById('outputEmpty');
  const dropZone    = document.getElementById('dropZone');
  const dropOverlay = document.getElementById('dropOverlay');
  const fileInput   = document.getElementById('fileInput');
  const engineSel   = document.getElementById('engine');
  const statSize    = document.getElementById('statSize');
  const statLines   = document.getElementById('statLines');
  const statEngine  = document.getElementById('statEngine');
  const btnRun      = document.getElementById('btnRun');

  function updateStats() {
    const val = inputCode.value;
    const bytes = new Blob([val]).size;
    statSize.textContent = bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
    statLines.textContent = val ? val.split('\n').length : 0;
  }
  inputCode.addEventListener('input', updateStats);
  engineSel.addEventListener('change', () => {
    statEngine.textContent = engineSel.options[engineSel.selectedIndex].text;
  });

  let dragDepth = 0;
  ['dragenter','dragover'].forEach(evt => {
    dropZone.addEventListener(evt, e => {
      e.preventDefault();
      if (evt === 'dragenter') dragDepth++;
      dropOverlay.classList.add('active');
    });
  });
  ['dragleave','dragend'].forEach(evt => {
    dropZone.addEventListener(evt, e => {
      e.preventDefault();
      if (evt === 'dragleave') dragDepth--;
      if (dragDepth <= 0) dropOverlay.classList.remove('active');
    });
  });
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dragDepth = 0;
    dropOverlay.classList.remove('active');
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  });

  document.getElementById('btnUpload').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) readFile(fileInput.files[0]);
    fileInput.value = '';
  });

  function readFile(file) {
    if (file.size > 5 * 1024 * 1024) { toast('File too large (max 5 MB).', 'err'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      inputCode.value = e.target.result;
      updateStats();
      toast(`Loaded ${file.name}`, 'ok');
    };
    reader.onerror = () => toast('Could not read file.', 'err');
    reader.readAsText(file);
  }

  document.getElementById('btnClear').addEventListener('click', () => {
    inputCode.value = '';
    updateStats();
    resetOutput();
    toast('Cleared.', 'ok');
  });

  document.getElementById('btnCopy').addEventListener('click', async () => {
    const text = outputBody.innerText.trim();
    if (!text || text.includes('Deobfuscated code will appear here')) {
      toast('Nothing to copy yet.', 'err'); return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast('Copied to clipboard.', 'ok');
    } catch { toast('Copy failed.', 'err'); }
  });

  document.getElementById('btnDownload').addEventListener('click', () => {
    const text = outputBody.innerText.trim();
    if (!text || text.includes('Deobfuscated code will appear here')) {
      toast('Nothing to download yet.', 'err'); return;
    }
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.lua';
    a.click();
    URL.revokeObjectURL(url);
    toast('Downloaded output.lua', 'ok');
  });

  const SAMPLE = `-- Example obfuscated Lua input
local a=("\\104\\101\\108\\108\\111")
local b=("\\119\\111\\114\\108\\100")
local function v(...) return select('#',...),{...} end
local function decode(s)
  return (s:gsub("\\\\(%d+)", function(x) return string.char(tonumber(x)) end))
end
print(decode(a).." "..decode(b))`;

  document.getElementById('btnSample').addEventListener('click', () => {
    inputCode.value = SAMPLE;
    updateStats();
    resetOutput();
    toast('Sample loaded.', 'ok');
  });

  function resetOutput() {
    outputBody.innerHTML = '';
    outputBody.appendChild(outputEmpty);
  }
  function setOutput(text, error) {
    outputBody.innerHTML = '';
    outputBody.textContent = text;
    outputBody.className = 'output-body' + (error ? ' output-error' : '');
  }

  function detectObfuscator(code) {
    const sigs = [
      { name: 'Luraph v15', patterns: [/Luraph/i, /luraph\.io/, /\bLuraph\b/] },
      { name: 'MoonSec V3', patterns: [/MoonSec/i, /moonsec/i, /_moonsec/] },
      { name: 'Moonveil 2.x', patterns: [/Moonveil/i, /moonveil/i] },
      { name: 'Prometheus', patterns: [/Prometheus/i, /prometheus/] },
      { name: 'IronBrew2', patterns: [/IronBrew/i, /ironbrew/i, /iron_brew/] },
      { name: 'Goofyscator', patterns: [/Goofy/i, /goofyscator/i] },
      { name: 'Boronide', patterns: [/Boronide/i, /boronide/i] },
      { name: 'Hercules', patterns: [/Hercules/i, /hercules/] },
      { name: 'XHider', patterns: [/XHider/i, /xhider/] },
      { name: 'Ironveil', patterns: [/Ironveil/i, /ironveil/] },
      { name: 'Clyde', patterns: [/Clyde/i, /\bclyde\b/] },
      { name: 'PSU', patterns: [/\bPSU\b/, /psu_/, /_psu/] },
      { name: '77fuscator', patterns: [/77fuscator/i, /_77f/] },
      { name: 'LuaObfuscator', patterns: [/LuaObfuscator/i, /luaobfuscator\.com/] },
    ];
    for (const sig of sigs) {
      for (const p of sig.patterns) {
        if (p.test(code)) return { name: sig.name, confidence: 0.92 };
      }
    }
    const longStrings = (code.match(/"[\x00-\xff]{200,}"/g) || []).length;
    const escSeq = (code.match(/\\\d{1,3}/g) || []).length;
    if (longStrings > 0 || escSeq > 20) return { name: 'Unknown (heavily obfuscated)', confidence: 0.55 };
    return { name: 'Plain Lua (no obfuscation detected)', confidence: 0.88 };
  }

  function beautifyLua(code, indentSize = 2) {
    const indent = ' '.repeat(indentSize);
    let level = 0;
    const lines = code.split('\n');
    return lines.map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      const lower = trimmed.toLowerCase();
      if (/^(end|until|\}|\)|elseif\b)/.test(lower)) level = Math.max(0, level - 1);
      const out = indent.repeat(level) + trimmed;
      if (/(\bthen\b|\bdo\b|\bfunction\b|\brepeat\b|else|\{|\()\s*(--.*)?$/.test(trimmed) && !/\bend\b/.test(lower)) level++;
      return out;
    }).join('\n');
  }

  btnRun.addEventListener('click', async () => {
    const code = inputCode.value.trim();
    if (!code) { toast('Paste a script first.', 'err'); inputCode.focus(); return; }

    const originalHTML = btnRun.innerHTML;
    btnRun.disabled = true;
    btnRun.innerHTML = `<span class="spinner"></span> Working…`;
    await new Promise(r => setTimeout(r, 700));

    const engine = engineSel.value;
    const engineName = engineSel.options[engineSel.selectedIndex].text;

    try {
      if (engine === 'detector') {
        const result = detectObfuscator(code);
        setOutput(
          `-- 🔍 LeakD Detector\n--\n-- Obfuscator:  ${result.name}\n-- Confidence:  ${(result.confidence * 100).toFixed(0)}%\n-- Input size:  ${code.length} chars\n-- Lines:       ${code.split('\n').length}\n--\n-- Note: This is client-side pattern matching. The full\n-- server-side detector uses a 40+ signature database.`
        );
        toast(`Detected: ${result.name}`, 'info');
      } else if (engine === 'beautifier') {
        const out = beautifyLua(code, 2);
        setOutput(out);
        toast('Beautified.', 'ok');
      } else {
        setOutput(
`-- ⚠ Deobfuscation backend not connected.
--
-- The real LeakD site runs "${engineName}" on a server.
-- This replica only includes the client-side Detector
-- and Beautifier (try them from the Engine dropdown).
--
-- Engine requested: ${engineName}
-- Input length:     ${code.length} chars
-- Input lines:      ${code.split('\n').length}
--
-- To add real deobfuscation, wire this handler to:
--   POST /api/deobfuscate
--   { "code": "...", "engine": "${engine}" }`,
          true
        );
        toast('Requires backend — not connected.', 'err');
      }
    } finally {
      btnRun.disabled = false;
      btnRun.innerHTML = originalHTML;
    }
  });

  inputCode.value = SAMPLE;
  updateStats();

  const params = new URLSearchParams(window.location.search);
  const preEngine = params.get('engine');
  if (preEngine) {
    const opt = [...engineSel.options].find(o => o.value === preEngine);
    if (opt) { engineSel.value = preEngine; statEngine.textContent = opt.text; }
  }
}