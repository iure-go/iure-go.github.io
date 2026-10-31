const titleInput = document.querySelector('#site-title');
const introInput = document.querySelector('#site-intro');
const aboutInput = document.querySelector('#about-text');
const buttonInput = document.querySelector('#button-label');
const colorInput = document.querySelector('#accent-color');
const preview = document.querySelector('#page-preview');
const codeOutput = document.querySelector('#code-output');
const status = document.querySelector('#editor-status');

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function selectedSections() {
  return new Set([...document.querySelectorAll('input[name="section"]:checked')].map(input => input.value));
}

function buildHTML() {
  const title = escapeHTML(titleInput.value.trim() || 'Título do projeto');
  const intro = escapeHTML(introInput.value.trim());
  const about = escapeHTML(aboutInput.value.trim());
  const cta = escapeHTML(buttonInput.value.trim() || 'Saiba mais');
  const color = /^#[0-9a-f]{6}$/i.test(colorInput.value) ? colorInput.value : '#51d5a2';
  const sections = selectedSections();
  const aboutSection = sections.has('about') ? `
    <section class="about" id="sobre"><p class="eyebrow">SOBRE</p><h2>Uma ideia com propósito</h2><p>${about}</p></section>` : '';
  const featuresSection = sections.has('features') ? `
    <section class="features"><p class="eyebrow">DESTAQUES</p><h2>O que torna esta página especial</h2><div class="cards"><article><strong>Conteúdo claro</strong><p>Informação organizada para facilitar a leitura.</p></article><article><strong>Design responsivo</strong><p>Uma experiência adaptada a diferentes telas.</p></article><article><strong>Atenção aos detalhes</strong><p>Estrutura simples, acessível e consistente.</p></article></div></section>` : '';
  const contactSection = sections.has('contact') ? `
    <section class="contact" id="contato"><p class="eyebrow">CONTATO</p><h2>Vamos conversar?</h2><p>Adicione aqui as informações de contato do seu projeto.</p><a class="button" href="mailto:contato@exemplo.com">Enviar mensagem</a></section>` : '';
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    :root{font-family:Arial,Helvetica,sans-serif;color:#18251f;background:#f7faf8;--accent:${color};--dark:#17352a;--muted:#66756c;--line:#e0e9e3}
    *{box-sizing:border-box}body{margin:0;line-height:1.6}a{color:inherit;text-decoration:none}.site-header{padding:18px max(6vw,22px);border-bottom:1px solid var(--line);font-weight:800}.site-header span{color:var(--accent)}main{width:min(1000px,calc(100% - 40px));margin:auto}.hero{padding:clamp(52px,10vw,110px) 0;max-width:760px}.eyebrow{color:#39795d;font-size:11px;font-weight:700;letter-spacing:1.2px}.hero h1{margin:8px 0;font-size:clamp(38px,7vw,72px);line-height:1.05;letter-spacing:-2px}.hero p:not(.eyebrow){color:var(--muted);font-size:18px;max-width:640px}.button{display:inline-block;margin-top:14px;padding:11px 16px;border-radius:7px;background:var(--dark);color:white;font-weight:700}.about,.features{padding:48px 0;border-top:1px solid var(--line)}h2{font-size:clamp(24px,4vw,36px);line-height:1.2}.about>p:last-child{max-width:700px;color:var(--muted)}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.cards article{padding:18px;border:1px solid var(--line);border-radius:9px;background:white}.cards p{color:var(--muted);font-size:14px}.contact{margin:30px 0;padding:36px;border-radius:12px;background:var(--dark);color:white}.contact .eyebrow{color:var(--accent)}.contact p:not(.eyebrow){color:#c4d4ca}.contact .button{background:var(--accent);color:#10241a}@media(max-width:620px){.cards{grid-template-columns:1fr}.contact{padding:25px}}
  </style>
</head>
<body>
  <header class="site-header">Meu<span>Projeto</span></header>
  <main>
    <section class="hero"><p class="eyebrow">PÁGINA INICIAL</p><h1>${title}</h1><p>${intro}</p><a class="button" href="#sobre">${cta}</a></section>${aboutSection}${featuresSection}${contactSection}
  </main>
</body>
</html>`;
}

function updatePreview(announce = false) {
  const html = buildHTML();
  preview.srcdoc = html;
  codeOutput.value = html;
  if (announce) status.textContent = 'Prévia e código HTML atualizados.';
}

document.querySelector('#page-form').addEventListener('input', () => updatePreview(true));
document.querySelector('#page-form').addEventListener('change', () => updatePreview(true));

document.querySelectorAll('[data-viewport]').forEach(button => {
  button.addEventListener('click', () => {
    const mobile = button.dataset.viewport === 'mobile';
    document.querySelector('#preview-frame').classList.toggle('mobile', mobile);
    document.querySelectorAll('[data-viewport]').forEach(option => {
      const active = option === button;
      option.classList.toggle('active', active);
      option.setAttribute('aria-pressed', String(active));
    });
  });
});

document.querySelector('#copy-code').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(codeOutput.value);
    status.textContent = 'Código HTML copiado.';
  } catch {
    codeOutput.focus();
    codeOutput.select();
    const copied = document.execCommand('copy');
    status.textContent = copied ? 'Código HTML copiado.' : 'Selecione o código para copiar manualmente.';
  }
});

updatePreview();
