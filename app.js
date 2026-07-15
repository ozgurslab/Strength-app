(() => {
  'use strict';
  const DATA = window.STRENGTH_DATA;
  const KEYS = { logs:'strength_v2_logs', recs:'strength_v2_recommendations' };
  const $ = id => document.getElementById(id);
  const safeParse = (raw, fallback) => { try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };
  const sourceRecommendations = Object.fromEntries(DATA.exercises.map(e => [e.id, e.recommendedKg]));
  let recommendations = {...sourceRecommendations, ...safeParse(localStorage.getItem(KEYS.recs), {})};
  let logs = safeParse(localStorage.getItem(KEYS.logs), []);
  let selectedEquipment = DATA.equipment[0].id;
  let selectedPart = DATA.bodyParts[0].id;
  let selectedExerciseId = null;

  function saveState(){ localStorage.setItem(KEYS.logs, JSON.stringify(logs)); localStorage.setItem(KEYS.recs, JSON.stringify(recommendations)); }
  function fmtDate(d=new Date()){ return d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'}); }
  function exercisesForSelection(){ return DATA.exercises.filter(e=>e.equipment===selectedEquipment && e.bodyPart===selectedPart); }
  function selectedExercise(){ return DATA.exercises.find(e=>e.id===selectedExerciseId); }
  function latestLog(id){ return logs.filter(l=>l.exerciseId===id).sort((a,b)=>b.timestamp-a.timestamp)[0] || null; }
  function recFor(id){ const n=Number(recommendations[id]); return Number.isFinite(n) ? n : 0; }

  function initProfile(){
    $('profileName').textContent=DATA.profile.name;
    $('profileStats').innerHTML=`<span>Age <b>${DATA.profile.age}</b></span><span>Bodyweight <b>${DATA.profile.bodyweightKg} kg</b></span><span>Height <b>${DATA.profile.heightCm} cm</b></span><span>Body fat <b>${DATA.profile.bodyFat}</b></span>`;
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
    $('exerciseOptions').innerHTML=list.length ? list.map(e=>`<button class="exercise-option ${e.id===selectedExerciseId?'on':''}" data-id="${e.id}"><span class="name">${e.name}</span><span class="rec">${recFor(e.id)} kg</span></button>`).join('') : '<div class="empty">No exercises for this combination.</div>';
    document.querySelectorAll('.exercise-option').forEach(b=>b.addEventListener('click',()=>{selectedExerciseId=b.dataset.id; refreshExercises();}));
    renderLogger();
  }
  function renderLogger(){
    const ex=selectedExercise(); if(!ex){$('loggerCard').innerHTML='';return;}
    const last=latestLog(ex.id); const prior=last?.sets||[];
    const rows=Array.from({length:4},(_,i)=>`<div class="set-row"><span class="setn">Set ${i+1}</span><input id="w${i}" type="number" inputmode="decimal" step="0.5" value="${prior[i]?.weightKg ?? (i===0?recFor(ex.id):'')}" placeholder="kg"><span class="unit">kg</span><input id="r${i}" type="number" inputmode="numeric" value="${prior[i]?.reps ?? ''}" placeholder="reps"><span class="unit">reps</span></div>`).join('');
    $('loggerCard').innerHTML=`<div class="logger"><div class="logger-top"><div><div class="logger-name">${ex.name}</div><div class="target">Target ${ex.target}${last?` · last logged ${new Date(last.timestamp).toLocaleDateString('en-GB')}`:''}</div></div><button class="recommendation" id="editCurrentRecommendation"><span>Recommended</span><strong>${recFor(ex.id)} kg</strong></button></div><div class="sets">${rows}</div><button class="primary" id="saveSets">Save sets</button><span class="save-status" id="saveStatus"></span></div>`;
    $('saveSets').addEventListener('click',saveSets);
    $('editCurrentRecommendation').addEventListener('click',()=>openRecommendation(ex.id));
  }
  function saveSets(){
    const ex=selectedExercise(); const sets=[];
    for(let i=0;i<4;i++){ const weight=parseFloat($(`w${i}`).value); const reps=parseInt($(`r${i}`).value,10); if(Number.isFinite(weight)||Number.isFinite(reps)) sets.push({weightKg:Number.isFinite(weight)?weight:null,reps:Number.isFinite(reps)?reps:null}); }
    if(!sets.length){$('saveStatus').textContent='Enter at least one set.';return;}
    logs.push({id:`log_${Date.now()}`,timestamp:Date.now(),exerciseId:ex.id,exerciseName:ex.name,equipment:ex.equipment,bodyPart:ex.bodyPart,sets}); saveState(); renderStats(); $('saveStatus').textContent='Saved ✓'; setTimeout(()=>$('saveStatus').textContent='',1400);
  }
  function renderStats(){
    const days7=Date.now()-7*86400000; const sessions=new Set(logs.map(l=>new Date(l.timestamp).toISOString().slice(0,10))); const week=logs.filter(l=>l.timestamp>=days7); const sets=logs.reduce((n,l)=>n+l.sets.length,0);
    $('statsGrid').innerHTML=`<div class="metric"><strong>${sessions.size}</strong><span>Training days</span></div><div class="metric"><strong>${sets}</strong><span>Sets logged</span></div><div class="metric"><strong>${new Set(week.map(l=>new Date(l.timestamp).toISOString().slice(0,10))).size}</strong><span>Days this week</span></div>`;
  }
  function openRecommendation(id){ document.querySelector('[data-tab="recommendations"]').click(); setTimeout(()=>{ const input=document.querySelector(`[data-rec-id="${CSS.escape(id)}"]`); if(input){input.scrollIntoView({behavior:'smooth',block:'center'});input.focus();input.select();}},40); }
  function renderRecommendations(){
    const q=($('recSearch').value||'').toLowerCase();
    $('recommendationsTable').innerHTML=DATA.equipment.map(eq=>{ const rows=DATA.exercises.filter(e=>e.equipment===eq.id && e.name.toLowerCase().includes(q)).map(e=>`<div class="rec-row"><div><div class="rec-name">${e.name}</div><div class="rec-meta">${DATA.bodyParts.find(p=>p.id===e.bodyPart)?.label||e.bodyPart} · kg</div></div><input type="number" step="0.5" data-rec-id="${e.id}" value="${recFor(e.id)}"></div>`).join(''); return rows?`<div class="rec-group"><h3>${eq.label}</h3>${rows}</div>`:''; }).join('') || '<div class="empty">No matching exercise.</div>';
    document.querySelectorAll('[data-rec-id]').forEach(inp=>inp.addEventListener('change',()=>{ const v=parseFloat(inp.value); if(Number.isFinite(v)){recommendations[inp.dataset.recId]=v;saveState();refreshExercises();} }));
  }
  function renderHistory(){
    if(!logs.length){$('historyList').innerHTML='<div class="empty">No sets logged yet.</div>';return;}
    const grouped={}; [...logs].sort((a,b)=>b.timestamp-a.timestamp).forEach(l=>{const d=new Date(l.timestamp).toISOString().slice(0,10);(grouped[d]??=[]).push(l);});
    $('historyList').innerHTML=Object.entries(grouped).map(([date,items])=>`<div class="history-day"><h3>${new Date(date+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</h3>${items.map(l=>`<div class="history-entry"><strong>${l.exerciseName}</strong><p>${l.sets.map(s=>`${s.weightKg??'—'} kg × ${s.reps??'—'}`).join(' · ')}</p></div>`).join('')}</div>`).join('');
  }
  function exportBackup(){ const blob=new Blob([JSON.stringify({version:2,exportedAt:new Date().toISOString(),logs,recommendations},null,2)],{type:'application/json'}); const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`strength-dashboard-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href); }
  async function importBackup(file){ const obj=safeParse(await file.text(),null); if(!obj||!Array.isArray(obj.logs)) return alert('This backup file is not valid.'); logs=obj.logs; recommendations={...sourceRecommendations,...(obj.recommendations||{})}; saveState(); renderStats(); renderHistory(); renderRecommendations(); refreshExercises(); alert('Backup imported.'); }
  function bindActions(){
    $('recSearch').addEventListener('input',renderRecommendations);
    $('resetRecommendations').addEventListener('click',()=>{if(confirm('Reset all recommendations to data.js defaults?')){recommendations={...sourceRecommendations};saveState();renderRecommendations();refreshExercises();}});
    $('exportData').addEventListener('click',exportBackup);
    $('importData').addEventListener('change',e=>{if(e.target.files[0])importBackup(e.target.files[0]);});
    $('clearHistory').addEventListener('click',()=>{if(confirm('Clear all logged history?')){logs=[];saveState();renderStats();renderHistory();}});
  }
  function init(){ initProfile(); bindTabs(); populateSelectors(); bindActions(); renderStats(); renderRecommendations(); renderHistory(); }
  try { init(); } catch (err) { console.error(err); document.body.insertAdjacentHTML('afterbegin','<div style="padding:12px;background:#8d3328;color:white;font-family:system-ui">Dashboard failed to initialise. Check the browser console.</div>'); }
})();
