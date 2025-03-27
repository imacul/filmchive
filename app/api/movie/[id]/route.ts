import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3/videos";
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

interface Movie {
  id: string;
  title: string;
  description?: string;
  creator?: string;
  thumbnail: string;
  source: "YouTube";
  channel?: string;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvers = await Promise.all([params]);
  const { id } = resolvers[0];
  const cacheDir = path.join(process.cwd(), "cache/videos");
  const cachePath = path.join(cacheDir, `${id}.json`);

  await fs.mkdir(cacheDir, { recursive: true }).catch(() => {});

  try {
    const cachedData = await fs.readFile(cachePath, "utf-8");
    console.log(`Serving from cache for video: ${id}`);
    return NextResponse.json(JSON.parse(cachedData));
  } catch {}

  try {
    const endpoint = `${YOUTUBE_API_BASE_URL}?part=snippet,contentDetails,statistics&id=${id}&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message || "Failed to fetch video");
    }

    const data = await response.json();
    const movieData = data.items[0].snippet;
    const movie: Movie = {
      id,
      title: movieData.title,
      description: movieData.description,
      creator: movieData.channelTitle,
      thumbnail: movieData.thumbnails.high.url,
      source: "YouTube",
      channel: movieData.channelTitle,
    };

    await fs.writeFile(cachePath, JSON.stringify(movie, null, 2));
    console.log(`Cached data for video: ${id}`);
    return NextResponse.json(movie);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
  }