const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function test() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const modelsToTest = ['gemini-2.5-flash', 'gemini-3.0-flash', 'gemini-1.5-flash'];

    for (const modelName of modelsToTest) {
        console.log(`\nTesting model: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("hello.");
            console.log(`SUCCESS with ${modelName}! Response:`, await result.response.text());
        } catch (err) {
            console.log(`FAILED with ${modelName}:`, err.status, err.statusText, err.message);
        }
    }
}
test();
