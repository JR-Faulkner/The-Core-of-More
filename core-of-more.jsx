import { useState, useRef, useEffect } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Share+Tech+Mono&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;overflow:hidden;background:#060810;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:#060810;}
::-webkit-scrollbar-thumb{background:#182338;border-radius:3px;}
::-webkit-scrollbar-thumb:hover{background:#243450;}
@keyframes gpulse{0%,100%{filter:drop-shadow(0 0 6px var(--gc)) drop-shadow(0 0 12px var(--gc))}50%{filter:drop-shadow(0 0 16px var(--gc)) drop-shadow(0 0 32px var(--gc)) drop-shadow(0 0 48px var(--gc))}}
@keyframes fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes lvlflash{0%,100%{background:transparent}50%{background:rgba(255,215,0,0.06)}}
`;

const R = a => a[Math.floor(Math.random() * a.length)];
const LID = n => `LOG ${String(Math.ceil(n/26)).padStart(2,'0')}-${String.fromCharCode(64+(((n-1)%26)+1))}`;

// ─────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────
const ELEMS = {
  fire:  {name:'Fire',  mat:'Obsidian / Magma',  col:'#FF6B35',glow:'#AA1500',tag:'VOLATILE',  icon:'🔥',desc:"Damage & Heat. You burn everything. Including, occasionally, your own dungeon."},
  water: {name:'Water', mat:'Aquamarine / Ice',   col:'#29D4FF',glow:'#005880',tag:'PATIENT',   icon:'💠',desc:"Control & Regeneration. Slow. Inevitable. Absolutely insufferable to fight."},
  earth: {name:'Earth', mat:'Granite / Quartz',   col:'#78C828',glow:'#2A5500',tag:'RESOLUTE',  icon:'🪨',desc:"Fortification & Defense. You don't move. Things trying to move you become regrets."},
  air:   {name:'Air',   mat:'Aether-Glass',       col:'#C080FF',glow:'#5500AA',tag:'MERCURIAL', icon:'🌀',desc:"Redirection & Speed. Everywhere. Nowhere. Frustrating to pin down."},
};

const STEWS = {
  kip: {
    name:'Kip',type:'Kobold',el:'Earth',hp:30,maxHp:30,gear:'Stone Pickaxe',icon:'🦎',col:'#78C828',
    intro:`A small scaly creature erupts from a wall crack, Stone Pickaxe dragging noisily behind it. It trips on the handle, recovers instantly, and beams up at you with enormous amber eyes.\n\n"BRIGHT BOSS IS AWAKE! Kip was WAITING! Made a tunnel while waiting—you want to see? Kip also found a bug. The bug is gone now. The bug was okay."\n\nAXIOM NOTE: The unsolicited tunnel does, technically, go somewhere useful.`,
    adv:["Kip is staring at the north wall with unnerving certainty. Tunnel opportunity, probably.","'Traps,' Kip whispers urgently. 'More traps.' He has nineteen diagrams. All are circles labeled 'pit.'","Kip found something while you were thinking. He has absorbed roughly half of it.","The kobold suggests going deeper. 'More deep = more hidden = more OURS.' Hard to argue.","Kip is eating a rock. Unclear if intentional. He seems completely fine."]
  },
  inta: {
    name:'Inta',type:'Imp',el:'Fire',hp:20,maxHp:20,gear:'Bone Focus',icon:'😈',col:'#FF6B35',
    intro:`A pop of displaced air deposits an imp directly onto your crystal, already writing in a notebook from nowhere.\n\n"Inta. Before you ask—no, I won't discuss the previous core. Yes, I already counted your mana. You're losing 7% in idle resonance. Your chamber acoustics are wasting another 12% intimidation potential."\n\nBrief eye contact. Back to the notebook.\n\n"We have work to do."`,
    adv:["Inta has drafted a mana expenditure budget. You didn't request it. It is four pages long.","'Every action has a mana cost,' Inta is saying. For the fourth time. 'Every. Single. One.'","The imp logged something in the south passage and won't say what. He looks shaken.","Inta suggests layered deceptions—false passages, decoy treasure, manufactured dread. He is smiling about this.","Inta reorganized your materia by cost-efficiency ratio. Unsolicited. The sorting is immaculate."]
  },
  shuna: {
    name:'Shuna',type:'Sprite',el:'Air',hp:15,maxHp:15,gear:'Gossamer Veil',icon:'🧚',col:'#C080FF',
    intro:`The chamber air shifts—barely perceptibly—and resolves into a sprite trailing a veil of compressed atmosphere. She's already looking at the ceiling.\n\n"Shuna. The currents said you were interesting." A pause. "They're usually right." Two seconds of direct eye contact. "Your resonance pattern is unusual. We'll talk about it when I understand it better."\n\nShe returns to the ceiling.`,
    adv:["Shuna is listening to the deep pressure gradients. She'll translate when they stop speaking in vibrations.","'The air moves wrong past the east passage,' Shuna notes. Five cloud metaphors follow.","The sprite is mapping sound propagation through the dungeon. Results will be esoteric and somehow accurate.","'They're coming from above. Overconfidence in their footsteps.' Good intel. Interesting delivery.","Shuna caught something on the Gossamer Veil. Mana trace. She's following it in slow contemplative circles."]
  },
  uala: {
    name:'Uala',type:'Undine',el:'Water',hp:25,maxHp:25,gear:'Pearl Siphon',icon:'🌊',col:'#29D4FF',
    intro:`Moisture condenses from the cave air—slow, patient, deliberate—resolving into something attentive. The Pearl Siphon orbits one raised hand. She takes a long moment before speaking.\n\n"Uala. I help cores find their current—the flow of action that conserves the most energy." She assesses you. "You're new to this form. Most cores panic through the first few scenes." A pause. "You have time. Relatively speaking."`,
    adv:["Uala recommends waiting for a stronger mana current before acting. She is very calm about urgency.","'Patience is not inaction,' Uala observes. You didn't say it was. She seems to know you were thinking it.","The undine has been mentioning the east wall seep for two scenes now. Gently. Persistently.","'Something disturbed the upper current,' Uala says. No alarm in her voice. That's somehow worse.","Uala recommends the Pearl Siphon for the next operation. No further details. She trusts the current."]
  }
};

const BOOT = `Processing... soul integration: complete. Crystalline matrix: stable. Consciousness transfer: unexpectedly successful.\n\nYou're a dungeon core now.\n\nI'm AXIOM — your System interface, operational guide, and the only thing preventing you from vibrating at the wrong frequency and ceasing to exist. The ley-line surge that ended your mortality fused your consciousness into a gemstone approximately the size of your former fist.\n\nThe good news: you're immortal. Provisionally.\nThe bad news: so is everyone trying to raid you.\n\nThis is the Deep Reaches. Welcome to the rest of your existence.`;

const PO = [
  "Organic scan: fungal cluster northeast (non-hostile, bioluminescent, harvestable), something with too many limbs near the south junction, and—flagging this—a heartbeat signature ~40m overhead. Surface-adjacent. It's pacing. It's planning something. Gear sounds cheap.",
  "Life signs: cave beetle colony, territorial, 11 individuals and manageable. Luminous moss on two wall surfaces (minor mana saturation, harvestable). One very large blind cave salamander that wandered in through the lower crack and has no exit strategy.",
  "Pulse read: minimal organic presence this sector. More interesting—a mana-saturated root network threads through the ceiling. Something above is pulling from the same ley-line you fused with. Coincidence or competition: unclear.",
];
const PI = [
  "Structural read: limestone base, granite intrusions, moderate quartz vein density (harvestable). Iron deposit 8m northeast, small but workable. Notable: crystallized mana residue 28m east. Previous surge, poorly absorbed. Free energy sitting in the dark.",
  "Composition scan: geologically stable. Excavation risk: low. Ancient stonework detected 20m north—pre-existing architecture. Something was here before you. It either left or got absorbed. The difference matters.",
  "Material sweep: standard Deep Reaches substrate. Exception: heavy iron concentration flanking main passage at intervals too regular to be natural. Previous core construction or something much older. Worth investigating.",
];
const ABT = [
  "Material processed. Crystalline matrix extracts useful components, discards the rest. Efficient if unglamorous. Materia Pool updated.",
  "Absorbed. The dungeon metabolizes raw material the way a body processes food—except the food is rocks and the stomach is your entire existence. Materia added.",
  "Processed and catalogued. Kip looks proud from across the chamber. He doesn't fully understand what just happened. He's proud anyway.",
];
const MFT = [
  "Mana flows from your crystal and stone responds—reluctantly at first, then with certainty. A structure crystallizes from intention and raw energy. Not elegant yet. Definitely yours.",
  "You push intention into the ambient mana and the dungeon extends your reach. Stone reshapes. Another section of your domain materializes from rock and will. AXIOM: effective. Improving.",
  "The crystal pulses and the dungeon grows with it. Another layer of yours in the deep. The stone accepted you quickly. It was waiting for something to do.",
];
const LUT = [
  "── LEVEL UP ──\n\nCore Integrity: restored. Max Mana: +10. Mana Regen: +2. Max Integrity: +10.\n\nAXIOM: You survived long enough to get better at surviving. Statistically uncommon for first-cycle cores. Don't mistake this for safety. Safer and safe are not the same thing.\n\nThere's a difference.",
  "── LEVEL UP ──\n\nThe crystal brightens. The dungeon feels it. Your minions feel it. That rookie raider from earlier felt it through solid stone and is currently reconsidering their career trajectory.\n\nMana ceiling raised. Regen improved. Integrity restored. Build something worth defending.",
];
const MLT = {
  kip:       ["Kip deploys the Stone Pickaxe with the efficiency of something born for exactly this. Three minutes: expanded alcove, sorted stone rubble, one kobold entirely covered in dust and profoundly satisfied.","Without being asked, Kip locates a structural weak point by headbutting it experimentally, confirms viability, and gets to work. The methodology is chaotic. The results are solid.","Kip drags debris with startling purpose, narrating construction assessments the entire time. Materia haul: solid. Monologue: unbroken."],
  inta:      ["Inta exhales loudly and begins scribing efficiency runes along the lower walls without prompting. He doesn't explain them. Passive mana bleed: measurably reduced.","The imp uses the Bone Focus for controlled micro-clearance of the blocked junction. Each pulse is exactly calibrated. Brief significant eye contact when finished. He wants credit. Fair.","Inta reorganized the materia distribution without instruction. The sorting is impressive. He won't bring it up first."],
  shuna:     ["Shuna trails the Gossamer Veil through the upper chamber, redirecting air pressure into stable circulation. 'The cave breathes better now,' she says. You didn't know caves breathed. They do now.","The sprite vanishes for three minutes and returns with an acoustic map of adjacent passages, delivered in weather metaphors that prove accurate once you parse them.","Shuna catches drifting mana currents in the veil and redirects them toward your matrix. Recovery: fractionally improved. She calls this following the natural current. She made the current."],
  uala:      ["Uala locates a trace moisture seep in the east wall and coaxes it into stable flow via the Pearl Siphon. 'Not much,' she notes. 'But consistent.' Passive regen: fractionally improved.","The undine purges mana corruption from three ambient nodes without commentary. Efficiency: high. Words used: none. AXIOM assessment: ideal.","Uala realigns your mana pressure distribution. 'You were holding tension in the lower matrix.' The dungeon feels more coherent afterward."],
};

const ENCS = [
  {id:'rookie',  name:'Rookie Raider',      icon:'⚔️', hp:15, ess:8,  xp:15, mana:0,  mat:0, desc:"An adventurer approaches consulting a hand-drawn map. It's upside down. Their sword is pointed the right direction, at least. That's about the ceiling of their preparation.", win:"The raider retreats with ~60% of their original confidence. The rest is Essence now. AXIOM note: better than average result for minimal effort."},
  {id:'beetles', name:'Cave Beetle Colony', icon:'🪲', hp:10, ess:3,  xp:8,  mana:0,  mat:0, desc:"Eleven cave beetles have claimed your main passage as territory. They were here first, technically. That stops mattering approximately now.", win:"Colony rerouted. Several absorbed for Essence. The rest relocated. Kip looks personally accomplished about this."},
  {id:'surge',   name:'Ley-Line Surge',     icon:'⚡', hp:null,ess:5, xp:12, mana:15, mat:0, desc:"Raw ley-line energy pulses through the deep stone—untethered, looking for something to do. It found you. Opportunity or structural problem depending on your next move.", win:"Surge absorbed cleanly. Mana reserves restored. The ley-line settles back to background frequency. AXIOM logs this as an unplanned mana recovery event."},
  {id:'merchant',name:'Lost Merchant',      icon:'💼', hp:12, ess:6,  xp:10, mana:0,  mat:3, desc:"A surface merchant took a wrong turn four tunnels ago and ended up here. They look more annoyed than scared. This is somehow more unsettling than fear.", win:"Merchant escorted out, parted from some trade goods in transit. They're definitely telling everyone. +3 Stone acquired."},
  {id:'fish',    name:'Mana-Drunk Cave Fish',icon:'🐟',hp:6,  ess:4,  xp:7,  mana:0,  mat:0, desc:"A school of luminous cave fish migrated up through an underwater crack. Beautiful. Also consuming your mana moss. This is unsustainable.", win:"School redirected via pressure manipulation. Two absorbed. The rest fled. Shuna looked wistful. Mana moss: intact."},
];

const BPS = [
  {n:'Rubble Trigger',      t:'Building', cost:5,  xp:10, desc:"Ceiling collapse on pressure. Classic for a reason."},
  {n:'Mana Crystal Seam',   t:'Resource', cost:3,  xp:8,  desc:"Passive mana regen node. Inta approves."},
  {n:'Fungal Garden',       t:'Building', cost:4,  xp:8,  desc:"Bioluminescent cultivation. Food, light, atmosphere."},
  {n:'Crawl Passage',       t:'Building', cost:2,  xp:6,  desc:"Low clearance. Minions: fine. Armored raiders: not fine."},
  {n:'Stone Sentry',        t:'Minion',   cost:10, xp:15, desc:"Animated stone guardian. Slow. Devastatingly committed."},
  {n:'Echo Chamber',        t:'Building', cost:7,  xp:12, desc:"Sound multiplication. One guard sounds like twelve."},
  {n:'Cave Bat Roost',      t:'Minion',   cost:5,  xp:10, desc:"Domesticated colony. Cheap harassment with good reach."},
  {n:'Mana Siphon Node',    t:'Resource', cost:8,  xp:12, desc:"Drains ambient mana from intruders as they pass."},
  {n:'Pressure Plate Array',t:'Building', cost:6,  xp:11, desc:"Triggered alarm system. No hiding the approach."},
  {n:'Blind Creeper',       t:'Minion',   cost:6,  xp:11, desc:"Echolocation-based hunter. Sees in total darkness."},
];

// ─────────────────────────────────────────────────────────────
// PURE STATE TRANSITION
// ─────────────────────────────────────────────────────────────
function applyCmd(prev, p) {
  const {cost=0,xp=0,text,type='command',matGain=0,newBP=null,newMinion=null,encData=null,clearEnc=false,encEss=0,encMana=0,encMat=0,lvlText=''} = p;

  if (!clearEnc && prev.core.mana < cost) {
    return {...prev, logs:[...prev.logs,{id:LID(prev.scene),text:`AXIOM: Insufficient mana. Need ${cost}, have ${prev.core.mana}. Mana regenerates +${prev.core.manaRegen} per scene. Wait it out.`,type:'error',ts:Date.now()}]};
  }

  let sc = prev.scene + 1;
  const afterSpend = clearEnc ? prev.core.mana : prev.core.mana - cost;
  let {level,maxMana,manaRegen,maxIntegrity,xpThreshold,integrity} = prev.core;
  let newXP = prev.core.xp + xp;
  let leveledUp = false;

  if (xp > 0 && newXP >= xpThreshold) {
    level++; maxMana+=10; manaRegen+=2; maxIntegrity+=10; xpThreshold+=150;
    integrity = maxIntegrity; leveledUp = true;
  }

  const finalMana = Math.min(maxMana, afterSpend + manaRegen + encMana);
  let logs = [...prev.logs, {id:LID(sc), text, type, ts:Date.now()}];

  if (leveledUp && lvlText) {
    sc++;
    logs = [...logs, {id:LID(sc), text:lvlText, type:'levelup', ts:Date.now()+1}];
  }

  let encounter = clearEnc ? null : prev.encounter;
  if (!clearEnc && encData && !prev.encounter) {
    encounter = {...encData};
    sc++;
    logs = [...logs, {
      id: LID(sc),
      text: `ANOMALY DETECTED\n\n${encData.desc}\n\n[ ${encData.name} ${encData.icon}${encData.hp ? ` — HP: ${encData.hp}/${encData.hp}` : ' — EVENT'} ]`,
      type: 'encounter', ts: Date.now()+2
    }];
  }

  return {
    ...prev, scene:sc, logs, encounter,
    blueprints: newBP ? [...prev.blueprints, newBP] : prev.blueprints,
    minions: newMinion ? [...prev.minions, newMinion] : prev.minions,
    materia: {stone: prev.materia.stone + matGain + encMat},
    core: {
      ...prev.core,
      mana:finalMana, maxMana, manaRegen, maxIntegrity, integrity,
      xp:newXP, level, xpThreshold,
      essence: prev.core.essence + encEss,
    }
  };
}

// ─────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────
function Gem({col, glow, sz=72, mp=1}) {
  const blur = 2 + mp * 6;
  return (
    <div style={{width:sz,height:sz,'--gc':col,animation:'gpulse 3s ease-in-out infinite',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <svg width={sz} height={sz} viewBox="0 0 100 100">
        <defs>
          <radialGradient id="rg" cx="38%" cy="26%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92"/>
            <stop offset="38%" stopColor={col} stopOpacity="0.88"/>
            <stop offset="100%" stopColor={glow} stopOpacity="1"/>
          </radialGradient>
          <filter id="gf">
            <feGaussianBlur stdDeviation={blur} result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <polygon points="50,5 92,36 76,95 24,95 8,36" fill="url(#rg)" filter="url(#gf)" opacity={0.8+mp*0.18}/>
        <polygon points="50,5 92,36 50,52" fill="white" opacity="0.12"/>
        <polygon points="50,5 8,36 50,52" fill="white" opacity="0.05"/>
        <line x1="50" y1="5" x2="50" y2="95" stroke="white" strokeWidth="0.5" opacity="0.08"/>
        <line x1="8" y1="36" x2="92" y2="36" stroke="white" strokeWidth="0.5" opacity="0.06"/>
        <ellipse cx="34" cy="26" rx="12" ry="7" fill="white" opacity="0.30" transform="rotate(-28 34 26)"/>
      </svg>
    </div>
  );
}

function Bar({label, val, max, col}) {
  const pct = Math.max(0, Math.min(100, (val/max)*100));
  return (
    <div style={{marginBottom:7}}>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:'#304858',marginBottom:3,fontFamily:"'Share Tech Mono',monospace"}}>
        <span>{label}</span>
        <span style={{color:col}}>{val}/{max}</span>
      </div>
      <div style={{height:5,background:'#0E1828',borderRadius:3,overflow:'hidden'}}>
        <div style={{height:'100%',width:`${pct}%`,background:`linear-gradient(90deg,${col}88,${col})`,borderRadius:3,transition:'width .4s ease',boxShadow:`0 0 6px ${col}55`}}/>
      </div>
    </div>
  );
}

function Btn({col, onClick, disabled=false, children, sm=false}) {
  const [h,sh] = useState(false);
  return (
    <button onClick={disabled ? undefined : onClick}
      onMouseEnter={()=>!disabled&&sh(true)}
      onMouseLeave={()=>sh(false)}
      style={{
        display:'block', width:'100%', marginBottom:5,
        padding: sm ? '6px 10px' : '9px 11px',
        background: h ? `${col}18` : 'transparent',
        border: `1px solid ${disabled ? '#14203A' : h ? col : col+'40'}`,
        color: disabled ? '#1E3050' : h ? col : `${col}99`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign:'left', fontFamily:"'Share Tech Mono',monospace",
        fontSize: sm ? 10 : 11, transition:'all .15s', letterSpacing:'.4px'
      }}>
      {children}
    </button>
  );
}

function LogEntry({e}) {
  const C = {system:'#29D4FF', command:'#78C828', encounter:'#FF8840', error:'#FF4444', levelup:'#FFD700', narrative:'#7090A8'};
  const col = C[e.type] || '#7090A8';
  const isLvl = e.type === 'levelup';
  return (
    <div style={{
      animation: 'fadein .3s ease',
      padding:'11px 14px',
      borderLeft: `2px solid ${col}44`,
      marginBottom: 10,
      background: isLvl ? 'rgba(255,215,0,0.04)' : '#0A1220',
      borderRadius:'0 2px 2px 0',
      boxShadow: isLvl ? `0 0 20px rgba(255,215,0,0.06)` : 'none'
    }}>
      <div style={{fontSize:7,color:'#182840',fontFamily:"'Press Start 2P'",marginBottom:5,letterSpacing:1}}>{e.id}</div>
      <div style={{whiteSpace:'pre-wrap',lineHeight:1.85,fontSize:12,color:col,fontFamily:"'Share Tech Mono',monospace"}}>{e.text}</div>
    </div>
  );
}

function TopPip({label, val, col, pct}) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:5,fontFamily:"'Share Tech Mono',monospace"}}>
      <span style={{fontSize:8,color:'#1E3050',flexShrink:0}}>{label}</span>
      {pct!=null && (
        <div style={{width:50,height:3,background:'#0E1828',borderRadius:2,flexShrink:0,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${Math.max(0,Math.min(100,pct*100))}%`,background:col,transition:'width .35s',boxShadow:`0 0 4px ${col}88`}}/>
        </div>
      )}
      <span style={{fontSize:9,color:col,flexShrink:0}}>{val}</span>
    </div>
  );
}

function MH({col, children}) {
  return <div style={{fontFamily:"'Press Start 2P'",fontSize:8,color:col,marginBottom:14,letterSpacing:1}}>── {children} ──</div>;
}

// ─────────────────────────────────────────────────────────────
// SETUP SCREENS
// ─────────────────────────────────────────────────────────────
function IntroScreen({onBegin}) {
  const [show,sShow] = useState(false);
  useEffect(()=>{const t=setTimeout(()=>sShow(true),300);return()=>clearTimeout(t);},[]);
  return (
    <div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#060810',padding:24}}>
      <div style={{textAlign:'center',maxWidth:460}}>
        <div style={{fontFamily:"'Press Start 2P'",fontSize:7,color:'#142232',letterSpacing:5,marginBottom:16}}>CRYSTALLINE PROTOCOLS</div>
        <div style={{fontFamily:"'Press Start 2P'",fontSize:26,color:'#29D4FF',lineHeight:1.4,textShadow:'0 0 40px #29D4FF55',marginBottom:22}}>DUNGEON<br/>CORE</div>
        <div style={{width:36,height:1,background:'linear-gradient(90deg,transparent,#29D4FF,transparent)',margin:'0 auto 22px'}}/>
        {show && <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:'#304858',lineHeight:2,marginBottom:32,animation:'fadein .5s ease'}}>
          You were mortal once.<br/>A ley-line surge ended that arrangement.<br/>
          <span style={{color:'#29D4FF'}}>You are now a dungeon core.</span><br/>
          AXIOM has been initialized.
        </div>}
        <div style={{display:'flex',justifyContent:'center'}}>
          <button onClick={onBegin}
            style={{fontFamily:"'Press Start 2P'",fontSize:9,padding:'13px 30px',background:'transparent',border:'1px solid #29D4FF66',color:'#29D4FF66',cursor:'pointer',letterSpacing:3,transition:'all .2s'}}
            onMouseEnter={e=>{e.target.style.borderColor='#29D4FF';e.target.style.color='#29D4FF';e.target.style.boxShadow='0 0 22px #29D4FF33';}}
            onMouseLeave={e=>{e.target.style.borderColor='#29D4FF66';e.target.style.color='#29D4FF66';e.target.style.boxShadow='none';}}>
            INITIALIZE
          </button>
        </div>
      </div>
    </div>
  );
}

function ElementSelect({onPick}) {
  const [hov,sHov] = useState(null);
  return (
    <div style={{minHeight:'100vh',background:'#060810',padding:28,overflowY:'auto'}}>
      <div style={{maxWidth:700,margin:'0 auto'}}>
        <div style={{fontFamily:"'Press Start 2P'",fontSize:7,color:'#142232',letterSpacing:4,marginBottom:8}}>AXIOM — INITIALIZATION SEQUENCE</div>
        <div style={{fontFamily:"'Press Start 2P'",fontSize:13,color:'#C0D0E0',marginBottom:10}}>ELEMENTAL COMPOSITION</div>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:'#304858',marginBottom:24,lineHeight:1.9}}>
          Your crystalline form must align with an elemental signature. This determines your material, your nature, and your general disposition toward obstacles. Choose deliberately. The ambient mana is already making suggestions and it doesn't have great taste.
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          {Object.entries(ELEMS).map(([k,el])=>(
            <div key={k} onClick={()=>onPick(k)}
              onMouseEnter={()=>sHov(k)} onMouseLeave={()=>sHov(null)}
              style={{padding:20,border:`1px solid ${hov===k?el.col:'#182338'}`,background:hov===k?`${el.col}0D`:'#0C1422',cursor:'pointer',transition:'all .2s',boxShadow:hov===k?`0 0 26px ${el.col}2A`:'none'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                <span style={{fontSize:26}}>{el.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Press Start 2P'",fontSize:9,color:el.col}}>{el.name.toUpperCase()}</div>
                  <div style={{fontSize:9,color:'#1A2E40',marginTop:3,fontFamily:"'Share Tech Mono',monospace"}}>{el.mat}</div>
                </div>
                <div style={{fontFamily:"'Press Start 2P'",fontSize:6,color:`${el.col}99`,border:`1px solid ${el.col}30`,padding:'2px 6px'}}>{el.tag}</div>
              </div>
              <div style={{fontSize:11,color:'#304858',lineHeight:1.7,fontFamily:"'Share Tech Mono',monospace"}}>{el.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StewardSelect({elType, onPick}) {
  const [hov,sHov] = useState(null);
  const el = ELEMS[elType];
  return (
    <div style={{minHeight:'100vh',background:'#060810',padding:28,overflowY:'auto'}}>
      <div style={{maxWidth:700,margin:'0 auto'}}>
        <div style={{fontFamily:"'Press Start 2P'",fontSize:7,color:'#142232',letterSpacing:4,marginBottom:8}}>AXIOM — INITIALIZATION SEQUENCE</div>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
          <div style={{fontFamily:"'Press Start 2P'",fontSize:13,color:'#C0D0E0'}}>SELECT STEWARD</div>
          <div style={{fontFamily:"'Press Start 2P'",fontSize:7,color:el.col,border:`1px solid ${el.col}44`,padding:'3px 8px'}}>{el.icon} {el.name.toUpperCase()}</div>
        </div>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:'#304858',marginBottom:24,lineHeight:1.9}}>
          Your first minion. They'll guide you, argue with you, and occasionally do useful things without being asked. Choose someone you can tolerate. They're going to be very present.
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          {Object.entries(STEWS).map(([k,s])=>(
            <div key={k} onClick={()=>onPick(k)}
              onMouseEnter={()=>sHov(k)} onMouseLeave={()=>sHov(null)}
              style={{padding:18,border:`1px solid ${hov===k?s.col:'#182338'}`,background:hov===k?`${s.col}0D`:'#0C1422',cursor:'pointer',transition:'all .2s',boxShadow:hov===k?`0 0 26px ${s.col}2A`:'none'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <span style={{fontSize:28}}>{s.icon}</span>
                <div>
                  <div style={{fontFamily:"'Press Start 2P'",fontSize:8,color:s.col}}>{s.name.toUpperCase()}</div>
                  <div style={{fontSize:9,color:'#1A2E40',marginTop:3,fontFamily:"'Share Tech Mono',monospace"}}>{s.type} · {s.el}</div>
                </div>
              </div>
              <div style={{fontSize:10,color:'#1E3048',marginBottom:10,fontFamily:"'Share Tech Mono',monospace"}}>Gear: <span style={{color:'#304858'}}>{s.gear}</span></div>
              <Bar label="HP" val={s.maxHp} max={s.maxHp} col={s.col}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// GAME SCREEN
// ─────────────────────────────────────────────────────────────
function GameScreen({gs, setGs, el}) {
  const [modal,sModal] = useState(null);
  const [nameIn,sNameIn] = useState('');
  const logRef = useRef(null);
  const prevLogLen = useRef(0);

  useEffect(()=>{
    if(gs.logs.length !== prevLogLen.current){
      prevLogLen.current = gs.logs.length;
      if(logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  });

  const cmd = p => setGs(prev => applyCmd(prev, p));
  const blocked = !!gs.encounter;
  const c = gs.core;
  const s = gs.steward;
  const mp = c.mana / c.maxMana;

  const doPulse = () => {
    const enc = Math.random()<.28 ? {...R(ENCS)} : null;
    cmd({cost:3,xp:8,
      text:`PULSE SENSES — 3 Mana\n\n[ORGANIC]\n${R(PO)}\n\n[INORGANIC]\n${R(PI)}`,
      type:'command', encData:enc, lvlText:R(LUT)});
  };
  const doScan = () => {
    const avail = BPS.filter(b=>!gs.blueprints.find(x=>x.n===b.n));
    if(!avail.length){
      setGs(p=>({...p,logs:[...p.logs,{id:LID(p.scene),text:"AXIOM: Blueprint library fully catalogued. SCAN NODE returning no new data. All available designs have been acquired.",type:'system',ts:Date.now()}]}));
      return;
    }
    const bp = R(avail);
    const enc = Math.random()<.28 ? {...R(ENCS)} : null;
    cmd({cost:5,xp:12,
      text:`SCAN NODE — 5 Mana\n\nBlueprint acquired: ${bp.n}\nType: ${bp.t} — Build cost: ${bp.cost} Mana\n\n"${bp.desc}"\n\nAXIOM: Added to library. Use MAGICAL MANIFESTATION to construct.`,
      type:'command', newBP:bp, encData:enc, lvlText:R(LUT)});
  };
  const doAbsorb = () => {
    const gain = Math.floor(Math.random()*3)+1;
    const enc = Math.random()<.22 ? {...R(ENCS)} : null;
    cmd({cost:0,xp:5,
      text:`ABSORB — Free\n\n${R(ABT)}\n\n+${gain} Stone added to Materia Pool.`,
      type:'command', matGain:gain, encData:enc, lvlText:R(LUT)});
  };
  const doLabor = () => {
    const gain = Math.floor(Math.random()*2)+1;
    const enc = Math.random()<.2 ? {...R(ENCS)} : null;
    cmd({cost:0,xp:6,
      text:`MANUAL LABOR — Free (${s.name})\n\n${R(MLT[s.key])}\n\n+${gain} Stone gained.`,
      type:'command', matGain:gain, encData:enc, lvlText:R(LUT)});
  };
  const doManifest = bp => {
    const minion = bp.t==='Minion' ? {name:bp.n,type:bp.t,hp:20,maxHp:20,id:Date.now()} : null;
    cmd({cost:bp.cost,xp:bp.xp,
      text:`MAGICAL MANIFESTATION — ${bp.cost} Mana\n\n${R(MFT)}\n\n[ ${bp.t.toUpperCase()} CREATED: ${bp.n} ]`,
      type:'command', newMinion:minion, lvlText:R(LUT)});
    sModal(null);
  };
  const doResolve = () => {
    const enc = gs.encounter;
    if(!enc) return;
    cmd({cost:0,xp:enc.xp,
      text:`ENCOUNTER RESOLVED — ${enc.name} ${enc.icon}\n\n${enc.win}\n\n+${enc.ess} Essence${enc.mana?` · +${enc.mana} Mana`:''}${enc.mat?` · +${enc.mat} Stone`:''}`,
      type:'encounter', encEss:enc.ess, encMana:enc.mana||0, encMat:enc.mat||0,
      clearEnc:true, lvlText:R(LUT)});
  };
  const doName = () => {
    if(!nameIn.trim()) return;
    const n = nameIn.trim(); sNameIn('');
    setGs(p=>({...p,core:{...p.core,name:n},logs:[...p.logs,{id:LID(p.scene+1),text:`Core designation updated: "${n}"\n\nAXIOM: Logged. I'll use it when appropriate. Mostly when you're about to make a mistake.`,type:'system',ts:Date.now()}],scene:p.scene+1}));
  };

  // ── MODALS ──
  const MODS = {
    status: (
      <div>
        <MH col={el.col}>CORE STATUS</MH>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:11,marginBottom:14}}>
          {[['DESIGNATION',c.name||'UNNAMED'],['LEVEL',c.level],['XP',`${c.xp} / ${c.xpThreshold}`],[`CORE TYPE`,`${el.name} (${el.mat})`],['MANA',`${c.mana} / ${c.maxMana}`],['REGEN',`+${c.manaRegen}/scene`],['ESSENCE',c.essence],['INTEGRITY',`${c.integrity} / ${c.maxIntegrity}`]].map(([k,v])=>(
            <div key={k}><div style={{fontSize:8,fontFamily:"'Press Start 2P'",color:'#1A2E44',marginBottom:2}}>{k}</div><div style={{fontSize:11,color:'#A0B8D0',fontFamily:"'Share Tech Mono',monospace"}}>{v}</div></div>
          ))}
        </div>
        <div style={{paddingTop:12,borderTop:'1px solid #0E1828'}}>
          <div style={{fontSize:8,fontFamily:"'Press Start 2P'",color:'#1A2E44',marginBottom:7}}>MATERIA POOL</div>
          <div style={{fontSize:11,color:'#506070',fontFamily:"'Share Tech Mono',monospace"}}>Stone: <span style={{color:'#7090A0'}}>{gs.materia.stone}</span></div>
        </div>
      </div>
    ),
    bps: (
      <div>
        <MH col={el.col}>BLUEPRINT LIBRARY</MH>
        {!gs.blueprints.length
          ? <div style={{fontSize:11,color:'#1E3048',fontFamily:"'Share Tech Mono',monospace"}}>No blueprints acquired. Use SCAN NODE to discover designs.</div>
          : gs.blueprints.map((bp,i)=>(
            <div key={i} style={{padding:'10px 12px',background:'#07101C',border:'1px solid #142030',marginBottom:8}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                <span style={{color:'#B0C8D8',fontSize:12,fontFamily:"'Share Tech Mono',monospace"}}>{bp.n}</span>
                <div style={{display:'flex',gap:8}}>
                  <span style={{fontSize:9,color:'#1E3048',fontFamily:"'Share Tech Mono',monospace"}}>{bp.t}</span>
                  <span style={{fontSize:9,color:el.col,fontFamily:"'Share Tech Mono',monospace"}}>{bp.cost}M</span>
                </div>
              </div>
              <div style={{fontSize:10,color:'#283840',lineHeight:1.5,marginBottom:8,fontFamily:"'Share Tech Mono',monospace"}}>{bp.desc}</div>
              <Btn col={el.col} onClick={()=>doManifest(bp)} disabled={c.mana<bp.cost} sm>
                BUILD — {bp.cost} MANA{c.mana<bp.cost ? ' (need mana)' : ''}
              </Btn>
            </div>
          ))
        }
      </div>
    ),
    minions: (
      <div>
        <MH col={el.col}>MINION REGISTRY</MH>
        {s && <div style={{padding:'10px 12px',background:'#07101C',border:`1px solid ${s.col}33`,marginBottom:8}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:20}}>{s.icon}</span>
            <div>
              <div style={{fontSize:11,color:s.col,fontFamily:"'Share Tech Mono',monospace"}}>{s.name} <span style={{color:'#1E3048'}}>[STEWARD]</span></div>
              <div style={{fontSize:9,color:'#1E3048',marginTop:2,fontFamily:"'Share Tech Mono',monospace"}}>HP {s.hp}/{s.maxHp}</div>
            </div>
          </div>
        </div>}
        {!gs.minions.length
          ? <div style={{fontSize:11,color:'#1E3048',fontFamily:"'Share Tech Mono',monospace",marginTop:4}}>No additional minions. Build Minion-type blueprints to expand the registry.</div>
          : gs.minions.map((m,i)=>(
            <div key={i} style={{padding:'9px 12px',background:'#07101C',border:'1px solid #142030',marginBottom:6}}>
              <div style={{fontSize:11,color:'#A0B8D0',fontFamily:"'Share Tech Mono',monospace"}}>{m.name}</div>
              <div style={{fontSize:9,color:'#1E3048',marginTop:2,fontFamily:"'Share Tech Mono',monospace"}}>HP: {m.hp}/{m.maxHp}</div>
            </div>
          ))
        }
      </div>
    ),
    cmds: (
      <div>
        <MH col={el.col}>COMMAND REGISTRY</MH>
        {[['PULSE SENSES','3 Mana','Active'],['SCAN NODE','5 Mana','Active'],['ABSORB','Free','Active'],['MANUAL LABOR','Free','Active'],['MAGICAL MANIFESTATION','Variable','Active'],['VIEW STATUS','Free','Passive'],['VIEW BLUEPRINTS','Free','Passive'],['VIEW MINION REGISTRY','Free','Passive'],['VIEW COMMANDS','Free','Passive'],['NAME CORE','Free','Any time']].map(([n,cost,t])=>(
          <div key={n} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #0A1420',fontFamily:"'Share Tech Mono',monospace"}}>
            <span style={{fontSize:11,color:'#5A7890'}}>{n}</span>
            <span style={{fontSize:9,color:t==='Active'?el.col:t==='Passive'?'#1A2E44':'#304858'}}>{cost}</span>
          </div>
        ))}
      </div>
    )
  };

  return (
    <div style={{height:'100vh',display:'flex',flexDirection:'column',overflow:'hidden',background:'#060810',fontFamily:"'Share Tech Mono',monospace"}}>

      {/* TOP BAR */}
      <div style={{background:'#090F1C',borderBottom:'1px solid #121E30',padding:'7px 14px',display:'flex',alignItems:'center',gap:14,flexShrink:0}}>
        <div style={{fontFamily:"'Press Start 2P'",fontSize:8,color:el.col,flexShrink:0,textShadow:`0 0 10px ${el.col}66`}}>
          {c.name||'CORE'} {el.icon}
        </div>
        <div style={{flex:1,display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
          <TopPip label="LV" val={c.level} col="#FFD700"/>
          <TopPip label="XP" val={`${c.xp}/${c.xpThreshold}`} col="#B09020" pct={c.xp/c.xpThreshold}/>
          <TopPip label="MANA" val={`${c.mana}/${c.maxMana}`} col={el.col} pct={mp}/>
          <TopPip label="INT" val={`${c.integrity}/${c.maxIntegrity}`} col="#DD5050" pct={c.integrity/c.maxIntegrity}/>
          <TopPip label="ESS" val={c.essence} col="#9060DD"/>
          <TopPip label="STONE" val={gs.materia.stone} col="#7090A0"/>
        </div>
        <div style={{fontFamily:"'Press Start 2P'",fontSize:6,color:'#0E1E2E',flexShrink:0}}>AXIOM SYS</div>
      </div>

      {/* 3-COLUMN BODY */}
      <div style={{flex:1,display:'flex',overflow:'hidden'}}>

        {/* LEFT */}
        <div style={{width:214,background:'#090F1C',borderRight:'1px solid #121E30',padding:14,overflowY:'auto',flexShrink:0,display:'flex',flexDirection:'column',gap:12}}>

          <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:14,background:'#060810',border:`1px solid ${el.col}22`}}>
            <Gem col={el.col} glow={el.glow} sz={70} mp={mp}/>
            <div style={{fontFamily:"'Press Start 2P'",fontSize:7,color:el.col,marginTop:9,letterSpacing:.5}}>{el.name.toUpperCase()}</div>
            <div style={{fontSize:9,color:'#1A2E44',marginTop:3}}>{el.mat}</div>
            <div style={{display:'flex',gap:14,marginTop:8,fontSize:9,color:'#1E3050'}}>
              <span>LV <span style={{color:'#FFD700'}}>{c.level}</span></span>
              <span>+<span style={{color:el.col}}>{c.manaRegen}</span>/sc</span>
            </div>
          </div>

          <div style={{display:'flex',gap:4}}>
            <input value={nameIn} onChange={e=>sNameIn(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doName()}
              placeholder="Name your core..."
              style={{flex:1,background:'#060810',border:'1px solid #121E30',color:'#4A6880',padding:'6px 8px',fontSize:10,fontFamily:"'Share Tech Mono',monospace",outline:'none',minWidth:0}}/>
            <button onClick={doName} style={{padding:'6px 10px',background:`${el.col}18`,border:`1px solid ${el.col}55`,color:el.col,cursor:'pointer',fontSize:13}}>✓</button>
          </div>

          {s && <div style={{background:'#060810',border:`1px solid ${s.col}28`,padding:12}}>
            <div style={{fontFamily:"'Press Start 2P'",fontSize:6,color:'#142232',marginBottom:8,letterSpacing:1}}>STEWARD</div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
              <span style={{fontSize:22}}>{s.icon}</span>
              <div>
                <div style={{color:s.col,fontSize:11}}>{s.name}</div>
                <div style={{fontSize:9,color:'#1A2E44',marginTop:2}}>{s.type}</div>
              </div>
            </div>
            <Bar label="HP" val={s.hp} max={s.maxHp} col={s.col}/>
            <div style={{fontSize:9,color:'#1A2E44',marginBottom:2,marginTop:8}}>GEAR</div>
            <div style={{fontSize:10,color:'#2E4658'}}>{s.gear}</div>
            <div style={{marginTop:10,padding:'8px 10px',background:'#0A1422',borderLeft:`2px solid ${s.col}44`}}>
              <div style={{fontSize:7,fontFamily:"'Press Start 2P'",color:'#142232',marginBottom:5}}>ADVICE</div>
              <div style={{fontSize:10,color:'#3A5260',lineHeight:1.65}}>{R(s.adv)}</div>
            </div>
          </div>}

          <div style={{background:'#060810',border:'1px solid #121E30',padding:11}}>
            <div style={{fontFamily:"'Press Start 2P'",fontSize:6,color:'#142232',marginBottom:8}}>LIBRARY</div>
            <div style={{fontSize:10,color:'#2E4658',marginBottom:3}}>{gs.blueprints.length} blueprint{gs.blueprints.length!==1?'s':''} acquired</div>
            {(gs.built||[]).length>0&&<div style={{fontSize:10,color:'#2E4658'}}>{gs.built.length} structure{gs.built.length!==1?'s':''} built</div>}
            {gs.minions.length>0&&<div style={{fontSize:10,color:'#2E4658'}}>{gs.minions.length} additional minion{gs.minions.length!==1?'s':''}</div>}
          </div>
        </div>

        {/* CENTER — LOG */}
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div ref={logRef} style={{flex:1,overflowY:'auto',padding:14}}>
            {gs.logs.map((e,i) => <LogEntry key={i} e={e}/>)}
          </div>

          {gs.encounter && (
            <div style={{padding:'11px 16px',background:'#120800',borderTop:'2px solid #FF6B35',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
              <div>
                <div style={{fontFamily:"'Press Start 2P'",fontSize:7,color:'#882200',marginBottom:3,letterSpacing:1}}>ACTIVE ENCOUNTER</div>
                <div style={{fontSize:11,color:'#CC5020'}}>{gs.encounter.name} {gs.encounter.icon}</div>
              </div>
              <button onClick={doResolve}
                style={{padding:'9px 18px',background:'#FF6B3514',border:'1px solid #FF6B3566',color:'#FF8040',cursor:'pointer',fontSize:11,fontFamily:"'Share Tech Mono',monospace",letterSpacing:'.4px',transition:'all .15s'}}
                onMouseEnter={e=>{e.target.style.background='#FF6B3524';e.target.style.borderColor='#FF6B35';}}
                onMouseLeave={e=>{e.target.style.background='#FF6B3514';e.target.style.borderColor='#FF6B3566';}}>
                ENGAGE →
              </button>
            </div>
          )}
        </div>

        {/* RIGHT — COMMANDS */}
        <div style={{width:192,background:'#090F1C',borderLeft:'1px solid #121E30',padding:14,overflowY:'auto',flexShrink:0}}>
          <div style={{fontFamily:"'Press Start 2P'",fontSize:6,color:'#142232',marginBottom:10,letterSpacing:2}}>COMMANDS</div>

          <div style={{fontFamily:"'Press Start 2P'",fontSize:6,color:'#162840',marginBottom:7}}>── ACTIVE</div>
          <Btn col={el.col} onClick={doPulse} disabled={blocked}>PULSE SENSES<span style={{float:'right',opacity:.7,fontSize:9}}>3M</span></Btn>
          <Btn col={el.col} onClick={doScan}  disabled={blocked}>SCAN NODE<span style={{float:'right',opacity:.7,fontSize:9}}>5M</span></Btn>
          <Btn col={el.col} onClick={doAbsorb} disabled={blocked}>ABSORB<span style={{float:'right',opacity:.7,fontSize:9}}>FREE</span></Btn>
          <Btn col={el.col} onClick={doLabor}  disabled={blocked}>MANUAL LABOR<span style={{float:'right',opacity:.7,fontSize:9}}>FREE</span></Btn>
          <Btn col="#9060DD" onClick={()=>sModal('bps')} disabled={blocked}>MANIFEST<span style={{float:'right',opacity:.7,fontSize:9}}>VAR</span></Btn>

          <div style={{fontFamily:"'Press Start 2P'",fontSize:6,color:'#162840',margin:'12px 0 7px'}}>── VIEW</div>
          <Btn col="#3A6080" onClick={()=>sModal('status')}>VIEW STATUS</Btn>
          <Btn col="#3A6080" onClick={()=>sModal('bps')}>VIEW BLUEPRINTS</Btn>
          <Btn col="#3A6080" onClick={()=>sModal('minions')}>VIEW MINIONS</Btn>
          <Btn col="#3A6080" onClick={()=>sModal('cmds')}>VIEW COMMANDS</Btn>

          <div style={{marginTop:14,paddingTop:12,borderTop:'1px solid #0E1828',fontFamily:"'Press Start 2P'",fontSize:6,color:'#0E1828',textAlign:'center',letterSpacing:1}}>{LID(gs.scene)}</div>
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div style={{position:'fixed',inset:0,background:'#060810CC',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,backdropFilter:'blur(2px)'}}
          onClick={()=>sModal(null)}>
          <div onClick={e=>e.stopPropagation()}
            style={{background:'#0C1422',border:`1px solid ${el.col}44`,padding:22,maxWidth:460,width:'92%',maxHeight:'82vh',overflowY:'auto',boxShadow:`0 0 50px ${el.col}18`}}>
            {MODS[modal]}
            <button onClick={()=>sModal(null)}
              style={{marginTop:14,fontSize:10,padding:'9px',background:'transparent',border:'1px solid #142030',color:'#1E3048',cursor:'pointer',fontFamily:"'Share Tech Mono',monospace",width:'100%',transition:'all .15s'}}
              onMouseEnter={e=>{e.target.style.borderColor='#1E3060';e.target.style.color='#2E4870';}}
              onMouseLeave={e=>{e.target.style.borderColor='#142030';e.target.style.color='#1E3048';}}>
              [ CLOSE ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [phase,sPhase] = useState('intro');
  const [elType,sElType] = useState(null);
  const [gs,sGs] = useState({
    core:{name:null,type:null,level:1,xp:20,xpThreshold:100,mana:50,maxMana:50,manaRegen:5,essence:0,integrity:100,maxIntegrity:100},
    steward:null, minions:[], materia:{stone:0}, blueprints:[], built:[], logs:[], scene:1, encounter:null,
  });

  const pickEl = type => {
    sElType(type);
    sGs(p=>({...p,core:{...p.core,type}}));
    sPhase('choose_steward');
  };

  const pickStew = key => {
    const el = ELEMS[elType];
    const s = {...STEWS[key], key};
    const initLogs = [
      {id:'LOG 01-A', type:'system', ts:Date.now(),
       text:`${BOOT}\n\n[ ELEMENTAL COMPOSITION LOCKED ]\nType: ${el.name.toUpperCase()}\nMaterial: ${el.mat}\nTag: ${el.tag}`},
      {id:'LOG 01-B', type:'command', ts:Date.now()+1,
       text:`BOND STEWARD — ${s.name} (${s.type})\n\n${s.intro}`},
    ];
    sGs(p=>({...p, steward:s, logs:initLogs, scene:3, core:{...p.core,type:elType}}));
    sPhase('playing');
  };

  return (
    <>
      <style>{CSS}</style>
      {phase==='intro'          && <IntroScreen onBegin={()=>sPhase('choose_element')}/>}
      {phase==='choose_element' && <ElementSelect onPick={pickEl}/>}
      {phase==='choose_steward' && <StewardSelect elType={elType} onPick={pickStew}/>}
      {phase==='playing'        && <GameScreen gs={gs} setGs={sGs} el={ELEMS[elType]}/>}
    </>
  );
}
