import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max for Vercel Pro

const BATCH_SIZE = 100;
const API_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}/api/images/process`
  : 'http://localhost:3000/api/images/process';

export async function GET() {
  const startTime = Date.now();
  const results: any[] = [];
  let offset = 0;
  let complete = false;
  let totalProcessed = 0;
  let totalFailed = 0;
  
  console.log('🖼️ Starting automated image processing cron job...');
  
  // Process multiple batches within the time limit
  while (!complete && (Date.now() - startTime) < 270000) { // Leave 30s buffer
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchSize: BATCH_SIZE, offset })
      });
      
      const result = await response.json();
      results.push(result);
      
      totalProcessed += result.processed || 0;
      totalFailed += result.failed || 0;
      offset = result.nextOffset || offset + BATCH_SIZE;
      complete = result.complete || false;
      
      console.log(`Batch complete: ${result.processed} processed, offset now ${offset}`);
      
      if (result.processed === 0 && result.failed === 0) {
        // No more to process
        break;
      }
      
    } catch (error: any) {
      console.error('Batch error:', error.message);
      results.push({ error: error.message });
      break;
    }
  }
  
  const duration = Math.round((Date.now() - startTime) / 1000);
  
  return NextResponse.json({
    message: complete ? 'All images processed!' : 'Partial processing complete (will continue next run)',
    duration: `${duration}s`,
    totalProcessed,
    totalFailed,
    batchesRun: results.length,
    complete
  });
}
