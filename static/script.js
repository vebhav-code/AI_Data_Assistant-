async function sendMessage() {

  const input = document.getElementById("userInput");
  const chat = document.getElementById("chatPanel");
  const result = document.getElementById("resultContent");

  if (!input.value.trim()) return;

  // Show user query on left
  const q = document.createElement("div");
  q.className = "user-msg";
  q.innerText = input.value;
  chat.appendChild(q);

  const question = input.value;
  input.value = "";
  chat.scrollTop = chat.scrollHeight;

  // Loading state
  result.innerHTML = "🤖 Analyzing database insights...";

  try {
    const res = await fetch("http://localhost:8000/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
You are a database AI assistant.
Return structured output in this format:

TABLE:
DESCRIPTION:
COLUMNS:
RELIABILITY:

User question: ${question}
`
      })
    });

    const data = await res.json();
    const text = data.answer;

    // Parse response
    const table = extract(text, "TABLE:");
    const desc = extract(text, "DESCRIPTION:");
    const cols = extract(text, "COLUMNS:");
    const rel = extract(text, "RELIABILITY:");

    // Render structured UI
    result.innerHTML = `
      <h3>AI Assistant</h3>
      <hr>

      <p><strong>📊 Table Found</strong><br>${table}</p>

      <p><strong>📝 Description</strong><br>${desc}</p>

      <p><strong>🔑 Key Columns</strong></p>
      <ul>
        ${cols.split(",").map(c => `<li>${c.trim()}</li>`).join("")}
      </ul>

      <p><strong>⚠ Data Reliability</strong><br>${rel}</p>

      <div style="display:flex;gap:10px;margin-top:10px;">
        <button onclick="saveReport()">Generate Report</button>
        <button>Explore Tables</button>
      </div>
    `;

  } catch (err) {
    result.innerHTML = "❌ AI connection failed. Check backend.";
  }
}


// -------- Helper to extract sections --------

function extract(text, label) {
  const start = text.indexOf(label);
  if (start === -1) return "Not available";

  const slice = text.substring(start + label.length);
  const end = slice.search(/\n[A-Z]+:/);

  return end === -1 ? slice.trim() : slice.substring(0, end).trim();
}


// -------- ENTER KEY SUPPORT --------

document.getElementById("userInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});


// -------- SAVE REPORT FUNCTION (WORKING) --------

async function saveReport() {

  const resultBox = document.getElementById("resultContent");

  if (!resultBox.innerText.trim()) {
    alert("No AI result to save yet!");
    return;
  }

  const content = resultBox.innerText;

  try {
    const res = await fetch("http://localhost:8000/save-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content })
    });

    const data = await res.json();

    alert("✅ Report saved in reports folder:\n" + data.file);

  } catch (err) {
    alert("❌ Failed to save report. Is backend running?");
  }
}

// -------- USER MENU --------

function toggleMenu() {
  const menu = document.getElementById("menuPopup");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

function openProfile() {
  alert("Profile page coming soon 😄");
}

function logout() {
  window.location.href = "/login";
}


const userName = "Admin";   // later fetch from backend/session
document.getElementById("avatarLetter").innerText = userName.charAt(0).toUpperCase();

