## Project Details

This project was generated by [GPT Pilot / Pythagora](https://github.com/Pythagora-io/gpt-pilot). It doesn't work as GPT Pilot struggled with the MongoDB connection, potentially because auth was via X509 Cert. 

The problem was related to the Mongoose Node module not being able to connect to the MongoDB Atlas instance which worked fine with MongoClient. I told the AI not to use Mongoose and as it went through it's Code Review process it fixed the issues that came up by reverting to Mongoose. At that point I gave up as it was just burning through by OpenAI credits.
