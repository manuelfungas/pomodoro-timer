
// Timer state
let timer = {
    minutes: 25,
    seconds: 0,
    isRunning: false,
    isPaused: false,
    mode: 'pomodoro',
    interval: null,
    sessionsCompleted: 0
};

let settings = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    autoStartBreaks: false,
    soundEnabled: true
};

// Cache DOM
const timerDisplay = document.getElementById('timerDisplay');
const timerLabel = document.getElementById('timerLabel');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const progressCircle = document.getElementById('progressCircle');
const timerRing = document.getElementById('timerRing');
const sessionsCount = document.getElementById('sessionsCount');
const tabBtns = document.querySelectorAll('.tab-btn');

// SVG Progress Ring Setup
const radius = 140;
const circumference = radius * 2 * Math.PI;

progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
progressCircle.style.strokeDashoffset = circumference;

function updateProgress() {
    const totalSeconds = settings[timer.mode] * 60;
    const currentSeconds = timer.minutes * 60 + timer.seconds;
    const progress = 1 - (currentSeconds / totalSeconds);

    const offset = circumference - (progress * circumference);
    progressCircle.style.strokeDashoffset = offset;
}

function updateDisplay() {
    const minutes = timer.minutes.toString().padStart(2, '0');
    const seconds = timer.seconds.toString().padStart(2, '0');

    timerDisplay.textContent = `${minutes}:${seconds}`;
    document.title = `${minutes}:${seconds} - Pomodoro`;
}

function startTimer() {
    if (timer.isRunning) return;
    
    timer.isRunning = true;
    timer.isPaused = false;

    startBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    timerRing.classList.add('active');

    timer.interval = setInterval(() => {
        if (timer.seconds === 0) {
            if (timer.minutes === 0) {
                completeSession();
                return;
            }
            timer.minutes--;
            timer.seconds = 59;
        } else {
            timer.seconds--;
        }
        updateDisplay();
        updateProgress();
    }, 1000);
}

function pauseTimer() {
    if (!timer.isRunning) return;

    timer.isRunning = false;
    timer.isPaused = true;

    clearInterval(timer.interval);

    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    timerRing.classList.remove('active');
}

function resetTimer() {
    timer.isRunning = false;
    timer.isPaused = false;

    clearInterval(timer.interval);

    timer.minutes = settings[timer.mode];
    timer.seconds = 0;

    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    timerRing.classList.remove('active');

    updateDisplay();
    updateProgress();
}

function completeSession() {
    clearInterval(timer.interval);
    timer.isRunning = false;

    if (timer.mode === 'pomodoro') {
        timer.sessionsCompleted++;
        sessionsCount.textContent = timer.sessionsCompleted;

        // Auto switch to break
        if (timer.sessionsCompleted % 4 === 0) {
            switchMode('longBreak');
        } else {
            switchMode('shortBreak');
        }
    } else {
        switchMode('pomodoro');
    }

    // Play sound
    playNotificationSound();

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Pomodoro Timer', {
            body: timer.mode === 'pomodoro' ? 'Time for a break!' : 'Time to focus!',
            icon: '🍅'
        });
    }

    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    timerRing.classList.remove('active');
}

function switchMode(mode) {
    timer.mode = mode;
    timer.minutes = settings[mode];
    timer.seconds = 0;

    tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    const labels = {
        pomodoro: 'Focus Time',
        shortBreak: 'Short Break',
        longBreak: 'Long Break'
    };
    timerLabel.textContent = labels[mode];

    const colors = {
        pomodoro: '#FF6B6B',
        shortBreak: '#4ECDC4',
        longBreak: '#45B7D1'
    };
    progressCircle.style.stroke = colors[mode];

    if (timer.isRunning) {
        resetTimer();
    } else {
        updateDisplay();
        updateProgress();
    }
}

function playNotificationSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Event Listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (!timer.isRunning) {
            switchMode(btn.dataset.mode);
        }
    });
});

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Initialize
updateDisplay();
updateProgress();