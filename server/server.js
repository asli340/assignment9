import express from "express";
import cors from "cors";
import {
  getAllBooks,
  getBookById,
  isDuplicateBook,
  createBook,
  replaceBook,
  deleteBook,
} from "./booksStore.js";
import {
  parsePositiveIntId,
  validateCompleteBook,
  validatePatchAndMerge,
  validateQueryParams,
} from "./validate.js";

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_ORIGIN,
  })
);

app.use(express.json());

// Malformed JSON error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Malformed JSON in request body" });
  }
  return next(err);
});

// GET /api/books
app.get("/api/books", async (req, res) => {
  const { error, value } = validateQueryParams(req.query);
  if (error) {
    return res.status(400).json({ error });
  }

  const { genre, read, q, sort, order, limit, page } = value;
  let result = await getAllBooks();

  if (genre !== null) {
    result = result.filter((b) => b.genre === genre);
  }
  if (read !== null) {
    result = result.filter((b) => b.read === read);
  }
  if (q !== "") {
    result = result.filter(
      (b) =>
        b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    );
  }

  const dir = order === "asc" ? 1 : -1;
  result = [...result].sort((a, b) => {
    if (sort === "rating") {
      if (a.rating === null && b.rating === null) return 0;
      if (a.rating === null) return 1;
      if (b.rating === null) return -1;
      return (a.rating - b.rating) * dir;
    }
    if (sort === "title" || sort === "author") {
      return a[sort].localeCompare(b[sort], undefined, { sensitivity: "base" }) * dir;
    }
    return (a[sort] - b[sort]) * dir;
  });

  const startIndex = (page - 1) * limit;
  const paginated = result.slice(startIndex, startIndex + limit);

  return res.status(200).json(paginated);
});

// GET /api/stats
app.get("/api/stats", async (req, res) => {
  const allBooks = await getAllBooks();
  const total = allBooks.length;
  const readCount = allBooks.filter((b) => b.read).length;
  const unreadCount = total - readCount;

  const ratedBooks = allBooks.filter((b) => b.rating !== null);
  const averageRating =
    ratedBooks.length > 0
      ? Number(
          (
            ratedBooks.reduce((sum, b) => sum + b.rating, 0) / ratedBooks.length
          ).toFixed(2)
        )
      : null;

  const byGenre = {};
  for (const book of allBooks) {
    byGenre[book.genre] = (byGenre[book.genre] || 0) + 1;
  }

  return res.status(200).json({
    total,
    read: readCount,
    unread: unreadCount,
    averageRating,
    byGenre,
  });
});

// GET /api/books/:id
app.get("/api/books/:id", async (req, res) => {
  const id = parsePositiveIntId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "Book id must be a positive integer" });
  }

  const book = await getBookById(id);
  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  return res.status(200).json(book);
});

// POST /api/books
app.post("/api/books", async (req, res) => {
  const { error, value } = validateCompleteBook(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const duplicate = await isDuplicateBook(value.title, value.author);
  if (duplicate) {
    return res
      .status(409)
      .json({ error: "A book with the same title and author already exists" });
  }

  const created = await createBook(value);
  return res
    .status(201)
    .set("Location", `/api/books/${created.id}`)
    .json(created);
});

// PUT /api/books/:id
app.put("/api/books/:id", async (req, res) => {
  const id = parsePositiveIntId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "Book id must be a positive integer" });
  }

  const { error, value } = validateCompleteBook(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const existing = await getBookById(id);
  if (!existing) {
    return res.status(404).json({ error: "Book not found" });
  }

  const duplicate = await isDuplicateBook(value.title, value.author, id);
  if (duplicate) {
    return res
      .status(409)
      .json({ error: "Another book with the same title and author already exists" });
  }

  const updated = await replaceBook(id, value);
  return res.status(200).json(updated);
});

// PATCH /api/books/:id
app.patch("/api/books/:id", async (req, res) => {
  const id = parsePositiveIntId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "Book id must be a positive integer" });
  }

  const existing = await getBookById(id);
  if (!existing) {
    return res.status(404).json({ error: "Book not found" });
  }

  const { error, value } = validatePatchAndMerge(existing, req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const duplicate = await isDuplicateBook(value.title, value.author, id);
  if (duplicate) {
    return res
      .status(409)
      .json({ error: "Another book with the same title and author already exists" });
  }

  const updated = await replaceBook(id, value);
  return res.status(200).json(updated);
});

// DELETE /api/books/:id
app.delete("/api/books/:id", async (req, res) => {
  const id = parsePositiveIntId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "Book id must be a positive integer" });
  }

  const deleted = await deleteBook(id);
  if (!deleted) {
    return res.status(404).json({ error: "Book not found" });
  }

  return res.status(204).end();
});

// Deliberate crash route for testing async error middleware
app.get("/api/crash", async (req, res) => {
  throw new Error("Simulated async crash");
});

// 404 fallback for unmatched /api routes (Express 5 compliant)
app.use("/api", (req, res) => {
  return res.status(404).json({ error: "Not found" });
});

// 4-parameter global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  if (res.headersSent) {
    return next(err);
  }
  return res.status(500).json({ error: "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
