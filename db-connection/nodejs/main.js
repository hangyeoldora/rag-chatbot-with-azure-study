const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const { CosmosClient } = require("@azure/cosmos");

// 자습서에서 사용하는 credential은 aad 인증 코드가 있어야 함. npm @azure/cosmos readme 참고하여 엔드포인트와 키만으로 인증 진행 필요
// const { DefaultAzureCredential } = require('@azure/identity');
// const credential = new DefaultAzureCredential();

const client = new CosmosClient({
  endpoint: process.env.COSMOS_DB_ENDPOINT,
  key: process.env.ACCOUNT_KEY,
});
async function main() {
  // console.log(await client)
  console.log("Hello, Azure Cosmos DB!");

  /** 전체 DB 가져오기 */
  await client.databases
    .readAll()
    .fetchAll()
    .then((response) => {
      // console.log(response.resources);
    });

  /** 특정 DB 선택 */
  const { database } = await client.databases.createIfNotExists({
    id: "cosmicworks",
  });
  /** 특정 컨테이너 (테이블) 선택 */
  const { container } = await database.containers.createIfNotExists({
    id: "employees",
  });
  /** 컨테이너 내 item 전체 출력 */
  await container.items
    .readAll()
    .fetchAll()
    .then((response) => {
      // console.log(response);
    });

  // 검색할 아이템의 id와 파티션 키를 지정하여 조회
  const id = "aaaaaaaa-0000-1111-2222-bbbbbbbbbbbb";
  const partitionKey = "Logistics";
  const result = await container.item(id, partitionKey).read();
  console.log(result);

  /** 컨테이너 내 전체 조회 쿼리 */
  const { resources } = await container.items
    .query("SELECT * from c")
    .fetchAll();
  // console.log('resources:', resources);
}

main().catch((err) => {
  console.error(err);
});
