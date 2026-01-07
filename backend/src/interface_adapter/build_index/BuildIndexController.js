const BuildIndex = require('../../use_case/build_index/BuildIndex');
const MongoDocumentRepository = require('../MongoDocumentRepository');
// 注意：需要先创建MongoIndexRepository
// const MongoIndexRepository = require('../MongoIndexRepository');

/**
 * BuildIndexController
 *
 * 职责：处理HTTP请求，调用Use Case构建索引
 *
 * 流程：
 * 1. 接收HTTP请求（POST /index/build）
 * 2. 创建具体的Repository实现
 * 3. 创建Use Case实例
 * 4. 调用Use Case执行索引构建
 * 5. 返回结果
 */
class BuildIndexController {
    async handle(req, res) {
        try {
            // 创建具体的Repository实现
            const documentRepository = new MongoDocumentRepository();

            // TODO: 需要先创建MongoIndexRepository
            // 如果还没有实现，可以先创建一个简单的内存实现用于测试
            // const indexRepository = new MongoIndexRepository();

            // 临时方案：如果MongoIndexRepository还没实现，可以先用内存实现
            // 或者先创建MongoIndexRepository（见下面的说明）

            // 创建Use Case实例（依赖注入）
            const buildIndexUseCase = new BuildIndex(documentRepository, indexRepository);

            // 执行索引构建
            const result = await buildIndexUseCase.execute();

            return res.status(200).json(result);

        } catch (error) {
            console.error('Error in BuildIndexController:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = BuildIndexController;
