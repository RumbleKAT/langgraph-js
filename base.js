const { ChatOllama } = require("@langchain/ollama");
const { LLMChain } = require("langchain/chains");
const {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate
} = require("@langchain/core/prompts");

const chat = new ChatOllama({
    model: "llama3.1:8b"
});

const baseProductInfo = `다음은 각 productId에 대한 기본 정보입니다:

- productId 123: "SuperWidget"이라는 이름의 가상 제품이며, 주로 "Tool" 카테고리에 속합니다.
- productId 999: "MegaWidget"이라는 이름의 프리미엄 제품이며, "Gadget" 카테고리에 속합니다.
`;

const newJson = {
    productId: 123,
    price: 49.99,
    inStock: true,
    description: "Latest version with enhanced durability"
  };
  

  const prompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(baseProductInfo),
    HumanMessagePromptTemplate.fromTemplate(`
  아래 JSON 데이터를 해석해 주세요. 
  특히 "productId"가 위에 제공된 베이스 정보와 어떤 관련이 있는지 설명해 주시고,
  제품에 대한 간단한 요약도 만들어 주세요.
  
  새 JSON:
  \`\`\`json
  {newJson}
  \`\`\`
  `)
  ]);

async function run() {
    const chain = new LLMChain({
        llm: chat,
        prompt
    });

    // 새 JSON을 템플릿의 {newJson} 자리에 바인딩
    const response = await chain.call({
        newJson: JSON.stringify(newJson, null, 2)
    });

    console.log("=== Ollama 응답 ===");
    console.log(response.text);
}

(async function(){
    run().catch(console.error);
})();  