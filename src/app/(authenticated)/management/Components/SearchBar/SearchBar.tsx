function SearchBar<T extends { email: string }>({
  data
}: {
  data: T[];
}) {


  return (
    <input
      className="bg-transparent text-text-on-primary placeholder:text-text-on-primary border border-outline-common rounded-md px-sm py-xs focus:outline-none focus:ring-1 focus:ring-primary-dark focus:border-transparent w-80 "
      type="text"
      placeholder="Busque através de identificador"
    />
  );
}

export default SearchBar;
