// ==========================
// START BUTTON
// ==========================
const GEMINI_API_KEY = "GEMINI_API_KEY";
const YOUTUBE_API_KEY = "YOUTUBE_API_KEY";
let lastRequestTime = 0;

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
    const now = Date.now();

if (now - lastRequestTime < 30000) {
    alert("Please wait 30 seconds before generating again");
    return;
}

lastRequestTime = now;
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
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
            quizContainer.innerHTML = "<p>API Error: "+(data?.error?.message || "Unknown error")+"</p>";
            return;
        }

        const text =
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Unable to generate questions";

        renderInteractiveMCQ(text);

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
function renderInteractiveMCQ(responseText) {
    const container = document.getElementById("quizContainer");

    // Split by Q1, Q2, Q3... pattern
    const parts = responseText.split(/(?=Q\d+[:.])/).filter(p => p.trim());

    let html = '<div id="mcq-wrapper">';

    parts.forEach((block, index) => {
        const lines = block.trim().split('\n').filter(l => l.trim() !== '');

        // First line is the question
        const questionLine = lines[0];

        // Find options A) B) C) D)
        const options = lines.filter(l => /^[A-D][).]/.test(l.trim()));

        // Find correct answer line but DON'T show it
        const answerLine = lines.find(l => /correct answer/i.test(l));
        const correctLetter = answerLine
            ? (answerLine.match(/[A-D]/i)?.[0]?.toUpperCase() || null)
            : null;

        if (options.length === 0) return; // skip non-MCQ blocks

    html += '<div class="mcq-question" id="mcq-' + index + '" data-correct="' + correctLetter + '">' +
'<p class="question-text"><strong>' + questionLine + '</strong></p>' +
'<div class="options-grid">' +
options.map(function(opt, i) {
    var letter = opt.trim()[0].toUpperCase();
    var text = opt.trim().substring(2).trim();
    return '<button class="option-btn" id="btn-' + index + '-' + letter + '" onclick="selectOption(' + index + ','+ "'" + letter + "'"+',this)">' + letter + ') ' + text + '</button>';
}).join('') +
'</div>' +
'<div class="mcq-feedback" id="feedback-' + index + '"></div>' +
'</div>';

}); // forEach ends here

html += '<button id="submitBtn" onclick="submitAllAnswers()" style="margin-top:25px;padding:14px 40px;background:linear-gradient(135deg,#00d4ff,#7b2ff7);color:white;border:none;border-radius:12px;font-size:1.1rem;font-weight:bold;cursor:pointer;display:block;width:100%;">SUBMIT QUIZ</button>';
html += '<div id="finalScore"></div>';

container.innerHTML = html;
window.mcqSelections = {};
}

function selectOption(qIndex, letter, btn) {
    // Remove selected from all buttons in this question
    var allBtns = document.querySelectorAll('#btn-' + qIndex + '-A, #btn-' + qIndex + '-B, #btn-' + qIndex + '-C, #btn-' + qIndex + '-D');
    allBtns.forEach(function(b) {
        b.classList.remove('selected');
    });
    
    // Mark this one selected
    btn.classList.add('selected');
    window.mcqSelections[qIndex] = letter;
};

function submitAllAnswers() {
    var cards = document.querySelectorAll('.mcq-question');
    var score = 0;
    var unanswered = 0;

    cards.forEach(function(card, index) {
        var correct = card.dataset.correct;
        var chosen = window.mcqSelections[index];
        var feedback = document.getElementById('feedback-' + index);

        card.querySelectorAll('.option-btn').forEach(function(btn) {
            btn.onclick = null;
            btn.style.cursor = 'default';
        });

        if (!chosen) {
            unanswered++;
            feedback.innerHTML = "⚠️ Not answered! Correct: <strong>" + correct + "</strong>";
            feedback.style.color = 'orange';
            var cb = document.getElementById('btn-' + index + '-' + correct);
            if (cb) cb.classList.add('correct');
        } else if (chosen === correct) {
            score++;
            var cb = document.getElementById('btn-' + index + '-' + chosen);
            if (cb) cb.classList.add('correct');
            feedback.innerHTML = "✅ Correct!";
            feedback.style.color = '#00ff88';
        } else {
            var wb = document.getElementById('btn-' + index + '-' + chosen);
            var cb = document.getElementById('btn-' + index + '-' + correct);
            if (wb) wb.classList.add('wrong');
            if (cb) cb.classList.add('correct');
            feedback.innerHTML = "❌ Wrong! Correct: <strong>" + correct + "</strong>";
            feedback.style.color = '#ff4444';
        }
        feedback.style.display = 'block';
    });

    document.getElementById('submitBtn').style.display = 'none';
    document.getElementById('finalScore').innerHTML =
        "<div style='text-align:center;margin-top:20px;padding:20px;background:rgba(255,255,255,0.05);border-radius:15px;'>" +
        "<h2 style='color:#00d4ff;'>🎯 Score: " + score + " / " + cards.length + "</h2>" +
        "<p style='color:#aaa;'>" + (unanswered > 0 ? unanswered + " skipped" : "All attempted!") + "</p>" +
        "</div>";
}
