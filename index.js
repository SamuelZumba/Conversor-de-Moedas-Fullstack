const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const exchangeRates = {
  USD: 1,
  BRL: 5.0,
  EUR: 0.92,
  GBP: 0.79,
  BTC: 0.000015
};

app.get('/convert', (req, res) => {
  const { from, to, amount } = req.query;
  
  if (!exchangeRates[from] || !exchangeRates[to]) {
    return res.status(400).json({ error: "Moeda não suportada" });
  }

  const amountInUsd = amount / exchangeRates[from];
  const result = amountInUsd * exchangeRates[to];

  const precision = to === 'BTC' ? 8 : 2;

  res.json({ 
    result: result.toFixed(precision),
    from,
    to,
    amount 
  });
});

app.listen(3001, () => console.log("Servidor Node rodando na porta 3001"));