(() => {
  'use strict';
  const DATA = window.STRENGTH_DATA;
  const KEYS = { logs:'strength_v2_logs', recs:'strength_v2_recommendations', custom:'strength_v2_custom_exercises' };
  const $ = id => document.getElementById(id);
  const safeParse = (raw, fallback) => { try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };
  
  // Load custom exercises and merge with DATA
  function loadCustomExercises(){
    const custom = safeParse(localStorage.getItem(KEYS.custom), []);
    if(custom.length) DATA.exercises = [...DATA.exercises, ...custom];
  }
  
  const sourceRecommendations = Object.fromEntries(DATA.exercises.map(e => [e.id, e.recommendedKg]));
  let recommendations = {...sourceRecommendations, ...safeParse(localStorage.getItem(KEYS.recs), {})};
  let logs = safeParse(localStorage.getItem(KEYS.logs), []);
  let selectedEquipment = DATA.equipment[0].id;
  let selectedPart = DATA.bodyParts[0].id;
  let selectedExerciseId = null;
  let currentSets = [];

  function saveState(){ localStorage.setItem(KEYS.logs, JSON.stringify(logs)); localStorage.setItem(KEYS.recs, JSON.stringify(recommendations)); }
  function saveCustomExercises(){ localStorage.setItem(KEYS.custom, JSON.stringify(DATA.exercises.filter(e => e.isCustom))); }
  function fmtDate(d=new Date()){ return d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'}); }
  function exercisesForSelection(){ return DATA.exercises.filter(e=>e.equipment===selectedEquipment && e.bodyPart===selectedPart); }
  function selectedExercise(){ return DATA.exercises.find(e=>e.id===selectedExerciseId); }
  function latestLog(id){ return logs.filter(l=>l.exerciseId===id).sort((a,b)=>b.timestamp-a.timestamp)[0] || null; }
  function recFor(id){ const n=Number(recommendations[id]); return Number.isFinite(n) ? n : 0; }
  function getTodayISO(){ return new Date().toISOString().slice(0,10); }

  function initProfile(){
    $('profileName').textContent=DATA.profile.name;
    $('profileStats').innerHTML=`<span>Age <b>${DATA.profile.age}</b></span><span>BW <b>${DATA.profile.bodyweightKg} kg</b></span><span>Height <b>${DATA.profile.heightCm} cm</b></span>`;
    $('todayLabel').textContent=fmtDate();
  }
  function bindTabs(){ document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>{ document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b===btn)); document.querySelectorAll('.page').forEach(p=>p.classList.toggle('on',p.id===`page-${btn.dataset.tab}`)); if(btn.dataset.tab==='recommendations') renderRecommendations(); if(btn.dataset.tab==='history') renderHistory(); })); }
  function populateSelectors(){
    $('equipmentSelect').innerHTML=DATA.equipment.map(x=>`<option value="${x.id}">${x.label}</option>`).join('');
    $('partSelect').innerHTML=DATA.bodyParts.map(x=>`<option value="${x.id}">${x.label}</option>`).join('');
    $('equipmentSelect').addEventListener('change',e=>{selectedEquipment=e.target.value; refreshExercises();});
    $('partSelect').addEventListener('change',e=>{selectedPart=e.target.value; refreshExercises();});
    refreshExercises();
  }
  function refreshExercises(){
    const list=exercisesForSelection();
    if(!list.some(e=>e.id===selectedExerciseId)) selectedExerciseId=list[0]?.id || null;
    $('exerciseOptions').innerHTML=list.length ? list.map(e=>`<button class="exercise-option ${e.id===selectedExerciseId?'on':''}" data-id="${e.id}"><span class="name">${e.name}${e.isCustom?' ★':''}</span><span class="rec">${recFor(e.id)} kg</span></button>`).join('') : '<div class="empty">No exercises for this combination.</div>';
    document.querySelectorAll('.exercise-option').forEach(b=>b.addEventListener('click',()=>{selectedExerciseId=b.dataset.id; refreshExercises();}));
    renderLogger();
  }
  function renderLogger(){
    const ex=selectedExercise(); if(!ex){$('loggerCard').innerHTML='';return;}
    const last=latestLog(ex.id); 
    currentSets = last?.sets ? [...last.sets] : [];
    
    const rows=Array.from({length:3},(_,i)=>{
      const set = currentSets[i];
      const w = set?.weightKg ?? (i===0?recFor(ex.id):'');
      const r = set?.reps ?? '';
      return `<div class="set-row">
        <span class="setn">Set ${i+1}</span>
        <input id="w${i}" type="number" inputmode="decimal" step="0.5" value="${w}" placeholder="kg">
        <span class="unit">kg</span>
        <input id="r${i}" type="number" inputmode="numeric" value="${r}" placeholder="reps">
        <span class="unit">reps</span>
        <button class="delete-set" onclick="window.deleteSet(${i})" title="Delete">✕</button>
      </div>`;
    }).join('');
    
    $('loggerCard').innerHTML=`<div class="logger"><div class="logger-top"><div><div class="logger-name">${ex.name}${ex.isCustom?' <span style="font-size:0.8em;opacity:0.7;">(custom)</span>':''}</div><div class="target">Target ${ex.target}${last?` · last logged ${new Date(last.timestamp).toLocaleDateString('en-GB')}`:''}</div></div><button class="recommendation" id="editCurrentRecommendation"><span>Peak (3RM)</span><strong>${recFor(ex.id)} kg</strong></button></div><div class="sets">${rows}</div><div class="set-actions"><button class="secondary" id="addSet">+ Add set</button><button class="primary" id="saveSets">Save sets</button></div><span class="save-status" id="saveStatus"></span></div>`;
    $('saveSets').addEventListener('click',saveSets);
    $('addSet').addEventListener('click',addSet);
    $('editCurrentRecommendation').addEventListener('click',()=>openRecommendation(ex.id));
  }
  
  window.deleteSet = function(index){
    currentSets.splice(index, 1);
    renderLogger();
  };
  
  function addSet(){
    currentSets.push({weightKg: null, reps: null});
    renderLogger();
  }
  
  function saveSets(){
    const ex=selectedExercise();
    for(let i=0; i<currentSets.length; i++){
      const w = $(`w${i}`);
      const r = $(`r${i}`);
      if(w && r){
        const weight=parseFloat(w.value);
        const reps=parseInt(r.value,10);
        currentSets[i] = {
          weightKg: Number.isFinite(weight)?weight:null,
          reps: Number.isFinite(reps)?reps:null
        };
      }
    }
    const sets = currentSets.filter(s => Number.isFinite(s.weightKg) || Number.isFinite(s.reps));
    
    if(!sets.length){$('saveStatus').textContent='Enter at least one set.';return;}
    
    const today = getTodayISO();
    const existingIndex = logs.findIndex(l => {
      const logDate = new Date(l.timestamp).toISOString().slice(0,10);
      return l.exerciseId === ex.id && logDate === today;
    });
    
    const newLog = {id:`log_${Date.now()}`,timestamp:Date.now(),exerciseId:ex.id,exerciseName:ex.name,equipment:ex.equipment,bodyPart:ex.bodyPart,sets};
    
    if(existingIndex !== -1){
      logs[existingIndex] = newLog;
    } else {
      logs.push(newLog);
    }
    
    currentSets = [];
    saveState(); 
    renderStats(); 
    $('saveStatus').textContent='Saved ✓'; 
    setTimeout(()=>$('saveStatus').textContent='',1400);
    renderLogger();
  }
  
  function renderStats(){
    const days7=Date.now()-7*86400000; 
    const sessions=new Set(logs.map(l=>new Date(l.timestamp).toISOString().slice(0,10))); 
    const week=logs.filter(l=>l.timestamp>=days7); 
    const sets=logs.reduce((n,l)=>n+l.sets.length,0);
    const weekDays = new Set(week.map(l=>new Date(l.timestamp).toISOString().slice(0,10))).size;
    $('statsGrid').innerHTML=`<div class="metrics"><div class="metric"><strong>${sessions.size}</strong><span>days</span></div><span class="sep">/</span><div class="metric"><strong>${weekDays}</strong><span>this week</span></div></div><div class="metric"><strong>${sets}</strong><span>Sets logged</span></div>`;
  }
  function openRecommendation(id){ document.querySelector('[data-tab="recommendations"]').click(); setTimeout(()=>{ const input=document.querySelector(`[data-rec-id="${CSS.escape(id)}"]`); if(input){input.scrollIntoView({behavior:'smooth',block:'center'});input.focus();input.select();}},40); }
  function renderRecommendations(){
    const q=($('recSearch').value||'').toLowerCase();
    $('recommendationsTable').innerHTML=DATA.equipment.map(eq=>{ const rows=DATA.exercises.filter(e=>e.equipment===eq.id && e.name.toLowerCase().includes(q)).map(e=>`<div class="rec-row"><div><div class="rec-name">${e.name}${e.isCustom?' ★':''}</div><div class="rec-meta">${DATA.bodyParts.find(p=>p.id===e.bodyPart)?.label||e.bodyPart}</div></div><input type="number" step="0.5" data-rec-id="${e.id}" value="${recFor(e.id)}"></div>`).join(''); return rows?`<div class="rec-group"><h3>${eq.label}</h3>${rows}</div>`:''; }).join('') || '<div class="empty">No matching exercise.</div>';
    document.querySelectorAll('[data-rec-id]').forEach(inp=>inp.addEventListener('change',()=>{ const v=parseFloat(inp.value); if(Number.isFinite(v)){recommendations[inp.dataset.recId]=v;saveState();refreshExercises();} }));
  }
  
  function renderHistory(){
    if(!logs.length){$('historyList').innerHTML='<div class="empty">No sets logged yet.</div>';return;}
    const grouped={}; 
    [...logs].sort((a,b)=>b.timestamp-a.timestamp).forEach(l=>{
      const d=new Date(l.timestamp).toISOString().slice(0,10);
      if(!grouped[d]) grouped[d]={};
      const bp = l.bodyPart;
      if(!grouped[d][bp]) grouped[d][bp]=[];
      grouped[d][bp].push(l);
    });
    
    $('historyList').innerHTML=Object.entries(grouped).map(([date,byBodyPart])=>{
      const dayHtml = Object.entries(byBodyPart).map(([bp,items])=>{
        return `<div class="history-section">
          <h4 class="bp-label">${DATA.bodyParts.find(p=>p.id===bp)?.label||bp}</h4>
          ${items.map(l=>`<div class="history-entry"><strong>${l.exerciseName}</strong><p>${l.sets.map(s=>\`\${s.weightKg??'—'} kg × \${s.reps??'—'}\`).join(' · ')}</p><button class="history-delete" onclick="window.deleteLog('\${l.id}')">Delete</button></div>`).join('')}
        </div>`;
      }).join('');
      return `<div class="history-day"><h3>${new Date(date+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}</h3>${dayHtml}</div>`;
    }).join('');
  }
  
  window.deleteLog = function(logId){
    if(!confirm('Delete this log entry?')) return;
    logs = logs.filter(l => l.id !== logId);
    saveState();
    renderStats();
    renderHistory();
  };
  
  function exportBackup(){ const blob=new Blob([JSON.stringify({version:2,exportedAt:new Date().toISOString(),logs,recommendations},null,2)],{type:'application/json'}); const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`strength-backup-${getTodayISO()}.json`;a.click();URL.revokeObjectURL(a.href); }
  async function importBackup(file){ const obj=safeParse(await file.text(),null); if(!obj||!Array.isArray(obj.logs)) return alert('Invalid backup file.'); logs=obj.logs; recommendations={...sourceRecommendations,...(obj.recommendations||{})}; saveState(); renderStats(); renderHistory(); renderRecommendations(); refreshExercises(); alert('Backup imported.'); }
  
  function openCustomExerciseModal(){
    const modal = $('customExerciseModal');
    if(!modal) return;
    $('customBodyPart').value = selectedPart;
    $('customEquipment').value = selectedEquipment;
    $('customExerciseName').value = '';
    $('customExerciseTarget').value = '';
    $('customRecommendedKg').value = '';
    modal.style.display = 'flex';
  }
  
  function closeCustomExerciseModal(){
    const modal = $('customExerciseModal');
    if(modal) modal.style.display = 'none';
  }
  
  function saveCustomExercise(){
    const name = $('customExerciseName').value.trim();
    const bodyPart = $('customBodyPart').value;
    const equipment = $('customEquipment').value;
    const target = $('customExerciseTarget').value.trim() || '3 × 12';
    const recommendedKg = parseFloat($('customRecommendedKg').value) || 0;
    
    if(!name) { alert('Please enter an exercise name.'); return; }
    
    const id = `${equipment}_${bodyPart}_${name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}`;
    const newEx = { id, equipment, bodyPart, name, recommendedKg, target, isCustom: true };
    
    DATA.exercises.push(newEx);
    sourceRecommendations[id] = recommendedKg;
    recommendations[id] = recommendedKg;
    
    saveCustomExercises();
    saveState();
    closeCustomExerciseModal();
    refreshExercises();
    alert(`Added: "${name}"`);
  }
  
  function bindActions(){
    $('recSearch').addEventListener('input',renderRecommendations);
    $('resetRecommendations').addEventListener('click',()=>{if(confirm('Reset all peaks to data.js defaults?')){recommendations={...sourceRecommendations};saveState();renderRecommendations();refreshExercises();}});
    $('exportData').addEventListener('click',exportBackup);
    $('importData').addEventListener('change',e=>{if(e.target.files[0])importBackup(e.target.files[0]);});
    $('clearHistory').addEventListener('click',()=>{if(confirm('Clear all history?')){logs=[];saveState();renderStats();renderHistory();}});
    
    const addCustomBtn = $('addCustomExercise');
    if(addCustomBtn) addCustomBtn.addEventListener('click', openCustomExerciseModal);
    
    const closeCustomBtn = $('closeCustomExerciseModal');
    if(closeCustomBtn) closeCustomBtn.addEventListener('click', closeCustomExerciseModal);
    
    const closeCustomBtn2 = document.querySelector('.close-modal');
    if(closeCustomBtn2) closeCustomBtn2.addEventListener('click', closeCustomExerciseModal);
    
    const saveCustomBtn = $('saveCustomExerciseBtn');
    if(saveCustomBtn) saveCustomBtn.addEventListener('click', saveCustomExercise);
    
    const modal = $('customExerciseModal');
    if(modal) modal.addEventListener('click', e => { if(e.target === modal) closeCustomExerciseModal(); });
  }
  
  function init(){ 
    loadCustomExercises();
    initProfile(); 
    bindTabs(); 
    populateSelectors(); 
    bindActions(); 
    renderStats(); 
    renderRecommendations(); 
    renderHistory(); 
  }
  
  try { init(); } catch (err) { console.error(err); document.body.insertAdjacentHTML('afterbegin','<div style="padding:12px;background:#8d3328;color:white;font-family:system-ui">Error. Check console.</div>'); }
})();
