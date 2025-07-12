const express = require('express');
const translateText = require('./services/translate');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = 3000;

app.use(express.json());

// API ENDPOINT to translate text to the selected language
app.post('/translate', async (req, res) => {
    const { text, source, target } = req.body;
    const translatedText = await translateText(text, source, target);
    res.send(translatedText);
});

app.listen(PORT, () => {
    console.log("App is listening on the port", PORT);
});