const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const { jsPDF } = require("jspdf");
const { createCanvas, loadImage } = require("canvas");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // Serve frontend files

// ✅ Load questions from JSON file
// const questionsPath = path.join(__dirname, "multipleChoice.json");

// if (!fs.existsSync(questionsPath)) {
//     console.error("❌ Error: 'multipleChoice.json' file is missing!");
//     process.exit(1);
// }

app.get("/multipleChoice.json", (req, res) => {
    const questionsPath = path.join(__dirname, "multipleChoice.json");

    fs.readFile(questionsPath, "utf8", (err, data) => {
        if (err) {
            res.status(500).json({ error: "Error reading questions file" });
        } else {
            res.json(JSON.parse(data));
        }
    });
});

// ✅ API to Serve Questions
app.get("/questions", (req, res) => {
    console.log("✅ Sending questions:", questions); // Debugging Log
    res.json(questions);
});
// ✅ API to Generate & Download Certificate
app.post("/generate-certificate", async (req, res) => {
    const { name, score, totalQuestions, status } = req.body;

    if (!name || name.trim() === "") {
        return res.status(400).send("Name is required");
    }

    try {
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
        });

        const imagePath = path.join(__dirname, "public", "certificate_bg.png");
        const img = await loadImage(imagePath);
        const canvas = createCanvas(297, 210);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, 297, 210);

        doc.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 297, 210);
        doc.addFont("GreatVibes-Regular.ttf", "GreatVibes", "normal");
        doc.setFont("GreatVibes");

        // ✅ Name Placement
        doc.setFontSize(35);
        doc.setTextColor(0, 0, 0);
        doc.text(name, 148, 85, { align: "center" });

        // ✅ Other Details
        doc.setFont("times", "italic");
        doc.setFontSize(18);
        doc.setTextColor(50, 50, 50);
        doc.text(`For successfully completing the SQL Quiz`, 148, 105, { align: "center" });
        doc.setFontSize(16);
        doc.text(`Score: ${score} / ${totalQuestions}`, 148, 125, { align: "center" });

        // ✅ Format Date as `DD-MMM-YYYY`
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentDate = new Date();
        const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}-${monthNames[currentDate.getMonth()]}-${currentDate.getFullYear()}`;
        doc.text(`Date: ${formattedDate}`, 20, 195);

        // ✅ Status (Pass or Fail)
        doc.setFont("times", "bold");
        doc.setFontSize(20);
        if (status === "Pass") {
            doc.setTextColor(0, 128, 0); // Green for Pass
        } else {
            doc.setTextColor(255, 0, 0); // Red for Fail
        }
        doc.text(`Status: ${status}`, 148, 165, { align: "center" });

        const filePath = path.join(__dirname, "public", `${name}_Certificate.pdf`);
        doc.save(filePath);

        res.download(filePath, `${name}_Certificate.pdf`, () => {
            fs.unlinkSync(filePath); // Delete file after download
        });

    } catch (error) {
        console.error("Certificate generation error:", error);
        res.status(500).send("Error generating certificate");
    }
});

// ✅ Start the Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});