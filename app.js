const TOOLS = [
  { n:'01', name:'Detector',           slug:'detector',      type:'SCANNER', desc:'Detect the obfuscator used on a Lua script by MonKDeobf (results are not 100% guaranteed).' },
  { n:'02', name:'Luraph v15 & v15.1', slug:'luraph',        type:'DEOBFUSCATOR', desc:'Deobfuscate Luraph v15 and v15.1 protected scripts.' },
  { n:'03', name:'Renamer',            slug:'renamer',       type:'TOOL', desc:'Rename messy and obfuscated variables to readable names.' },
  { n:'04', name:'Beautifier',         slug:'beautifier',    type:'TOOL', desc:'Format and beautify Lua source code for readability.' },
  { n:'05', name:'Moonveil 2.x',       slug:'moonveil',      type:'DEOBFUSCATOR', desc:'Deobfuscate Moonveil 2.x protected scripts (BETA).' },
  { n:'06', name:'Prometheus',         slug:'prometheus',    type:'DEOBFUSCATOR', desc:'Deobfuscate Prometheus (not made by MonKDeobf).' },
  { n:'07', name:'Ironbrew2',          slug:'ironbrew2',     type:'DEOBFUSCATOR', desc:'Deobfuscate Ironbrew2 (not made by MonKDeobf).' },
  { n:'08', name:'MoonSec V3',         slug:'moonsecv3',     type:'DEOBFUSCATOR', desc:'Deobfuscate MoonSec V3 protected scripts.' },
  { n:'09', name:'Hercules',           slug:'hercules',      type:'DEOBFUSCATOR', desc:'Deobfuscate Hercules protected scripts.' },
  { n:'10', name:'Goofyscator',        slug:'goofyscator',   type:'DEOBFUSCATOR', desc:'Deobfuscate Goofyscator V11 protected scripts.' },
  { n:'11', name:'Boronide',           slug:'boronide',      type:'DEOBFUSCATOR', desc:'Deobfuscate Boronide protected scripts.' },
  { n:'12', name:'XHider',             slug:'xhider',        type:'DEOBFUSCATOR', desc:'Deobfuscate XHider protected scripts.' },
  { n:'13', name:'Ironveil',           slug:'ironveil',      type:'DEOBFUSCATOR', desc:'Deobfuscate Ironveil protected scripts.' },
  { n:'14', name:'LuaObfuscator',      slug:'luaobfuscator', type:'DEOBFUSCATOR', desc:'Deobfuscate LuaObfuscator protected scripts.' },
  { n:'15', name:'PSU',                slug:'psu',           type:'DEOBFUSCATOR', desc:'Deobfuscate PSU protected scripts.' },
  { n:'16', name:'77fuscator',         slug:'77fuscator',    type:'DEOBFUSCATOR', desc:'Deobfuscate 77fuscator protected scripts.' },
  { n:'17', name:'Clyde',              slug:'clyde',         type:'DEOBFUSCATOR', desc:'Deobfuscate Clyde protected scripts.' }
];

const LOGO_URL = "https://leakd.vercel.app/LeakD.webp"; 
// Using the real site's tool icons so they never break
function getToolIcon(slug) { return `https://leakd.vercel.app/deobf/${slug}.webp`; }

function toast(msg) {
  const holder = document.getElementById('toastHolder');
  if (!holder) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span class="t-dot"></span><span>${msg}</span>`;
  holder.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    el.addEventListener('animationend', () => el.remove());
  }, 2800);
}

// Run only on tools.html
if (document.getElementById('toolPills')) {
  const urlParams = new URLSearchParams(window.location.search);
  let currentTool = urlParams.get('tool') || 'detector';

  const pillsContainer = document.getElementById('toolPills');
  pillsContainer.innerHTML = TOOLS.map(t => `
    <div class="pill" data-slug="${t.slug}" onclick="selectTool('${t.slug}')">
      <img src="${getToolIcon(t.slug)}" alt="" onerror="this.style.display='none'">
      ${t.name}
    </div>
  `).join('');

  window.selectTool = function(slug) {
    currentTool = slug;
    const tool = TOOLS.find(t => t.slug === slug) || TOOLS[0];
    
    document.querySelectorAll('.pill').forEach(p => {
      p.classList.toggle('active', p.dataset.slug === slug);
      if(p.dataset.slug === slug) p.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });

    document.getElementById('benchTitle').innerHTML = `${tool.name} <span class="bench-type">${tool.type}</span>`;
    document.getElementById('benchDesc').textContent = tool.desc;
    
    const iconImg = document.getElementById('benchIcon');
    iconImg.src = getToolIcon(slug);
    iconImg.onerror = function() { this.src = `https://via.placeholder.com/32/d4a853/000000?text=${tool.name.charAt(0)}`; };

    document.getElementById('benchNotice').style.display = (slug === 'detector') ? 'flex' : 'none';
    
    // Update URL without reloading
    window.history.replaceState(null, '', `?tool=${slug}`);
  }

  // Init
  selectTool(currentTool);

  // File upload handler
  document.getElementById('fileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      document.getElementById('codeInput').value = ev.target.result;
      toast(`Loaded ${file.name}`);
    };
    reader.readAsText(file);
  });
}

function runTool() {
  const code = document.getElementById('codeInput').value.trim();
  if (!code) {
    toast('Paste a script first.');
    return;
  }
  toast('Processing... (Backend not connected)');
}