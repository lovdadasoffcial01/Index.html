function toggleDropdown() {
  const dropdown = document.getElementById('dropdown');
  dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
}

function appendMessage(role, content, isSpinner = false) {
  const chat = document.getElementById('chat');
  const div = document.createElement('div');
  div.className = `message ${role.toLowerCase()}`;
  div.innerHTML = isSpinner ? '<div class="spinner"></div>' : formatResponse(content);
  chat.appendChild(div);
  MathJax.typeset();
  addCopyButtons();
  chat.scrollTop = chat.scrollHeight;
}

async function sendPrompt() {
  const promptInput = document.getElementById('prompt');
  const prompt = promptInput.value.trim();
  if (!prompt) return;

  appendMessage("User", prompt);
  promptInput.value = "";
  appendMessage("AI", "", true);

  try {
    const res = await fetch("https://ai.api-url-production.workers.dev/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "qwen", prompt, max_tokens: 8000, temperature: 0.6 })
    });

    const data = await res.json();
    const aiMessages = document.querySelectorAll('.ai');
    aiMessages[aiMessages.length - 1].innerHTML = formatResponse(data.response);
    MathJax.typeset();
    addCopyButtons();
  } catch (err) {
    alert("Error getting response from API.");
  }
}

function formatResponse(text) {
  text = text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => `<pre><button class='copy-btn'>Copy</button><code class="${lang}">${code.trim()}</code></pre>`)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
  return text;
}

function addCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.onclick = () => {
      const code = btn.nextElementSibling.innerText;
      navigator.clipboard.writeText(code);
      btn.innerText = "Copied!";
      setTimeout(() => btn.innerText = "Copy", 1500);
    };
  });
}

function clearChat() {
  document.getElementById('chat').innerHTML = "";
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
}

(function initDarkMode() {
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark');
  }
})();
