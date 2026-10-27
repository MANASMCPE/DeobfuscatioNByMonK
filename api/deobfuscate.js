// api/deobfuscate.js
const LEAKD_BASE = "https://leakd.up.railway.app";

// Detector ke output keyword → LeakD endpoint mapping
const DETECT_MAP = [
  { keys: ["moonsec v3", "moonsec3", "moonsec"], endpoint: "/moonsec" },
  { keys: ["moonsec v2", "moonsecv2"], endpoint: "/moonsecv2" },
  { keys: ["prometheus"], endpoint: "/prometheus" },
  { keys: ["ironbrew2", "ironbrew 2"], endpoint: "/ironbrew2" },
  { keys: ["ironveil"], endpoint: "/ironveil" },
  { keys: ["hercules"], endpoint: "/hercules" },
  { keys: ["goofyscator"], endpoint: "/goofyscator" },
  { keys: ["clyde"], endpoint: "/clydedeobf" },
  { keys: ["boronide"], endpoint: "/boronide" },
  { keys: ["jayfuscator"], endpoint: "/jayfuscator" },
  { keys: ["77fuscator"], endpoint: "/77fuscator" },
  { keys: ["psu"], endpoint: "/psu" },
  { keys: ["xhider"], endpoint: "/xhider" },
  { keys: ["luaobfuscator"], endpoint: "/luaobfuscator" },
  { keys: ["moonveil"], endpoint: "/moonveil" },
  { keys: ["luraph"], endpoint: "/luraphv15" },
];

async function callLeakD(endpoint, script) {
  const res = await fetch(`${LEAKD_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": process.env.LEAKD_API_KEY,
    },
    body: JSON.stringify({ script }),
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  if (!res.ok) {
    throw new Error(data.error || data.raw || `LeakD ${endpoint} failed (${res.status})`);
  }
  return data;
}

// Detector response me field ka naam alag ho sakta hai — sab handle karo
function extractDetectedName(detectData) {
  if (!detectData || typeof detectData !== "object") return null;

  const candidates = [
    detectData.obfuscator,
    detectData.detected,
    detectData.name,
    detectData.result,
    detectData.obfuscator_name,
    detectData.script_type,
  ].filter(Boolean);

  if (candidates.length) return String(candidates[0]);

  if (detectData.data && typeof detectData.data === "object") {
    return extractDetectedName(detectData.data);
  }
  return null;
}

function endpointFromDetected(name) {
  if (!name) return null;
  const n = name.toLowerCase();
  for (const item of DETECT_MAP) {
    if (item.keys.some(k => n.includes(k))) return item.endpoint;
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { script, endpoint: manualEndpoint } = req.body || {};

    if (!script || typeof script !== "string") {
      return res.status(400).json({ error: "script required" });
    }
    if (script.length > 512 * 1024) {
      return res.status(413).json({ error: "Script too large (max 512 KB)" });
    }

    let detected = null;
    let endpoint = manualEndpoint;

    // Step 1: Auto-detect (agar manual endpoint nahi diya)
    if (!endpoint) {
      let detectData;
      try {
        detectData = await callLeakD("/detect", script);
      } catch (err) {
        return res.status(502).json({
          error: "Detector fail hua: " + err.message,
          hint: "Manual endpoint bhejo",
        });
      }

      detected = extractDetectedName(detectData);
      endpoint = endpointFromDetected(detected);

      if (!endpoint) {
        return res.status(422).json({
          error: "Obfuscator detect nahi hua",
          detected: detected || null,
          raw: detectData,
          hint: "Manual endpoint select karo",
        });
      }
    }

    // Step 2: Deobfuscate
    const data = await callLeakD(endpoint, script);

    if (data.success === false) {
      return res.status(422).json({
        error: data.error || "Deobfuscation failed",
        detected,
        endpoint,
      });
    }

    return res.status(200).json({
      success: true,
      detected,
      endpoint,
      file: data.file || null,
      code: data.deobfuscated_code || data.code || data.output || "",
      raw: data,
    });
  } catch (err) {
    console.error("LeakD proxy error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
          }
