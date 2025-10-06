import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config(); // Make sure to load the .env file

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Helper function to call the Hugging Face API
async function queryHuggingFace(prompt) {
  const model = "mistralai/Mistral-7B-Instruct-v0.1";
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // This is the crucial line that adds your authentication token
        "Authorization": `Bearer ${process.env.HF_TOKEN}`
      },
      body: JSON.stringify({ "inputs": prompt }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Hugging Face API Error: ${response.statusText} - ${errorBody}`);
  }

  const result = await response.json();
  const generatedText = result[0].generated_text;
  
  const jsonStart = generatedText.lastIndexOf('{'); // Find the last '{' to get the start of the JSON
  const jsonEnd = generatedText.lastIndexOf('}');
  
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("AI did not return valid JSON.");
  }
  
  const jsonString = generatedText.substring(jsonStart, jsonEnd + 1);
  return JSON.parse(jsonString);
}

// The rest of your endpoints (/generate-question, /generate-exam) remain exactly the same
// ...

app.listen(port, () => {
  console.log(`✅ AI server (powered by Hugging Face) is running on http://localhost:${port}`);
});