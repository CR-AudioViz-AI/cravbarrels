import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET_NAME = 'spirit-images';

// Verified working official images (HTTP 200 tested)
const VERIFIED_IMAGES: Record<string, string> = {
  'buffalo trace': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/11/BUFFALO_TRACE_BOTTLE-e1765117225509.png',
  'blanton': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/12/BLANTONS.png',
  'eagle rare': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/12/BOTTLE-EAGLE-RARE.png',
  'weller': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/11/WELLER-SPECIAL-RESERVE-PACKSHOT-PRODUCT-e1764158017233.png',
  'e.h. taylor': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/11/E.H.TAYLOR_SINGLE_BARREL_BOTTLE.png',
  'taylor': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/11/E.H.TAYLOR_SINGLE_BARREL_BOTTLE.png',
  'sazerac': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/11/Sazerac-Rye-Pack-Shot.png',
  'van winkle': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/11/OLD_-RIP_VAN_WINKLE_10_B0TTLE.png',
  'pappy': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/11/OLD_-RIP_VAN_WINKLE_10_B0TTLE.png',
  'traveller': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/11/TRAVELLER_BOTTLE.png',
  'michter': 'https://michters.com/wp-content/uploads/2025/01/BOURB750_418x1378100_2023.jpg',
};

function findVerifiedImage(name: string, brand: string): string | null {
  const searchText = `${name} ${brand}`.toLowerCase();
  for (const [pattern, url] of Object.entries(VERIFIED_IMAGES)) {
    if (searchText.includes(pattern)) {
      return url;
    }
  }
  return null;
}

async function downloadAndUpload(imageUrl: string, spiritId: string): Promise<string | null> {
  try {
    // Download the image
    const response = await fetch(imageUrl);
    if (!response.ok) return null;
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload to Supabase Storage
    const filename = `${spiritId}.jpg`;
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    
    // Return the public URL
    return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filename}`;
  } catch (error) {
    console.error('Download/upload error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { batch = 0, batchSize = 50 } = await request.json();
    
    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some(b => b.name === BUCKET_NAME)) {
      await supabase.storage.createBucket(BUCKET_NAME, { public: true });
    }
    
    // Fetch spirits for this batch
    const { data: spirits, error: fetchError } = await supabase
      .from('bv_spirits')
      .select('id, name, brand, image_url')
      .range(batch * batchSize, (batch + 1) * batchSize - 1);
    
    if (fetchError || !spirits) {
      return NextResponse.json({ error: 'Failed to fetch spirits' }, { status: 500 });
    }
    
    const results = {
      processed: 0,
      uploaded: 0,
      failed: 0,
      skipped: 0,
      updates: [] as { id: string; url: string }[]
    };
    
    for (const spirit of spirits) {
      results.processed++;
      
      // Find the best image URL
      let imageUrl = findVerifiedImage(spirit.name || '', spirit.brand || '');
      
      if (!imageUrl && spirit.image_url) {
        // Validate existing URL
        try {
          const check = await fetch(spirit.image_url, { method: 'HEAD' });
          if (check.ok) {
            imageUrl = spirit.image_url;
          }
        } catch {
          // URL is invalid
        }
      }
      
      if (!imageUrl) {
        results.skipped++;
        continue;
      }
      
      // Download and upload
      const newUrl = await downloadAndUpload(imageUrl, spirit.id);
      
      if (newUrl) {
        results.uploaded++;
        results.updates.push({ id: spirit.id, url: newUrl });
        
        // Update database
        await supabase
          .from('bv_spirits')
          .update({ image_url: newUrl, thumbnail_url: newUrl })
          .eq('id', spirit.id);
      } else {
        results.failed++;
      }
    }
    
    return NextResponse.json({
      batch,
      batchSize,
      ...results,
      hasMore: spirits.length === batchSize
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  // Get status/count
  const { count } = await supabase
    .from('bv_spirits')
    .select('*', { count: 'exact', head: true });
  
  return NextResponse.json({
    totalSpirits: count,
    bucketName: BUCKET_NAME,
    supabaseUrl
  });
}
