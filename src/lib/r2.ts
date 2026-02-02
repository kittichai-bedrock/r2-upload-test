import { S3Client } from '@aws-sdk/client-s3';

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function createR2Client(): S3Client {
  const accountId = getEnvVar('CLOUDFLARE_ACCOUNT_ID');
  const accessKeyId = getEnvVar('CLOUDFLARE_R2_ACCESS_KEY_ID');
  const secretAccessKey = getEnvVar('CLOUDFLARE_R2_SECRET_ACCESS_KEY');

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

let _r2Client: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!_r2Client) {
    _r2Client = createR2Client();
  }
  return _r2Client;
}

export const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME || '';
export const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || '';
