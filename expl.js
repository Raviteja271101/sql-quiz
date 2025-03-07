let questions = [];
        let selectedAnswers = [];
        let currentIndex = 0;

        function loadQuestions() {
            questions = JSON.parse(localStorage.getItem("quizQuestions")) || [];
            selectedAnswers = JSON.parse(localStorage.getItem("userAnswers")) || [];
            showQuestion(0);
        }

        function showQuestion(index) {
            if (index < 0 || index >= questions.length) return;
            
            let question = questions[index];
            let userSelected = selectedAnswers[index]; // Get user's selected answer
            let correctAnswer = question["Correct Answer"];
        
            document.querySelector(".question").innerHTML = (index + 1) + ". " + question.Question;
        
            let optionsContainer = document.getElementById("options-container");
            optionsContainer.innerHTML = ""; // Clear previous options
        
            ["A", "B", "C", "D"].forEach(letter => {
                let option = document.createElement("div");
                option.textContent = letter + ". " + question["Option " + letter];
                option.classList.add("option");
        
                if (letter === correctAnswer) {
                    option.classList.add("correct"); // ✅ Highlight correct answer in green
                }
                if (letter === userSelected && userSelected !== correctAnswer) {
                    option.classList.add("incorrect"); // ❌ Highlight wrong selection in red
                }
        
                optionsContainer.appendChild(option);
            });
        
            // ✅ Show user's selected answer or "Not Attempted" if skipped
            let userAnswerText = userSelected ? `Your Answer: ${question["Option " + userSelected]}` : "❌ Not Attempted";
            document.getElementById("user-answer").innerHTML = `<strong>${userAnswerText}</strong>`;
        
            // ✅ Always show correct answer
            document.getElementById("correct-answer").innerHTML = `<strong>✅ Correct Answer:</strong> ${question["Option " + correctAnswer]}`;
        
            // ✅ Show explanation
            document.querySelector(".explanation").innerHTML = "ℹ Explanation: " + question.Explanation;
        
            currentIndex = index;
        }
        function nextQuestion() {
            if (currentIndex < questions.length - 1) {
                showQuestion(currentIndex + 1);
            }
        }

        function prevQuestion() {
            if (currentIndex > 0) {
                showQuestion(currentIndex - 1);
            }
        }

        window.onload = loadQuestions;