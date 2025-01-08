const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const path = require("path");
const { AzureOpenAIEmbeddings } = require("@langchain/openai");
const { v4: uuidv4 } = require("uuid");

/**
 * container 반환
 * @returns {object} container
 */
const getContainer = async (client) => {
  // 특정 DB 선택
  const { database } = await client.databases.createIfNotExists({
    id: "cosmicworks",
    partitionKey: {
      paths: ["/partitionKey"],
    },
  });
  // 특정 컨테이너 (테이블) 선택
  const { container } = await database.containers.createIfNotExists({
    id: "vectorTest",
    partitionKey: {
      paths: ["/partitionKey"],
    },
  });

  return container;
};
  
/**
 * 컨테이너에 item 저장
 * @param {*} container 
 * @param {*} param1 
 */
const upsert2Container = async (container, {title, content, loc, contentVector}) => {
  // id - uuid                           
  const uuidRes = await uuidv4();

  const item = {
    id: uuidRes,
    partitionKey: "test",
    title,
    content,
    loc, // pdf 페이지 번호
    contentVector, // content 임베딩 값
  };

  let response = await container.items.upsert(item);
  console.log(response);
};

/**
 * 데이터 저장
 * @param {object} client 
 * @returns 
 */
const storeDataInDatabase = async (client) => {
  try {
    const container = await getContainer(client);
    console.log("Hello, Azure Cosmos DB!");
    // pdf 로드
    const pdf_path = path.join(__dirname, "./labs.pdf");
    const pdfLoader = new PDFLoader(pdf_path);
    const result = await pdfLoader.load();

    // embedding 모델 표현
    const embeddings = new AzureOpenAIEmbeddings({
      azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
      azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
      azureOpenAIApiEmbeddingsDeploymentName:
        process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME,
      azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
      modelName: "text-embedding-3-small",
      maxRetries: 3,
    });

    // pdf content 출력
    for await (const page of result) {
      const embedPageContentResult = await embeddings.embedQuery(page.pageContent);
      const props = {
        title: page.metadata.pdf.info.Title,
        loc: page.metadata.loc?.pageNumber || '',
        content: page.pageContent,
        contentVector: embedPageContentResult,
      }
      await upsert2Container(container, props);
    }
    console.log('-- 끝 --')
    return '저장 완료';
  } catch (err) {
    console.error(err);
    throw err;
  };
};

/**
 * main 함수
 * @param {object} client
 */
async function main(client) {
  const res = await storeDataInDatabase(client);
  console.log('insert data result: ', res);
}

module.exports = main;