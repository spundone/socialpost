import express from 'express';
import cors from 'cors';
import { PostFormatter } from './services/formatter';
import { FormatRequest, FormatResponse } from './types';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/format', (req, res) => {
  try {
    const { markdown, platforms } = req.body as FormatRequest;
    
    if (!markdown || !platforms || !Array.isArray(platforms)) {
      return res.status(400).json({ error: 'Invalid request format' });
    }

    const posts = platforms.flatMap(platform => 
      PostFormatter.formatPost(markdown, platform)
    );

    const response: FormatResponse = { posts };
    res.json(response);
  } catch (error) {
    console.error('Error formatting post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 