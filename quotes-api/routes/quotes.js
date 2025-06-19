import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const getQuotes = () => {
  const filePath = path.resolve('data', 'quotes.json');
  const quotesRaw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(quotesRaw);
};

router.get('/', (req, res) => {
  const quotes = getQuotes();
  res.json(quotes);
});

router.get('/random', (req, res) => {
  const quotes = getQuotes();
  const count = parseInt(req.query.count) || 1;
  const shuffled = quotes.sort(() => 0.5 - Math.random());
  res.json(shuffled.slice(0, count));
});

export default router;
