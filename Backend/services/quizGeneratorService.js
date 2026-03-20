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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
    You are an expert quiz parser. Extract ALL MCQ questions from the text below and return them as a clean JSON array.

    STRICT RULES:

    === RULE 1: Question Text ("text" field) ===
    - Contains ONLY the question stem — no option labels, no answer.
    - Remove leading question numbers like "Q1.", "4.", "Q.4" from the start.
    - For "Match the Following" questions: include the question stem AND the matching pairs (A–1, B–2 etc.) as part of the text. Format them inline like: "Match: A. Psychoanalytic Theory — 1. Carl Rogers | B. Humanistic Theory — 2. Albert Bandura | ..."
    - For regular questions: just the question sentence.

    === RULE 2: Options ("options" array — always exactly 4) ===
    - Each item is the raw option text only — strip leading labels like "(A)", "(B)", "A.", "a)", "1." from the start.
    - For "Match the Following": options are the combination answers like "A-3, B-1, C-4, D-2".
    - For regular MCQ: options are the 4 answer choices.
    - If the text only has 3 options, add a plausible 4th one.

    === RULE 3: Correct Answer ("correctOption" — 0-based index) ===
    - If the text says "Answer — A" or "Answer: (B)" or "Ans: C", map it: A=0, B=1, C=2, D=3.
    - If no answer is given, use your best judgment based on the content.

    === EXAMPLE ===
    Input:
    4. Match List I with List II:
    A. Psychoanalytic Theory — 1. Carl Rogers
    B. Humanistic Theory — 2. Albert Bandura
    (A) A-3, B-1, C-4, D-2
    (B) A-4, B-3, C-2, D-1
    (C) A-2, B-4, C-1, D-3
    (D) A-3, B-2, C-4, D-1
    Answer — A

    Output:
    {
      "text": "Match List I with List II: A. Psychoanalytic Theory — 1. Carl Rogers | B. Humanistic Theory — 2. Albert Bandura",
      "options": ["A-3, B-1, C-4, D-2", "A-4, B-3, C-2, D-1", "A-2, B-4, C-1, D-3", "A-3, B-2, C-4, D-1"],
      "correctOption": 0
    }

    Return ONLY a valid JSON array. No markdown, no explanation, no extra text.

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
