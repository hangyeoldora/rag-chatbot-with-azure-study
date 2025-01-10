const {
  VectorEmbeddingDataType,
  VectorIndexType,
  VectorEmbeddingDistanceFunction,
} = require("@azure/cosmos");
const { cosmosClient } = require("./config/client");

/**
 * db 연결 및 생성, 벡터 검색을 위한 벡터 컨테이너와 정책 생성
 */
async function main() {
  console.log("Hello, Azure Cosmos DB!");
  try {

    /** 특정 DB 선택 */
    const { database } = await cosmosClient.databases.createIfNotExists({
      id: "hybridTest",
    });

    /** 벡터 검색을 위한 벡터 전용 db 및 정책 생성 */
    const containerName = "ragContainer2";

    // 벡터 임베딩 정책
    const vectorEmbeddingPolicy = {
      vectorEmbeddings: [
        {
          path: "/contentVector",
          dataType: VectorEmbeddingDataType.Float32,
          dimensions: 1536,
          distanceFunction: VectorEmbeddingDistanceFunction.Cosine,
        },
      ],
    };
    // Full-text 검색 정책
    const fullTextPolicy = {
      efaultLanguage: "en-US",
      fullTextPaths: [
        { path: "/content", language: "en-US" },
      ],
    };

    // 인덱싱 정책
    const indexingPolicy = {
      indexingMode: "consistent",
      automatic: true,
      includedPaths: [
        {
          path: "/*" // 모든 필드 포함
        }
      ],
      excludedPaths: [
        {
          path: "/\"_etag\"/?"
        },
        {
          path: "/contentVector/*",
        }
      ],
      fullTextIndexes: [
        {
          path: "/content"
        }
      ],
      vectorIndexes: [
        {
          path: "/contentVector", // 벡터 필드
          type: VectorIndexType.DiskANN
        }
      ]
    };
    

    /** 벡터 컨테이너 생성 */
    const { resource } = await database.containers.createIfNotExists({
      id: containerName,
      partitionKey: '/filename',
      fullTextPolicy: fullTextPolicy,
      vectorEmbeddingPolicy: vectorEmbeddingPolicy,
      indexingPolicy: indexingPolicy,
    });

    console.log('resource: ', resource);

    return 'db 생성 완료'
  } catch (err) {
    throw err;
  };
}

module.exports = main;
