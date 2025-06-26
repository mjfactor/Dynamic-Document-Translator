// IMPORTANT - Add your API keys here. Be careful not to publish them.
process.env.OPENAI_API_KEY = "sk-...";
process.env.TAVILY_API_KEY = "tvly-...";

import { TavilySearch } from "@langchain/tavily";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

// Define the tools for the agent to use
const agentTools = [new TavilySearch({ maxResults: 3 })];
const agentModel = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0.4
});

// Initialize memory to persist state between graph runs
const agentCheckpointer = new MemorySaver();
const agent = createReactAgent({
    llm: agentModel,
    tools: agentTools,
    checkpointSaver: agentCheckpointer,
});

export async function runAgentDemo() {
    try {
        // First query about SF weather
        const agentFinalState = await agent.invoke(
            { messages: [new HumanMessage("what is the current weather in sf")] },
            { configurable: { thread_id: "42" } },
        );

        console.log(
            "SF Weather:",
            agentFinalState.messages[agentFinalState.messages.length - 1].content,
        );

        // Follow-up query about NY weather
        const agentNextState = await agent.invoke(
            { messages: [new HumanMessage("what about ny")] },
            { configurable: { thread_id: "42" } },
        );

        console.log(
            "NY Weather:",
            agentNextState.messages[agentNextState.messages.length - 1].content,
        );

        return {
            sfWeather: agentFinalState.messages[agentFinalState.messages.length - 1].content,
            nyWeather: agentNextState.messages[agentNextState.messages.length - 1].content,
        };
    } catch (error) {
        console.error("Error running agent demo:", error);
        throw error;
    }
}

runAgentDemo()