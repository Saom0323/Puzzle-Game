// 10 Distinct Words with Hints for 10 Levels
const GAME_WORDS = [
  { word: "CODE", hint: "Instructions written for a computer program" },
  { word: "DATA", hint: "Information processed or stored by a computer" },
  { word: "LOOP", hint: "A sequence of instructions that repeats" },
  { word: "NODE", hint: "A basic unit of a data structure" },
  { word: "PYTHON", hint: "A popular high-level programming language" },
  { word: "CANVAS", hint: "An HTML element used to draw graphics via JS" },
  { word: "GITHUB", hint: "A platform for code hosting and version control" },
  { word: "ALGORITHM", hint: "A step-by-step procedure for solving a problem" },
  { word: "RECURSION", hint: "A programming technique where a function calls itself" },
  { word: "FULLSTACK", hint: "Development covering both front-end and back-end" }
];

class WordCraftGame {
  constructor() {
    this.currentLevel = 1; 
    this.score = 0;
    this.gems = parseInt(localStorage.getItem('wordcraft_gems')) || 0;
    this.bestLevel = parseInt(localStorage.getItem('wordcraft_best_level')) || 1;

    this.timer = null;
    this.timeLeft = 30;
    this.currentWordObj = null;

    // Web Audio API for Background Music
    this.audioCtx = null;
    this.isBgmPlaying = false;

    // DOM Elements
    this.levelDisplay = document.getElementById('levelDisplay');
    this.gemsDisplay = document.getElementById('gemsDisplay');
    this.scoreDisplay = document.getElementById('scoreDisplay');
    this.bestLevelDisplay = document.getElementById('bestLevelDisplay');
    this.difficultyBadge = document.getElementById('difficultyBadge');
    this.timerDisplay = document.getElementById('timerDisplay');
    this.scrambledWordEl = document.getElementById('scrambledWord');
    this.hintTextEl = document.getElementById('hintText');
    this.userInputEl = document.getElementById('userInput');
    this.feedbackEl = document.getElementById('feedback');
    this.submitBtn = document.getElementById('submitBtn');

    this.init();
  }

  init() {
    this.attachEventListeners();
    this.updateUI();
    this.loadLevelWord();
  }

  attachEventListeners() {
    const triggerAudio = () => {
      this.startBackgroundMusic();
      document.removeEventListener('click', triggerAudio);
      document.removeEventListener('keydown', triggerAudio);
    };

    document.addEventListener('click', triggerAudio);
    document.addEventListener('keydown', triggerAudio);

    this.submitBtn.addEventListener('click', () => this.checkAnswer());
    this.userInputEl.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') this.checkAnswer();
    });
  }

  // 👶 Cute Kid/Cartoon Voice System
  speakCute(text, isHappy) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop current speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';

      if (isHappy) {
        utterance.pitch = 2.0; // Maximum Pitch for a high-pitched cute kid voice
        utterance.rate = 1.25;  // Fast and excited
      } else {
        utterance.pitch = 0.5; // Low pitch for a pouting, sad voice
        utterance.rate = 0.8;   // Slow & disappointed
      }

      window.speechSynthesis.speak(utterance);
    }
  }

  // 🎵 Soft Background Music (Loops smoothly)
  startBackgroundMusic() {
    if (this.isBgmPlaying) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContext();
    this.isBgmPlaying = true;

    const notes = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C notes (Pleasant Melody)
    let idx = 0;

    const playStep = () => {
      if (!this.isBgmPlaying) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine'; // Soft sine wave
      osc.frequency.setValueAtTime(notes[idx], this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.02, this.audioCtx.currentTime); // Low Background Volume
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.9);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.9);

      idx = (idx + 1) % notes.length;
      setTimeout(playStep, 600);
    };

    playStep();
  }

  scrambleWord(word) {
    let arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const scrambled = arr.join('');
    return scrambled === word ? this.scrambleWord(word) : scrambled;
  }

  loadLevelWord() {
    this.resetTimer();
    this.clearFeedback();
    this.userInputEl.value = '';

    if (this.currentLevel > 10) {
      this.speakCute("That's Great!", true);
      this.showFeedback("🎉🥳 AMAZING! You cleared all levels! 🏆", "correct");
      this.scrambledWordEl.innerText = "VICTORY 🏆";
      this.hintTextEl.innerText = "You are a Word Master!";
      return;
    }

    this.currentWordObj = GAME_WORDS[this.currentLevel - 1];
    this.scrambledWordEl.innerText = this.scrambleWord(this.currentWordObj.word);
    this.hintTextEl.innerText = this.currentWordObj.hint;

    this.updateDifficultyBadge();
    this.startTimer();
  }

  updateDifficultyBadge() {
    if (this.currentLevel <= 5) {
      this.difficultyBadge.className = 'badge easy';
      this.difficultyBadge.innerText = 'STAGE 1 (+10 PTS)';
    } else {
      this.difficultyBadge.className = 'badge hard';
      this.difficultyBadge.innerText = 'STAGE 2 (+20 PTS)';
    }
  }

  checkAnswer() {
    const userGuess = this.userInputEl.value.trim().toUpperCase();

    if (!userGuess) {
      this.speakCute("Try It Again", false);
      this.showFeedback("⚠️ Please enter a word! 🥺", "wrong");
      return;
    }

    if (userGuess === this.currentWordObj.word) {
      const pointsAdded = this.currentLevel <= 5 ? 10 : 20;
      
      this.score += pointsAdded;
      this.gems += 1;

      // 🔊 Happy Cute Voice
      this.speakCute("That's Great!", true);
      this.showFeedback(`🎉 That's Great! +${pointsAdded} Points, +1 💎 🥳✨`, "correct");
      
      this.currentLevel++;

      if (this.currentLevel > this.bestLevel && this.currentLevel <= 10) {
        this.bestLevel = this.currentLevel;
        localStorage.setItem('wordcraft_best_level', this.bestLevel);
      }
      localStorage.setItem('wordcraft_gems', this.gems);

      this.updateUI();
      clearInterval(this.timer);
      setTimeout(() => this.loadLevelWord(), 1500);

    } else {
      // 🔊 Sad Voice
      this.speakCute("Try It Again", false);
      this.handlePenalty("❌ Try It Again! 🥺 Going back 1 step...");
    }
  }

  handlePenalty(reasonMessage) {
    this.triggerShakeAnimation();
    this.showFeedback(reasonMessage, "wrong");
    clearInterval(this.timer);

    if (this.currentLevel > 1) {
      this.currentLevel--;
    }

    this.updateUI();
    setTimeout(() => this.loadLevelWord(), 1800);
  }

  startTimer() {
    this.timeLeft = 30;
    this.timerDisplay.innerText = `${this.timeLeft}s`;

    this.timer = setInterval(() => {
      this.timeLeft--;
      this.timerDisplay.innerText = `${this.timeLeft}s`;

      if (this.timeLeft <= 0) {
        this.speakCute("Try It Again", false);
        this.handlePenalty(`⏰ Time's up! 🥺 Try It Again!`);
      }
    }, 1000);
  }

  resetTimer() {
    if (this.timer) clearInterval(this.timer);
  }

  updateUI() {
    this.levelDisplay.innerText = `${this.currentLevel}/10`;
    this.gemsDisplay.innerText = `💎 ${this.gems}`;
    this.scoreDisplay.innerText = this.score;
    this.bestLevelDisplay.innerText = `${this.bestLevel}/10`;
  }

  showFeedback(msg, type) {
    this.feedbackEl.innerText = msg;
    this.feedbackEl.className = `feedback ${type}`;
  }

  clearFeedback() {
    this.feedbackEl.innerText = '';
    this.feedbackEl.className = 'feedback';
  }

  triggerShakeAnimation() {
    this.userInputEl.classList.add('shake');
    setTimeout(() => this.userInputEl.classList.remove('shake'), 300);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new WordCraftGame();
});