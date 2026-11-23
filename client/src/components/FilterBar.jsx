const GENRE_OPTIONS = [
  "fiction",
  "non-fiction",
  "sci-fi",
  "fantasy",
  "biography",
  "history",
  "technical",
];

export default function FilterBar({ filters, onFilterChange, onReset }) {
  const handleChange = (field, value) => {
    onFilterChange(field, value);
  };

  return (
    <section className="panel filter-bar" aria-label="Filter and sort books">
      <div className="filter-grid">
        <div className="field">
          <label htmlFor="search-q">Search (Title or Author)</label>
          <input
            id="search-q"
            type="search"
            placeholder="e.g. Dune, Herbert..."
            value={filters.q}
            onChange={(e) => handleChange("q", e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="filter-genre">Genre</label>
          <select
            id="filter-genre"
            value={filters.genre}
            onChange={(e) => handleChange("genre", e.target.value)}
          >
            <option value="">All genres</option>
            {GENRE_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="filter-read">Status</label>
          <select
            id="filter-read"
            value={filters.read}
            onChange={(e) => handleChange("read", e.target.value)}
          >
            <option value="">All</option>
            <option value="true">Read</option>
            <option value="false">Unread</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="sort-by">Sort By</label>
          <select
            id="sort-by"
            value={filters.sort}
            onChange={(e) => handleChange("sort", e.target.value)}
          >
            <option value="id">ID</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="year">Year</option>
            <option value="rating">Rating</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="sort-order">Order</label>
          <select
            id="sort-order"
            value={filters.order}
            onChange={(e) => handleChange("order", e.target.value)}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      <div className="filter-actions">
        <button type="button" className="btn btn-secondary" onClick={onReset}>
          Reset Filters
        </button>
      </div>
    </section>
  );
}
