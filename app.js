// --- SPLASH SCREEN LOGIC (Yahan loop fix hua hai) ---
const splash = document.getElementById('splashScreen');
const mainContent = document.getElementById('mainContent');
const enterSub = document.getElementById('enterSub');
const enterSpin = document.getElementById('enterSpin');

splash.addEventListener('click', function() {
  // 1. Text hide karo aur spinner dikhao
  enterSub.style.display = 'none';
  enterSpin.style.display = 'block';
  
  // 2. Thoda delay (0.6 sec) taaki premium feel aaye
  setTimeout(() => {
    // 3. Splash fade out karo
    splash.classList.add('hidden');
    
    // 4. Main content show karo
    setTimeout(() => {
      splash.style.display = 'none';
      mainContent.style.display = 'block';
    }, 700); // Fade out transition time
  }, 600);
});


// --- DEOBFUSCATOR LOGIC ---
async function deobfuscate() {
  const script = document.getElementById('scriptInput').value.trim();
  const btn = document.getElementById('deobfBtn');
  const btnText = document.getElementById('btnText');
  const spinner = document.getElementById('btnSpinner');
  const outputWrapper = document.getElementById('outputWrapper');
  const statusText = document.getElementById('statusText');
  const outputCode = document.getElementById('outputCode');

  if (!script) {
    alert("Bhai, pehle script toh paste karo!");
    return;
  }

  // Loading Start
  btn.disabled = true;
  btnText.innerText = "Processing...";
  spinner.style.display = "inline-block";
  outputWrapper.style.display = "block";
  statusText.className = "";
  statusText.innerText = "Detect aur Deobfuscate chal raha hai... (Wait karo)";
  outputCode.innerText = "";

  try {
    // API Call
    const response = await fetch('/api/deobfuscate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script: script })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Kuch galat ho gaya");
    }

    // Success
    statusText.className = "success-text";
    statusText.innerText = `Success! Detected: ${data.detected || 'Unknown'} (${data.endpoint})`;
    outputCode.innerText = data.code || "Code extract nahi ho paya.";

  } catch (error) {
    // Error Handle
    statusText.className = "error-text";
    statusText.innerText = `Error: ${error.message}`;
    if (error.message.includes("detect nahi hua")) {
        outputCode.innerText = "Auto-detect fail ho gaya. Yeh script shayad kisi aur obfuscator ki hai.";
    }
  } finally {
    // 🚨 LOOP FIX: Chahe error aaye ya success, button hamesha normal hoga
    btn.disabled = false;
    btnText.innerText = "Auto Detect & Deobfuscate";
    spinner.style.display = "none";
  }
}

// Button ko function se connect karo
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('deobfBtn');
  if (btn) {
    btn.addEventListener('click', deobfuscate);
  }
});
