import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, wilaya, commune, item, color, size, price, delivery, total } = body;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Log the order locally as fallback
    console.log("=== NEW ORDER ===", body);

    if (!botToken || !chatId) {
      console.warn("Telegram credentials not set. Add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to .env");
      return NextResponse.json({ success: true, warning: 'Credentials missing, order logged to console only.' });
    }

    const message = `
🚨 *NEW CHECKOUT ORDER*
━━━━━━━━━━━━━━━━━━
👤 *Name*: ${name}
📞 *Phone*: ${phone}
📍 *Location*: ${wilaya} - ${commune}

👕 *Item*: ${item} (${color})
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
