// Chat Interface Component - Traces API chat data
class ChatInterface {
  constructor(apiClient, elementId) {
    this.api = apiClient;
    this.element = document.getElementById(elementId);
    this.commands = [];
    this.messages = [];
  }

  async init() {
    const response = await this.api.getChatCommands();
    if (response.commands) {
      this.commands = response.commands;
    }
    this.render();
    this.setupEventListeners();
  }

  async sendMessage(message, command = 'help') {
    if (!message.trim()) return;
    
    // Add user message to UI
    this.appendMessage('user', message);
    this.messages.push({ sender: 'user', text: message });

    // Send to API
    const response = await this.api.processChat(message, command);
    
    // Add bot response to UI
    if (response.response) {
      this.appendMessage('bot', response.response);
      this.messages.push({ sender: 'bot', text: response.response });
    }
  }

  render() {
    if (!this.element) return;
    
    this.element.innerHTML = `
      <div class="chat-container">
        <div class="chat-header">
          <h3>💬 Chat Interface</h3>
        </div>
        <div class="chat-commands">
          ${this.commands.map(cmd => 
            `<button class="command-btn" data-cmd="${cmd.id}">${cmd.description}</button>`
          ).join('')}
        </div>
        <div class="chat-messages" id="chat-messages-${this.element.id}">
          <div class="message bot">
            <div class="sender">System</div>
            <div class="text">Welcome! I'm your AI assistant. Choose a command or type a message.</div>
          </div>
        </div>
        <div class="chat-input-area">
          <input type="text" id="chat-input-${this.element.id}" placeholder="Type a message..." />
          <button id="send-btn-${this.element.id}">Send</button>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    if (!this.element) return;

    // Command buttons
    const commandBtns = this.element.querySelectorAll('.command-btn');
    commandBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.dataset.cmd;
        this.sendMessage(cmd, cmd);
      });
    });

    // Send button
    const sendBtn = this.element.querySelector(`#send-btn-${this.element.id}`);
    const input = this.element.querySelector(`#chat-input-${this.element.id}`);
    
    if (sendBtn && input) {
      sendBtn.addEventListener('click', () => {
        if (input.value.trim()) {
          this.sendMessage(input.value.trim());
          input.value = '';
        }
      });

      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
          this.sendMessage(input.value.trim());
          input.value = '';
        }
      });
    }
  }

  appendMessage(sender, text) {
    const messagesContainer = this.element.querySelector(`#chat-messages-${this.element.id}`);
    if (messagesContainer) {
      messagesContainer.innerHTML += `
        <div class="message ${sender}">
          <div class="sender">${sender === 'user' ? 'You' : 'AI Assistant'}</div>
          <div class="text">${text}</div>
        </div>
      `;
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  clearMessages() {
    const messagesContainer = this.element.querySelector(`#chat-messages-${this.element.id}`);
    if (messagesContainer) {
      messagesContainer.innerHTML = '';
      this.messages = [];
    }
  }

  getMessages() {
    return this.messages;
  }
}
