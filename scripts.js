document.addEventListener("DOMContentLoaded", async function () {
    let questions = [];
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let attemptedCount = 0;
  

    // ✅ Get HTML Elements
    const questionEl = document.getElementById("question-text");
    const optionsEl = document.getElementById("options");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const submitBtn = document.getElementById("submit-btn");
    const certificateBtn = document.getElementById("download-certificate-btn");
    const attemptedCountDisplay = document.getElementById("attempted-count");
    const remainingCountDisplay = document.getElementById("remaining-count");
    const timerDisplay = document.getElementById("timer");

    let score = 0;

    // ✅ Fetch Questions from Backend
    async function fetchQuestions() {
        try {
            const response = await fetch("http://localhost:3000/multipleChoice.json");
    
            // ✅ Check if response is OK
            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }
    
            let allQuestions = await response.json();
    
            // ✅ Select 5 random questions
            questions = getRandomQuestions(allQuestions, 5);
    
            // ✅ Debugging: Print selected questions
            console.log("✅ Selected Questions:", questions);
    
            remainingCountDisplay.textContent = questions.length;
            displayQuestion(currentQuestionIndex);
    
            startTimer(); // ✅ Start the timer when quiz begins
        } catch (error) {
            console.error("❌ Error fetching questions:", error);
            alert("Failed to load quiz questions. Please check the server!");
        }
        updateSidebar(); // ✅ Ensure sidebar starts with correct values
    }

    function updateSidebar() {
        let attempted = userAnswers.filter(answer => answer !== null && answer !== undefined).length;
        let remaining = questions.length - attempted;
    
        document.getElementById("attempted-count").textContent = attempted;
        document.getElementById("remaining-count").textContent = remaining;
    }

    // Function to select 5 random questions from the full set
function getRandomQuestions(allQuestions, count) {
    let shuffled = allQuestions.sort(() => 0.5 - Math.random()); // Shuffle questions
    return shuffled.slice(0, count); // Pick first 5
}
    
    
    // Display a Question
    function displayQuestion(index) {
        if (!questions || !questions[index]) {
            console.error("❌ Error: Trying to display an undefined question at index:", index);
            return;
        }
    
        const question = questions[index];
    
        // Ensure Options exist before using `forEach`
        if (!question.Options || !Array.isArray(question.Options)) {
            console.error("❌ Error: Options are missing for question:", question);
            return;
        }
    
        questionEl.textContent = `${index + 1}. ${question.Question}`;
        optionsEl.innerHTML = ""; // Clear previous options
    
        question.Options.forEach((option, i) => {
            const optionID = `option${index}_${i}`; // Unique ID for each option

             // ✅ Check if the option was previously selected
        let isChecked = userAnswers[index] === option ? "checked" : "";
    
        const optionHTML = `
        <div class="form-check">
            <input class="form-check-input" type="radio" name="answer" value="${option}" id="${optionID}" ${isChecked}>
            <label class="form-check-label btn btn-light d-block py-2" for="${optionID}">
                ${option}
            </label>
        </div>
    `;
    optionsEl.innerHTML += optionHTML;            
        });
    
    
        prevBtn.disabled = index === 0;
        nextBtn.style.display = index < questions.length - 1 ? "inline-block" : "none";
        submitBtn.style.display = index === questions.length - 1 ? "inline-block" : "none";
    }
    document.getElementById("options").addEventListener("change", function (event) {
        if (event.target.name === "answer") {
            userAnswers[currentQuestionIndex] = event.target.value;
            updateSidebar(); // ✅ Update sidebar when user selects an answer
        }
    });

   
    // ✅ Track Questions Attempted
    function saveAnswer() {
        const selectedAnswer = document.querySelector('input[name="answer"]:checked');
        if (selectedAnswer && !userAnswers[currentQuestionIndex]) {
            attemptedCount++;
        }
        userAnswers[currentQuestionIndex] = selectedAnswer ? selectedAnswer.value : null;
        attemptedCountDisplay.textContent = attemptedCount;
        remainingCountDisplay.textContent = questions.length - attemptedCount;
    }

    // ✅ Navigation Buttons
    nextBtn.addEventListener("click", () => {
        saveAnswer();
        currentQuestionIndex++;
        displayQuestion(currentQuestionIndex);
        updateSidebar();
    });

    prevBtn.addEventListener("click", () => {
        saveAnswer();
        currentQuestionIndex--;
        displayQuestion(currentQuestionIndex);
        updateSidebar();
    });

    let totalTime = 300; // 5 minutes in seconds
    let quizTimer;
    
    function startTimer() {
        if (quizTimer) clearInterval(quizTimer); // Prevent multiple timers
    
        // ✅ Update timer immediately on start
        updateTimerDisplay();
    
        quizTimer = setInterval(() => {
            totalTime--;
            updateTimerDisplay();
    
            if (totalTime <= 0) {
                clearInterval(quizTimer);
                submitQuiz(); // Auto-submit when time runs out
            }
        }, 1000);
    }
    
    // ✅ Function to update the timer display
    function updateTimerDisplay() {
        let minutes = Math.floor(totalTime / 60);
        let seconds = totalTime % 60;
        timerDisplay.innerHTML = `Time Remaining: ${minutes}:${seconds < 10 ? '0' : ''}${seconds} seconds`;
    }
    

    // ✅ Submit Quiz
    submitBtn.addEventListener("click", () => {
        saveAnswer();
        submitQuiz();
    });

    function submitQuiz() {
        clearInterval(quizTimer); // Stop the timer
    
        // ✅ Move Sidebar to Center
        document.body.classList.add("submitted");
    
        let score = userAnswers.filter((ans, i) => ans === questions[i]["Correct Answer"]).length;
    
        // ✅ Ensure result section exists and make it visible
        let resultSection = document.getElementById("result-section");
        if (resultSection) {
            resultSection.style.display = "block";
        } else {
            console.error("❌ Error: Result section not found in HTML.");
            return;
        }
    
        // ✅ Update result details
        document.getElementById("score-display").textContent = `You scored ${score} out of ${questions.length}`;
        document.getElementById("percentage-display").textContent = `Percentage: ${(score / questions.length * 100).toFixed(2)}%`;
        document.getElementById("status-display").textContent = score >= (questions.length / 2) ? "Pass" : "Fail";
    
        // ✅ Show "Download Certificate" button in Sidebar
        let sidebarCertBtn = document.getElementById("sidebar-certificate-btn");
        if (sidebarCertBtn) {
            sidebarCertBtn.style.display = "inline-block";
        } else {
            console.error("❌ Error: Sidebar certificate button not found.");
        }
    
        // ✅ Store quiz questions & user answers in localStorage
        localStorage.setItem("quizResults", JSON.stringify(questions));
        localStorage.setItem("userAnswers", JSON.stringify(userAnswers));
    
        // ✅ Show Explanation & Retry Buttons
        document.getElementById("show-explanation-btn").style.display = "inline-block";
        document.getElementById("retry-quiz-btn").style.display = "inline-block";
    }
   
   
    

    
    function generateCertificate() {
        // ✅ Ensure jsPDF is loaded properly
        if (typeof window.jspdf === "undefined") {
            console.error("❌ Error: jsPDF is not loaded. Make sure the script is included in index.html.");
            alert("Error generating certificate. Please refresh and try again.");
            return;
        }
    
        // ✅ Correct way to use jsPDF in UMD format
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
        });
    
        // ✅ Ask for the user's name
        let userName = prompt("Enter your name for the certificate:");
        if (!userName || userName.trim() === "") {
            alert("Name is required to generate the certificate.");
            return;
        }
    
        const img = new Image();
        img.src = 'certificate_bg.png'; // ✅ Ensure this file exists in your project
    
        img.onload = function () {
            doc.addImage(img, 'PNG', 0, 0, 297, 210);
    
            // ✅ Use Great Vibes font for name
            doc.addFont("GreatVibes-Regular.ttf", "GreatVibes", "normal");
            doc.setFont("GreatVibes");
            doc.setFontSize(30);
            doc.setTextColor(0, 0, 0);
            doc.text(userName, 148, 90, null, null, 'center');
    
            // ✅ Use Normal Font for Other Text
            doc.setFont("times", "italic");
            doc.setFontSize(18);
            doc.setTextColor(50, 50, 50);
            doc.text(`For successfully completing the SQL Quiz`, 148, 110, null, null, 'center');
    
            let score = userAnswers.filter((ans, i) => ans === questions[i]["Correct Answer"]).length;
            let status = score >= (questions.length / 2) ? "Pass" : "Fail";
            let percentage = (score / questions.length * 100).toFixed(2) + "%";
    
            doc.setFontSize(16);
            doc.text(`Score: ${score} / ${questions.length}`, 148, 130, null, null, 'center');
            doc.text(`Percentage: ${percentage}`, 148, 145, null, null, 'center');
            doc.text(`Status: ${status}`, 148, 160, null, null, 'center');
    
            const currentDate = new Date();
            const formattedDate = `${currentDate.getDate()}-${currentDate.toLocaleString('en-us', { month: 'short' })}-${currentDate.getFullYear()}`;
            doc.setFontSize(14);
            doc.text(`Date: ${formattedDate}`, 20, 190);
    
            doc.save(`${userName}_Certificate.pdf`);
        };
    
        img.onerror = function () {
            alert("Error loading certificate background image. Make sure the file path is correct.");
        };
    }
    
    fetchQuestions(); 
    // ✅ Show Explanation Button - Opens Explanation Page
document.getElementById("show-explanation-btn").addEventListener("click", function () {
    window.open("explanation.html", "_blank");
});

// ✅ Retry Quiz Button - Resets the Quiz
document.getElementById("retry-quiz-btn").addEventListener("click", function () {
    location.reload(); // Refresh the page to restart the quiz
});

document.getElementById("sidebar-certificate-btn").addEventListener("click", generateCertificate);

})
