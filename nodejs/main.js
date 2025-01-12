// https://learn.microsoft.com/ko-kr/azure/cosmos-db/nosql/quickstart-nodejs?pivots=programming-language-js#create-an-item 참조

// 테스트 대상 파일명 변경
const main = require('./HybridSearchContainer');

main().then((res) => {
  res && console.log('최종 결과: ', res);
  console.log('=== azure cosmos db 테스트 완료 ===');
}).catch(err => {
  console.error('에러 발생: ', err);
});