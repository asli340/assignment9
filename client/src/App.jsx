import { useState, useEffect, useCallback } from "react";
import {
  fetchBooks,
  fetchStats,
  createBook,
  updateBook,
  patchBook,
  deleteBook,
} from "./api/books.js";
import StatsPanel from "./components/StatsPanel.jsx";
import FilterBar from "./components/FilterBar.jsx";
import BookForm from "./components/BookForm.jsx";
import BookList from "./components/BookList.jsx";

const DEFAULT_FILTERS = {
  q: "",
  genre: "",
  read: "",
  sort: "id",
  order: "asc",
};

export default function App() {
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const loadData = useCallback(async (activeFilters, signal) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const [booksData, statsData] = await Promise.all([
        fetchBooks(activeFilters, signal),
        fetchStats(signal),
      ]);
      setBooks(booksData);
      setStats(statsData);
    } catch (err) {
      if (err.name === "AbortError") return;
      setErrorMessage(
        err.message || "Failed to load reading list. Is the backend server running?"
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadData(filters, controller.signal);
    return () => controller.abort();
  }, [filters, loadData]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleFormSubmit = async (payload, editId) => {
    setSubmitting(true);
    setErrorMessage("");
    setStatusMessage("");
    try {
      if (editId) {
        await updateBook(editId, payload);
        setEditingBook(null);
        setStatusMessage(`Updated "${payload.title}".`);
      } else {
        await createBook(payload);
        setStatusMessage(`Added "${payload.title}" to your reading list.`);
      }
      await loadData(filters);
      return true;
    } catch (err) {
      setErrorMessage(err.message || "Could not save book.");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleRead = async (book) => {
    setBusyId(book.id);
    setErrorMessage("");
    setStatusMessage("");
    try {
      const nextRead = !book.read;
      const patchPayload = nextRead
        ? { read: true }
        : { read: false, rating: null };
      await patchBook(book.id, patchPayload);
      if (editingBook && editingBook.id === book.id) {
        setEditingBook(null);
      }
      await loadData(filters);
    } catch (err) {
      setErrorMessage(err.message || "Failed to update read status.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRate = async (id, rating) => {
    setBusyId(id);
    setErrorMessage("");
    setStatusMessage("");
    try {
      await patchBook(id, { rating });
      await loadData(filters);
    } catch (err) {
      setErrorMessage(err.message || "Failed to update rating.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (book) => {
    setBusyId(book.id);
    setErrorMessage("");
    setStatusMessage("");
    try {
      await deleteBook(book.id);
      if (editingBook && editingBook.id === book.id) {
        setEditingBook(null);
      }
      setStatusMessage(`Deleted "${book.title}".`);
      await loadData(filters);
    } catch (err) {
      setErrorMessage(err.message || "Failed to delete book.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Reading List Manager</h1>
        <p className="subtitle">
          Track books, filter by genre or status, and rate what you have read.
        </p>
      </header>

      <main className="app-main">
        {errorMessage && (
          <div className="alert alert-error" role="alert">
            <span>{errorMessage}</span>
            <button
              type="button"
              className="btn-dismiss"
              onClick={() => setErrorMessage("")}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {statusMessage && (
          <div className="alert alert-success" role="status">
            <span>{statusMessage}</span>
            <button
              type="button"
              className="btn-dismiss"
              onClick={() => setStatusMessage("")}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        <StatsPanel stats={stats} loading={loading} />

        <BookForm
          editingBook={editingBook}
          onSubmit={handleFormSubmit}
          onCancelEdit={() => setEditingBook(null)}
          submitting={submitting}
        />

        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        <BookList
          books={books}
          loading={loading}
          busyId={busyId}
          onToggleRead={handleToggleRead}
          onRate={handleRate}
          onEdit={(book) => setEditingBook(book)}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
}
