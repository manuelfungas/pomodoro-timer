// timer state

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


//cache DOM
const timerDisplay = document.getElementById('timerDisplay');
const timerLabel = document.getElementById('timerLabel');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const progressCircle = document.querySelector('.progress-ring__circle');

// radius and circumference
/** 
 * SVG Animation Logic for progress
 */
const radius = progressCircle.releasePointerCapture.baseVal.value;
const circumference = radius * 2 * Math.PI;

// init progress ring
progressCircle.style.stokeDasharray = `${circumference} ${circumference}`;
progressCircle.style.strokeDashoffset = circumference;

function updateProgress() {
    const totalSeconds = settings[timer.mode] * 60;
    const currentSeconds = timer.minutes * 60 + timer.seconds;
    const progress = 1 - (currentSeconds / totalSeconds);

    // uodate stroke offset
    const offset = circumference - (progress * circumference);
    progressCircle.style.strokeDashoffset = offset; 
}

// Timer Core functions

function startTimer() {
    if (timer.isRunning)return;
    
    timer.isRunning = true;
    timer.isPaused = false;

    //UI update
    startBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');

    // add pulse annimation during active timer
    document.querySelector('.timer-ring').style.animation = 'pulse 2s ease-in-out infinit';
    

    //start interval
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

function updateDisplay() {
    // format with zeros
    const minutes = timer.minutes.toString().padStart(2, '0');
    const seconds = timer.seconds.toString().padStart(2, '0');

    timerDisplay.textContent = `${minutes} : ${seconds}`;
    document.title = `${minutes} : ${seconds} - Pomodoro`;
}

function switchMode(mode) {
    timer.mode = mode;
    timer.minutes = settings[mode];
    timer.seconds = 0;

    // update active tab
    tabBtn.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    //update labels
    const labels = {
        pomodoro: 'Focus Time',
        shortBreak: 'Short Break',
        longBreak: "Long Break"
    };
    timerLabel.textContent = labels[mode];

    // change colors
    const colors = {
        pomodoro: '#FF6B6B',
        shortBreak: '#4ECDC4',
        longBreak: '#45B7D1'
    };
    progressCircle.style.stroke = colors[mode]
    
    if (timer.isRunning) {
        resetTimer();
    } else {
        updateDisplay();
        updateProgress();
    }
}


function playNotification() {
    if (!settings.soundEnabled) return;
    
    // Create a simple notification sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure sound
    oscillator.frequency.value = 800; // Hz
    oscillator.type = 'sine';
    
    // Fade out effect
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    // Play sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

function showNotification() {
    // Visual browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification('Pomodoro Timer', {
            body: timer.mode === 'pomodoro' ? 'Time for a break!' : 'Ready to focus!',
            icon: '🍅',
            badge: '🍅'
        });
        
        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);
    }
    
    // Visual feedback with glow animation
    document.querySelector('.timer-ring').style.animation = 'glow 1s ease-in-out 3';
}

// Request notification permission on load
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}