"use client";

import React, { useEffect, useState } from "react";
import Search from "@/components/Search";
import Spinner from "@/components/Spinner";
import MovieCard from "@/components/MovieCard";
import { useDebounce } from "react-use";
import Image from "next/image";

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

const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

const Home = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [movieList, setMovieList] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [debounceSearchTerm, setDebounceSearchTerm] = useState<string>("");

  useDebounce(() => setDebounceSearchTerm(searchTerm), 2000, [searchTerm]);

  const fetchMovies = async (query: string = "") => {
    setErrorMessage("");
    setIsLoading(true);
    
    try {
      const endpoint = `${YOUTUBE_API_BASE_URL}/search?part=snippet&q=${encodeURIComponent(query || "full movie free")}&type=video&videoDuration=long&videoEmbeddable=true&maxResults=20&key=${YOUTUBE_API_KEY}`;
      
      console.log("Fetching from endpoint:", endpoint);

      const response = await fetch(endpoint);
      if (!response.ok) {
        console.error(`HTTP Error: ${response.status}`);
        console.error(`Response Text: ${await response.text()}`);
        throw new Error(`Failed to fetch movies: ${response.status}`);
      }

      const data = await response.json();
      console.log("API response data:", data);

      // Transform response into Movie format
      const movies: Movie[] = data.items.map((item: { id: { videoId: string }; snippet: { title: string; description: string; channelTitle: string; thumbnails: { high: { url: string } } } }) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        creator: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.high.url,
        source: "YouTube",
        channel: item.snippet.channelTitle,
      }));

      setMovieList(movies);
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("Error fetching movies, please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(debounceSearchTerm);
  }, [debounceSearchTerm]);

  return (
    <main>
       <div className="py-8 px-4">
          <header>
            <Image src="/hero.png" priority alt="Banner image" height={500} width={800} />
            <h1>
              Find <span className="text-gradient"> Movies </span> you will Love!
            </h1>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </header>

          <section className="all-movies">
            <h1 className="mt-8">All Movies</h1>
            {isLoading ? (
              <div className="text-center justify-center items-center">
                <Spinner />
              </div>
            ) : errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : (
              <ul>
                {movieList.map((movie) => (
                 
                  <MovieCard key={movie.id} movie={movie} />
                  
                ))}
              </ul>
            )}
          </section>
            </div>
    </main>
  );
};

export default Home;
