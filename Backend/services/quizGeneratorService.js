const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Generates quiz questions from the provided text using Gemini AI.
 * @param {string} text - The text content to generate quiz from.
 * @returns {Promise<Array>} - A promise that resolves to an array of question objects.
 */
const generateQuestionsFromText = async (text) => {
    if (!process.env.GOOGLE_API_KEY) {
        throw new Error('GOOGLE_API_KEY is not defined in environment variables');
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
    Analyze the following text and extract ALL quiz questions found within it.
    Each question must have exactly 4 options and 1 correct option (index 0-3).
    Provide a comprehensive list of all questions identified in the text.
    Return the response ONLY as a JSON array of objects with the following structure:
    [
        {
            "text": "Question text here?",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correctOption": 0
        }
    ]

    Text content:
    ${text.substring(0, 100000)}
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();
        // Remove markdown formatting if present
        const jsonText = textResponse.replace(/```json|```/g, '').trim();
        const questions = JSON.parse(jsonText);
        return questions;
    } catch (error) {
        console.error('AI Generation Error:', error);
        throw new Error('Failed to generate quiz questions from text.');
    }
};

module.exports = { generateQuestionsFromText };
