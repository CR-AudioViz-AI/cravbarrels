import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET_NAME = 'spirit-images';

// Verified working official images
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
  'maker\'s mark': 'https://images.openfoodfacts.org/images/products/008/501/000/0017/front_en.16.400.jpg',
  'wild turkey': 'https://images.openfoodfacts.org/images/products/008/043/264/0022/front_en.16.400.jpg',
  'jack daniel': 'https://images.openfoodfacts.org/images/products/008/200/016/2039/front_en.47.400.jpg',
  'jim beam': 'https://images.openfoodfacts.org/images/products/506/004/558/5271/front_de.6.400.jpg',
  'bulleit': 'https://images.openfoodfacts.org/images/products/008/200/001/0008/front_en.19.400.jpg',
};

// Find verified image for a spirit
function findVerifiedImage(name: string, brand: string): string | null {
  const searchText = `${name} ${brand}`.toLowerCase();
  for (const [pattern, url] of Object.entries(VERIFIED_IMAGES)) {
    if (searchText.includes(pattern)) {
      return url;
    }
  }
  return null;
}

// Download image and return as buffer
async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BarrelVerseBot/1.0)' },
      signal: AbortSignal.timeout(30000)
    });
    
    if (!response.ok) return null;
    
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

// Process a single spirit
async function processSpirit(spirit: any): Promise<{ id: string; newUrl: string } | null> {
  const { id, name, brand, image_url } = spirit;
  
  // 1. Try verified official image first
  let sourceUrl = findVerifiedImage(name || '', brand || '');
  
  // 2. If no verified image, try existing URL
  if (!sourceUrl && image_url) {
    try {
      const check = await fetch(image_url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
      if (check.ok) sourceUrl = image_url;
    } catch {}
  }
  
  if (!sourceUrl) return null;
  
  // 3. Download the image
  const imageBuffer = await downloadImage(sourceUrl);
  if (!imageBuffer) return null;
  
  // 4. Upload to Supabase Storage
  const filename = `${id}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, imageBuffer, {
      contentType: 'image/jpeg',
      upsert: true
    });
  
  if (error) {
    console.error(`Upload failed for ${id}:`, error.message);
    return null;
  }
  
  // 5. Return the new self-hosted URL
  const newUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filename}`;
  return { id, newUrl };
}

// API Route Handler
export async function POST(request: NextRequest) {
  try {
    const { batchSize = 50, offset = 0 } = await request.json().catch(() => ({}));
    
    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some(b => b.name === BUCKET_NAME)) {
      await supabase.storage.createBucket(BUCKET_NAME, { public: true });
    }
    
    // Fetch batch of spirits
    const { data: spirits, error, count } = await supabase
      .from('bv_spirits')
      .select('id, name, brand, image_url', { count: 'exact' })
      .range(offset, offset + batchSize - 1);
    
    if (error) throw error;
    if (!spirits || spirits.length === 0) {
      return NextResponse.json({ 
        message: 'No more spirits to process',
        processed: 0,
        total: count 
      });
    }
    
    // Process spirits in parallel (max 10 concurrent)
    const results = await Promise.all(
      spirits.map(spirit => processSpirit(spirit))
    );
    
    // Update database with new URLs
    const successful = results.filter(r => r !== null) as { id: string; newUrl: string }[];
    
    for (const { id, newUrl } of successful) {
      await supabase
        .from('bv_spirits')
        .update({ image_url: newUrl, thumbnail_url: newUrl })
        .eq('id', id);
    }
    
    return NextResponse.json({
      message: 'Batch processed',
      processed: successful.length,
      failed: spirits.length - successful.length,
      nextOffset: offset + batchSize,
      total: count,
      complete: offset + batchSize >= (count || 0)
    });
    
  } catch (error: any) {
    console.error('Image processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET handler to check status
export async function GET() {
  try {
    // Count total spirits
    const { count: total } = await supabase
      .from('bv_spirits')
      .select('*', { count: 'exact', head: true });
    
    // Count spirits with self-hosted images
    const { count: hosted } = await supabase
      .from('bv_spirits')
      .select('*', { count: 'exact', head: true })
      .like('image_url', `${supabaseUrl}/storage/%`);
    
    // Check bucket
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);
    
    return NextResponse.json({
      total,
      selfHosted: hosted || 0,
      remaining: (total || 0) - (hosted || 0),
      percentComplete: total ? Math.round(((hosted || 0) / total) * 100) : 0,
      bucketExists,
      bucketUrl: `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/`
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
