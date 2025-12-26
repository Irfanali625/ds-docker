import dotenv from 'dotenv';
import { runDataCleaningJob } from '../services/dataCleaningService';
import { connectDB } from '../database/db';

dotenv.config();

async function run() {
  console.log('Starting manual data cleaning job...');
  try {
    await connectDB();
    
    await runDataCleaningJob();
    console.log('Manual job finished successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Manual job failed:', err);
    process.exit(1);
  }
}

run();
