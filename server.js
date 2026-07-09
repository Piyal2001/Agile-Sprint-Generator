const port = process.env.PORT || 5001;
const express = require('express');
// 1. Import the proper class from the package you installed
const { GoogleGenerativeAI } = require('@google/generative-ai'); 
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// 2. Initialize it using the correct matching constructor class
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware to parse payload streams
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


// --- 2. BACKEND API PIPELINE ---
app.post('/api/generate-sprint', async (req, res) => {
    const { requirement } = req.body;

    if (!requirement) {
        return res.status(400).json({ error: "Missing requirement payload parameter." });
    }

  try {
        // CORRECTED METHOD CALL FOR THIS SPECIFIC SDK
        const model = ai.getGenerativeModel({ 
            model: "gemini-2.5-flash" // Best standard production text processing model
        });

        const prompt = `
            You are a senior enterprise Technical Business Analyst and agile Scrum Master.
            Analyze the following raw business requirements definition and slice it down into atomic, well-engineered user scrum assets.
            
            You must output a validated JSON schema response string matching this object signature perfectly. Do not include markdown code fences (like \`\`\`json):
            {
              "featureOverview": "A tight 5-10 word abstract naming the overall epic feature set",
              "estimatedSprints": 1,
              "userStories": [
                {
                  "title": "Short descriptive card identifier title",
                  "storyText": "Written explicitly using the exact layout: 'As a [user type role], I want [an objective functional capability] so that [business value gain outcome]'",
                  "acceptanceCriteria": [
                     "Minimum of 2 crisp validation points written explicitly matching 'Given / When / Then' architectural criteria."
                  ],
                  "technicalTasks": [
                     "Minimum of 3 system integration tasks like endpoint routing models, SQL table schema updates, or functional utility steps."
                  ]
                }
              ]
            }

            Deconstruct this text block: "${requirement}"
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        
        // Output clean JSON
        res.json(JSON.parse(responseText));

    } catch (error) {
        console.error("AI Backlog Engine Error:", error);
        res.status(500).json({ error: "Backlog transformation processes encountered a system fault." });

    }
});

app.listen(port, () => {
    console.log(`AgileForge engine actively monitoring connection parameters at http://localhost:${port}`);
})