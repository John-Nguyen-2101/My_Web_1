(function () {

    const NOTES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  
    const listenBtn = document.getElementById("listenBtn");
    const showBtn = document.getElementById("showBtn");
    const hideBtn = document.getElementById("hideBtn");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const resetBtn = document.getElementById("resetBtn");
    const noteDisplay = document.getElementById("noteDisplay");
    const guessArea = document.getElementById("guessArea");
    const scoreHint = document.getElementById("scoreHint");
  
    let audioCtx = null;
  
    let currentNote = null;
    let history = [];
    let historyIndex = -1;
  
    let correct = 0;
    let total = 0;
  
    function ensureAudio(){
      if(!audioCtx){
        const Ctx = window.AudioContext || window.webkitAudioContext;
        audioCtx = new Ctx();
      }
      return audioCtx;
    }
  
    function noteToFreq(note){
      const index = NOTES.indexOf(note);
      const midi = 60 + index; // C4 = midi 60
      return 440 * Math.pow(2, (midi - 69)/12);
    }
    function resetTrainer(){
        correct = 0;
        total = 0;
        history = [];
        historyIndex = -1;
        updateScore();
        setNewNote();
      }
    function playNote(note){
      const ctx = ensureAudio();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
  
      osc.type = "sine";
      osc.frequency.value = noteToFreq(note);
  
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.3, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1);
  
      osc.connect(gain);
      gain.connect(ctx.destination);
  
      osc.start(now);
      osc.stop(now + 1);
    }
  
    function randomNote(){
      let next;
      do{
        next = NOTES[Math.floor(Math.random()*NOTES.length)];
      }while(next === currentNote);
      return next;
    }
  
    function setNewNote(){
      const note = randomNote();
      currentNote = note;
      history.push(note);
      historyIndex++;
      noteDisplay.textContent = "???";
    }
  
    function renderGuessButtons(){
      guessArea.innerHTML = "";
      NOTES.forEach(n=>{
        const btn = document.createElement("button");
        btn.className = "chipBeat";
        btn.textContent = n;
        btn.onclick = ()=>{
          total++;
          if(n === currentNote){
            correct++;
          }
          updateScore();
        };
        guessArea.appendChild(btn);
      });
    }
  
    function updateScore(){
      scoreHint.textContent = `Score: ${correct} / ${total}`;
    }
  
    listenBtn.onclick = ()=> playNote(currentNote);
  
    showBtn.onclick = ()=>{
      noteDisplay.textContent = currentNote;
    };
  
    hideBtn.onclick = ()=>{
      noteDisplay.textContent = "???";
    };
  
    nextBtn.onclick = ()=>{
      setNewNote();
    };
    resetBtn.onclick = resetTrainer;
    prevBtn.onclick = ()=>{
      if(historyIndex > 0){
        historyIndex--;
        currentNote = history[historyIndex];
        noteDisplay.textContent = "???";
      }
    };
  
    renderGuessButtons();
    setNewNote();
  })();