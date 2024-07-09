const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3500;

app.use(bodyParser.json());

let serverTypeNumber = null;

app.post('/', (req, res) => {
  const { number } = req.body;
  serverTypeNumber = number;
  console.log(`Received number: ${number}`);
  res.json({ message: `Number ${number} received` });
});

app.get('/', (req, res) => {
  if (serverTypeNumber !== null) {
    res.json({ type: serverTypeNumber });
  } else {
    res.json({ message: 'No number received yet' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
