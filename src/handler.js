const { nanoid } = require("nanoid");
const books = require("./books");

// Menyimpan Buku
const addBook = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;
  const id = nanoid(16);
  const finished = pageCount === readPage;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
    id,
    finished,
    insertedAt,
    updatedAt,
  };

  //Client Tidak melampirkan property name pada requset body
  if (name === undefined) {
    const response = h.response({
      status: "fail",
      message: "Gagal menambahkan buku. Mohon isi nama buku",
    });
    response.code(400);
    return response;
  }

  //Client melampirkan nilai properti readPage yang lebih besar dari nilai properti pageCount
  if (readPage > pageCount) {
    const response = h.response({
      status: "fail",
      message:
        "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount",
    });
    response.code(400);
    return response;
  }

  books.push(newBook);
  const isSuccess = books.filter((book) => book.id === id).length > 0;

  //Jika buku berhasil dimasukkan atau disimpan
  if (isSuccess) {
    const response = h.response({
      status: "success",
      message: "Buku berhasil ditambahkan",
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  //Jika server gagal memasukkan atau menyimpan buku
  const response = h.response({
    status: "error",
    message: "Buku gagal ditambahkan",
  });
  response.code(500);
  return response;
};

//Mendapatkan dan menampilkan seluruh data buku
const getAllBooks = (request, h) => {
  const { name, reading, finished } = request.query;

  //Query parameters untuk menampilkan buku berdasarkan nama yang dicari
  if (name !== undefined) {
    const nameQuery = books.filter((book) =>
      book.name.toLowerCase().includes(name.toLowerCase())
    );
    const response = h.response({
      status: "success",
      data: {
        books: nameQuery.map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        })),
      },
    });
    response.code(200);

    return response;
  }

  //Query parameters untuk menampilkan buku yang sedang dibaca/belum
  if (reading !== undefined) {
    const readBook = books.filter(
      (book) => Number(book.reading) === Number(reading)
    );
    const response = h.response({
      status: "success",
      data: {
        books: readBook.map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        })),
      },
    });
    response.code(200);
    return response;
  }

  //Query parameters untuk menampilkan buku yang sudah diselesaikan
  if (finished !== undefined) {
    const finishedBook = books.filter(
      (book) => Number(book.finished) === Number(finished)
    );
    const response = h.response({
      status: "success",
      data: {
        books: finishedBook.map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        })),
      },
    });
    response.code(200);
    return response;
  }

  //Berhasil menampilkan buku
  const response = h.response({
    status: "success",
    data: {
      books: books.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      })),
    },
  });
  response.code(200);
  return response;
};

//Menampilkan buku berdasarkan id yang dicari
const getBookById = (request, h) => {
  const { bookId } = request.params;
  const book = books.filter((b) => b.id === bookId)[0];
  if (book !== undefined) {
    return {
      status: "success",
      data: {
        book,
      },
    };
  }

  //Jika id buku tidak ditemukan
  const response = h.response({
    status: "fail",
    message: "Buku tidak ditemukan",
  });
  response.code(404);
  return response;
};

//Melakukan edit/perubahan pada buku
const editBookById = (request, h) => {
  const { bookId } = request.params;
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;
  const updatedAt = new Date().toISOString();

  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };

    //Client tidak melampirkan properti name pada request body
    if (name === undefined) {
      const response = h.response({
        status: "fail",
        message: "Gagal memperbarui buku. Mohon isi nama buku",
      });
      response.code(400);
      return response;
    }

    //Client melampirkan nilai properti readPage yang lebih besar dari nilai properti pageCount
    if (readPage > pageCount) {
      const response = h.response({
        status: "fail",
        message:
          "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
      });
      response.code(400);
      return response;
    }
    //Jika buku berhasil diperbarui, kembalikan response
    const response = h.response({
      status: "success",
      message: "Buku berhasil diperbarui",
    });
    response.code(200);
    return response;
  }

  //Jika id yang dilampirkan oleh client tidak ditemukkan oleh server
  const response = h.response({
    status: "fail",
    message: "Gagal memperbarui buku. Id tidak ditemukan",
  });
  response.code(404);
  return response;
};

//Menghapus buku
const deleteBookById = (request, h) => {
  const { bookId } = request.params;

  const index = books.findIndex((book) => book.id === bookId);

  //Jika id dimiliki oleh salah satu buku, maka buku tersebut harus dihapus
  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: "success",
      message: "Buku berhasil dihapus",
    });
    response.code(200);
    return response;
  }

  //Jika id yang dilampirkan tidak dimiliki oleh buku manapun
  const response = h.response({
    status: "fail",
    message: "Buku gagal dihapus. Id tidak ditemukan",
  });
  response.code(404);
  return response;
};

module.exports = {
  addBook,
  getAllBooks,
  getBookById,
  editBookById,
  deleteBookById,
};
