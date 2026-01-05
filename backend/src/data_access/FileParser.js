/**
 * FileParser

 * 作用：从不同格式的文件中提取文本内容
 * 支持的格式：
 * - TXT (纯文本)
 * - MD (Markdown)
 * - PDF (需要 pdf-parse 库)
 * - DOCX (需要 mammoth 库)
 */

const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

class FileParser {
    async extractText(file) {
        const fileType = this.getFileType(file.originalname);

        console.log(`📄 Parsing ${fileType} file: ${file.originalname}`);

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

            // Buffer.toString('utf-8') - 把二进制数据转换成文本
            const text = file.buffer.toString('utf-8');

            console.log(`Extracted ${text.length} characters from text file`);

            // 清理文本（去除多余空格、换行等）
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

            const data = await pdfParse(file.buffer);

            console.log(`Extracted ${data.text.length} characters from PDF (${data.numpages} pages)`);

            // data.text - PDF 中提取的文本
            // data.numpages - PDF 的页数
            // data.info - PDF 的元信息（标题、作者等）

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

            // 使用 mammoth 库解析 Word 文档
            const result = await mammoth.extractRawText({ buffer: file.buffer });

            console.log(`Extracted ${result.value.length} characters from Word`);

            if (result.messages.length > 0) {
                console.warn('⚠️ Word parsing warnings:', result.messages);
            }

            // result.value - 提取的文本
            // result.messages - 解析过程中的警告信息

            return this.cleanText(result.value);

        } catch (error) {
            throw new Error(`Failed to parse Word document: ${error.message}`);
        }
    }

    cleanText(text) {
        return text
            .replace(/\r\n/g, '\n')        // Windows 换行符 → Unix 换行符
            .replace(/\n{3,}/g, '\n\n')    // 多个空行 → 最多 2 个空行
            .replace(/[ \t]+/g, ' ')       // 多个空格/Tab → 单个空格
            .trim();                        // 去除首尾空白
    }

    getFileType(fileName) {
        // 'document.pdf'.split('.') → ['document', 'pdf']
        // .pop() → 取最后一个元素 'pdf'
        // .toLowerCase() → 转小写 'pdf'
        return fileName.split('.').pop().toLowerCase();
    }

    isSupportedType(fileName) {
        const supportedTypes = ['txt', 'md', 'pdf', 'docx'];
        const fileType = this.getFileType(fileName);
        return supportedTypes.includes(fileType);
    }
}

module.exports = FileParser;