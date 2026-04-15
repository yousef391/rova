import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
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
    } else {
      console.log("=== ORDER SAVED TO SUPABASE ===", body);
    }

    // 2. Fetch Notification Settings dynamically from DB
    const { data: settings } = await supabase.from('store_settings').select('*').eq('id', 1).single();

    const botToken = settings?.telegram_bot_token;
    const chatId = settings?.telegram_chat_id;

    if (!botToken || !chatId) {
      console.warn("Telegram credentials not set in Database.");
      return NextResponse.json({ success: true, warning: 'Credentials missing in DB, order logged.' });
    }

    const message = `
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
