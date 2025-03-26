import Image from "next/image";

interface SearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const Search: React.FC<SearchProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="search">
      <div>
        <Image width={20} height={20} src="./search.svg" alt="Search icon" />
        <input
          className="placeholder:truncate"
          type="text"
          placeholder="Browse movies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Search;
