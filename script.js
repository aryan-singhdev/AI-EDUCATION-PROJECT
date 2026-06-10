// ==========================
// START BUTTON
// ==========================
const GEMINI_API_KEY = "GEMINI_API_KEY";
const YOUTUBE_API_KEY = "YOUTUBE_API_KEY";

const startButton = document.getElementById("start-btn");
const dashboard = document.getElementById("dashboard");

startButton.addEventListener("click", function () {
    startButton.innerHTML = "Loading...";
    setTimeout(function () {
        document.querySelector(".hero").style.display = "none";
        dashboard.style.display = "block";
        dashboard.scrollIntoView({ behavior: "smooth" });
    }, 1500);
});

// ==========================
// SEARCH TOPIC
// ==========================
async function searchTopic() {
    const topic = document.getElementById("searchBox").value;
    const videoContainer = document.getElementById("videoContainer");

    if (topic === "") {
        alert("Please enter a topic");
        return;
    }

    videoContainer.innerHTML = `<div class="loader"></div>`;

    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(topic)} lecture&type=video&maxResults=5&order=relevance&key=${YOUTUBE_API_KEY}`
        );
        const data = await response.json();
        videoContainer.innerHTML = "";
        data.items.forEach(video => {
            videoContainer.innerHTML += `
                <div class="video-card">
                    <h3>${video.snippet.title}</h3>
                    <iframe width="100%" height="250"
                        src="https://www.youtube.com/embed/${video.id.videoId}"
                        title="${video.snippet.title}"
                        frameborder="0" allowfullscreen>
                    </iframe>
                    <p>${video.snippet.channelTitle}</p>
                </div>
            `;
        });
    } catch (error) {
        console.error(error);
        videoContainer.innerHTML = `
            <div class="video-card">
                <h3>Failed to load videos</h3>
                <p>Check your YouTube API key.</p>
            </div>
        `;
    }
}

// ==========================
// SELECT LEVEL
// ==========================
let currentLevel = "";

function selectLevel(level) {
    currentLevel = level;
    alert("Selected Level: " + level.toUpperCase());
}

// ==========================
// GENERATE QUESTIONS
// ==========================
async function generateQuestions(type) {
    const topic = document.getElementById("searchBox").value.trim();
    const quizContainer = document.getElementById("quizContainer");

    if (!topic) {
        alert("Please enter a topic first");
        return;
    }

    quizContainer.innerHTML = "<p>Generating questions...</p>";

    let prompt = "";

 if (type === "mcq") {
    prompt = `Generate 10 MCQ questions on ${topic}. Format: Q1: Question A) B) C) D) Correct Answer:`;
} else if (type === "short") {
    prompt = `Generate 10 short answer questions on ${topic}. Each requires 2-5 lines.`;
} else if (type === "long") {
    prompt = `Generate 10 long answer questions on ${topic}. Each suitable for 5-10 marks.`;
}

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        // ✅ Read body ONCE
        const data = await response.json();

        if (!response.ok) {
            console.error("API Error:", data);
            quizContainer.innerHTML = `<p>API Error: ${data?.error?.message || "Unknown error"}</p>`;
            return;
        }

        const text =
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Unable to generate questions";

        quizContainer.innerHTML = `
            <div class="question-card">
                <pre>${text}</pre>
            </div>
        `;

    } catch (error) {
        console.error(error);
        quizContainer.innerHTML = "<p>Failed to generate questions.</p>";
    }
}

// ==========================
// TIMER
// ==========================
let timeLeft = 1200;

function startTimer() {
    const timer = document.getElementById("timer");
    const interval = setInterval(() => {
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        timer.innerText = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
        timeLeft--;
        if (timeLeft < 0) {
            clearInterval(interval);
            alert("Time Up!");
        }
    }, 1000);
}

// ==========================
// PARTICLE BACKGROUND
// ==========================
const particles = document.getElementById("particles");

for (let i = 0; i < 40; i++) {
    const particle = document.createElement("span");
    particle.style.position = "fixed";
    particle.style.width = Math.random() * 6 + 2 + "px";
    particle.style.height = particle.style.width;
    particle.style.background = "#00bfff";
    particle.style.borderRadius = "50%";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.top = Math.random() * 100 + "%";
    particle.style.opacity = Math.random();
    particle.style.animation = "floatParticle " + (Math.random() * 10 + 5) + "s linear infinite";
    particles.appendChild(particle);
}

const style = document.createElement("style");
style.innerHTML = `
@keyframes floatParticle {
    from { transform: translateY(0px); }
    to { transform: translateY(-100vh); }
}
.video-card {
    background: rgba(255,255,255,0.05);
    padding: 20px;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.1);
}
.question-card {
    background: rgba(255,255,255,0.05);
    padding: 20px;
    border-radius: 20px;
}
`;
document.head.appendChild(style);

// ==========================
// PAGE LOADED
// ==========================
window.onload = function () {
    console.log("EduAI Loaded Successfully");
};
