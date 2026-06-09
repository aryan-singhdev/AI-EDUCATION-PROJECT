// ==========================
// START BUTTON
// ==========================
// GEMINI API
const GEMINI_API_KEY = "YOUR_API_KEY";
// YOUTUBE API
const YOUTUBE_API_KEY = "YOUR_API_KEY"
const startButton = document.getElementById("start-btn");
const dashboard = document.getElementById("dashboard");

startButton.addEventListener("click", function () {

    startButton.innerHTML = "Loading...";

    setTimeout(function () {

        document.querySelector(".hero").style.display = "none";

        dashboard.style.display = "block";

        dashboard.scrollIntoView({
            behavior: "smooth"
        });

    }, 1500);

});

// ==========================
// SEARCH TOPIC
// ==========================

// ==========================
// SEARCH TOPIC
// ==========================
async function searchTopic() {
    const topic =
        document.getElementById("searchBox").value;
    const videoContainer =
        document.getElementById("videoContainer");
    if (topic === "") {
        alert("Please enter a topic");
        return;
    }
    videoContainer.innerHTML = `
        <div class="loader"></div>
    `;
    try {
        const response =
        await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(topic)} lecture&type=video&maxResults=5&order=relevance&key=${YOUTUBE_API_KEY}`
           );
        const data = await response.json();
        console.log(data);
        videoContainer.innerHTML = "";
        data.items.forEach(video => {
            videoContainer.innerHTML += `
                <div class="video-card">
                    <h3>
                        ${video.snippet.title}
                    </h3>
                    <iframe
                        width="100%"
                        height="250"
                        src="https://www.youtube.com/embed/${video.id.videoId}"
                        title="${video.snippet.title}"
                        frameborder="0"
                        allowfullscreen>
                    </iframe>
                    <p>
                        ${video.snippet.channelTitle}
                    </p>
                </div>
            `;
        });
    }
    catch(error){
        console.error(error);
        videoContainer.innerHTML = `
            <div class="video-card">
                <h3>
                    Failed to load videos
                </h3>
                <p>
                    Check your YouTube API key.
                </p>
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

    alert(
        "Selected Level : " +
        level.toUpperCase()
    );

}

// ==========================
// GENERATE QUESTIONS
// ==========================

function generateQuestions(type) {

    const quizContainer =
        document.getElementById("quizContainer");

    quizContainer.innerHTML =
        "<div class='loader'></div>";

    setTimeout(function () {

        if (type === "mcq") {

            quizContainer.innerHTML = `

                <div class="question-card">

                    <h3>
                    What is HTML?
                    </h3>

                    <p>
                    A) Programming Language
                    </p>

                    <p>
                    B) Markup Language
                    </p>

                    <p>
                    C) Database
                    </p>

                    <p>
                    D) Operating System
                    </p>

                </div>

            `;

        }

        else if (type === "short") {

            quizContainer.innerHTML = `

                <div class="question-card">

                    <h3>
                    Explain the purpose of HTML.
                    </h3>

                </div>

            `;

        }

        else if (type === "long") {

            quizContainer.innerHTML = `

                <div class="question-card">

                    <h3>
                    Explain the complete structure
                    of an HTML document.
                    </h3>

                </div>

            `;

        }

    }, 1500);

}

// ==========================
// PARTICLE BACKGROUND
// ==========================

const particles =
    document.getElementById("particles");

for (let i = 0; i < 40; i++) {

    const particle =
        document.createElement("span");

    particle.style.position = "fixed";

    particle.style.width =
        Math.random() * 6 + 2 + "px";

    particle.style.height =
        particle.style.width;

    particle.style.background =
        "#00bfff";

    particle.style.borderRadius =
        "50%";

    particle.style.left =
        Math.random() * 100 + "%";

    particle.style.top =
        Math.random() * 100 + "%";

    particle.style.opacity =
        Math.random();

    particle.style.animation =
        "floatParticle " +
        (Math.random() * 10 + 5) +
        "s linear infinite";

    particles.appendChild(particle);

}

// ==========================
// FLOAT ANIMATION
// ==========================

const style =
document.createElement("style");

style.innerHTML = `

@keyframes floatParticle {

    from {

        transform:
        translateY(0px);

    }

    to {

        transform:
        translateY(-100vh);

    }

}

.video-card{

    background:
    rgba(255,255,255,0.05);

    padding:20px;

    border-radius:20px;

    border:
    1px solid rgba(255,255,255,0.1);

}

.question-card{

    background:
    rgba(255,255,255,0.05);

    padding:20px;

    border-radius:20px;

}

`;

document.head.appendChild(style);

// ==========================
// PAGE LOADED
// ==========================

window.onload = function () {

    console.log(
        "EduAI Loaded Successfully"
    );

};