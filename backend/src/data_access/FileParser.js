/**
 * FileParser.js - Extract text from uploaded files
 * 
 * Supported formats: TXT, MD, PDF, DOCX
 */

const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');

class FileParser {
    async extractText(file) {
        const fileType = this.getFileType(file.originalname);

        console.log(`Parsing ${fileType} file: ${file.originalname}`);

        switch (fileType) {
            case 'txt':
            case 'md':
                return await this.parseTextFile(file);

            case 'pdf':
                return await this.parsePDF(file);

            case 'docx':
                return await this.parseWord(file);

            default:
                throw new Error(
                    `Unsupported file type: ${fileType}. Supported types: txt, md, pdf, docx`
                );
        }
    }

    async parseTextFile(file) {
        try {
            if (!file.buffer) {
                throw new Error('File buffer not found');
            }

            const text = file.buffer.toString('utf-8');
            console.log(`Extracted ${text.length} characters from text file`);
            return this.cleanText(text);

        } catch (error) {
            throw new Error(`Failed to parse text file: ${error.message}`);
        }
    }

    async parsePDF(file) {
        try {
            if (!file.buffer) {
                throw new Error('File buffer not found');
            }

            const parser = new PDFParse({ data: file.buffer });
            const data = await parser.getText();

            console.log(`Extracted ${data.text.length} characters from PDF (${data.total} pages)`);
            return this.cleanText(data.text);

        } catch (error) {
            console.error('PDF parsing error:', error);
            throw new Error(`Failed to parse PDF: ${error.message}`);
        }
    }

    async parseWord(file) {
        try {
            if (!file.buffer) {
                throw new Error('File buffer not found');
            }

            const result = await mammoth.extractRawText({ buffer: file.buffer });
            console.log(`Extracted ${result.value.length} characters from Word`);

            if (result.messages.length > 0) {
                console.warn('Word parsing warnings:', result.messages);
            }

            return this.cleanText(result.value);

        } catch (error) {
            throw new Error(`Failed to parse Word document: ${error.message}`);
        }
    }

    cleanText(text) {
        return text
            .replace(/\r\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/[ \t]+/g, ' ')
            .trim();
    }

    getFileType(fileName) {
        return fileName.split('.').pop().toLowerCase();
    }

    isSupportedType(fileName) {
        const supportedTypes = ['txt', 'md', 'pdf', 'docx'];
        const fileType = this.getFileType(fileName);
        return supportedTypes.includes(fileType);
    }
}

module.exports = FileParser;
