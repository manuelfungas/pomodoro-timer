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