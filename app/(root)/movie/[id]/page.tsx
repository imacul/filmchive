import { notFound } from "next/navigation";

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

const MoviePage = async ({ params }: MoviePageProps) => {
  const resolvers = await Promise.all([params]);
  const { id } = resolvers[0];

  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000"; // Fallback for local dev
  const response = await fetch(`${baseUrl}/api/movie/${id}`);
  if (!response.ok) return notFound();

  const movie: {
    id: string;
    title: string;
    description?: string;
    creator?: string;
    thumbnail: string;
    source: "YouTube";
    channel?: string;
  } = await response.json();

  return (
    <div className="container mx-auto p-4">
      <div className="aspect-w-16 aspect-h-9 flex justify-center">
        <iframe
          width="95%"
          height="500"
          src={`https://www.youtube.com/embed/${id}`}
          title={movie.title}
          allowFullScreen
          className="rounded-lg mt-4 shadow-lg md:mt-0 md:rounded-none md:shadow-none md:w-full md:h-96 w-full h-80"
        />
      </div>
      <h1 className="text-2xl font-bold text-gradient mt-10">{movie.title}</h1>
      <p className="mt-4 text-white">{movie.description}</p>
    </div>
  );
};

export default MoviePage;