import { useState, useEffect } from "react";

const GENRE_OPTIONS = [
  "fiction",
  "non-fiction",
  "sci-fi",
  "fantasy",
  "biography",
  "history",
  "technical",
];

const INITIAL_FORM = {
  title: "",
  author: "",
  genre: "fiction",
  year: "",
  rating: "",
  read: false,
};

export default function BookForm({ editingBook, onSubmit, onCancelEdit, submitting }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (editingBook) {
      setForm({
        title: editingBook.title,
        author: editingBook.author,
        genre: editingBook.genre,
        year: String(editingBook.year),
        rating: editingBook.rating !== null ? String(editingBook.rating) : "",
        read: Boolean(editingBook.read),
      });
      setLocalError("");
    } else {
      setForm(INITIAL_FORM);
      setLocalError("");
    }
  }, [editingBook]);

  const handleChange = (field, value) => {
    setLocalError("");
    setForm((prev) => {
      if (field === "read" && value === false) {
        return { ...prev, read: false, rating: "" };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    const trimmedTitle = form.title.trim();
    const trimmedAuthor = form.author.trim();
    const parsedYear = Number(form.year);

    if (!trimmedTitle) {
      setLocalError("Title is required.");
      return;
    }
    if (!trimmedAuthor) {
      setLocalError("Author is required.");
      return;
    }
    if (!form.year || !Number.isInteger(parsedYear) || parsedYear < 1450 || parsedYear > 2026) {
      setLocalError("Year must be an integer between 1450 and 2026.");
      return;
    }
    if (!form.read && form.rating !== "") {
      setLocalError("Cannot assign a rating to an unread book.");
      return;
    }

    const payload = {
      title: trimmedTitle,
      author: trimmedAuthor,
      genre: form.genre,
      year: parsedYear,
      read: form.read,
      rating: form.rating === "" ? null : Number(form.rating),
    };

    const ok = await onSubmit(payload, editingBook ? editingBook.id : null);
    if (ok && !editingBook) {
      setForm(INITIAL_FORM);
    }
  };

  return (
    <section className="panel form-panel" aria-label={editingBook ? "Edit book" : "Add new book"}>
      <h2>{editingBook ? `Edit Book #${editingBook.id}` : "Add a New Book"}</h2>

      {localError && (
        <div className="alert alert-error" role="alert">
          {localError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="book-form" noValidate>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="book-title">Title *</label>
            <input
              id="book-title"
              type="text"
              maxLength={200}
              placeholder="e.g. Clean Code"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="book-author">Author *</label>
            <input
              id="book-author"
              type="text"
              maxLength={120}
              placeholder="e.g. Robert C. Martin"
              value={form.author}
              onChange={(e) => handleChange("author", e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="book-genre">Genre *</label>
            <select
              id="book-genre"
              value={form.genre}
              onChange={(e) => handleChange("genre", e.target.value)}
              disabled={submitting}
            >
              {GENRE_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="book-year">Publication Year *</label>
            <input
              id="book-year"
              type="number"
              min={1450}
              max={2026}
              placeholder="1450 - 2026"
              value={form.year}
              onChange={(e) => handleChange("year", e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="field checkbox-field">
            <label htmlFor="book-read" className="checkbox-label">
              <input
                id="book-read"
                type="checkbox"
                checked={form.read}
                onChange={(e) => handleChange("read", e.target.checked)}
                disabled={submitting}
              />
              <span>Marked as Read</span>
            </label>
          </div>

          <div className="field">
            <label htmlFor="book-rating">Rating (1–5)</label>
            <select
              id="book-rating"
              value={form.rating}
              onChange={(e) => handleChange("rating", e.target.value)}
              disabled={submitting || !form.read}
            >
              <option value="">No rating</option>
              <option value="1">1 ★</option>
              <option value="2">2 ★★</option>
              <option value="3">3 ★★★</option>
              <option value="4">4 ★★★★</option>
              <option value="5">5 ★★★★★</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting
              ? "Saving..."
              : editingBook
              ? "Save Changes"
              : "Add Book"}
          </button>

          {editingBook && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancelEdit}
              disabled={submitting}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
