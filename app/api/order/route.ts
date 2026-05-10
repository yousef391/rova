import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Get client IP
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : (headersList.get('x-real-ip') ?? 'unknown');

    // Check if this IP already ordered in the last 48h (stored in Supabase, persists across deploys)
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const { data: recentOrders } = await supabase
      .from('order_rate_limits')
      .select('id')
      .eq('ip_address', clientIp)
      .gte('created_at', fortyEightHoursAgo)
      .limit(1);

    if (recentOrders && recentOrders.length > 0) {
      return NextResponse.json(
        { error: "Vous avez déjà passé une commande aujourd'hui. Veuillez réessayer demain." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, phone, wilaya, commune, item, color, size, quantity, price, delivery, total } = body;

    // 1. Insert into Supabase Orders Table
    const { error: dbError } = await supabase
      .from('orders')
      .insert([
        { name, phone, wilaya, commune, item, color, size, quantity: quantity || 1, price, delivery, total, status: 'new' }
      ]);

    if (dbError) {
      console.error("Supabase Error:", dbError);
      return NextResponse.json({ error: "Failed to save order to database." }, { status: 500 });
    }
    console.log("=== ORDER SAVED TO SUPABASE ===", body);

    // Record this IP for rate limiting (persists in DB)
    await supabase.from('order_rate_limits').insert([{ ip_address: clientIp }]);

    // 2. Fetch Notification Settings dynamically from DB
    const { data: settings } = await supabase.from('store_settings').select('*').eq('id', 1).single();

    let botToken = settings?.telegram_bot_token;
    let chatId = settings?.telegram_chat_id;

    if (item === "Ensemble Lin Premium") {
      botToken = settings?.lin_telegram_bot_token || botToken; // Fallback to main bot if not set
      chatId = settings?.lin_telegram_chat_id || chatId;
    }

    if (!botToken || !chatId) {
      console.warn("Telegram credentials not set in Database.");
      return NextResponse.json({ success: true, warning: 'Credentials missing in DB, order logged.' });
    }

    let message = '';

    if (item === "Ensemble Lin Premium") {
      message = `
✨ *NOUVELLE COMMANDE LIN* ✨
━━━━━━━━━━━━━━━━━━
🤵 *Client*: ${name}
📱 *Tél*: ${phone}
🗺️ *Adresse*: ${wilaya} - ${commune}

👔 *Article*: ${item} (${color})
🛍️ *Quantité*: ${quantity || 1} pièce(s)
📐 *Taille*: ${size}

💶 *Prix Unitaire*: ${price}
🛵 *Livraison*: ${delivery} DA
💎 *Total*: *${total}*
`;
    } else {
      message = `
🚨 *NEW CHECKOUT ORDER*
━━━━━━━━━━━━━━━━━━
👤 *Name*: ${name}
📞 *Phone*: ${phone}
📍 *Location*: ${wilaya} - ${commune}

👕 *Item*: ${item} (${color})
📦 *Quantity*: ${quantity || 1} piece(s)
📏 *Size*: ${size}

💰 *Product*: ${price}
🚚 *Delivery*: ${delivery} DA
🛒 *Total*: *${total}*
`;
    }

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error sending order:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
