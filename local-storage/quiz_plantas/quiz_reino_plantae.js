const quizData = [
  {
    title: "Reino Plantaeeaer",
    type: "multiple",
    question: "Qual característica é comum a todas as plantas?",
    explanation: "A fotossíntese é uma característica comum a todas as plantas. Nem todas as plantas possuem flores (apenas angiospermas) ou sementes (apenas gimnospermas e angiospermas) ou vasos condutores (as briófitas não possuem).",
    options: [
      { text: "Presença de flores.", correct: false },
      { text: "Presença de sementes.", correct: false },
      { text: "Fotossíntese.", correct: true },
      { text: "Presença de vasos condutores.", correct: false }
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
      // Se não foi enviado, apenas mostrar seleção NEUTRA
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
    // Sempre mostrar a resposta CORRETA em verde
    if (question.correct === true) {
      trueBtn.classList.add('correct-true');
    } else {
      falseBtn.classList.add('correct-false');
    }
    
    // Se o usuário errou, mostrar a resposta ERRADA em vermelho
    if (savedAnswer !== question.correct) {
      if (savedAnswer === true) {
        trueBtn.classList.add('incorrect-true');
      } else if (savedAnswer === false) {
        falseBtn.classList.add('incorrect-false');
      }
    }
  } else {
    // Mostrar seleção em VERDE antes de enviar
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

// NOVO: Criar modal de resultado
function createResultModal(correctCount, totalQuestions, results) {
  const modal = document.createElement('div');
  modal.id = 'resultModal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 20px;
  `;

  const percentage = ((correctCount / totalQuestions) * 100).toFixed(0);
  const passed = percentage >= 70;

  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: #1a1a2e;
    border-radius: 20px;
    padding: 30px;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    color: white;
  `;

  let resultHtml = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="font-size: 60px; margin-bottom: 10px;">
        ${passed ? '🎉' : '📚'}
      </div>
      <h2 style="margin: 0 0 10px 0; font-size: 28px;">
        ${passed ? 'Parabéns!' : 'Continue estudando!'}
      </h2>
      <div style="font-size: 48px; font-weight: bold; color: ${passed ? '#10b981' : '#f59e0b'}; margin: 20px 0;">
        ${correctCount}/${totalQuestions}
      </div>
      <div style="font-size: 18px; color: #9ca3af;">
        ${percentage}% de acertos
      </div>
    </div>
    
    <div style="margin-top: 30px;">
      <h3 style="margin-bottom: 15px; font-size: 20px; border-bottom: 2px solid #374151; padding-bottom: 10px;">
        Suas respostas:
      </h3>
  `;

  results.forEach((result, index) => {
    const icon = result.isCorrect ? '✓' : '✗';
    const color = result.isCorrect ? '#10b981' : '#ef4444';
    const bgColor = result.isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
    
    resultHtml += `
      <div style="
        background: ${bgColor};
        border-left: 4px solid ${color};
        padding: 15px;
        margin-bottom: 15px;
        border-radius: 8px;
      ">
        <div style="display: flex; align-items: start; gap: 10px;">
          <span style="font-size: 24px; color: ${color}; flex-shrink: 0;">${icon}</span>
          <div style="flex: 1;">
            <div style="font-weight: 600; margin-bottom: 5px;">
              Questão ${index + 1}
            </div>
            <div style="color: #d1d5db; font-size: 14px; margin-bottom: 8px;">
              ${result.question}
            </div>
            <div style="font-size: 13px;">
              <span style="color: #9ca3af;">Sua resposta:</span> 
              <span style="color: ${color};">${result.userAnswer}</span>
            </div>
            ${!result.isCorrect ? `
              <div style="font-size: 13px; margin-top: 5px;">
                <span style="color: #9ca3af;">Resposta correta:</span> 
                <span style="color: #10b981;">${result.correctAnswer}</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  });

  resultHtml += `
    </div>
    
    <button id="closeResultModal" style="
      width: 100%;
      padding: 15px;
      margin-top: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
      Revisar Respostas
    </button>
  `;

  modalContent.innerHTML = resultHtml;
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Fechar modal
  document.getElementById('closeResultModal').addEventListener('click', () => {
    modal.remove();
  });

  // Fechar ao clicar fora
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

function submitQuiz() {
  quizSubmitted = true;
  saveProgress(getTopicId(), userAnswers, true);

  // Calcular pontuação e preparar resultados detalhados
  let correct = 0;
  const results = [];

  quizData.forEach((question, index) => {
    const userAnswer = userAnswers[index];
    let isCorrect = false;
    let userAnswerText = '';
    let correctAnswerText = '';

    if (question.type === 'multiple') {
      isCorrect = question.options[userAnswer]?.correct || false;
      userAnswerText = question.options[userAnswer]?.text || 'Não respondida';
      correctAnswerText = question.options.find(opt => opt.correct)?.text || '';
    } else if (question.type === 'trueFalse') {
      isCorrect = userAnswer === question.correct;
      userAnswerText = userAnswer === true ? 'Verdadeiro' : userAnswer === false ? 'Falso' : 'Não respondida';
      correctAnswerText = question.correct ? 'Verdadeiro' : 'Falso';
    }

    if (isCorrect) correct++;

    results.push({
      question: question.question,
      userAnswer: userAnswerText,
      correctAnswer: correctAnswerText,
      isCorrect: isCorrect
    });
  });

  // Mostrar modal de resultado
  createResultModal(correct, quizData.length, results);
  
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

// document.querySelector('.close-btn')?.addEventListener('click', () => {
//   alert('Fechar quiz');
// });

document.querySelector('.back-btn')?.addEventListener('click', () => {
  alert('Voltar ao tópico');
});

// Iniciar quiz
loadSavedAnswers();
renderQuestion();