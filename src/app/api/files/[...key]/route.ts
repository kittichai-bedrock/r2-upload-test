import { NextRequest, NextResponse } from 'next/server';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET } from '@/lib/r2';

type Params = Promise<{ key: string[] }>;

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { key: keyParts } = await params;
    const key = keyParts.join('/');

    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    });

    await r2Client.send(command);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}
