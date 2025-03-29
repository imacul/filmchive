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
  const acceptLanguage = request.headers.get("accept-language") || "en-US";
  const regionCode = acceptLanguage.split(",")[0].split("-")[1] || "US";
  const cacheDir = path.join(process.cwd(), "cache/videos");
  const cachePath = path.join(cacheDir, `${id}-${regionCode}.json`);

  await fs.mkdir(cacheDir, { recursive: true }).catch(() => {});

  try {
    const cachedData = await fs.readFile(cachePath, "utf-8");
    console.log(`Serving from cache for video: ${id} - Region: ${regionCode}`);
    return NextResponse.json(JSON.parse(cachedData));
  } catch {}

  try {
    const endpoint = `${YOUTUBE_API_BASE_URL}?part=snippet,contentDetails,statistics&id=${id}&regionCode=${regionCode}&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to fetch video");
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      console.error(`No video found for ID: ${id} in region: ${regionCode}`);
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
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
    console.log(`Cached data for video: ${id} - Region: ${regionCode}`);
    return NextResponse.json(movie);
  } catch (error) {
    console.error("API error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}