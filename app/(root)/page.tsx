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
      const response = await fetch(`/api/movies?query=${encodeURIComponent(query || "full movie free")}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch: ${response.status}`);
      }
      const movies: Movie[] = await response.json();
      setMovieList(movies);
    } catch (error) {
      console.error(`Error fetching movies:`, error);
      if (error instanceof Error) {
        setErrorMessage(
          error.message.includes("quota") 
            ? "API quota exceeded—try again tomorrow!" 
            : "Error fetching movies, please try again later."
        );
      } else {
        setErrorMessage("An unknown error occurred.");
      }
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