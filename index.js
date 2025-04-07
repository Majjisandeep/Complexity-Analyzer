const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const analyzeCode = require('./complexityAnalyzer');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/analyze', (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: "No code provided!" });
    }

    const result = analyzeCode(code);
    res.json(result);
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
