/**
 * Menutech AI - Gemini Chatbot with 3D Model Viewer
 * Plug-and-play web component and script for integrating Menutech AI Chatbot.
 */

class CloserChat extends HTMLElement {
  constructor() {
    super();
    this.endpointUrl = 'https://ojpyfjgkffmzwvukjagf.supabase.co/functions/v1/closer-chat';
    this.historyKey = 'closer_chat_history_v1';
    this.history = JSON.parse(localStorage.getItem(this.historyKey) || '[]');
    this.isFetching = false;
    this.isOpen = false;
  }

  connectedCallback() {
    this.render();
    this.bindElements();
    this.renderHistory();
  }

  render() {
    this.innerHTML = `
      <div class="closer-widget-container">
        <!-- Chat Window Modal -->
        <div id="closerChatWindow" class="closer-chat-window" aria-hidden="true">
          <div class="closer-chat-header">
            <div class="closer-chat-header-info">
              <div class="closer-avatar-mini">🤖</div>
              <div class="closer-header-text">
                <h3>Menutech AI <span style="font-size: 10px; background: rgba(0, 230, 118, 0.2); color: #00e676; padding: 2px 6px; border-radius: 8px;">PRO</span></h3>
              </div>
            </div>
            <div class="closer-chat-header-actions">
              <button id="closerClearBtn" class="closer-btn-icon" title="Limpiar historial">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                </svg>
              </button>
              <button id="closerCloseBtn" class="closer-btn-icon" title="Cerrar chat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <div id="closerChatBody" class="closer-chat-body">
            <!-- Messages rendered dynamically -->
          </div>

          <div class="closer-chat-footer">
            <input id="closerInput" class="closer-input-field" type="text" placeholder="Hazme cualquier pregunta..." />
            <button id="closerSendBtn" class="closer-btn-send">
              <span>Enviar</span>
            </button>
          </div>
        </div>

        <!-- 3D Model Trigger in Bottom Right Corner -->
        <div id="closerTrigger" class="closer-model-trigger" title="Abrir Menutech AI Chatbot">
          <span class="closer-status-badge"></span>
          <model-viewer
            src="./assets/img/AI.gltf"
            alt="Menutech AI 3D Avatar"
            auto-rotate
            camera-controls
            disable-zoom
            shadow-intensity="1"
            interaction-prompt="none"
            ar>
          </model-viewer>
        </div>
      </div>
    `;
  }

  bindElements() {
    this.chatWindow = this.querySelector('#closerChatWindow');
    this.chatBody = this.querySelector('#closerChatBody');
    this.triggerBtn = this.querySelector('#closerTrigger');
    this.closeBtn = this.querySelector('#closerCloseBtn');
    this.clearBtn = this.querySelector('#closerClearBtn');
    this.inputField = this.querySelector('#closerInput');
    this.sendBtn = this.querySelector('#closerSendBtn');

    this.triggerBtn.addEventListener('click', () => this.toggleChat());
    this.closeBtn.addEventListener('click', () => this.closeChat());

    this.clearBtn.addEventListener('click', () => {
      this.history = [];
      localStorage.removeItem(this.historyKey);
      this.renderHistory();
    });

    this.sendBtn.addEventListener('click', () => this.sendMessage());

    this.inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.chatWindow.classList.add('active');
      this.chatWindow.setAttribute('aria-hidden', 'false');
      this.inputField.focus();
      this.scrollToBottom();
    } else {
      this.closeChat();
    }
  }

  closeChat() {
    this.isOpen = false;
    this.chatWindow.classList.remove('active');
    this.chatWindow.setAttribute('aria-hidden', 'true');
  }

  scrollToBottom() {
    requestAnimationFrame(() => {
      if (this.chatBody) {
        this.chatBody.scrollTop = this.chatBody.scrollHeight;
      }
    });
  }

  renderHistory() {
    this.chatBody.innerHTML = '';

    if (this.history.length === 0) {
      const welcomeDiv = document.createElement('div');
      welcomeDiv.className = 'closer-msg bot';
      welcomeDiv.innerHTML = `
        <div class="closer-bubble">
          En que puedo ayudarte
        </div>
      `;
      this.chatBody.appendChild(welcomeDiv);
      return;
    }

    this.history.forEach((msg) => {
      const div = document.createElement('div');
      div.className = `closer-msg ${msg.role === 'user' ? 'user' : 'bot'}`;

      const bubble = document.createElement('div');
      bubble.className = 'closer-bubble';
      bubble.innerHTML = this.escapeHtml(msg.text).replace(/\n/g, '<br>');

      div.appendChild(bubble);
      this.chatBody.appendChild(div);
    });

    this.scrollToBottom();
  }

  showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.id = 'closerTyping';
    typingDiv.className = 'closer-typing';
    typingDiv.innerHTML = `
      <div class="closer-dot"></div>
      <div class="closer-dot"></div>
      <div class="closer-dot"></div>
    `;
    this.chatBody.appendChild(typingDiv);
    this.scrollToBottom();
  }

  removeTypingIndicator() {
    const typingDiv = this.querySelector('#closerTyping');
    if (typingDiv) {
      typingDiv.remove();
    }
  }

  async sendMessage() {
    const text = (this.inputField.value || '').trim();
    if (!text || this.isFetching) return;

    this.isFetching = true;
    this.inputField.value = '';

    // Guardar mensaje de usuario en historial
    this.history.push({ role: 'user', text });
    this.saveHistory();
    this.renderHistory();

    // Mostrar indicador de escritura
    this.showTypingIndicator();

    try {
      // Formatear conversación previa para la API
      const conversation_history = this.history.map(item => ({
        role: item.role === 'user' ? 'user' : 'model',
        text: item.text
      }));

      const response = await fetch(this.endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: text,
          conversation_history
        })
      });

      this.removeTypingIndicator();

      if (response.ok) {
        const data = await response.json();
        const aiReply = data.response || data.text || 'Sin respuesta.';
        this.history.push({ role: 'bot', text: aiReply });
      } else {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error || 'Lo siento, ocurrió un problema al conectar con Gemini AI.';
        this.history.push({ role: 'bot', text: `⚠️ ${errMsg}` });
      }
    } catch (err) {
      this.removeTypingIndicator();
      this.history.push({ role: 'bot', text: '⚠️ Error de conexión con el servidor de IA.' });
    } finally {
      this.isFetching = false;
      this.saveHistory();
      this.renderHistory();
    }
  }

  saveHistory() {
    localStorage.setItem(this.historyKey, JSON.stringify(this.history));
  }

  escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));
  }
}

// Register custom element
if (!customElements.get('closer-chat')) {
  customElements.define('closer-chat', CloserChat);
}

// Auto-mount if script is included directly
document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('closer-chat')) {
    const elem = document.createElement('closer-chat');
    document.body.appendChild(elem);
  }
});
