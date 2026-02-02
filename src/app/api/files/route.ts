import { NextResponse } from 'next/server';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getR2Client, R2_BUCKET, R2_PUBLIC_URL } from '@/lib/r2';

export async function GET() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      Prefix: 'uploads/',
    });

    const response = await getR2Client().send(command);
    const files = (response.Contents || []).map((item) => ({
      key: item.Key,
      size: item.Size,
      lastModified: item.LastModified,
      publicUrl: `${R2_PUBLIC_URL}/${item.Key}`,
    }));

    return NextResponse.json({ success: true, files });
  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json(
      { error: 'Failed to list files', details: (error as Error).message },
      { status: 500 }
    );
  }
}
