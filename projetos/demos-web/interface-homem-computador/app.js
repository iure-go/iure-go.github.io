// GUIA DE EDIÇÃO: Laboratório de usabilidade. profileMessages define dicas; controles alteram acessibilidade; formulário simula uma tarefa; updateScore calcula avaliação.
(() => {
  const body = document.body;
  const profile = document.getElementById('user-profile');
  const profileTip = document.getElementById('profile-tip');
  const contrastToggle = document.getElementById('contrast-toggle');
  const textToggle = document.getElementById('text-toggle');
  const form = document.getElementById('support-form');
  const formStatus = document.getElementById('form-status');
  const confirmation = document.getElementById('confirmation');
  const confirmationCopy = document.getElementById('confirmation-copy');
  const checklist = document.getElementById('heuristic-list');
  const scoreValue = document.getElementById('score-value');
  const scoreBar = document.getElementById('score-bar');
  const scoreFeedback = document.getElementById('score-feedback');
  const progress = document.querySelector('.progress-track');
  const rating = document.getElementById('experience-rating');
  const ratingStatus = document.getElementById('rating-status');

  const profileMessages = {
    default: 'Você pode usar Tab para navegar e Enter para selecionar os controles.',
    keyboard: 'Use Tab e Shift + Tab para percorrer os campos; pressione Espaço para marcar opções.',
    'low-vision': 'Ative o alto contraste ou amplie o texto. O conteúdo permanece disponível sem depender apenas de cores.',
    'first-time': 'As instruções explicam quais dados são necessários e o que acontece ao enviar a solicitação.'
  };

  profile.addEventListener('change', () => {
    profileTip.textContent = profileMessages[profile.value];
    body.classList.toggle('keyboard-profile', profile.value === 'keyboard');
    if (profile.value === 'low-vision') {
      body.classList.add('high-contrast', 'large-text');
      contrastToggle.setAttribute('aria-pressed', 'true');
      textToggle.setAttribute('aria-pressed', 'true');
    }
  });

  contrastToggle.addEventListener('click', () => {
    const active = contrastToggle.getAttribute('aria-pressed') !== 'true';
    contrastToggle.setAttribute('aria-pressed', String(active));
    body.classList.toggle('high-contrast', active);
    if (!active && profile.value === 'low-vision') {
      profile.value = 'default';
      profileTip.textContent = profileMessages.default;
    }
  });

  textToggle.addEventListener('click', () => {
    const active = textToggle.getAttribute('aria-pressed') !== 'true';
    textToggle.setAttribute('aria-pressed', String(active));
    body.classList.toggle('large-text', active);
    if (!active && profile.value === 'low-vision') {
      profile.value = 'default';
      profileTip.textContent = profileMessages.default;
    }
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    formStatus.textContent = '';
    if (!form.reportValidity()) {
      formStatus.textContent = 'Confira os campos obrigatórios indicados para continuar.';
      return;
    }
    const location = document.getElementById('location').value;
    const urgency = form.elements.urgency.value === 'high' ? 'A equipe verá que você precisa de ajuda agora.' : 'A equipe responderá assim que possível.';
    confirmationCopy.textContent = 'Seu pedido para ' + location + ' foi registrado. ' + urgency;
    form.hidden = true;
    confirmation.hidden = false;
    document.getElementById('confirmation-title').focus?.();
    confirmation.scrollIntoView({behavior: 'smooth', block: 'nearest'});
  });

  document.getElementById('new-request').addEventListener('click', () => {
    form.reset();
    form.hidden = false;
    confirmation.hidden = true;
    formStatus.textContent = '';
    document.getElementById('location').focus();
  });

  const checks = [...checklist.querySelectorAll('input[type="checkbox"]')];
  // Conta princípios marcados e sincroniza texto, barra e atributo acessível.
  const updateScore = () => {
    const count = checks.filter(input => input.checked).length;
    scoreValue.textContent = count + ' de ' + checks.length;
    scoreBar.style.width = (count / checks.length * 100) + '%';
    progress.setAttribute('aria-valuenow', String(count));
    scoreFeedback.textContent = count === 0
      ? 'Comece a explorar os princípios abaixo.'
      : count === checks.length
        ? 'Você identificou todos os princípios deste exercício.'
        : 'Você identificou ' + count + ' princípio(s). Continue observando a interface.';
  };
  checklist.addEventListener('change', updateScore);

  document.getElementById('reset-evaluation').addEventListener('click', () => {
    checks.forEach(input => { input.checked = false; });
    updateScore();
    checks[0].focus();
  });

  document.getElementById('save-rating').addEventListener('click', () => {
    if (!rating.value) {
      ratingStatus.textContent = 'Escolha uma nota antes de registrar.';
      rating.focus();
      return;
    }
    const labels = {
      1: 'Obrigado. O teste aponta que a tarefa foi muito difícil.',
      2: 'Obrigado. O teste aponta que a tarefa foi difícil.',
      3: 'Obrigado. O teste indica uma experiência intermediária.',
      4: 'Obrigado. O teste indica uma experiência fácil.',
      5: 'Obrigado. O teste indica uma experiência muito fácil.'
    };
    ratingStatus.textContent = labels[rating.value] + ' Em um projeto real, combine a nota com observações e comentários da pessoa usuária.';
  });

  updateScore();
})();