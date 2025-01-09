const {
  VectorEmbeddingDataType,
  VectorIndexType,
  VectorEmbeddingDistanceFunction,
} = require("@azure/cosmos");
const cosmosClient = require("./config/client");

/**
 * db 연결 및 생성, 벡터 검색을 위한 벡터 컨테이너와 정책 생성
 */
async function main() {
  console.log("Hello, Azure Cosmos DB!");
  try {
    /** 전체 DB 가져오기 */
    await cosmosClient.databases
      .readAll()
      .fetchAll()
      .then((response) => {
        // console.log(response.resources);
      });

    /** 특정 DB 선택 */
    const { database } = await cosmosClient.databases.createIfNotExists({
      id: "cosmicworks",
    });

    /** 특정 컨테이너 (테이블) 선택 */
    const { container } = await database.containers.createIfNotExists({
      id: "vectorTest",
    });

    /** 컨테이너 내 전체 조회 쿼리 */
    await container.items
      .query("SELECT * from c")
      .fetchAll()
      .then((response) => {
        console.log("response:", response.resources[0]);
      });

    /** 컨테이너 내 item 전체 출력 */
    await container.items
      .readAll()
      .fetchAll()
      .then((response) => {
        // console.log(response);
      });

    /** 검색할 아이템의 id와 파티션 키를 지정하여 조회 */
    const id = "aaaaaaaa-0000-1111-2222-bbbbbbbbbbbb";
    const partitionKey = "Logistics";
    const result = await container.item(id, partitionKey).read();
    // console.log(result);

    /** 벡터 검색을 위한 벡터 전용 db 및 정책 생성 */
    const containerName = "vectorTest";

    // 벡터 임베딩 정책
    const vectorEmbeddingPolicy = {
      vectorEmbeddings: [
        // {
        //   path: "/coverImageVector",
        //   dataType: VectorEmbeddingDataType.Float32,
        //   dimensions: 8,
        //   distanceFunction: VectorEmbeddingDistanceFunction.DotProduct,
        // },
        {
          path: "/contentVector",
          dataType: VectorEmbeddingDataType.Float32,
          dimensions: 1536,
          distanceFunction: VectorEmbeddingDistanceFunction.Cosine,
        },
      ],
    };
    // 인덱싱 정책
    const indexingPolicy = {
      vectorIndexes: [
        // { path: "/coverImageVector", type: VectorIndexType.QuantizedFlat },
        { path: "/contentVector", type: VectorIndexType.DiskANN },
      ],
      includedPaths: [
        {
          path: "/*",
        },
      ],
      excludedPaths: [
        // {
        //   path: "/coverImageVector/*",
        // },
        {
          path: "/contentVector/*",
        },
      ],
    };

    /** 벡터 컨테이너 생성 */
    const { resource } = await database.containers.createIfNotExists({
      id: containerName,
      vectorEmbeddingPolicy: vectorEmbeddingPolicy,
      indexingPolicy: indexingPolicy,
    });

    // console.log('resource: ', resource);
    return 'db 생성 완료'
  } catch (err) {
    throw err;
  };
}

module.exports = main;
