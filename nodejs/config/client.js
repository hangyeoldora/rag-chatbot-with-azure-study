const path = require("path");
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { CosmosClient } = require('@azure/cosmos');

/**
 * 참고 사항
 * - 자습서에서 사용하는 credential 방법은 aad 인증 토큰이 있어야 가능
 *  const { DefaultAzureCredential } = require('@azure/identity');
 *  const credential = new DefaultAzureCredential();
 * - 따라서 npm @azure/cosmos readme 참고하여 엔드포인트와 키만으로 인증 진행 필요
 * https://www.npmjs.com/package/@azure/cosmos#read-an-item
 */

// cosmos client 생성
const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_DB_ENDPOINT,
  key: process.env.ACCOUNT_KEY,
});

/**
 * container 반환
 * - 추후 db, container name env로 변경
 * @returns {object} containerç
 */
const getContainer = async () => {
  // 특정 DB 선택
  const { database } = await cosmosClient.databases.createIfNotExists({
    id: "hybridTest",
  });
  // 특정 컨테이너 (테이블) 선택
  const { container } = await database.containers.createIfNotExists({
    id: "ragContainer2",
  });
  return container;
};

module.exports = { cosmosClient, getContainer };
