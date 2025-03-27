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
  const [category, setCategory] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [movieList, setMovieList] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [debounceSearchTerm, setDebounceSearchTerm] = useState<string>("");

  useDebounce(() => setDebounceSearchTerm(searchTerm), 2000, [searchTerm]);

  const fetchMovies = async (query: string = "", cat: string = "") => {
    setErrorMessage("");
    setIsLoading(true);
    let searchQuery = query;
    if (!query) {
      if (cat === "23") searchQuery = "comedy movie full";
      else if (cat === "10") searchQuery = "music movie full";
      else if (cat === "1") searchQuery = "action movie full";
      else if (cat === "2") searchQuery = "car movie full";
      else if (cat === "24") searchQuery = "entertainment movie full";
      else if (cat === "44") searchQuery = "movie trailer full";
      else searchQuery = "full movie free";
    }
    try {
      const url = `/api/movies?query=${encodeURIComponent(searchQuery)}${
        cat ? `&category=${cat}` : ""
      }`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || "Unknown error occurred");
      }
      const movies: Movie[] = await response.json();
      setMovieList(movies);
    } catch (error) {
      console.error(`Error fetching movies:`, error);
      if (error instanceof Error) {
        setErrorMessage(error.message.includes("quota") ? "API quota exceeded—try again tomorrow!" : "Error fetching movies.");
      } else {
        setErrorMessage("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(debounceSearchTerm, category);
  }, [debounceSearchTerm, category]);

  return (
    <main>
      <div className="py-8 px-4">
        <header>
          <Image src="/hero.png" priority alt="Banner image" height={500} width={800} />
          <h1>
            Find <span className="text-gradient"> Movies </span> you will Love!
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-4 p-2 border rounded bg-slate-800 text-white" 
          >
            <option value="">All Categories</option>
            <option value="1">Action & Drama</option>
            <option value="23">Comedy</option>
            <option value="10">Music</option>
            <option value="2">Autos & Vehicles</option>
            <option value="24">Entertainment</option>
            <option value="44">Trailers</option>
          </select>
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