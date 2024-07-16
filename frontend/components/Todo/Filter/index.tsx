import { FILTER_VALUES, Filter } from '../Screen';

type TodoFilterProps = {
  filter: Filter;
  setFilter: (filter: Filter) => void;
};

export const TodoFilter = ({ filter, setFilter }: TodoFilterProps) => {
  return (
    <div className="flex space-x-4 my-2">
      {FILTER_VALUES.map((filterValue) => (
        <button
          key={filterValue}
          className={`px-4 py-2 rounded ${
            filter === filterValue
              ? 'bg-lightgray text-black border-2'
              : 'bg-ivory-500 text-black'
          } hover:bg-lightgray transition-colors duration-200`}
          onClick={() => setFilter(filterValue)}
        >
          {filterValue}
        </button>
      ))}
    </div>
  );
};
