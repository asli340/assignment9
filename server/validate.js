export const VALID_GENRES = [
  "fiction",
  "non-fiction",
  "science",
  "history",
  "fantasy",
  "other",
];

export function parsePositiveIntId(rawId) {
  if (!/^[1-9]\d*$/.test(String(rawId))) {
    return null;
  }
  const num = Number(rawId);
  return Number.isSafeInteger(num) ? num : null;
}

export function validateCompleteBook(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Request body must be a JSON object" };
  }

  // Title
  if (typeof body.title !== "string") {
    return { error: "Title is required and must be a string" };
  }
  const title = body.title.trim();
  if (title.length < 1 || title.length > 100) {
    return { error: "Title must be between 1 and 100 characters" };
  }

  // Author
  if (typeof body.author !== "string") {
    return { error: "Author is required and must be a string" };
  }
  const author = body.author.trim();
  if (author.length < 1 || author.length > 100) {
    return { error: "Author must be between 1 and 100 characters" };
  }

  // Year
  const currentYear = new Date().getFullYear();
  if (
    typeof body.year !== "number" ||
    !Number.isInteger(body.year) ||
    body.year < 1000 ||
    body.year > currentYear
  ) {
    return {
      error: `Year must be an integer between 1000 and ${currentYear}`,
    };
  }

  // Genre
  if (typeof body.genre !== "string" || !VALID_GENRES.includes(body.genre)) {
    return {
      error: `Genre must be one of: ${VALID_GENRES.join(", ")}`,
    };
  }

  // Read (defaults to false)
  let read = false;
  if (body.read !== undefined) {
    if (typeof body.read !== "boolean") {
      return { error: "Read status must be a boolean" };
    }
    read = body.read;
  }

  // Rating (defaults to null; allowed only when read is true)
  let rating = null;
  if (body.rating !== undefined && body.rating !== null) {
    if (
      typeof body.rating !== "number" ||
      !Number.isInteger(body.rating) ||
      body.rating < 1 ||
      body.rating > 5
    ) {
      return { error: "Rating must be an integer between 1 and 5, or null" };
    }
    if (!read) {
      return { error: "Rating can only be set when read is true" };
    }
    rating = body.rating;
  }

  return {
    value: {
      title,
      author,
      year: body.year,
      genre: body.genre,
      read,
      rating,
    },
  };
}

export function validatePatchAndMerge(existingBook, body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Request body must be a JSON object" };
  }

  const merged = {
    title: body.title !== undefined ? body.title : existingBook.title,
    author: body.author !== undefined ? body.author : existingBook.author,
    year: body.year !== undefined ? body.year : existingBook.year,
    genre: body.genre !== undefined ? body.genre : existingBook.genre,
    read: body.read !== undefined ? body.read : existingBook.read,
    rating: body.rating !== undefined ? body.rating : existingBook.rating,
  };

  if (body.read === false && body.rating === undefined) {
    merged.rating = null;
  }

  return validateCompleteBook(merged);
}

export function validateQueryParams(query) {
  const allowedKeys = ["genre", "read", "q", "sort", "order", "limit", "page"];
  for (const key of Object.keys(query)) {
    if (Array.isArray(query[key])) {
      return { error: `Repeated query parameter '${key}' is not allowed` };
    }
    if (!allowedKeys.includes(key)) {
      return { error: `Unknown query parameter '${key}'` };
    }
  }

  // genre
  let genre = null;
  if (query.genre !== undefined && query.genre !== "") {
    if (!VALID_GENRES.includes(query.genre)) {
      return { error: `Invalid genre. Must be one of: ${VALID_GENRES.join(", ")}` };
    }
    genre = query.genre;
  }

  // read
  let read = null;
  if (query.read !== undefined && query.read !== "") {
    if (query.read !== "true" && query.read !== "false") {
      return { error: "Query parameter 'read' must be 'true' or 'false'" };
    }
    read = query.read === "true";
  }

  // q
  const q = query.q !== undefined ? String(query.q).trim().toLowerCase() : "";

  // sort
  const validSorts = ["id", "title", "author", "year", "rating"];
  const sort = query.sort || "id";
  if (!validSorts.includes(sort)) {
    return { error: `Invalid sort field. Must be one of: ${validSorts.join(", ")}` };
  }

  // order
  const order = query.order || "asc";
  if (order !== "asc" && order !== "desc") {
    return { error: "Invalid order. Must be 'asc' or 'desc'" };
  }

  // limit
  let limit = 50;
  if (query.limit !== undefined && query.limit !== "") {
    if (!/^[1-9]\d*$/.test(query.limit)) {
      return { error: "Limit must be an integer between 1 and 50" };
    }
    limit = Number(query.limit);
    if (limit < 1 || limit > 50) {
      return { error: "Limit must be between 1 and 50" };
    }
  }

  // page
  let page = 1;
  if (query.page !== undefined && query.page !== "") {
    if (!/^[1-9]\d*$/.test(query.page)) {
      return { error: "Page must be a positive integer" };
    }
    page = Number(query.page);
  }

  return {
    value: { genre, read, q, sort, order, limit, page },
  };
}
