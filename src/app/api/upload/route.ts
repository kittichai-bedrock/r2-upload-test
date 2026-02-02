import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client, R2_BUCKET, R2_PUBLIC_URL } from '@/lib/r2';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const fileName = `uploads/${timestamp}-${file.name}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await getR2Client().send(command);

    const publicUrl = `${R2_PUBLIC_URL}/${fileName}`;

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        fileName: file.name,
        key: fileName,
        size: file.size,
        contentType: file.type,
        publicUrl,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}
