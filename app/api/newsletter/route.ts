/**
 * NEWSLETTER SUBSCRIPTION API
 * ===========================
 * Email capture and newsletter management
 * 
 * POST /api/newsletter - Subscribe email
 * DELETE /api/newsletter - Unsubscribe email
 * GET /api/newsletter/verify?token=xxx - Verify email
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

// ============================================
// EMAIL VALIDATION
// ============================================

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// ============================================
// POST - Subscribe
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source = 'website', preferences = {} } = body;
    
    // Validate email
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({
        error: 'Please provide a valid email address',
      }, { status: 400 });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if already subscribed
    const { data: existing } = await supabase
      .from('bv_newsletter_subscribers')
      .select('id, status, verified')
      .eq('email', normalizedEmail)
      .single();
    
    if (existing) {
      if (existing.status === 'subscribed') {
        return NextResponse.json({
          success: true,
          message: 'You\'re already subscribed! Check your inbox for our latest updates.',
          alreadySubscribed: true,
        });
      }
      
      // Resubscribe if previously unsubscribed
      if (existing.status === 'unsubscribed') {
        const verificationToken = generateToken();
        
        await supabase
          .from('bv_newsletter_subscribers')
          .update({
            status: 'pending',
            verification_token: verificationToken,
            resubscribed_at: new Date().toISOString(),
            preferences,
          })
          .eq('id', existing.id);
        
        // Would send verification email here
        // await sendVerificationEmail(normalizedEmail, verificationToken);
        
        return NextResponse.json({
          success: true,
          message: 'Welcome back! Please check your email to confirm your subscription.',
          requiresVerification: true,
        });
      }
    }
    
    // Create new subscription
    const verificationToken = generateToken();
    
    const { data: subscriber, error } = await supabase
      .from('bv_newsletter_subscribers')
      .insert({
        email: normalizedEmail,
        status: 'pending',
        source,
        preferences,
        verification_token: verificationToken,
        subscribed_at: new Date().toISOString(),
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Newsletter signup error:', error);
      return NextResponse.json({
        error: 'Failed to subscribe. Please try again.',
      }, { status: 500 });
    }
    
    // For now, auto-verify (in production, would send email)
    await supabase
      .from('bv_newsletter_subscribers')
      .update({
        status: 'subscribed',
        verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq('id', subscriber.id);
    
    // Award XP if user is logged in
    if (body.user_id) {
      await supabase.from('bv_xp_log').insert({
        user_id: body.user_id,
        action: 'newsletter_signup',
        xp_earned: 25,
        reference_type: 'newsletter',
      });
      
      const { data: profile } = await supabase
        .from('bv_profiles')
        .select('total_xp')
        .eq('id', body.user_id)
        .single();
      
      if (profile) {
        await supabase
          .from('bv_profiles')
          .update({ total_xp: (profile.total_xp || 0) + 25 })
          .eq('id', body.user_id);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Thanks for subscribing! You\'ll receive our latest updates and exclusive offers.',
      subscribed: true,
    });
    
  } catch (error: any) {
    console.error('Newsletter API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// DELETE - Unsubscribe
// ============================================

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    
    if (!email && !token) {
      return NextResponse.json({
        error: 'Email or unsubscribe token required',
      }, { status: 400 });
    }
    
    let query = supabase.from('bv_newsletter_subscribers');
    
    if (token) {
      // Unsubscribe via token (from email link)
      const { data, error } = await query
        .update({
          status: 'unsubscribed',
          unsubscribed_at: new Date().toISOString(),
        })
        .eq('unsubscribe_token', token)
        .select()
        .single();
      
      if (error || !data) {
        return NextResponse.json({
          error: 'Invalid unsubscribe link',
        }, { status: 400 });
      }
    } else if (email) {
      // Unsubscribe via email
      const normalizedEmail = email.toLowerCase().trim();
      
      const { error } = await query
        .update({
          status: 'unsubscribed',
          unsubscribed_at: new Date().toISOString(),
        })
        .eq('email', normalizedEmail);
      
      if (error) {
        return NextResponse.json({
          error: 'Failed to unsubscribe',
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'You\'ve been unsubscribed. We\'re sorry to see you go!',
    });
    
  } catch (error: any) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// GET - Verify Email or Get Stats
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const token = searchParams.get('token');
    
    // Verify email
    if (action === 'verify' && token) {
      const { data, error } = await supabase
        .from('bv_newsletter_subscribers')
        .update({
          status: 'subscribed',
          verified: true,
          verified_at: new Date().toISOString(),
        })
        .eq('verification_token', token)
        .eq('status', 'pending')
        .select()
        .single();
      
      if (error || !data) {
        return NextResponse.json({
          error: 'Invalid or expired verification link',
        }, { status: 400 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Email verified! You\'re all set to receive our updates.',
      });
    }
    
    // Get subscriber stats (admin only - would add auth check)
    if (action === 'stats') {
      const { count: total } = await supabase
        .from('bv_newsletter_subscribers')
        .select('*', { count: 'exact', head: true });
      
      const { count: subscribed } = await supabase
        .from('bv_newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'subscribed');
      
      const { count: thisWeek } = await supabase
        .from('bv_newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'subscribed')
        .gte('subscribed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      return NextResponse.json({
        success: true,
        stats: {
          total: total || 0,
          subscribed: subscribed || 0,
          thisWeek: thisWeek || 0,
        },
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error: any) {
    console.error('Newsletter GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
