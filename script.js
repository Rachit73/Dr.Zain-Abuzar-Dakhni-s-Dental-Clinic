const GROQ_API_KEY = "YOUR_API_KEY_HERE";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const body = document.body;
const loader = document.getElementById("loader");
const year = document.getElementById("year");
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const appointmentForm = document.getElementById("appointmentForm");
const formMessage = document.getElementById("formMessage");
const chatbotToggle = document.getElementById("chatbotToggle");
const chatbot = document.getElementById("chatbot");
const chatbotClose = document.getElementById("chatbotClose");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

const systemPrompt = `
You are a helpful AI dental assistant for Mujahid Dental Clinic.
Provide clear, careful, friendly answers about common dental topics such as:
- tooth pain
- cavities
- oral hygiene
- teeth cleaning
- braces
- gum care
- dental sensitivity
- root canal basics
- appointment preparation

Rules:
- Be supportive and concise.
- Do not diagnose with certainty.
- Encourage professional dental evaluation for severe pain, swelling, bleeding, trauma, fever, or emergencies.
- Avoid unsafe medical claims.
- If asked something non-dental, politely steer back to dental clinic help.
`.trim();

body.classList.add("is-loading");

window.addEventListener("load", () => {
  setTimeout(() => {
    loader.classList.add("is-hidden");
    body.classList.remove("is-loading");
  }, 900);
});

year.textContent = new Date().getFullYear();

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

document.querySelectorAll('.nav-links a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

if (appointmentForm) {
  appointmentForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(appointmentForm);
    const name = formData.get("name")?.toString().trim();
    const date = formData.get("date");

    formMessage.textContent = `Thank you, ${name || "patient"}! Your appointment request for ${date} has been received successfully.`;
    appointmentForm.reset();
  });
}

const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

revealElements.forEach((element) => revealObserver.observe(element));

function setChatbotOpen(isOpen) {
  chatbot.classList.toggle("is-open", isOpen);
  chatbot.setAttribute("aria-hidden", String(!isOpen));
  if (isOpen) {
    setTimeout(() => chatInput.focus(), 200);
  }
}

chatbotToggle.addEventListener("click", () => {
  const isOpen = !chatbot.classList.contains("is-open");
  setChatbotOpen(isOpen);
});

chatbotClose.addEventListener("click", () => setChatbotOpen(false));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setChatbotOpen(false);
  }
});

function appendMessage(content, type) {
  const message = document.createElement("div");
  message.className = `message message--${type}`;
  message.textContent = content;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return message;
}

async function fetchGroqResponse(userMessage) {
  if (GROQ_API_KEY === "YOUR_API_KEY_HERE") {
    return "The chatbot is ready, but you still need to add your Groq API key in script.js. Once added, I can answer dental questions in real time.";
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.4,
      max_tokens: 500,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "I couldn't generate a reply right now. Please try again.";
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userMessage = chatInput.value.trim();
  if (!userMessage) {
    return;
  }

  appendMessage(userMessage, "user");
  chatInput.value = "";

  const typingMessage = appendMessage("Thinking about the best dental guidance for you...", "bot");
  typingMessage.classList.add("message--typing");

  try {
    const botReply = await fetchGroqResponse(userMessage);
    typingMessage.remove();
    appendMessage(botReply, "bot");
  } catch (error) {
    typingMessage.remove();
    appendMessage(
      "I’m having trouble connecting right now. Please try again in a moment, or contact the clinic directly for urgent help.",
      "bot"
    );
    console.error(error);
  }
});
