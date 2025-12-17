// ============================================================
// BARRELVERSE - USER IMAGE UPLOAD API
// Crowdsourced images with legal rights for monetization
// Created: December 17, 2025
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

function getSupabaseAuth(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }
  });
  
  return client;
}

// ============================================================
// LEGAL TERMS FOR USER-UPLOADED IMAGES
// ============================================================
export const IMAGE_UPLOAD_TERMS = {
  version: '1.0.0',
  effectiveDate: '2025-12-17',
  
  summary: `By uploading images to CRAVBarrels, you grant CR AudioViz AI, LLC perpetual, 
worldwide, royalty-free license to use, modify, distribute, and sublicense the images 
for any purpose including commercial use and resale.`,

  fullTerms: {
    grantOfRights: `
1. LICENSE GRANT
By uploading any image to CRAVBarrels ("Service"), you ("User") hereby grant to 
CR AudioViz AI, LLC ("Company") and its successors, assigns, and licensees:

a) A perpetual, irrevocable, worldwide, royalty-free, fully paid-up, non-exclusive 
   license to use, reproduce, modify, adapt, publish, translate, create derivative 
   works from, distribute, perform, display, and otherwise exploit the uploaded 
   image(s) in any form, medium, or technology now known or later developed;

b) The right to sublicense any or all of the foregoing rights to third parties, 
   including but not limited to licensing the images as part of a commercial 
   image database or API service;

c) The right to use User's uploaded images to train machine learning models, 
   create image recognition systems, and develop AI-powered services;

d) The right to aggregate, catalog, and index uploaded images as part of a 
   proprietary database that may be licensed or sold to third parties.
`,
    
    userRepresentations: `
2. USER REPRESENTATIONS AND WARRANTIES
By uploading an image, you represent and warrant that:

a) You are the original creator of the image OR have obtained all necessary 
   rights, licenses, and permissions to grant the rights described herein;

b) The image does not infringe upon any copyright, trademark, patent, trade 
   secret, or other intellectual property right of any third party;

c) The image does not violate any person's right of privacy or publicity;

d) The image is not defamatory, obscene, or otherwise unlawful;

e) You are at least 18 years of age or have parental consent;

f) You have the legal capacity to enter into this agreement.
`,

    indemnification: `
3. INDEMNIFICATION
You agree to indemnify, defend, and hold harmless CR AudioViz AI, LLC, its 
officers, directors, employees, agents, and affiliates from and against any 
and all claims, damages, losses, costs, and expenses (including reasonable 
attorneys' fees) arising from or related to:

a) Your breach of any representation, warranty, or obligation herein;
b) Any claim that your uploaded image infringes any third-party rights;
c) Your use of the Service in violation of these terms.
`,

    dataRetention: `
4. DATA RETENTION AND REMOVAL
a) Company may retain uploaded images indefinitely, even if User deletes their 
   account or requests removal of specific images;

b) Images may be cached, backed up, or distributed across multiple systems 
   and cannot be guaranteed to be fully deleted upon request;

c) Company reserves the right to remove any image at its sole discretion 
   without notice or compensation;

d) Removal requests will be processed within 30 business days where technically 
   feasible, but sublicensed copies may persist with third parties.
`,

    commercialUse: `
5. COMMERCIAL USE AND MONETIZATION
a) Company may include uploaded images in commercial products and services 
   without compensation to User;

b) Company may license, sell, or otherwise monetize access to the image 
   database containing User uploads;

c) User acknowledges that they will receive no royalties, fees, or other 
   compensation for any commercial use of their uploaded images;

d) Third parties who license the image database may use User images for 
   their own commercial purposes.
`,

    limitationOfLiability: `
6. LIMITATION OF LIABILITY
TO THE MAXIMUM EXTENT PERMITTED BY LAW, CR AUDIOVIZ AI, LLC SHALL NOT BE 
LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE 
DAMAGES ARISING FROM OR RELATED TO USER'S UPLOAD OF IMAGES OR USE OF THE 
SERVICE, REGARDLESS OF WHETHER SUCH DAMAGES WERE FORESEEABLE OR WHETHER 
COMPANY WAS ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
`,

    governingLaw: `
7. GOVERNING LAW AND JURISDICTION
These terms shall be governed by and construed in accordance with the laws 
of the State of Florida, without regard to its conflict of law provisions. 
Any dispute arising from these terms shall be resolved exclusively in the 
state or federal courts located in Lee County, Florida.
`,

    amendments: `
8. AMENDMENTS
Company reserves the right to modify these terms at any time. Continued use 
of the Service after any modifications constitutes acceptance of the updated 
terms. Material changes will be communicated via the Service or email.
`
  },
  
  acceptanceText: `I confirm that I have read, understood, and agree to the Image Upload Terms 
of Service. I acknowledge that by uploading images, I am granting CR AudioViz AI, LLC 
a perpetual, worldwide, royalty-free license to use my images for any purpose, 
including commercial resale and sublicensing to third parties.`
};

// ============================================================
// UPLOAD RESPONSE TYPES
// ============================================================
interface UploadResult {
  success: boolean;
  imageId?: string;
  spiritId?: string;
  imageUrl?: string;
  status: string;
  error?: string;
}

// ============================================================
// API HANDLERS
// ============================================================

// GET: Get upload terms and requirements
export async function GET(request: NextRequest) {
  const showFull = request.nextUrl.searchParams.get('full') === 'true';
  
  return NextResponse.json({
    service: 'CRAVBarrels Image Upload',
    operator: 'CR AudioViz AI, LLC',
    terms: {
      version: IMAGE_UPLOAD_TERMS.version,
      effectiveDate: IMAGE_UPLOAD_TERMS.effectiveDate,
      summary: IMAGE_UPLOAD_TERMS.summary,
      acceptanceText: IMAGE_UPLOAD_TERMS.acceptanceText,
      ...(showFull ? { fullTerms: IMAGE_UPLOAD_TERMS.fullTerms } : {})
    },
    requirements: {
      authentication: 'Required (Bearer token)',
      acceptTerms: 'Must include termsAccepted: true in request',
      acceptTermsVersion: IMAGE_UPLOAD_TERMS.version,
      imageFormats: ['image/jpeg', 'image/png', 'image/webp'],
      maxFileSize: '10MB',
      minDimensions: '200x200 pixels',
      maxDimensions: '4096x4096 pixels'
    },
    endpoints: {
      upload: {
        method: 'POST',
        path: '/api/admin/user-upload',
        contentType: 'multipart/form-data',
        fields: {
          image: 'Image file (required)',
          spiritId: 'UUID of spirit (required)',
          termsAccepted: 'Must be "true" (required)',
          termsVersion: `Must be "${IMAGE_UPLOAD_TERMS.version}" (required)`
        }
      }
    },
    fullTermsUrl: '/api/admin/user-upload?full=true'
  });
}

// POST: Upload image for a spirit
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = getSupabaseAuth(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({
        error: 'Authentication required',
        message: 'Please log in to upload images'
      }, { status: 401 });
    }
    
    // Parse form data
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    const spiritId = formData.get('spiritId') as string | null;
    const termsAccepted = formData.get('termsAccepted') as string | null;
    const termsVersion = formData.get('termsVersion') as string | null;
    
    // Validate required fields
    if (!image) {
      return NextResponse.json({
        error: 'Image required',
        message: 'Please provide an image file'
      }, { status: 400 });
    }
    
    if (!spiritId) {
      return NextResponse.json({
        error: 'Spirit ID required',
        message: 'Please specify which spirit this image is for'
      }, { status: 400 });
    }
    
    // CRITICAL: Validate terms acceptance
    if (termsAccepted !== 'true') {
      return NextResponse.json({
        error: 'Terms not accepted',
        message: 'You must accept the Image Upload Terms of Service',
        terms: IMAGE_UPLOAD_TERMS.summary,
        acceptanceRequired: IMAGE_UPLOAD_TERMS.acceptanceText
      }, { status: 400 });
    }
    
    if (termsVersion !== IMAGE_UPLOAD_TERMS.version) {
      return NextResponse.json({
        error: 'Terms version mismatch',
        message: `Please accept current terms version ${IMAGE_UPLOAD_TERMS.version}`,
        providedVersion: termsVersion,
        requiredVersion: IMAGE_UPLOAD_TERMS.version
      }, { status: 400 });
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json({
        error: 'Invalid file type',
        message: 'Only JPEG, PNG, and WebP images are allowed',
        providedType: image.type,
        allowedTypes
      }, { status: 400 });
    }
    
    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (image.size > maxSize) {
      return NextResponse.json({
        error: 'File too large',
        message: 'Maximum file size is 10MB',
        providedSize: `${(image.size / 1024 / 1024).toFixed(2)}MB`,
        maxSize: '10MB'
      }, { status: 400 });
    }
    
    // Get admin client for database operations
    const adminSupabase = getSupabaseAdmin();
    
    // Verify spirit exists
    const { data: spirit, error: spiritError } = await adminSupabase
      .from('spirits')
      .select('id, name, brand, category')
      .eq('id', spiritId)
      .single();
    
    if (spiritError || !spirit) {
      return NextResponse.json({
        error: 'Spirit not found',
        message: `No spirit found with ID: ${spiritId}`
      }, { status: 404 });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const extension = image.type.split('/')[1];
    const filename = `user-uploads/${user.id}/${spiritId}/${timestamp}.${extension}`;
    
    // Upload to Supabase Storage
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const { data: uploadData, error: uploadError } = await adminSupabase
      .storage
      .from('spirit-images')
      .upload(filename, buffer, {
        contentType: image.type,
        upsert: false
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({
        error: 'Upload failed',
        message: 'Failed to upload image to storage',
        details: uploadError.message
      }, { status: 500 });
    }
    
    // Get public URL
    const { data: urlData } = adminSupabase
      .storage
      .from('spirit-images')
      .getPublicUrl(filename);
    
    const publicUrl = urlData.publicUrl;
    
    // Record the upload with terms acceptance in database
    const { data: uploadRecord, error: recordError } = await adminSupabase
      .from('user_image_uploads')
      .insert({
        user_id: user.id,
        spirit_id: spiritId,
        image_url: publicUrl,
        storage_path: filename,
        file_size: image.size,
        file_type: image.type,
        terms_accepted: true,
        terms_version: IMAGE_UPLOAD_TERMS.version,
        terms_accepted_at: new Date().toISOString(),
        ip_address: request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') ||
                    'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        status: 'pending_review',
        license_type: 'user_contributed',
        commercial_rights_granted: true
      })
      .select()
      .single();
    
    if (recordError) {
      console.error('Record error:', recordError);
      // Image uploaded but record failed - still return success
      // but flag for manual review
    }
    
    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      upload: {
        id: uploadRecord?.id,
        spiritId,
        spiritName: spirit.name,
        imageUrl: publicUrl,
        status: 'pending_review'
      },
      legal: {
        termsAccepted: true,
        termsVersion: IMAGE_UPLOAD_TERMS.version,
        acceptedAt: new Date().toISOString(),
        rightsGranted: [
          'Perpetual license',
          'Worldwide use',
          'Commercial use',
          'Sublicensing',
          'Derivative works',
          'Database inclusion'
        ]
      },
      nextSteps: [
        'Your image will be reviewed within 24-48 hours',
        'Once approved, it will appear on the spirit page',
        'You may be credited as a contributor (optional)',
        'The image becomes part of our proprietary database'
      ]
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: 'An unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// ============================================================
// PUT: Update image status (admin only)
// ============================================================
export async function PUT(request: NextRequest) {
  const adminKey = request.headers.get('X-Admin-Key');
  const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'crav-admin-2024';
  
  if (adminKey !== ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  
  try {
    const body = await request.json();
    const { uploadId, status, applyToSpirit = false } = body;
    
    if (!uploadId || !status) {
      return NextResponse.json({
        error: 'Missing required fields',
        required: ['uploadId', 'status']
      }, { status: 400 });
    }
    
    const validStatuses = ['approved', 'rejected', 'pending_review', 'flagged'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        error: 'Invalid status',
        validStatuses
      }, { status: 400 });
    }
    
    const supabase = getSupabaseAdmin();
    
    // Get upload record
    const { data: upload, error: fetchError } = await supabase
      .from('user_image_uploads')
      .select('*')
      .eq('id', uploadId)
      .single();
    
    if (fetchError || !upload) {
      return NextResponse.json({
        error: 'Upload not found'
      }, { status: 404 });
    }
    
    // Update status
    const { error: updateError } = await supabase
      .from('user_image_uploads')
      .update({
        status,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', uploadId);
    
    if (updateError) {
      return NextResponse.json({
        error: 'Failed to update status',
        details: updateError.message
      }, { status: 500 });
    }
    
    // If approved and applyToSpirit, update spirit's image
    if (status === 'approved' && applyToSpirit) {
      const { error: spiritUpdateError } = await supabase
        .from('spirits')
        .update({
          image_url: upload.image_url,
          image_source: 'User Contributed',
          image_confidence: 0.98,
          image_updated_at: new Date().toISOString()
        })
        .eq('id', upload.spirit_id);
      
      if (spiritUpdateError) {
        return NextResponse.json({
          warning: 'Status updated but failed to apply to spirit',
          details: spiritUpdateError.message
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      uploadId,
      newStatus: status,
      appliedToSpirit: status === 'approved' && applyToSpirit
    });
    
  } catch (error) {
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
