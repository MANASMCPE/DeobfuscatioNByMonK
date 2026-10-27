<textarea id="scriptInput" placeholder="Lua script paste karo..."></textarea>
<button id="deobfBtn">Auto Detect & Deobfuscate</button>
<pre id="output"></pre>

<script>
const btn = document.getElementById("deobfBtn");
const out = document.getElementById("output");
const input = document.getElementById("scriptInput");

btn.onclick = async () => {
  const script = input.value.trim();
  if (!script) return alert("Pehle script paste karo");

  out.textContent = "Detect + deobfuscate chal raha hai...";
  btn.disabled = true;

  try {
    const res = await fetch("/api/deobfuscate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ script }), // endpoint nahi bheja → auto-detect
    });

    const data = await res.json();

    if (!res.ok) {
      out.textContent =
        `Error: ${data.error}\n` +
        `Detected: ${data.detected || "unknown"}\n\n` +
        `${JSON.stringify(data.raw || "", null, 2)}`;
      return;
    }

    out.textContent =
      `Detected: ${data.detected || "unknown"}\n` +
      `Endpoint: ${data.endpoint}\n\n` +
      (data.code || JSON.stringify(data.raw, null, 2));
  } catch (err) {
    out.textContent = "Error: " + err.message;
  } finally {
    btn.disabled = false;
  }
};
</script>
