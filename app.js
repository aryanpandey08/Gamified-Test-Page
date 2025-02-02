const API_URL = 'https://cors-anywhere.herokuapp.com/https://api.jsonserve.com/Uw5CrX';

let quizData = null;
let currentQuestion = 0;
let score = 0;

const elements = {
    quizContainer: document.getElementById('quiz-container'),
    results: document.getElementById('results'),
    scoreElement: document.getElementById('score'),
    progressBar: document.getElementById('progress-bar'),
    loading: document.getElementById('loading'),
    error: document.getElementById('error')
};

function createConfetti() {
    const colors = ['#4A90E2', '#6C5CE7', '#00B894', '#FF7675'];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
        document.body.appendChild(confetti);
    }
}

async function initializeQuiz() {
    try {
        // Try from API
        const response = await fetch(API_URL);
        quizData = await response.json();
    } catch (err) {
        // local mock data
        try {
            const mockResponse = await fetch('mock-data.json');
            quizData = await mockResponse.json();
        } catch (error) {
            elements.loading.classList.add('hidden');
            elements.error.classList.remove('hidden');
            return;
        }
    }
    
    elements.loading.classList.add('hidden');
    showQuestion();
}

function showQuestion() {
    const question = quizData.questions[currentQuestion];
    const options = question.options.map(opt => `
        <button class="option-btn" 
                data-correct="${opt.is_correct}" 
                onclick="handleAnswer(this)">
            ${opt.description}
        </button>
    `).join('');

    elements.quizContainer.innerHTML = `
        <div class="question-card">
            <div class="question-text">${currentQuestion + 1}. ${question.description}</div>
            <div class="options-container">${options}</div>
        </div>
    `;

    updateProgress();
}

function handleAnswer(selectedButton) {
    const isCorrect = selectedButton.dataset.correct === 'true';
    const options = document.querySelectorAll('.option-btn');
    
    options.forEach(btn => {
        btn.disabled = true;
        if(btn.dataset.correct === 'true') {
            btn.classList.add('correct');
        } else {
            btn.classList.add('incorrect');
        }
    });

    score += isCorrect ? 
        parseFloat(quizData.correct_answer_marks) : 
        -parseFloat(quizData.negative_marks);
    
    elements.scoreElement.textContent = Math.max(score, 0);

    setTimeout(() => {
        currentQuestion++;
        if(currentQuestion < quizData.questions_count) {
            showQuestion();
        } else {
            showResults();
        }
    }, 1500);
}

function updateProgress() {
    const progress = (currentQuestion / quizData.questions_count) * 100;
    elements.progressBar.style.width = `${progress}%`;
    elements.progressBar.parentElement.setAttribute('data-progress', `${Math.round(progress)}%`);
}

function showResults() {
    elements.quizContainer.classList.add('hidden');
    elements.results.classList.remove('hidden');
    document.getElementById('final-score').textContent = Math.max(score, 0);
    createConfetti();
    
    const emoji = score >= 40 ? '🎉' : 
                 score >= 20 ? '👍' : 
                 '💡';
    elements.results.querySelector('h2').innerHTML = `
        Quiz Complete! ${emoji}
    `;
}

// Start the quiz
initializeQuiz();