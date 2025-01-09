const path = require("path");
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { CosmosClient } = require('@azure/cosmos');

// 자습서에서 사용하는 credential은 aad 인증 코드가 있어야 함. npm @azure/cosmos readme 참고하여 엔드포인트와 키만으로 인증 진행 필요
// const { DefaultAzureCredential } = require('@azure/identity');
// const credential = new DefaultAzureCredential();

// cosmos client 생성
const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_DB_ENDPOINT,
  key: process.env.ACCOUNT_KEY,
})

module.exports = cosmosClient;