/**
 * CRAV Barrels - Batch Image Population API
 * 
 * POST /api/admin/populate-images
 * 
 * Automatically fetches and saves images for spirits that don't have them.
 * Uses Wikidata, Wikimedia Commons, and Openverse.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Rate limiting
const DELAY_BETWEEN_REQUESTS = 1500; // 1.5 seconds between API calls

interface ImageResult {
  url: string;
  thumbnail_url?: string;
  source: string;
  license: string;
  attribution: string;
  source_url: string;
  width?: number;
  height?: number;
}

/**
 * Search Wikimedia Commons for bottle images
 */
async function searchWikimedia(spiritName: string, brand?: string): Promise<ImageResult[]> {
  const searchTerms = brand ? `${brand} ${spiritName} bottle` : `${spiritName} bottle`;
  
  const params = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: searchTerms,
    srnamespace: '6',
    srlimit: '10',
    format: 'json',
    origin: '*'
  });

  const response = await fetch(
    `https://commons.wikimedia.org/w/api.php?${params}`,
    {
      headers: {
        'User-Agent': 'CRAVBarrels/1.0 (https://cravbarrels.com)'
      }
    }
  );

  if (!response.ok) return [];

  const data = await response.json();
  const results: ImageResult[] = [];

  for (const item of (data.query?.search || []).slice(0, 5)) {
    const imageInfo = await getImageInfo(item.title);
    if (imageInfo) {
      results.push(imageInfo);
    }
    await sleep(500);
  }

  return results;
}

/**
 * Get detailed image info from Wikimedia
 */
async function getImageInfo(fileTitle: string): Promise<ImageResult | null> {
  const params = new URLSearchParams({
    action: 'query',
    titles: fileTitle,
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
    format: 'json',
    origin: '*'
  });

  const response = await fetch(
    `https://commons.wikimedia.org/w/api.php?${params}`,
    {
      headers: {
        'User-Agent': 'CRAVBarrels/1.0 (https://cravbarrels.com)'
      }
    }
  );

  if (!response.ok) return null;

  const data = await response.json();
  const pages = data.query?.pages || {};
  const page = Object.values(pages)[0] as any;

  if (!page?.imageinfo?.[0]) return null;

  const info = page.imageinfo[0];
  const meta = info.extmetadata || {};

  let license = 'cc0';
  const licenseShort = (meta.LicenseShortName?.value || '').toLowerCase();
  if (licenseShort.includes('cc-by-sa')) license = 'cc-by-sa';
  else if (licenseShort.includes('cc-by')) license = 'cc-by';

  return {
    url: info.url,
    thumbnail_url: info.thumburl,
    source: 'wikimedia',
    license,
    attribution: meta.Artist?.value || 'Wikimedia Commons',
    source_url: `https://commons.wikimedia.org/wiki/${encodeURIComponent(fileTitle)}`,
    width: info.width,
    height: info.height
  };
}

/**
 * Search Openverse for images
 */
async function searchOpenverse(spiritName: string, brand?: string): Promise<ImageResult[]> {
  const searchTerms = brand ? `${brand} ${spiritName} bottle` : `${spiritName} whiskey bottle`;
  
  const params = new URLSearchParams({
    q: searchTerms,
    license: 'cc0,by,by-sa',
    mature: 'false',
    page_size: '10'
  });

  try {
    const response = await fetch(
      `https://api.openverse.org/v1/images/?${params}`,
      {
        headers: {
          'User-Agent': 'CRAVBarrels/1.0'
        }
      }
    );

    if (!response.ok) return [];

    const data = await response.json();

    return (data.results || []).slice(0, 5).map((item: any) => ({
      url: item.url,
      thumbnail_url: item.thumbnail,
      source: 'openverse',
      license: item.license || 'cc-by',
      attribution: item.attribution || item.creator || 'Unknown',
      source_url: item.foreign_landing_url || item.url,
      width: item.width,
      height: item.height
    }));
  } catch (error) {
    console.error('Openverse search failed:', error);
    return [];
  }
}

/**
 * Save image to database
 */
async function saveImage(spiritId: string, image: ImageResult, isPrimary: boolean) {
  const { data, error } = await supabase
    .from('spirit_images')
    .insert({
      spirit_id: spiritId,
      url: image.url,
      thumbnail_url: image.thumbnail_url,
      source: image.source,
      license: image.license,
      attribution_required: image.license !== 'cc0',
      attribution_text: image.attribution,
      source_url: image.source_url,
      width: image.width,
      height: image.height,
      status: 'approved',
      is_primary: isPrimary
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to save image:', error);
    return null;
  }

  return data;
}

/**
 * Update spirit with primary image
 */
async function updateSpiritPrimaryImage(spiritId: string, imageId: string) {
  await supabase
    .from('spirits')
    .update({ primary_image_id: imageId })
    .eq('id', spiritId);
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const limit = Math.min(body.limit || 50, 200); // Max 200 at a time
    const priorityOnly = body.priorityOnly || false;

    // Get spirits without images
    let query = supabase
      .from('spirits')
      .select('id, name, brand, spirit_type')
      .is('primary_image_id', null);

    if (priorityOnly) {
      // Priority spirits (popular brands)
      query = query.or('brand.ilike.%pappy%,brand.ilike.%buffalo trace%,brand.ilike.%makers mark%,brand.ilike.%jack daniels%,brand.ilike.%johnnie walker%,brand.ilike.%macallan%,brand.ilike.%glenfiddich%');
    }

    const { data: spirits, error } = await query.limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const results = {
      processed: 0,
      imagesFound: 0,
      imagesSaved: 0,
      spiritsWithImages: 0,
      errors: [] as string[]
    };

    for (const spirit of spirits || []) {
      results.processed++;

      try {
        // Search both sources
        const wikimediaImages = await searchWikimedia(spirit.name, spirit.brand);
        await sleep(DELAY_BETWEEN_REQUESTS);
        
        const openverseImages = await searchOpenverse(spirit.name, spirit.brand);
        await sleep(DELAY_BETWEEN_REQUESTS);

        const allImages = [...wikimediaImages, ...openverseImages];
        results.imagesFound += allImages.length;

        if (allImages.length > 0) {
          // Save the best image as primary
          const primaryImage = await saveImage(spirit.id, allImages[0], true);
          
          if (primaryImage) {
            results.imagesSaved++;
            results.spiritsWithImages++;
            await updateSpiritPrimaryImage(spirit.id, primaryImage.id);
          }

          // Save up to 4 more as additional images
          for (let i = 1; i < Math.min(allImages.length, 5); i++) {
            const saved = await saveImage(spirit.id, allImages[i], false);
            if (saved) results.imagesSaved++;
          }
        }

      } catch (error: any) {
        results.errors.push(`${spirit.name}: ${error.message}`);
      }

      // Progress logging
      if (results.processed % 10 === 0) {
        console.log(`Progress: ${results.processed}/${spirits?.length || 0} spirits processed`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} spirits`,
      results
    });

  } catch (error: any) {
    console.error('Batch image population failed:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Get stats about images
  const { data: stats } = await supabase
    .from('spirits')
    .select('id, primary_image_id', { count: 'exact' });

  const total = stats?.length || 0;
  const withImages = stats?.filter(s => s.primary_image_id).length || 0;
  const withoutImages = total - withImages;

  return NextResponse.json({
    total_spirits: total,
    with_images: withImages,
    without_images: withoutImages,
    coverage_percent: total > 0 ? ((withImages / total) * 100).toFixed(1) : 0
  });
}
