import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    CLOUDFLARE_ACCOUNT_ID: !!process.env.CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_R2_ACCESS_KEY_ID: !!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: !!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    CLOUDFLARE_R2_BUCKET_NAME: !!process.env.CLOUDFLARE_R2_BUCKET_NAME,
    CLOUDFLARE_R2_PUBLIC_URL: !!process.env.CLOUDFLARE_R2_PUBLIC_URL,
  };

  const allConfigured = Object.values(envVars).every(Boolean);

  return NextResponse.json({
    status: allConfigured ? 'ok' : 'missing',
    configured: envVars,
    timestamp: new Date().toISOString(),
  });
}
