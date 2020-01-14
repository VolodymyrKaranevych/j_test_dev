const newsImage = document.getElementById('newsImage');
const newsTitle = document.getElementById('newsTitle');
const newsText = document.getElementById('newsText');
const addNews = document.getElementById('addNews');
const newsImgPreview = document.getElementById('newsImgPreview');
const popup = document.getElementById('popup');
const error = document.getElementById('error');
const clearLS = document.getElementById('clearLS');
const chooseStorage = document.getElementsByName('storage');
let useLocalStorage = localStorage.getItem('db') || true;

if (useLocalStorage === 'true') {
  chooseStorage[0].setAttribute('checked', true);
} else {
  chooseStorage[1].setAttribute('checked', true);
}

chooseStorage.forEach(function (input) {
  input.onchange = function () {
    if (this.value === 'IndexedDB') {
      useLocalStorage = false;
      localStorage.setItem('db', 'false');
    } else {
      useLocalStorage = true;
      localStorage.setItem('db', 'true');
    }
    location.reload();
  }
});

newsImage.onchange = function () {
  newsImgPreview.setAttribute('src', 'images/' + newsImage.files[0].name);
}

addNews.onclick = function () {
  if (!newsImage.value.length || !newsTitle.value.trim().length || !newsText.value.trim().length) {
    !newsImage.value.length && newsImage.classList.add('error');
    !newsTitle.value.trim().length && newsTitle.classList.add('error');
    !newsText.value.trim().length && newsText.classList.add('error');
    error.style.display = 'block';
    setTimeout(function () {
      error.style.display = 'none';
    }, 2000);
  } else {
    if (useLocalStorage === 'true') {
      localNews('images/' + newsImage.files[0].name, newsTitle.value.trim(), newsText.value.trim());
    } else {
      let news = new News('images/' + newsImage.files[0].name, newsTitle.value.trim(), newsText.value.trim());
      news.sendNewsToIDB();
    }
    newsImage.classList.remove('error');
    newsTitle.classList.remove('error');
    newsText.classList.remove('error');
    newsImgPreview.setAttribute('src', 'images/noimage.jpg');
    newsImage.value = '';
    newsTitle.value = '';
    newsText.value = '';
    popup.style.display = 'block';
    setTimeout(function () {
      popup.style.display = 'none';
    }, 2000);
  }
}

const request = window.indexedDB.open('sportSiteDB', 5);
let db;

request.onupgradeneeded = function (event) {
  db = event.target.result;

  if (!db.objectStoreNames.contains('comments')) {
    let objectStore = db.createObjectStore('comments', { keyPath: 'id', autoIncrement: true });
    objectStore.createIndex('text', 'text', { unique: false });
    objectStore.createIndex('time', 'time', { unique: false });
  }
  if (!db.objectStoreNames.contains('news')) {
    let objectStore = db.createObjectStore('news', { keyPath: 'id', autoIncrement: true });
    objectStore.createIndex('image', 'image', { unique: false });
    objectStore.createIndex('title', 'title', { unique: false });
    objectStore.createIndex('text', 'text', { unique: false });
  }
}
request.onerror = function (event) {
  console.log('ERROR');
};
request.onsuccess = function (event) {
  console.log('success');
  db = event.target.result;

  return db;
};

class News {
  constructor(image, title, text) {
    this.image = image;
    this.title = title;
    this.text = text;
  }
  sendNewsToIDB() {
    const transaction = db.transaction(['news'], 'readwrite');
    transaction.objectStore('news').add({
      image: this.image,
      title: this.title,
      text: this.text
    });
  }
}
//
//




function localNews(image, title, text) {
  const news = { image, title, text };
  let newsArr;
  if (localStorage.getItem('news') === null) {
    newsArr = [];
  } else {
    newsArr = JSON.parse(localStorage.getItem('news'));
  }
  newsArr.push(news);
  localStorage.setItem('news', JSON.stringify(newsArr));
  clearLS.classList.add('visible');
}

if (localStorage.getItem('news') && useLocalStorage === 'true') {
  clearLS.classList.add('visible');
}

clearLS.onclick = function () {
  localStorage.removeItem('news');
  clearLS.classList.remove('visible');
}