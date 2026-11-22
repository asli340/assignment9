const delay = (ms = 20) => new Promise((resolve) => setTimeout(resolve, ms));

let nextId = 7;

let books = [
  {
    id: 1,
    title: "Dune",
    author: "Frank Herbert",
    year: 1965,
    genre: "science",
    read: true,
    rating: 5,
  },
  {
    id: 2,
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    year: 2011,
    genre: "history",
    read: true,
    rating: 4,
  },
  {
    id: 3,
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    year: 1937,
    genre: "fantasy",
    read: true,
    rating: 5,
  },
  {
    id: 4,
    title: "1984",
    author: "George Orwell",
    year: 1949,
    genre: "fiction",
    read: false,
    rating: null,
  },
  {
    id: 5,
    title: "Atomic Habits",
    author: "James Clear",
    year: 2018,
    genre: "non-fiction",
    read: true,
    rating: 4,
  },
  {
    id: 6,
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    year: 2007,
    genre: "fantasy",
    read: false,
    rating: null,
  },
];

export async function getAllBooks() {
  await delay();
  return books.map((b) => ({ ...b }));
}

export async function getBookById(id) {
  await delay();
  const book = books.find((b) => b.id === id);
  return book ? { ...book } : null;
}

export async function isDuplicateBook(title, author, excludeId = null) {
  await delay(5);
  const normTitle = title.trim().toLowerCase();
  const normAuthor = author.trim().toLowerCase();
  return books.some(
    (b) =>
      b.id !== excludeId &&
      b.title.trim().toLowerCase() === normTitle &&
      b.author.trim().toLowerCase() === normAuthor
  );
}

export async function createBook(data) {
  await delay();
  const newBook = {
    id: nextId++,
    title: data.title,
    author: data.author,
    year: data.year,
    genre: data.genre,
    read: data.read,
    rating: data.rating,
  };
  books = [...books, newBook];
  return { ...newBook };
}

export async function replaceBook(id, data) {
  await delay();
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const updatedBook = {
    id,
    title: data.title,
    author: data.author,
    year: data.year,
    genre: data.genre,
    read: data.read,
    rating: data.rating,
  };
  books = books.map((b) => (b.id === id ? updatedBook : b));
  return { ...updatedBook };
}

export async function deleteBook(id) {
  await delay();
  const exists = books.some((b) => b.id === id);
  if (!exists) return false;

  books = books.filter((b) => b.id !== id);
  return true;
}
