import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const acceptLanguage = request.headers.get("accept-language") || "en-US";
  const regionCode = acceptLanguage.split(",")[0].split("-")[1] || "US";
  const query = searchParams.get("query") || "";
  const category = searchParams.get("category") || "";
  const cacheKey = `${query || "full-movie-free"}-${category || "all"}-${regionCode}`.toLowerCase().replace(/\s/g, "-");
  const cacheDir = path.join(process.cwd(), "cache");
  const cachePath = path.join(cacheDir, `${cacheKey}.json`);

  await fs.mkdir(cacheDir, { recursive: true }).catch(() => {});

  try {
    const cachedData = await fs.readFile(cachePath, "utf-8");
    console.log(`Serving from cache for: ${cacheKey}`);
    return NextResponse.json(JSON.parse(cachedData));
  } catch {}

  try {
    const endpoint = `${YOUTUBE_API_BASE_URL}/search?part=snippet&type=video${category ? `&videoCategoryId=${category}` : ""}&regionCode=${regionCode}&q=${encodeURIComponent(query || "full movie free")}&videoDuration=long&videoEmbeddable=true&maxResults=50&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to fetch movies");
    }

    const data = await response.json();
    interface YouTubeVideo {
      id: { videoId: string };
      snippet: {
      title: string;
      description: string;
      channelTitle: string;
      thumbnails: {
        high: { url: string };
      };
      };
    }

    interface YouTubeResponse {
      items: YouTubeVideo[];
    }

    const filteredMovies: Movie[] = (data as YouTubeResponse).items
      .filter((item: YouTubeVideo) => item.snippet && item.id.videoId)
      .map((item: YouTubeVideo) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      creator: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high.url,
      source: "YouTube",
      channel: item.snippet.channelTitle,
      }));
    const movies = filteredMovies.slice(0, 20);

    await fs.writeFile(cachePath, JSON.stringify(movies, null, 2));
    console.log(`Cached data for: ${cacheKey}`);
    return NextResponse.json(movies);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: (error instanceof Error ? error.message : "An unknown error occurred") }, { status: 500 });
  }
}