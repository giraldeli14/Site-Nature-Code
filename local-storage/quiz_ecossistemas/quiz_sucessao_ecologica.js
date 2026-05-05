const quizData = [
  {
    title: "Sucessão Ecológica",
    type: "multiple",
    question: "Qual alternativa melhor representa um exemplo de sucessão ecológica secundária?",
    explanation: "A sucessão secundária ocorre me locais que já abrigaram vida, mas foram perturbados. A floresta após um incêndio é um exemplo claro, pois o solo continua presente e há possibilidade de regeneração a partir do que restou.",
    options: [
      { text: "Recuperação de uma floresta após um incêndio que destruiu a vegetação.", correct: true },
      { text: "Formação de vegetação em rochas expostas por recuo de geleiras.", correct: false },
      { text: "Colonização de lava solidificada após uma erupção vulcânica.", correct: false },
      { text: "Crescimento de líquens sobre rochas em uma ilha recém-formada no oceano.", correct: false }
    ]
  }
];

let currentQuestion = 0;
let userAnswers = {};
let quizSubmitted = false;

// Funções de localStorage
function loadProgress() {
  try {
    const saved = localStorage.getItem('quizProgress');
    return saved ? JSON.parse(saved) : { topics: {} };
  } catch (e) {
    console.error('Erro ao carregar progresso:', e);
    return { topics: {} };
  }
}

function saveProgress(topicId, answers, submitted = false) {
  try {
    const progress = loadProgress();
    progress.topics[topicId] = {
      topicName: quizData[0].title,
      totalQuestions: quizData.length,
      answers: answers,
      submitted: submitted,
      completedAt: submitted ? new Date().toISOString() : null,
      progress: (Object.keys(answers).length / quizData.length) * 100
    };
    localStorage.setItem('quizProgress', JSON.stringify(progress));
    console.log('Progresso salvo no localStorage:', progress);
  } catch (e) {
    console.error('Erro ao salvar progresso:', e);
  }
}

function loadSavedAnswers() {
  try {
    const topicId = getTopicId();
    const progress = loadProgress();
    const savedTopic = progress.topics[topicId];
    
    if (savedTopic) {
      userAnswers = savedTopic.answers || {};
      quizSubmitted = savedTopic.submitted || false;
      console.log('Progresso carregado:', savedTopic);
      
      if (quizSubmitted) {
        console.log('Quiz já foi completado anteriormente');
      }
    }
  } catch (e) {
    console.error('Erro ao carregar respostas salvas:', e);
  }
}

function getTopicId() {
  return quizData[0].title.toLowerCase().replace(/\s+/g, '_');
}

const questionTypeEl = document.getElementById('questionTypeText');
const questionTitleEl = document.getElementById('questionTitle');
const explanationEl = document.getElementById('explanation');
const explanationTextEl = document.getElementById('explanationText');
const optionsContainerEl = document.getElementById('optionsContainer');
const trueFalseContainerEl = document.getElementById('trueFalseContainer');
const progressInfoEl = document.getElementById('progressInfo');
const progressFillEl = document.getElementById('progressFill');
const nextBtnEl = document.getElementById('nextBtn');
const prevBtnEl = document.getElementById('prevBtn');
const nextNavBtnEl = document.getElementById('nextNavBtn');
const quizTitleEl = document.getElementById('quizTitle');
const scoreEl = document.getElementById('score');

function renderQuestion() {
  const question = quizData[currentQuestion];

  quizTitleEl.textContent = question.title;
  scoreEl.textContent = `${currentQuestion + 1}/${quizData.length}`;

  const progress = ((currentQuestion + 1) / quizData.length) * 100;
  progressInfoEl.textContent = `Questão ${currentQuestion + 1} de ${quizData.length}`;
  progressFillEl.style.width = progress + '%';

  questionTitleEl.textContent = question.question;
  explanationTextEl.textContent = question.explanation;

  // Sempre ocultar explicação até enviar o quiz
  explanationEl.classList.remove('show');

  prevBtnEl.disabled = currentQuestion === 0;
  nextNavBtnEl.disabled = currentQuestion === quizData.length - 1;

  // Configurar botão baseado no estado
  if (quizSubmitted) {
    // Quiz já foi enviado - mostrar explicação
    explanationEl.classList.add('show');
    nextBtnEl.textContent = 'Próximo';
    nextBtnEl.disabled = currentQuestion === quizData.length - 1;
  } else if (currentQuestion === quizData.length - 1) {
    // Última questão - mostrar botão enviar
    nextBtnEl.textContent = 'Enviar Respostas';
    nextBtnEl.disabled = Object.keys(userAnswers).length < quizData.length;
  } else {
    // Questões intermediárias
    nextBtnEl.textContent = 'Próximo';
    nextBtnEl.disabled = false;
  }

  if (question.type === 'multiple') {
    questionTypeEl.textContent = 'Escolha múltipla';
    renderMultipleChoice(question);
    trueFalseContainerEl.style.display = 'none';
    optionsContainerEl.style.display = 'flex';
  } else if (question.type === 'trueFalse') {
    questionTypeEl.textContent = 'Verdadeiro ou Falso';
    renderTrueFalse(question);
    optionsContainerEl.style.display = 'none';
    trueFalseContainerEl.style.display = 'flex';
  }
}

function renderMultipleChoice(question) {
  optionsContainerEl.innerHTML = '';
  const savedAnswer = userAnswers[currentQuestion];

  question.options.forEach((option, index) => {
    const optionEl = document.createElement('div');
    optionEl.className = 'option';

    // Se quiz foi enviado, mostrar correção
    if (quizSubmitted) {
      if (option.correct) {
        optionEl.classList.add('correct');
      } else if (savedAnswer === index) {
        optionEl.classList.add('incorrect');
      }
    } else {
      // Se não foi enviado, apenas mostrar seleção (sem indicar certo/errado)
      if (savedAnswer === index) {
        optionEl.classList.add('selected');
      }
    }

    optionEl.innerHTML = `
      <div class="option-letter">${String.fromCharCode(65 + index)}</div>
      <div class="option-text">${option.text}</div>
      <span class="check-icon">✓</span>
    `;

    // Permitir cliques apenas se não foi submetido
    if (!quizSubmitted) {
      optionEl.addEventListener('click', () => {
        // Remove seleção de todas as opções
        document.querySelectorAll('#optionsContainer .option').forEach(opt => {
          opt.classList.remove('selected');
        });

        // Adiciona seleção na opção clicada
        optionEl.classList.add('selected');
        
        // Salva a resposta
        userAnswers[currentQuestion] = index;
        saveProgress(getTopicId(), userAnswers, false);

        // Atualiza botão se estiver na última questão
        if (currentQuestion === quizData.length - 1) {
          nextBtnEl.disabled = Object.keys(userAnswers).length < quizData.length;
        }
      });
    }

    optionsContainerEl.appendChild(optionEl);
  });
}

function renderTrueFalse(question) {
  trueFalseContainerEl.innerHTML = '';
  const savedAnswer = userAnswers[currentQuestion];

  const trueBtn = document.createElement('button');
  trueBtn.className = 'true-false-btn';
  trueBtn.innerHTML = `
    <span class="true-false-btn-icon">✓</span>
    <span>Verdadeiro</span>
  `;

  const falseBtn = document.createElement('button');
  falseBtn.className = 'true-false-btn';
  falseBtn.innerHTML = `
    <span class="true-false-btn-icon">✕</span>
    <span>Falso</span>
  `;

  // Se quiz foi enviado, mostrar correção
  if (quizSubmitted) {
    if (question.correct === true) {
      trueBtn.classList.add('correct-true');
      if (savedAnswer === false) {
        falseBtn.classList.add('selected-false');
      }
    } else {
      falseBtn.classList.add('correct-false');
      if (savedAnswer === true) {
        trueBtn.classList.add('selected-true');
      }
    }
  } else {
    // Mostrar apenas seleção, sem indicar certo/errado
    if (savedAnswer === true) {
      trueBtn.classList.add('selected-true');
    } else if (savedAnswer === false) {
      falseBtn.classList.add('selected-false');
    }

    // Permitir cliques apenas se não foi submetido
    trueBtn.addEventListener('click', () => {
      // Remove seleção do botão falso
      falseBtn.classList.remove('selected-false');
      // Adiciona seleção no botão verdadeiro
      trueBtn.classList.add('selected-true');
      
      userAnswers[currentQuestion] = true;
      saveProgress(getTopicId(), userAnswers, false);

      if (currentQuestion === quizData.length - 1) {
        nextBtnEl.disabled = Object.keys(userAnswers).length < quizData.length;
      }
    });

    falseBtn.addEventListener('click', () => {
      // Remove seleção do botão verdadeiro
      trueBtn.classList.remove('selected-true');
      // Adiciona seleção no botão falso
      falseBtn.classList.add('selected-false');
      
      userAnswers[currentQuestion] = false;
      saveProgress(getTopicId(), userAnswers, false);

      if (currentQuestion === quizData.length - 1) {
        nextBtnEl.disabled = Object.keys(userAnswers).length < quizData.length;
      }
    });
  }

  trueFalseContainerEl.appendChild(trueBtn);
  trueFalseContainerEl.appendChild(falseBtn);
}

function submitQuiz() {
  quizSubmitted = true;
  saveProgress(getTopicId(), userAnswers, true);

  // Calcular pontuação
  let correct = 0;
  quizData.forEach((question, index) => {
    const userAnswer = userAnswers[index];
    if (question.type === 'multiple') {
      if (question.options[userAnswer]?.correct) {
        correct++;
      }
    } else if (question.type === 'trueFalse') {
      if (userAnswer === question.correct) {
        correct++;
      }
    }
  });

  alert(`Quiz finalizado!\n\nVocê acertou ${correct} de ${quizData.length} questões.\n\nAgora você pode revisar suas respostas.`);
  
  // Voltar para a primeira questão para revisar
  currentQuestion = 0;
  renderQuestion();
}

nextBtnEl.addEventListener('click', () => {
  if (currentQuestion === quizData.length - 1 && !quizSubmitted) {
    // Enviar respostas
    submitQuiz();
  } else if (currentQuestion < quizData.length - 1) {
    currentQuestion++;
    renderQuestion();
    window.scrollTo(0, 0);
  }
});

prevBtnEl.addEventListener('click', () => {
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuestion();
    window.scrollTo(0, 0);
  }
});

nextNavBtnEl.addEventListener('click', () => {
  if (currentQuestion < quizData.length - 1) {
    currentQuestion++;
    renderQuestion();
    window.scrollTo(0, 0);
  }
});

// document.querySelector('.close-btn').addEventListener('click', () => {
//   alert('Fechar quiz');
// });

document.querySelector('.back-btn').addEventListener('click', () => {
  alert('Voltar ao tópico');
});

// Iniciar quiz
loadSavedAnswers(); // Carregar progresso salvo
renderQuestion();