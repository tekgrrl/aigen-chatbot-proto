const axios = require('axios');
const { ChatHistory } = require('./models/ChatHistory');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; 
const OLLAMA_ENDPOINT = process.env.OLLAMA_ENDPOINT;

const sendToOpenAI = async (prompt, temperature, additionalContext) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v4/completions',
      {
        model: process.env.OPENAI_MODEL, // Dynamically set based on environment variable
        prompt: `${additionalContext}\n\n${prompt}`,
        temperature: temperature,
        max_tokens: 150,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );
    console.log("OpenAI response received");
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error(`Error calling OpenAI API: ${error.message}`, error.stack);
    throw new Error('Failed to get response from OpenAI');
  }
};

const sendToOllama = async (prompt, temperature, additionalContext) => {
  try {
    const response = await axios.post(
      OLLAMA_ENDPOINT,
      {
        prompt: `${additionalContext}\n\n${prompt}`,
        temperature: temperature,
        max_tokens: 150,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    console.log("Ollama response received");
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error(`Error calling Ollama API: ${error.message}`, error.stack);
    throw new Error('Failed to get response from Ollama');
  }
};

const saveChatHistory = async (userId, prompt, response) => {
  try {
    await ChatHistory.create({
      userId,
      prompt,
      response,
      timestamp: new Date(),
    });
    console.log('Chat history saved successfully');
  } catch (error) {
    console.error(`Error saving chat history: ${error.message}`, error.stack);
    throw new Error('Failed to save chat history');
  }
};

module.exports = { sendToOpenAI, sendToOllama, saveChatHistory };