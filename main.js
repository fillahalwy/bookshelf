const books = [];
const RENDER_EVENT = 'render-books';
const STORAGE_KEY = 'BOOKSHELF_APPS';
const SAVED_EVENT = 'saved-book';

// fungsi cek ketersediaan web storage
function isStorageExist(){
  if(typeof(Storage) === undefined){
		alert('Browser tidak mendukung web storage');
		return false;
  }else {
		return true;
  }
};

// fungsi untuk generate id buku
function generateBookId(){
	return +new Date();
};

// fungsi untuk generate object buku
function generateBookObject(id, title, author, year, isComplete){
	return{ 
		id, 
		title, 
		author, 
		year,
		isComplete 
	}
};

function findBook(bookId){
	for(bookItem of books){
		if(bookItem.id === bookId){
			return bookItem;
		}
	}
	return null;
};

function findBookIndex(bookId){
	for(index in books){
		if(books[index].id === bookId){
			return index;
		}
	}
	return -1;
};

// fungsi untuk menambah daftar buku
function makeBook(bookObject){
	const {id, title, author, year, isComplete} = bookObject;

	const textBookTitle = document.createElement('h3');
	textBookTitle.setAttribute('data-testid', 'bookItemTitle');
	textBookTitle.innerText = bookObject.title;

	const textBookAuthor = document.createElement('p');
	textBookAuthor.setAttribute('data-testid', 'bookItemAuthor');
	textBookAuthor.innerText = 'Penulis: ' + bookObject.author;

	const textBookYear = document.createElement('p');
	textBookYear.setAttribute('data-testid', 'bookItemYear');
	textBookYear.innerText = 'Tahun: ' + bookObject.year;

	const buttonCompleted = document.createElement('button');
	buttonCompleted.classList.add('button-green');
	buttonCompleted.setAttribute('data-testid', 'bookItemIsCompleteButton');
	if(bookObject.isComplete){
		buttonCompleted.innerText = 'Belum selesai dibaca';
		buttonCompleted.addEventListener('click', function (){
			undoBookFromComplete(bookObject.id);
		});
	} else {
		buttonCompleted.innerText = 'Selesai dibaca';
		buttonCompleted.addEventListener('click', function (){
			addBookToComplete(bookObject.id);
		});
	};

	const buttonDelete = document.createElement('button');
	buttonDelete.classList.add('button-red');
	buttonDelete.setAttribute('data-testid', 'bookItemDeleteButton');
	buttonDelete.innerText = 'Hapus Buku';
	buttonDelete.addEventListener('click', function (){
		confirm(`Apakah Anda yakin ingin menghapus buku '${bookObject.title}'`) ? deleteBook(bookObject.id): '' ;
	});
	
	const buttonEdit = document.createElement('button');
	buttonEdit.classList.add('button-blue');
	buttonEdit.setAttribute('data-testid', 'bookItemEditButton');
	buttonEdit.innerText = 'Edit Buku';
	buttonEdit.addEventListener('click', function (){
		editBook(bookObject.id);
	});

	const buttonsContainer = document.createElement('div');
	buttonsContainer.classList.add('action_buttons');
	buttonsContainer.append(buttonCompleted, buttonDelete, buttonEdit);

	const container = document.createElement('div');
	container.setAttribute('data-bookid', bookObject.id);
	container.setAttribute('data-testid', 'bookItem');
	container.append(textBookTitle, textBookAuthor, textBookYear, buttonsContainer);

	return container;
};

// fungsi untuk memasukkan buku baru ke dalam array
function addBook(){
	const bookID = generateBookId();
	const title = document.getElementById('bookFormTitle').value;
	const author = document.getElementById('bookFormAuthor').value;
	const year = Number(document.getElementById('bookFormYear').value);
	const isComplete = document.getElementById('bookFormIsComplete').checked ? true : false;
	const bookObject = generateBookObject(bookID, title, author, year, isComplete);
	books.push(bookObject);

	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
};

// fungsi untuk hapus data buku
function deleteBook(bookId){
	const bookTarget = findBookIndex(bookId);
	if(bookTarget === -1) return;
	books.splice(bookTarget, 1);
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
};

// fungsi untuk edit data buku
function editBook(bookId){
	const editModal = document.getElementById('editBookModal');
	const bookToEdit = findBook(bookId);
	if(!bookToEdit) return;

	document.getElementById('editBookId').value = bookToEdit.id;
	document.getElementById('editBookTitle').value = bookToEdit.title;
	document.getElementById('editBookAuthor').value = bookToEdit.author;
	document.getElementById('editBookYear').value = bookToEdit.year;

	editModal.showModal();
};

// fungsi untuk memindahkan buku yang selesai dibaca
function addBookToComplete(bookId){
	const bookTarget = findBook(bookId);
	if(findBook == null) return;
	bookTarget.isComplete = true;
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
};

// fungsi untuk memindahkan buku yang belum selesai dibaca
function undoBookFromComplete(bookId){
	const bookTarget = findBook(bookId);
	if(bookTarget == null) return;
	bookTarget.isComplete = false;
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
};

// fungsi untuk menyimpan data array ke dalam localStorage
function saveData(){
	if(isStorageExist()){
	const parsed = JSON.stringify(books);
		localStorage.setItem(STORAGE_KEY, parsed);
		document.dispatchEvent(new Event(SAVED_EVENT));
	}
};

// fungsi untuk load data dari storage
function loadDataFromStorage(){
	const serializedData = localStorage.getItem(STORAGE_KEY);
	let data = JSON.parse(serializedData);

	if(data !== null){
		for(const book of data){
			books.push(book);
		}       
	};

	document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener('DOMContentLoaded', function (){
	const bookForm = document.getElementById('bookForm');
	bookForm.addEventListener('submit', function (event) {
		event.preventDefault();
		addBook();
		bookForm.reset();
	});


	const searchForm = document.getElementById('searchBook');
	const searchInput = document.getElementById('searchBookTitle');
	searchForm.addEventListener('submit', function(event){
		event.preventDefault();
		document.dispatchEvent(new Event(RENDER_EVENT));
	});
	searchInput.addEventListener('input', function(){
		document.dispatchEvent(new Event(RENDER_EVENT));
	});

	const editBookForm = document.getElementById('editBookForm');
  editBookForm.addEventListener('submit', function(event){
      event.preventDefault();
      const bookId = Number(document.getElementById('editBookId').value);
      const bookTarget = findBook(bookId);
      bookTarget.title = document.getElementById('editBookTitle').value;
      bookTarget.author = document.getElementById('editBookAuthor').value;
      bookTarget.year = Number(document.getElementById('editBookYear').value);

      saveData();
      document.dispatchEvent(new Event(RENDER_EVENT));
      document.getElementById('editBookModal').close();
  });

  const cancelEditButton = document.getElementById('cancelEdit');
  cancelEditButton.addEventListener('click', function(){
      document.getElementById('editBookModal').close();
  });

	if(isStorageExist()){
		loadDataFromStorage();
	};
});

// fungsi untuk merender event ke document
document.addEventListener(RENDER_EVENT, function () {
	const incompleteBooks = document.getElementById('incompleteBookList');
	const completeBooks = document.getElementById('completeBookList');

	incompleteBooks.innerHTML = '';
	completeBooks.innerHTML = '';

	// filter search
	const searchInput = document.getElementById('searchBookTitle').value.toLowerCase();
	const filteredBooks = books.filter(book => {
		return book.title.toLowerCase().includes(searchInput);
	});

	for(const bookItem of filteredBooks){
		const bookElement = makeBook(bookItem);
		if(bookItem.isComplete){
			completeBooks.append(bookElement);
		}else{
			incompleteBooks.append(bookElement);
		}
	}
});

document.addEventListener(SAVED_EVENT, function () {
	console.log(localStorage.getItem(STORAGE_KEY));
});
