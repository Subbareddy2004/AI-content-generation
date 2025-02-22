import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = authHeader.split(' ')[1];
    const formData = await request.formData();
    const media = formData.get('media');

    if (!media || !(media instanceof Blob)) {
      return NextResponse.json({ error: 'No media file provided' }, { status: 400 });
    }

    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: accessToken
    });

    const arrayBuffer = await media.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mediaId = await client.v1.uploadMedia(buffer, { mimeType: media.type });

    return NextResponse.json({ media_id_string: mediaId });
  } catch (error) {
    console.error('Twitter media upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    );
  }
}