const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

function addMessage(content, sender, isHTML = false) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender);
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const safe = isHTML ? content : content.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
  msgDiv.innerHTML = `${safe}<div class="timestamp">${time}</div>`;
  chatContainer.appendChild(msgDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  if (window.MathJax) MathJax.typeset();
  setTimeout(() => hljs.highlightAll(), 0);
  return msgDiv;
}

function insertCodeCopyButtons(text) {
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  return text.replace(regex, (_, lang, code) => {
    const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const encoded = encodeURIComponent(code.trim());
    return `
      <pre><code class="language-${lang}">${escaped}</code>
        <button class="copy-btn" onclick="copyCode(this, decodeURIComponent('${encoded}'))">Copy</button>
      </pre>
    `;
  });
}

function copyCode(btn, code) {
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 2000);
  });
}

async function getAIResponse(prompt) {
  try {
    const res = await fetch('https://ai.api-url-production.workers.dev/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen',
        prompt,
        format: 'json',
        max_tokens: 8000,
        temperature: 0.7
      }),
    });
    const text = await res.text();
    const data = JSON.parse(text);
    return data.success && data.response ? data.response.trim() : "Sorry, I couldn't process that.";
  } catch (e) {
    return `Error: ${e.message}`;
  }
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, 'user');
  userInput.value = '';
  userInput.style.height = "auto";
  userInput.disabled = true;
  sendBtn.disabled = true;

  const loading = addMessage('Typing...', 'ai');
  const response = await getAIResponse(message);
  const formatted = insertCodeCopyButtons(response).replace(/\n/g, "<br>");
  loading.innerHTML = `${formatted}<div class="timestamp">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>`;

  userInput.disabled = false;
  sendBtn.disabled = false;
  userInput.focus();

  if (window.MathJax) MathJax.typeset();
  hljs.highlightAll();
}

sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
  autoResize(userInput);
});

function autoResize(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
}

window.copyCode = copyCode;
