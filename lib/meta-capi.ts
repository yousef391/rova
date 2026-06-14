import crypto from "crypto";
import { supabase } from "@/lib/supabase";

const API_VERSION = "v21.0";

// ── Dynamic config from Supabase (cached for 60s) ──
let cachedConfig: { pixelId: string; accessToken: string } | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60_000; // 60 seconds

async function getMetaConfig(): Promise<{ pixelId: string; accessToken: string }> {
  const now = Date.now();
  if (cachedConfig && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedConfig;
  }

  try {
    const { data } = await supabase
      .from("store_settings")
      .select("fb_pixel_id, meta_access_token")
      .eq("id", 1)
      .single();

    if (data?.fb_pixel_id && data?.meta_access_token) {
      cachedConfig = {
        pixelId: data.fb_pixel_id,
        accessToken: data.meta_access_token,
      };
      cacheTimestamp = now;
      return cachedConfig;
    }
  } catch (err) {
    console.error("[Meta CAPI] Failed to fetch config from DB:", err);
  }

  // Fallback to .env if DB fails
  return {
    pixelId: process.env.META_PIXEL_ID || "",
    accessToken: process.env.META_ACCESS_TOKEN || "",
  };
}

/**
 * SHA-256 hash a string value (lowercased, trimmed) as required by Meta CAPI.
 * Returns undefined if the input is empty/undefined.
 */
function hashValue(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

export interface MetaUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  userId?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string; // Facebook click ID cookie
  fbp?: string; // Facebook browser ID cookie
}

export interface MetaCustomData {
  value?: number;
  currency?: string;
  contentIds?: string[];
  contentName?: string;
  contentCategory?: string;
  contentType?: string;
  orderId?: string;
}

export interface MetaEventPayload {
  eventName: string;
  eventId: string;
  eventTime?: number;
  eventSourceUrl?: string;
  userData?: MetaUserData;
  customData?: MetaCustomData;
  actionSource?: string;
}

/**
 * Send a server-side event to Meta Conversions API.
 */
export async function sendServerEvent(payload: MetaEventPayload): Promise<{ success: boolean; error?: string }> {
  const {
    eventName,
    eventId,
    eventTime = Math.floor(Date.now() / 1000),
    eventSourceUrl,
    userData = {},
    customData = {},
    actionSource = "website",
  } = payload;

  // Build hashed user_data
  const user_data: Record<string, unknown> = {};
  if (userData.email) user_data.em = [hashValue(userData.email)];
  if (userData.phone) user_data.ph = [hashValue(userData.phone)];
  if (userData.firstName) user_data.fn = [hashValue(userData.firstName)];
  if (userData.lastName) user_data.ln = [hashValue(userData.lastName)];
  if (userData.userId) user_data.external_id = [hashValue(userData.userId)];
  if (userData.clientIpAddress) user_data.client_ip_address = userData.clientIpAddress;
  if (userData.clientUserAgent) user_data.client_user_agent = userData.clientUserAgent;
  if (userData.fbc) user_data.fbc = userData.fbc;
  if (userData.fbp) user_data.fbp = userData.fbp;

  // Build custom_data
  const custom_data: Record<string, unknown> = {};
  if (customData.value !== undefined) custom_data.value = customData.value;
  if (customData.currency) custom_data.currency = customData.currency;
  if (customData.contentIds) custom_data.content_ids = customData.contentIds;
  if (customData.contentName) custom_data.content_name = customData.contentName;
  if (customData.contentCategory) custom_data.content_category = customData.contentCategory;
  if (customData.contentType) custom_data.content_type = customData.contentType;
  if (customData.orderId) custom_data.order_id = customData.orderId;

  const body = {
    data: [
      {
        event_name: eventName,
        event_time: eventTime,
        event_id: eventId,
        event_source_url: eventSourceUrl,
        action_source: actionSource,
        user_data,
        custom_data,
      },
    ],
    // ⚠️ TEST MODE — Uncomment to debug in Events Manager
    // test_event_code: "TEST51730",
  };

  try {
    const { pixelId, accessToken } = await getMetaConfig();
    const url = `https://graph.facebook.com/${API_VERSION}/${pixelId}/events?access_token=${accessToken}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("[Meta CAPI] Error:", res.status, errorBody);
      return { success: false, error: `Meta API ${res.status}: ${errorBody}` };
    }

    const resData = await res.json();
    console.log(`[CAPI] Event sent: ${eventName} | events_received: ${resData.events_received ?? "?"}`);

    return { success: true };
  } catch (err) {
    console.error("[Meta CAPI] Network error:", err);
    return { success: false, error: String(err) };
  }
}
