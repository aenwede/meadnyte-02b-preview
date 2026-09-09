(() => {
  'use strict';
  const ROOT = location.hostname.endsWith('github.io')
    ? '/meadnyte-02b-preview/review/06d-listen-portal'
    : 'https://meadnyte.com';
  const poems = [
    ['five-days-of-hell','5 Days Of Hell'],['time-in-retrospect','Time In Retrospect'],['agony','Agony'],['love','Love'],['yearning','Yearning'],['you-alone','You Alone'],['day-youll-finally-be-mine','The Day You’ll Finally Be Mine'],['procrastination','Procrastination'],['santa-monica-boardwalk','Santa Monica Boardwalk'],['the-oracle','The Oracle'],['in-transit-take-two','In Transit, Take II'],['the-wish','The Wish'],['the-universe','The Universe'],['rain','Rain'],['contemplation','Contemplation'],['living-life','Living Life'],['images','Images'],['identity-crises','Identity Crises'],['ode-to-success','Ode To Success'],['faulting','Faulting'],['stripe-man','Stripe Man'],['in-transit','In Transit'],['time','Time'],['strange-affliction','Strange Affliction']
  ];
  const $ = s => document.querySelector(s);
  const audio=$('[data-audio]'), select=$('[data-poem-select]'), list=$('[data-cue-list]'), canvas=$('[data-waveform]'), ctx=canvas.getContext('2d');
  const state={poem:0,cue:0,cues:[],original:null,duration:0,loop:false,dirty:false,peaks:[],history:[],blockStart:null,blockEnd:null};
  let segmentStop=null;
  const fmt=(s,ms=false)=>{s=Math.max(0,Number(s)||0);const m=Math.floor(s/60),v=ms?s%60:(Math.floor(s)%60);return `${m}:${v.toFixed(ms?3:0).padStart(ms?6:2,'0')}`};
  const storageKey=slug=>`${slug==='the-oracle'?'fols-timing-v2':'fols-timing-v1'}:${slug}`;
  const audioUrl=slug=>slug==='the-oracle'?'assets/the-oracle-workbench.mp3?v=web-20260909':`${ROOT}/assets/audio/listen/fragments/${slug}.mp3`;
  select.innerHTML=poems.map(([slug,title],i)=>`<option value="${i}">${String(i+1).padStart(2,'0')} · ${title}</option>`).join('');

  async function loadPoem(index){
    state.poem=(index+poems.length)%poems.length; state.cue=0; state.loop=false; state.history=[]; state.blockStart=null; state.blockEnd=null; updateUndo(); updateBlockControls(); $('[data-loop]').textContent='Loop cue: off'; select.value=state.poem;
    const [slug,title]=poems[state.poem]; $('[data-title]').textContent=title; $('[data-position]').textContent=`Fragments of a Listening Soul · ${String(state.poem+1).padStart(2,'0')} of 24`;
    const art=`${ROOT}/assets/img/listen/fragments/${slug}.png`; $('[data-art]').src=art; $('[data-art-backdrop]').src=art; $('[data-art]').alt=`Artwork for ${title}`;
    audio.pause(); audio.src=audioUrl(slug); audio.currentTime=0; $('[data-preview-line]').textContent='Press play to begin.';
    const response=await fetch(`${ROOT}/assets/data/listen/cues/${slug}.json?v=${Date.now()}`); if(!response.ok)throw new Error(`Cue file returned ${response.status}`);
    const payload=await response.json(); state.original=structuredClone(payload); const saved=localStorage.getItem(storageKey(slug)); state.cues=saved?JSON.parse(saved).cues:structuredClone(payload.cues); state.dirty=Boolean(saved); setSaveState(); renderList(); selectCue(0); decodeWave();
  }
  function setSaveState(){const el=$('[data-save-state]');el.textContent=state.dirty?'Corrections saved in this browser':'Loaded from published timing';el.classList.toggle('is-dirty',state.dirty)}
  function renderList(){const low=state.blockStart===null||state.blockEnd===null?-1:Math.min(state.blockStart,state.blockEnd),high=state.blockStart===null||state.blockEnd===null?-1:Math.max(state.blockStart,state.blockEnd);list.innerHTML=state.cues.map((c,i)=>`<li class="${i===state.cue?'is-active ':''}${i>=low&&i<=high?'is-block ':''}${c.matchedWords===0?'is-inferred':''}"><button type="button" data-cue="${i}"><span>${escapeHtml(c.text)}</span><span>${fmt(c.start,true)}–${fmt(c.end,true)}</span></button></li>`).join(''); $('[data-progress-label]').textContent=`${state.cues.length} lines`; list.querySelectorAll('button').forEach(b=>b.onclick=()=>selectCue(Number(b.dataset.cue)))}
  function escapeHtml(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML}
  function selectCue(index){state.cue=Math.max(0,Math.min(state.cues.length-1,index));const c=state.cues[state.cue];$('[data-cue-number]').textContent=`Line ${state.cue+1} of ${state.cues.length}`;$('[data-text]').value=c.text;$('[data-start]').value=c.start.toFixed(3);$('[data-end]').value=c.end.toFixed(3);$('[data-quality]').textContent=c.matchedWords?`${c.matchedWords} matched word${c.matchedWords===1?'':'s'}`:'Inferred timing';renderList();list.children[state.cue]?.scrollIntoView({block:'nearest'});validateDraft();drawWave()}
  function draft(){return {text:$('[data-text]').value.trim(),start:Number($('[data-start]').value),end:Number($('[data-end]').value),matchedWords:state.cues[state.cue].matchedWords||0}}
  function validate(c){const prev=state.cues[state.cue-1],next=state.cues[state.cue+1],issues=[];if(!c.text)issues.push('Lyric text cannot be empty.');if(!Number.isFinite(c.start)||!Number.isFinite(c.end))issues.push('Both times must be numbers.');if(c.start<0)issues.push('Start cannot be before 0:00.');if(c.end<=c.start)issues.push('End must be later than start.');if(state.duration&&c.end>state.duration)issues.push('End exceeds the recording duration.');if(prev&&c.start<prev.end)issues.push(`Start overlaps line ${state.cue}.`);if(next&&c.end>next.start)issues.push(`End overlaps line ${state.cue+2}.`);return issues}
  function validateDraft(){const issues=validate(draft()),el=$('[data-validation]');el.classList.toggle('is-error',issues.length>0);el.textContent=issues.length?issues.join(' '):'Timing is ordered and valid. Changes are not applied until you press Apply correction.';return !issues.length}
  function updateUndo(){$('[data-undo]').disabled=!state.history.length}
  function remember(){state.history.push(structuredClone(state.cues));if(state.history.length>50)state.history.shift();updateUndo()}
  function persist(){const [slug]=poems[state.poem];localStorage.setItem(storageKey(slug),JSON.stringify({...state.original,cues:state.cues,status:'editorially-adjusted'}));state.dirty=true;setSaveState()}
  function apply(next=false){if(!validateDraft())return;const revised={...state.cues[state.cue],...draft(),edited:true};if(JSON.stringify(revised)!==JSON.stringify(state.cues[state.cue]))remember();state.cues[state.cue]=revised;persist();renderList();if(next)selectCue(state.cue+1);else selectCue(state.cue)}
  function insertLine(after){
    const text=prompt(`Enter the lyric line to insert ${after?'after':'before'} the selected line:`);
    if(text===null||!text.trim())return;
    remember();
    const current=state.cues[state.cue],index=state.cue+(after?1:0),neighbor=after?state.cues[state.cue+1]:state.cues[state.cue-1];
    let start,end;
    if(after){
      const gapStart=current.end,gapEnd=neighbor?neighbor.start:(state.duration||current.end+1);
      if(gapEnd-gapStart>=.02){start=gapStart;end=Math.min(gapEnd,start+Math.min(1,gapEnd-gapStart));}
      else{const oldEnd=current.end,mid=current.start+(oldEnd-current.start)/2;current.end=mid;start=mid;end=oldEnd;}
    }else{
      const gapStart=neighbor?neighbor.end:0,gapEnd=current.start;
      if(gapEnd-gapStart>=.02){end=gapEnd;start=Math.max(gapStart,end-Math.min(1,gapEnd-gapStart));}
      else{const oldStart=current.start,mid=oldStart+(current.end-oldStart)/2;current.start=mid;start=oldStart;end=mid;}
    }
    state.cues.splice(index,0,{text:text.trim(),start:Number(start.toFixed(3)),end:Number(end.toFixed(3)),matchedWords:0,edited:true,inserted:true});
    persist();renderList();selectCue(index);
  }
  function deleteLine(){
    if(state.cues.length===1)return alert('A timing map must contain at least one lyric line.');
    const cue=state.cues[state.cue];
    if(!confirm(`Delete this lyric line?\n\n${cue.text}`))return;
    remember();state.cues.splice(state.cue,1);state.cue=Math.min(state.cue,state.cues.length-1);persist();renderList();selectCue(state.cue);
  }
  function undo(){if(!state.history.length)return;state.cues=state.history.pop();state.cue=Math.min(state.cue,state.cues.length-1);persist();updateUndo();renderList();selectCue(state.cue)}
  function updateBlockControls(){
    const start=state.blockStart,end=state.blockEnd,ready=start!==null&&end!==null;
    $('[data-block-status]').textContent=ready?`Selected lines ${Math.min(start,end)+1}–${Math.max(start,end)+1}.`:start!==null?`First line: ${start+1}. Now select the last line.`:end!==null?`Last line: ${end+1}. Now select the first line.`:'No block selected.';
    $('[data-duplicate-block]').disabled=!ready;$('[data-clear-block]').disabled=start===null&&end===null;
  }
  function markBlock(which){state[which]=state.cue;updateBlockControls();renderList()}
  function clearBlock(){state.blockStart=null;state.blockEnd=null;updateBlockControls();renderList()}
  function duplicateBlock(){
    if(state.blockStart===null||state.blockEnd===null)return;
    const first=Math.min(state.blockStart,state.blockEnd),last=Math.max(state.blockStart,state.blockEnd),count=Math.max(1,Math.min(20,Math.floor(Number($('[data-repeat-count]').value)||1)));
    const source=state.cues.slice(first,last+1),sourceStart=source[0].start,sourceEnd=source[source.length-1].end,span=sourceEnd-sourceStart,after=state.cues[last+1];
    const limit=after?after.start:(state.duration||0),available=limit-sourceEnd;
    if(span<=0)return alert('The selected block has invalid timing. Correct it before duplication.');
    if(available<=.01)return alert('There is no available time after this block. Move the following line later or reduce the selected block first.');
    const scale=Math.min(1,available/(span*count)),used=span*scale*count,gap=Math.max(0,(available-used)/count),copies=[];
    for(let repetition=0;repetition<count;repetition++){
      const base=sourceEnd+repetition*(span*scale+gap);
      source.forEach(c=>copies.push({...structuredClone(c),start:Number((base+(c.start-sourceStart)*scale).toFixed(3)),end:Number((base+(c.end-sourceStart)*scale).toFixed(3)),matchedWords:0,edited:true,duplicated:true}));
    }
    remember();state.cues.splice(last+1,0,...copies);persist();state.cue=last+1;clearBlock();renderList();selectCue(state.cue);
  }
  function sync(){const current=audio.currentTime,duration=audio.duration||state.duration||0;state.duration=duration;$('[data-elapsed]').value=fmt(current,true);$('[data-remaining]').value=fmt(duration-current,true);$('[data-seek]').value=duration?String(Math.round(current/duration*1000)):'0';const cue=state.cues.findIndex(c=>current>=c.start&&current<c.end);$('[data-preview-line]').textContent=audio.paused&&current===0?'Press play to begin.':cue>=0?state.cues[cue].text:'';if(cue>=0&&cue!==state.cue){state.cue=cue;renderList();drawWave()}if(state.loop&&current>=state.cues[state.cue].end)audio.currentTime=Math.max(0,state.cues[state.cue].start-.2);drawWave()}
  async function decodeWave(){state.peaks=[];drawWave();try{const [slug]=poems[state.poem],buffer=await fetch(audioUrl(slug)).then(r=>r.arrayBuffer()),ac=new AudioContext(),decoded=await ac.decodeAudioData(buffer),data=decoded.getChannelData(0),bins=900,step=Math.max(1,Math.floor(data.length/bins));for(let i=0;i<bins;i++){let peak=0;for(let j=0;j<step;j+=8)peak=Math.max(peak,Math.abs(data[i*step+j]||0));state.peaks.push(peak)}ac.close();drawWave()}catch(e){console.warn('Waveform unavailable',e)}}
  function drawWave(){const rect=canvas.getBoundingClientRect(),dpr=devicePixelRatio||1;canvas.width=Math.max(1,rect.width*dpr);canvas.height=Math.max(1,rect.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);const w=rect.width,h=rect.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='rgba(215,184,120,.42)';const peaks=state.peaks.length?state.peaks:Array(300).fill(.08);peaks.forEach((p,i)=>{const x=i/peaks.length*w,bh=Math.max(1,p*h*.82);ctx.fillRect(x,(h-bh)/2,Math.max(1,w/peaks.length),bh)});if(state.duration){const c=state.cues[state.cue];ctx.fillStyle='rgba(121,201,210,.2)';ctx.fillRect(c.start/state.duration*w,0,Math.max(2,(c.end-c.start)/state.duration*w),h);ctx.fillStyle='#f4ede0';ctx.fillRect(audio.currentTime/state.duration*w,0,2,h)}}
  function nudge(which,delta){const input=$(which==='start'?'[data-start]':'[data-end]');input.value=(Number(input.value)+delta).toFixed(3);validateDraft()}
  function clearSegmentStop(){if(segmentStop){audio.removeEventListener('timeupdate',segmentStop);segmentStop=null}}
  function playSegment(start,end){clearSegmentStop();audio.currentTime=Math.max(0,start);segmentStop=()=>{if(audio.currentTime>=end){audio.pause();clearSegmentStop()}};audio.addEventListener('timeupdate',segmentStop);audio.play()}
  $('[data-play]').onclick=()=>{clearSegmentStop();if(audio.paused)audio.play();else audio.pause()};$('[data-back]').onclick=()=>audio.currentTime=Math.max(0,audio.currentTime-.25);$('[data-forward]').onclick=()=>audio.currentTime=Math.min(audio.duration||0,audio.currentTime+.25);$('[data-seek]').oninput=e=>{clearSegmentStop();if(audio.duration)audio.currentTime=Number(e.target.value)/1000*audio.duration};
  $('[data-loop]').onclick=e=>{state.loop=!state.loop;e.currentTarget.textContent=`Loop cue: ${state.loop?'on':'off'}`};$('[data-mark-start]').onclick=()=>{$('[data-start]').value=audio.currentTime.toFixed(3);validateDraft()};$('[data-mark-end]').onclick=()=>{$('[data-end]').value=audio.currentTime.toFixed(3);validateDraft()};$('[data-save-cue]').onclick=()=>apply(false);$('[data-next-cue]').onclick=()=>apply(true);$('[data-preview-cue]').onclick=()=>{const c=draft();playSegment(c.start,c.end)};$('[data-replay]').onclick=()=>{const c=draft();playSegment(Math.max(0,c.start-2),Math.min(audio.duration,c.start+3))};
  $('[data-nudge-start]').onclick=e=>{if(e.target.value)nudge('start',Number(e.target.value))};$('[data-nudge-end]').onclick=e=>{if(e.target.value)nudge('end',Number(e.target.value))};$('[data-text]').oninput=validateDraft;$('[data-start]').oninput=validateDraft;$('[data-end]').oninput=validateDraft;select.onchange=e=>loadPoem(Number(e.target.value));$('[data-prev-poem]').onclick=()=>loadPoem(state.poem-1);$('[data-next-poem]').onclick=()=>loadPoem(state.poem+1);
  $('[data-insert-before]').onclick=()=>insertLine(false);$('[data-insert-after]').onclick=()=>insertLine(true);$('[data-delete]').onclick=deleteLine;$('[data-undo]').onclick=undo;
  $('[data-block-start]').onclick=()=>markBlock('blockStart');$('[data-block-end]').onclick=()=>markBlock('blockEnd');$('[data-clear-block]').onclick=clearBlock;$('[data-duplicate-block]').onclick=duplicateBlock;
  $('[data-reset]').onclick=()=>{const [slug]=poems[state.poem];if(confirm(`Discard saved corrections for ${poems[state.poem][1]}?`)){localStorage.removeItem(storageKey(slug));loadPoem(state.poem)}};
  $('[data-export]').onclick=()=>{const [slug]=poems[state.poem],payload={...state.original,cues:state.cues,status:'editorially-adjusted',editedAt:new Date().toISOString()};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json'}));a.download=`${slug}.corrected.json`;a.click();URL.revokeObjectURL(a.href)};
  $('[data-import]').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const payload=JSON.parse(await file.text());if(payload.slug!==poems[state.poem][0]||!Array.isArray(payload.cues))throw new Error('This file does not match the selected poem.');remember();state.cues=payload.cues;persist();selectCue(0)}catch(err){alert(err.message)}e.target.value=''};
  audio.addEventListener('loadedmetadata',sync);audio.addEventListener('timeupdate',sync);audio.addEventListener('play',()=>{$('[data-play]').innerHTML='Ⅱ <span>Pause</span>'});audio.addEventListener('pause',()=>{$('[data-play]').innerHTML='▶ <span>Play full recording</span>';sync()});canvas.onclick=e=>{clearSegmentStop();if(audio.duration)audio.currentTime=e.offsetX/canvas.clientWidth*audio.duration};addEventListener('resize',drawWave);
  addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undo()}else if(e.code==='Space'){e.preventDefault();$('[data-play]').click()}else if(e.key==='[')$('[data-mark-start]').click();else if(e.key===']')$('[data-mark-end]').click();else if(e.key.toLowerCase()==='j')$('[data-back]').click();else if(e.key.toLowerCase()==='l')$('[data-forward]').click();else if(e.key.toLowerCase()==='n')$('[data-next-cue]').click();else if(e.key.toLowerCase()==='r')$('[data-replay]').click()});
  loadPoem(0).catch(err=>{$('[data-save-state]').textContent=`Could not load collection: ${err.message}`});
})();
