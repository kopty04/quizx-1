let startTime, timerInterval;
let currentQuestion = 0;
let score = 0;
let questions = [];

// Start timer when page loads
function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  document.getElementById('timerVal').textContent = seconds;
}

// Fetch questions from MongoDB
async function fetchQuestions() {
  try {
    const response = await fetch('http://localhost:3000/api/questions');
    questions = await response.json();
    console.log('Questions loaded:', questions);
    showQuestion();
  } catch (error) {
    console.error('Error fetching questions:', error);
    // Fallback to local questions if MongoDB fails
    questions = [
      {
        question: "What is 2 + 2?",
        answers: ["3", "4", "5"],
        correctAnswer: "4"
      },
      {
        question: "What is the capital of France?",
        answers: ["London", "Paris", "Berlin"],
        correctAnswer: "Paris"
      }
    ];
    showQuestion();
  }
}

function showQuestion() {
  if (currentQuestion >= questions.length) {
    finishQuiz();
    return;
  }

  const q = questions[currentQuestion];
  document.getElementById('question').textContent = q.question;
  
  const answersDiv = document.getElementById('answers');
  answersDiv.innerHTML = '';
  
  q.answers.forEach((answer, index) => {
    const button = document.createElement('button');
    button.textContent = answer;
    button.onclick = () => selectAnswer(answer);
    answersDiv.appendChild(button);
  });

  // Show/hide buttons based on question position
  if (currentQuestion === 0) {
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById('submitBtn').style.display = 'none';
  } else if (currentQuestion === questions.length - 1) {
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById('submitBtn').style.display = 'inline-block';
  } else {
    document.getElementById('nextBtn').style.display = 'inline-block';
    document.getElementById('submitBtn').style.display = 'none';
  }
}

function selectAnswer(selectedAnswer) {
  const q = questions[currentQuestion];
  if (selectedAnswer === q.correctAnswer) {
    score++;
  }
  
  // Show next button after answering
  document.getElementById('nextBtn').style.display = 'inline-block';
}

function nextQuestion() {
  currentQuestion++;
  showQuestion();
}

function submitQuiz() {
  clearInterval(timerInterval);
  const timeTaken = Math.floor((Date.now() - startTime) / 1000);
  
  document.getElementById('quiz').style.display = 'none';
  document.getElementById('nextBtn').style.display = 'none';
  document.getElementById('submitBtn').style.display = 'none';
  document.getElementById('result').classList.remove('hidden');
  document.getElementById('result').innerHTML = `
    <h2>Quiz Complete!</h2>
    <p>Score: ${score} out of ${questions.length}</p>
    <p>Time: ${timeTaken} seconds</p>
  `;

  // Send results to backend
  fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      score: score, 
      totalQuestions: questions.length, 
      timeTaken: timeTaken 
    })
  });
}

function finishQuiz() {
  clearInterval(timerInterval);
  const timeTaken = Math.floor((Date.now() - startTime) / 1000);
  
  document.getElementById('quiz').style.display = 'none';
  document.getElementById('nextBtn').style.display = 'none';
  document.getElementById('submitBtn').style.display = 'none';
  document.getElementById('result').classList.remove('hidden');
  document.getElementById('result').innerHTML = `
    <h2>Quiz Complete!</h2>
    <p>Score: ${score} out of ${questions.length}</p>
    <p>Time: ${timeTaken} seconds</p>
  `;
}

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('nextBtn').addEventListener('click', nextQuestion);
  document.getElementById('submitBtn').addEventListener('click', submitQuiz);
  
  // Start timer and fetch questions
  startTimer();
  fetchQuestions();
});