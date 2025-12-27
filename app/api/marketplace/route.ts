import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20"
});

// Commission rates by listing type
const COMMISSION_RATES = {
  standard: 0.05,      // 5% for standard listings
  featured: 0.08,      // 8% for featured listings
  auction: 0.10,       // 10% for auction sales
  premium: 0.03        // 3% for premium sellers
};

const LISTING_FEES = {
  standard: 0,
  featured: 499,       // $4.99 to feature a listing
  premium_week: 999,   // $9.99 for premium visibility
  auction: 199         // $1.99 to create auction
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "create_listing": {
        const { userId, spiritId, price, listingType, description } = body;

        // Check if user needs to pay listing fee
        const fee = LISTING_FEES[listingType as keyof typeof LISTING_FEES] || 0;
        
        if (fee > 0) {
          // Create Stripe checkout for listing fee
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("stripe_customer_id")
            .eq("id", userId)
            .single();

          const session = await stripe.checkout.sessions.create({
            customer: profile?.stripe_customer_id,
            mode: "payment",
            line_items: [{
              price_data: {
                currency: "usd",
                product_data: {
                  name: `${listingType.charAt(0).toUpperCase() + listingType.slice(1)} Listing`,
                  description: `Marketplace listing fee`
                },
                unit_amount: fee
              },
              quantity: 1
            }],
            metadata: {
              type: "listing_fee",
              user_id: userId,
              spirit_id: spiritId,
              listing_type: listingType,
              price: price.toString()
            },
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/marketplace/success?listing=pending`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/marketplace/sell`
          });

          return NextResponse.json({ checkoutUrl: session.url, requiresPayment: true });
        }

        // Free listing - create directly
        const { data: listing, error } = await supabase
          .from("marketplace_listings")
          .insert({
            seller_id: userId,
            spirit_id: spiritId,
            price,
            listing_type: listingType,
            description,
            status: "active",
            commission_rate: COMMISSION_RATES[listingType as keyof typeof COMMISSION_RATES] || 0.05
          })
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ listing, requiresPayment: false });
      }

      case "purchase": {
        const { buyerId, listingId } = body;

        // Get listing details
        const { data: listing } = await supabase
          .from("marketplace_listings")
          .select(`*, seller:seller_id(stripe_customer_id, email)`)
          .eq("id", listingId)
          .single();

        if (!listing || listing.status !== "active") {
          return NextResponse.json({ error: "Listing not available" }, { status: 400 });
        }

        const commission = Math.round(listing.price * listing.commission_rate);
        const sellerPayout = listing.price - commission;

        // Create checkout session
        const { data: buyerProfile } = await supabase
          .from("user_profiles")
          .select("stripe_customer_id")
          .eq("id", buyerId)
          .single();

        const session = await stripe.checkout.sessions.create({
          customer: buyerProfile?.stripe_customer_id,
          mode: "payment",
          line_items: [{
            price_data: {
              currency: "usd",
              product_data: {
                name: `Marketplace Purchase`,
                description: `Spirit from CravBarrels Marketplace`
              },
              unit_amount: listing.price
            },
            quantity: 1
          }],
          metadata: {
            type: "marketplace_purchase",
            listing_id: listingId,
            buyer_id: buyerId,
            seller_id: listing.seller_id,
            commission,
            seller_payout: sellerPayout
          },
          success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/marketplace/purchase/success?id=${listingId}`,
          cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/marketplace/listing/${listingId}`
        });

        return NextResponse.json({ checkoutUrl: session.url });
      }

      case "complete_sale": {
        // Called by webhook after successful payment
        const { listingId, buyerId, commission, sellerPayout } = body;

        // Update listing status
        await supabase
          .from("marketplace_listings")
          .update({ status: "sold", sold_at: new Date().toISOString(), buyer_id: buyerId })
          .eq("id", listingId);

        // Record commission
        await supabase
          .from("marketplace_commissions")
          .insert({
            listing_id: listingId,
            commission_amount: commission,
            seller_payout: sellerPayout,
            status: "pending_payout"
          });

        // Transfer spirit ownership
        const { data: listing } = await supabase
          .from("marketplace_listings")
          .select("spirit_id, seller_id")
          .eq("id", listingId)
          .single();

        if (listing) {
          await supabase
            .from("user_collections")
            .update({ user_id: buyerId })
            .eq("spirit_id", listing.spirit_id)
            .eq("user_id", listing.seller_id);
        }

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "active";
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;

    let query = supabase
      .from("marketplace_listings")
      .select(`
        *,
        spirit:spirit_id(*),
        seller:seller_id(display_name, avatar_url)
      `, { count: "exact" })
      .eq("status", type)
      .range((page - 1) * limit, page * limit - 1)
      .order("created_at", { ascending: false });

    if (category) query = query.eq("spirit.category", category);
    if (minPrice) query = query.gte("price", parseInt(minPrice));
    if (maxPrice) query = query.lte("price", parseInt(maxPrice));

    const { data, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      listings: data,
      total: count,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
