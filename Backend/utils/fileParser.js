const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const csv = require('csv-parser');

const parsePDF = async (filePath) => {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
};

const parseDOCS = async (filePath) => {
    const data = await mammoth.extractRawText({ path: filePath });
    return data.value;
};

const parseCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        let text = '';
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                text += Object.values(row).join(' ') + '\n';
            })
            .on('end', () => {
                resolve(text);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

const extractTextFromFile = async (file) => {
    const { path, mimetype, originalname } = file;
    const extension = originalname.split('.').pop().toLowerCase();

    if (mimetype === 'application/pdf' || extension === 'pdf') {
        return await parsePDF(path);
    } else if (
        mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        extension === 'docx'
    ) {
        return await parseDOCS(path);
    } else if (mimetype === 'text/csv' || extension === 'csv') {
        return await parseCSV(path);
    } else {
        throw new Error('Unsupported file type. Please upload PDF, DOCS, or CSV.');
    }
};

module.exports = { extractTextFromFile };
