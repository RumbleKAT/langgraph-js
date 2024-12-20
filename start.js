const fs = require("fs");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const {
  RunnablePassthrough,
  RunnableSequence,
} = require("@langchain/core/runnables");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { ChatOllama, OllamaEmbeddings } = require("@langchain/ollama");

(async function(){

    const formatDocumentsAsString = (documents) => {
        return documents.map((document) => document.pageContent).join("\n\n");
    };
    // Initialize the LLM to use to answer the question.
    const model = new ChatOllama({
        model: "llama3.1:8b",  // Default value.
        temperature: 0,
    });
  
    const text = fs.readFileSync("state_of_the_union.txt", "utf8");
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
    const docs = await textSplitter.createDocuments([text]);
    
    const embeddings = new OllamaEmbeddings({
        model: "mxbai-embed-large", // Default value
        baseUrl: "http://127.0.0.1:11434", // Default value
    });
    
    // Create a vector store from the documents.
    const vectorStore = await MemoryVectorStore.fromDocuments(
        docs,
        embeddings
    );
  
    // Initialize a retriever wrapper around the vector store
    const vectorStoreRetriever = vectorStore.asRetriever();
    
    // Create a system & human prompt for the chat model
    const SYSTEM_TEMPLATE = `Use the following pieces of context to answer the question at the end.
    If you don't know the answer, just say that you don't know, don't try to make up an answer.
    ----------------
    {context}`;
  
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", SYSTEM_TEMPLATE],
        ["human", "{question}"],
    ]);
    
    const chain = RunnableSequence.from([
        {
        context: vectorStoreRetriever.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(),
        },
        prompt,
        model,
        new StringOutputParser(),
    ]);
    const answer = await chain.invoke(
        "What did the president say about Justice Breyer?"
    );  
    console.log({ answer });  
})();
/*
  {
    answer: 'The president honored Justice Stephen Breyer by recognizing his dedication to serving the country as an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. He thanked Justice Breyer for his service.'
  }
*/