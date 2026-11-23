export default function BookList({
  books,
  loading,
  busyId,
  onToggleRead,
  onRate,
  onEdit,
  onDelete,
}) {
  if (loading && books.length === 0) {
    return (
      <section className="panel list-panel" aria-label="Book list">
        <p className="muted">Loading books...</p>
      </section>
    );
  }

  if (!loading && books.length === 0) {
    return (
      <section className="panel list-panel" aria-label="Book list">
        <p className="empty-state">
          No books match the current criteria. Add a new book or reset filters.
        </p>
      </section>
    );
  }

  return (
    <section className="panel list-panel" aria-label="Book list">
      <div className="list-header">
        <h2>Books ({books.length})</h2>
      </div>

      <div className="book-grid">
        {books.map((book) => {
          const isBusy = busyId === book.id;

          return (
            <article
              key={book.id}
              className={`book-card ${book.read ? "is-read" : "is-unread"}`}
            >
              <div className="book-card-top">
                <span className="badge badge-genre">{book.genre}</span>
                <span
                  className={`badge ${
                    book.read ? "badge-read" : "badge-unread"
                  }`}
                >
                  {book.read ? "Read" : "Unread"}
                </span>
              </div>

              <h3 className="book-title">{book.title}</h3>
              <p className="book-meta">
                {book.author} · <span>{book.year}</span>
              </p>

              <div className="book-rating-row">
                <label htmlFor={`rate-${book.id}`} className="rating-label">
                  Rating:
                </label>
                <select
                  id={`rate-${book.id}`}
                  value={book.rating !== null ? String(book.rating) : ""}
                  disabled={!book.read || isBusy}
                  onChange={(e) =>
                    onRate(
                      book.id,
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                >
                  <option value="">—</option>
                  <option value="1">1 ★</option>
                  <option value="2">2 ★★</option>
                  <option value="3">3 ★★★</option>
                  <option value="4">4 ★★★★</option>
                  <option value="5">5 ★★★★★</option>
                </select>
                {!book.read && (
                  <small className="muted">(Mark read to rate)</small>
                )}
              </div>

              <div className="book-actions">
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  disabled={isBusy}
                  onClick={() => onToggleRead(book)}
                >
                  {book.read ? "Mark Unread" : "Mark Read"}
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  disabled={isBusy}
                  onClick={() => onEdit(book)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  disabled={isBusy}
                  onClick={() => onDelete(book)}
                >
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
