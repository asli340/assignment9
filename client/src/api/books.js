const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function handleResponse(response) {
  if (response.status === 204) {
    return null;
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      (data && data.error) || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export async function fetchBooks(params = {}, signal) {
  const url = new URL(`${API_BASE}/api/books`);
  Object.entries(params).forEach(([key, val]) => {
    if (val !== "" && val !== null && val !== undefined) {
      url.searchParams.set(key, String(val));
    }
  });

  const response = await fetch(url.toString(), { signal });
  return handleResponse(response);
}

export async function fetchStats(signal) {
  const response = await fetch(`${API_BASE}/api/stats`, { signal });
  return handleResponse(response);
}

export async function createBook(bookData) {
  const response = await fetch(`${API_BASE}/api/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookData),
  });
  return handleResponse(response);
}

export async function updateBook(id, bookData) {
  const response = await fetch(`${API_BASE}/api/books/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookData),
  });
  return handleResponse(response);
}

export async function patchBook(id, partialData) {
  const response = await fetch(`${API_BASE}/api/books/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(partialData),
  });
  return handleResponse(response);
}

export async function deleteBook(id) {
  const response = await fetch(`${API_BASE}/api/books/${id}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}
