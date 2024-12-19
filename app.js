const { ChatOllama } = require("@langchain/ollama");

const model = new ChatOllama({
  model: "llama3.1:8b",  // Default value.
});

(async function(){
  const result = await model.invoke(["human", "Hello, how are you?"]);
  console.log(result);
})();
