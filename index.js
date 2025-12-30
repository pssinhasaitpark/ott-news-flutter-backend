import express from 'express';
import dotenv from 'dotenv';
import connectDB from './app/dbConfig/dbConfig.js';
import setupRoutes from './app/routes/index.js';
import morgan from 'morgan';
import cors from 'cors';

dotenv.config();

const app = express();
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
}));

app.use(express.json());

app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('OTT News Backend Running');
});

connectDB(); 
setupRoutes(app);

app.listen(PORT,HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});