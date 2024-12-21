const { ChatOllama } = require("@langchain/ollama");
const {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate
} = require("@langchain/core/prompts");
const { z } = require("zod");

const chat = new ChatOllama({
    model: "llama3.1:8b"
});
const schema = z.object({
    productId: z.number().describe("상품 식별자"),
    analysis: z.string().describe("상품에 대한 분석 텍스트"),
    mergedData: z.object({
      name: z.string().optional(),
      price: z.number().optional(),
      inStock: z.boolean().optional(),
      description: z.string().optional(),
      extraField: z.string().optional(),
    }).describe("기준 데이터와 새 데이터 병합 결과")
  });

const structuredOllama = chat.withStructuredOutput(schema);
const systemTemplate = `
다음은 기준 JSON(레퍼런스)입니다:
\`\`\`json
{baselineJson}
\`\`\`

이제 모델은 항상 이 정보를 참고해야 합니다.
`;

const humanTemplate = `
새로운 JSON 데이터가 도착했습니다:
\`\`\`json
{newJson}
\`\`\`

위 기준 JSON과 새 JSON을 비교하여 다음 JSON 스키마로 답해주세요:
- \`productId\`: (number) 상품 식별자
- \`analysis\`: (string) 비교/분석 내용
- \`mergedData\`: (object) 기준과 새 정보를 합쳐서 유의미한 필드를 구성한 결과

**추가 설명 없이** 오직 JSON만 출력해야 하며, 스키마 외 필드는 넣지 마세요.
`;

const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(systemTemplate),
    HumanMessagePromptTemplate.fromTemplate(humanTemplate),
  ]);

  const baselineJson = {
    productId: 123,
    name: "SuperWidget",
    price: 49.99,
    description: "An imaginary product for demonstration"
  };
  
  const newJson = {
    productId: 123,
    price: 54.99,
    inStock: true,
    extraField: "Extra data field"
  };

async function run() {
    const messages = await chatPrompt.format({
        baselineJson: JSON.stringify(baselineJson, null, 2),
        newJson: JSON.stringify(newJson, null, 2)
      });
    const response = await structuredOllama.invoke(messages);
    console.log("=== Parsed JSON Response ===");
    console.log(response);
}

(async function(){
    run().catch(console.error);
})();  