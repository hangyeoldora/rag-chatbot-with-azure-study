const { getContainer } = require("./config/client");
const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const { AzureOpenAIEmbeddings } = require("@langchain/openai");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

/**
 * 컨테이너에 item 저장
 * @param {*} container 
 * @param {*} param1 
 */
const upsert2Container = async (container, {title, content, loc, contentVector}) => {
  const uuidRes = await uuidv4(); // id를 위한 uuid 생성

  const item = {
    id: uuidRes,
    filename: 'skelter',
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
 * @param {object} cosmosClient 
 * @returns 
 */
const storeDataInDatabase = async (cosmosClient) => {
  try {
    const container = await getContainer(cosmosClient);
    // pdf 로드
    const pdf_path = path.join(__dirname, "./labs.pdf");
    const pdfLoader = new PDFLoader(pdf_path);
    const result = await pdfLoader.load();

    // embedding 모델 객체 생성
    const embeddings = new AzureOpenAIEmbeddings({
      azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
      azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
      azureOpenAIApiEmbeddingsDeploymentName:
        process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME,
      azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
      modelName: process.env.AZURE_OPENAI_EMBEDDINGS_MODEL_NAME,
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
 * 메인 실행 함수
 */
async function main() {
  const res = await storeDataInDatabase();
  console.log('insert data result: ', res);
  console.log('저장 로직 실행')
}

module.exports = main;