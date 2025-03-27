import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
const YOUTUBE_API_BASE_URL: string = "https://www.googleapis.com/youtube/v3";
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
interface Movie {
  id: string;
  title: string;
  description?: string;
  creator?: string;
  year?: string;
  thumbnail: string;
  source: "YouTube";
  channel?: string;
}
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";
  const cacheDir = path.join(process.cwd(), "cache");
  const category = searchParams.get("category") || "";
  const cacheKey = `${query || "full-movie-free"}-${category || "all"}`.toLowerCase().replace(/\s/g, "-");
  const cachePath = path.join(cacheDir, `${cacheKey}.json`);
  // Ensure cache directory exists
  await fs.mkdir(cacheDir, { recursive: true }).catch(() => {});
  // Check cache
  try {
    const cachedData = await fs.readFile(cachePath, "utf-8");
    console.log(`Serving from cache for: ${query || "default"}`);
    return NextResponse.json(JSON.parse(cachedData));
  } catch {}
  // Fetch from YouTube
  try {
    const endpoint = `${YOUTUBE_API_BASE_URL}/search?part=snippet&type=video${category ? `&videoCategoryId=${category}` : ""}&q=${encodeURIComponent(query || "full movie free")}&videoDuration=long&videoEmbeddable=true&maxResults=20&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message || `Failed to fetch: ${response.status}`);
    }

const data = await response.json();
const movies: Movie[] = data.items.map(
  (item: { id: { videoId: string }; snippet: { title: string; description: string; channelTitle: string; thumbnails: { high: { url: string } } } }) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    creator: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.high.url,
    source: "YouTube",
    channel: item.snippet.channelTitle,
  })
);

// Cache it
await fs.writeFile(cachePath, JSON.stringify(movies, null, 2));
console.log(`Cached data for: ${query || "default"}`);
return NextResponse.json(movies);

  } catch (error) {
      console.error("API error:", error);
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

