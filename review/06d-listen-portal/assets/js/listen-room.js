(() => {
  'use strict';
  const allAudio = new Set();
  const stopOthers = current => allAudio.forEach(a => { if (a !== current) a.pause(); });
  const format = seconds => {
    if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
    const mins = Math.floor(seconds / 60);
    return `${mins}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  };

  document.querySelectorAll('[data-aperture]').forEach(aperture => {
    const audio = aperture.querySelector('[data-aperture-audio]');
    const play = aperture.querySelector('[data-aperture-play]');
    const title = aperture.querySelector('[data-aperture-title]');
    const progress = aperture.querySelector('.aperture-progress');
    const tracks = JSON.parse(aperture.dataset.tracks || '[]');
    let index = 0;
    allAudio.add(audio);
    const load = () => { audio.src = tracks[index].src; title.textContent = tracks[index].title; progress.style.strokeDashoffset = 100; };
    const choose = delta => { const wasPlaying = !audio.paused; index = (index + delta + tracks.length) % tracks.length; load(); if (wasPlaying) audio.play(); };
    load();
    play.addEventListener('click', () => audio.paused ? audio.play() : audio.pause());
    aperture.querySelector('[data-aperture-prev]').addEventListener('click', () => choose(-1));
    aperture.querySelector('[data-aperture-next]').addEventListener('click', () => choose(1));
    audio.addEventListener('play', () => { stopOthers(audio); aperture.classList.add('is-playing'); play.setAttribute('aria-label','Pause featured song'); });
    audio.addEventListener('pause', () => { aperture.classList.remove('is-playing'); play.setAttribute('aria-label','Play featured song'); });
    audio.addEventListener('timeupdate', () => { const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0; progress.style.strokeDashoffset = String(100 - pct); });
    audio.addEventListener('ended', () => choose(1));
  });

  document.querySelectorAll('[data-audio-room]').forEach(async room => {
    const audio = room.querySelector('audio');
    const play = room.querySelector('[data-audio-play]');
    const seek = room.querySelector('[data-audio-seek]');
    const elapsed = room.querySelector('[data-audio-elapsed]');
    const remaining = room.querySelector('[data-audio-remaining]');
    const landscape = room.querySelector('.progress-landscape');
    const status = room.querySelector('[data-audio-status]');
    const activeLine = room.querySelector('[data-active-line]');
    const cueData = room.querySelector('[data-poem-cues]');
    let cues = cueData ? JSON.parse(cueData.textContent || '[]') : [];
    let cuesUseSeconds = false;
    const lines = [...document.querySelectorAll('[data-poem-lines] [data-line]')];
    let active = -1;
    allAudio.add(audio);
    const sync = () => {
      const duration = audio.duration || 0, ratio = duration ? audio.currentTime / duration : 0;
      seek.value = String(Math.round(ratio * 1000));
      landscape.style.setProperty('--progress', `${ratio * 100}%`);
      elapsed.value = format(audio.currentTime);
      remaining.value = format(Math.max(0, duration - audio.currentTime));
      if (activeLine && cues.length) {
        const position = cuesUseSeconds ? audio.currentTime : ratio;
        const cue = cues.find(entry => position >= entry.start && position < entry.end);
        const atRest = audio.paused && audio.currentTime === 0;
        const text = atRest ? 'Press play to begin.' : (cue ? cue.text : '');
        if (activeLine.textContent !== text) {
          activeLine.classList.remove('is-visible');
          activeLine.textContent = text;
          requestAnimationFrame(() => activeLine.classList.add('is-visible'));
        }
      }
      if (lines.length) {
        const weights = lines.map(line => Math.max(2, line.textContent.trim().split(/\s+/).length));
        const total = weights.reduce((a,b) => a+b, 0); let sum = 0, next = 0;
        for (let i=0;i<weights.length;i++) { sum += weights[i]; if (ratio <= sum/total) { next=i; break; } }
        if (next !== active) { lines[active]?.classList.remove('is-current'); active=next; lines[active]?.classList.add('is-current'); lines[active]?.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}); }
      }
    };
    play.addEventListener('click', () => audio.paused ? audio.play() : audio.pause());
    room.querySelector('[data-audio-start]').addEventListener('click', () => audio.currentTime=0);
    room.querySelector('[data-audio-end]').addEventListener('click', () => audio.currentTime=audio.duration||0);
    room.querySelector('[data-audio-rewind]').addEventListener('click', () => audio.currentTime=Math.max(0,audio.currentTime-10));
    room.querySelector('[data-audio-forward]').addEventListener('click', () => audio.currentTime=Math.min(audio.duration||0,audio.currentTime+10));
    seek.addEventListener('input', () => { if(audio.duration) audio.currentTime=(Number(seek.value)/1000)*audio.duration; });
    audio.addEventListener('loadedmetadata', sync); audio.addEventListener('timeupdate', sync);
    audio.addEventListener('play', () => { stopOthers(audio); room.classList.add('is-playing'); play.innerHTML='<span aria-hidden="true">Ⅱ</span><span class="sr-only">Pause</span>'; status.textContent='Playing'; });
    audio.addEventListener('pause', () => { room.classList.remove('is-playing'); play.innerHTML='<span aria-hidden="true">▶</span><span class="sr-only">Play</span>'; status.textContent=audio.ended?'Complete':'Paused'; });
    audio.addEventListener('waiting', () => status.textContent='Gathering the stream…');
    audio.addEventListener('error', () => status.textContent='This recording could not be loaded.');
    if (room.dataset.cuesSrc) {
      try {
        const response = await fetch(room.dataset.cuesSrc);
        if (!response.ok) throw new Error(`Cue request returned ${response.status}`);
        const payload = await response.json();
        cues = Array.isArray(payload) ? payload : (payload.cues || []);
        cuesUseSeconds = !Array.isArray(payload) && payload.schemaVersion >= 1;
        room.dataset.cueStatus = payload.status || 'loaded';
        sync();
      } catch (error) {
        room.dataset.cueStatus = 'unavailable';
        if (activeLine) activeLine.textContent = 'Press play to listen.';
        console.warn('Lyric timing could not be loaded.', error);
      }
    }
  });
})();
