import 'reflect-metadata';
import '@shared/container';
import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';

import { router } from './routes';

config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/api/v1', router);

export { app };
