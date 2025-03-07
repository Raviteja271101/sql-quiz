let questions = JSON.parse(localStorage.getItem("quizResults")) || [];
let userAnswers = JSON.parse(localStorage.getItem("userAnswers")) || [];
let currentQuestionIndex = 0;

function displayExplanation(index) {
    let questionData = questions[index];
    if (!questionData) return;

    document.getElementById("question-text").textContent = `${index + 1}. ${questionData.Question}`;
    let optionsContainer = document.getElementById("options-container");
    optionsContainer.innerHTML = "";

    let correctAnswer = questionData["Correct Answer"];
    let userSelected = userAnswers[index];

    questionData.Options.forEach(option => {
        let optionClass = "";
        if (option === correctAnswer) {
            optionClass = "correct"; // ✅ Highlight correct answer in green
        } else if (option === userSelected) {
            optionClass = "incorrect"; // ❌ Highlight wrong selected answer in red
        }

        optionsContainer.innerHTML += `<p class="option ${optionClass}">${option}</p>`;
    });

    let explanationText = questionData.Explanation ? `Explanation: ${questionData.Explanation}` : "No explanation available.";
    document.getElementById("explanation-text").textContent = explanationText;

    if (userSelected) {
        document.getElementById("user-attempt-text").textContent = `Your Answer: ${userSelected}`;
    } else {
        document.getElementById("user-attempt-text").innerHTML = `<span class="not-attempted">Not Attempted</span>`;
    }

    // ✅ Disable previous button on first question
    document.getElementById("prev-btn").disabled = index === 0;
    document.getElementById("next-btn").disabled = index === questions.length - 1;
}

document.getElementById("prev-btn").addEventListener("click", function () {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayExplanation(currentQuestionIndex);
    }
});

document.getElementById("next-btn").addEventListener("click", function () {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayExplanation(currentQuestionIndex);
    }
});

// ✅ Load first question on page load
displayExplanation(currentQuestionIndex);