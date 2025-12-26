

// ==============================
// Global API state
// ==============================
let API_URL = null;
let apiReady = false;


// ==============================
// Load app.json configuration
// ==============================
fetch("app.json")
  .then(response => {
    if (!response.ok) {
      throw new Error("Failed to load app.json");
    }
    return response.json();
  })
  .then(config => {
    API_URL = "https://gretta-unimpressed-noncommercially.ngrok-free.dev/safety-check"; //config.api_url;
    apiReady = true;
    console.log("✅ API ready:", "https://gretta-unimpressed-noncommercially.ngrok-free.dev/safety-check");
    showSystemMessage("🟢 Safety service connected.");
  })
  .catch(error => {
    console.error("❌ Config load error:", error);
    showSystemMessage("❌ Failed to load safety service configuration.");
  });


// ==============================
// Send message to backend
// ==============================
async function sendMessage() {
  if (!apiReady || !API_URL) {
    showSystemMessage("⏳ Safety service is still starting. Please wait...");
    return;
  }

  const input = document.getElementById("textInput");
  const text = input.value.trim();

  if (!text) return;

  // Show user message
  addMessage(text, "user-msg");
  input.value = "";

  // Show typing indicator
  showTyping();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text: text })
    });

    removeTyping();

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    showAlert(data);

  } catch (error) {
    console.error("❌ API error:", error);
    removeTyping();
    showSystemMessage("⚠️ Could not connect to safety service.");
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("textInput");
  const sendBtn = document.getElementById("sendBtn");

  // Send on Enter
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // Send on button click
  sendBtn.addEventListener("click", () => sendMessage());
});


// ==============================
// UI helper functions
// ==============================
function addMessage(text, className) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${className}`;
  msgDiv.textContent = text;

  const messages = document.getElementById("messages");
  messages.appendChild(msgDiv);
  messages.scrollTop = messages.scrollHeight;
}

function showAlert(data) {
  const alertDiv = document.createElement("div");
  alertDiv.className = `message bot-msg ${data.status}`;

  let emoji = "✅";
  if (data.status === "warning") emoji = "⚠️";
  if (data.status === "harmful") emoji = "🚫";

  alertDiv.innerHTML = `
    <strong>${emoji} ${data.status.toUpperCase()}</strong><br>
    <span>Suggested actions:</span><br>
    • ${data.next_steps.join("<br>• ")}
  `;

  const messages = document.getElementById("messages");
  messages.appendChild(alertDiv);
  messages.scrollTop = messages.scrollHeight;
}

function showSystemMessage(text) {
  const msgDiv = document.createElement("div");
  msgDiv.className = "message bot-msg system";
  msgDiv.textContent = text;

  const messages = document.getElementById("messages");
  messages.appendChild(msgDiv);
  messages.scrollTop = messages.scrollHeight;
}


// ==============================
// Typing indicator (WhatsApp-style)
// ==============================
function showTyping() {
  const typing = document.createElement("div");
  typing.id = "typing";
  typing.className = "typing";
  typing.innerHTML = `Safety Bot is typing<span>.</span><span>.</span><span>.</span>`;

  const messages = document.getElementById("messages");
  messages.appendChild(typing);
  messages.scrollTop = messages.scrollHeight;
}

function removeTyping() {
  const typing = document.getElementById("typing");
  if (typing) typing.remove();
}


// ==============================
// Send on Enter key
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("textInput");

  input.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });
});
