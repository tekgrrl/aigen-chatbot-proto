module.exports = function(app) {
  const { isAuthenticated } = require("./middleware/authMiddleware");
  const { sendToOpenAI, sendToOllama } = require("./aiServices");

  app.post('/chat', isAuthenticated, async (req, res) => {
    const { message, temperature, contextURL } = req.body;
    let response;
    try {
      console.log(`Received chat request with message: ${message}, temperature: ${temperature}, contextURL: ${contextURL}`);
      if (temperature > 0.7) {
        console.log("Sending prompt to OpenAI");
        response = await sendToOpenAI(message, temperature, contextURL);
      } else {
        console.log("Sending prompt to Ollama");
        response = await sendToOllama(message, temperature, contextURL);
      }
      console.log("Received response from AI service");
      res.json({ message: response });
    } catch (error) {
      console.error("Error processing chat prompt:", error.message, error.stack);
      res.status(500).send("Failed to process chat prompt.");
    }
  });
};