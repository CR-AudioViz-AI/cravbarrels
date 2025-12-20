import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Define types for the API
interface HiddenCard {
  id: string;
  name: string;
  description: string;
  image_url: string;
  rarity: string;
  series: string;
  xp_reward: number;
  credit_reward: number;
  max_supply: number | null;
  is_secret: boolean;
  unlock_code: string | null;
  location_hint: string | null;
}

// Hidden card discovery endpoint
export async function POST(request: NextRequest) {
  try {
    const { cardId, location, userId } = await request.json();

    if (!cardId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Check if user already has this card
    const { data: existing } = await supabase
      .from('user_digital_cards')
      .select('id')
      .eq('user_id', userId)
      .eq('card_id', cardId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Card already discovered', alreadyDiscovered: true },
        { status: 409 }
      );
    }

    // Get card details
    const { data: card, error: cardError } = await supabase
      .from('hidden_cards')
      .select('*')
      .eq('id', cardId)
      .single();

    if (cardError || !card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    // Cast to typed card
    const typedCard = card as HiddenCard;

    // Check supply limits
    if (typedCard.max_supply) {
      const { count } = await supabase
        .from('user_digital_cards')
        .select('id', { count: 'exact' })
        .eq('card_id', cardId);

      if (count && count >= typedCard.max_supply) {
        return NextResponse.json(
          { error: 'Card supply exhausted', soldOut: true },
          { status: 410 }
        );
      }
    }

    // Award the card
    const instanceNumber = await getNextInstanceNumber(supabase, cardId);
    const isFoil = Math.random() < 0.05; // 5% chance for foil

    const { data: newCard, error: insertError } = await supabase
      .from('user_digital_cards')
      .insert({
        user_id: userId,
        card_id: cardId,
        discovered_at: new Date().toISOString(),
        discovery_location: location,
        instance_number: instanceNumber,
        is_foil: isFoil
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to award card:', insertError);
      return NextResponse.json(
        { error: 'Failed to award card' },
        { status: 500 }
      );
    }

    // Update user XP and credits (if RPC exists)
    try {
      await supabase.rpc('add_user_rewards', {
        p_user_id: userId,
        p_xp: typedCard.xp_reward,
        p_credits: typedCard.credit_reward
      });
    } catch (rpcError) {
      // RPC may not exist yet, just log it
      console.log('Rewards RPC not available:', rpcError);
    }

    // Log the discovery event
    await supabase
      .from('discovery_events')
      .insert({
        user_id: userId,
        card_id: cardId,
        location,
        is_foil: isFoil,
        instance_number: instanceNumber
      });

    return NextResponse.json({
      success: true,
      card: {
        ...typedCard,
        instanceNumber,
        isFoil
      },
      rewards: {
        xp: typedCard.xp_reward,
        credits: typedCard.credit_reward
      }
    });

  } catch (error) {
    console.error('Hidden cards API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get user's discovered cards
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Get user's cards
    const { data: userCards, error } = await supabase
      .from('user_digital_cards')
      .select(`
        *,
        card:hidden_cards(*)
      `)
      .eq('user_id', userId)
      .order('discovered_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch cards:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cards' },
        { status: 500 }
      );
    }

    // Get all available cards for progress tracking
    const { data: allCards } = await supabase
      .from('hidden_cards')
      .select('id, name, series, rarity, is_secret')
      .order('series');

    // Calculate stats
    const stats = {
      totalDiscovered: userCards?.length || 0,
      totalAvailable: allCards?.length || 0,
      xpEarned: userCards?.reduce((sum: number, c: { card?: { xp_reward?: number } }) => sum + (c.card?.xp_reward || 0), 0) || 0,
      creditsEarned: userCards?.reduce((sum: number, c: { card?: { credit_reward?: number } }) => sum + (c.card?.credit_reward || 0), 0) || 0,
      foilCount: userCards?.filter((c: { is_foil?: boolean }) => c.is_foil).length || 0
    };

    return NextResponse.json({
      cards: userCards,
      allCards,
      stats
    });

  } catch (error) {
    console.error('Hidden cards GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getNextInstanceNumber(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, cardId: string): Promise<number> {
  const { count } = await supabase
    .from('user_digital_cards')
    .select('id', { count: 'exact' })
    .eq('card_id', cardId);
  
  return (count || 0) + 1;
}
