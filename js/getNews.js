const newsList = document.getElementById('news-container');
const chooseStorage = document.getElementsByName('storage');
let useLocalStorage = localStorage.getItem('db') || true;

if (useLocalStorage === 'true') {
  chooseStorage[0].setAttribute('checked', true);
  getLocNews();
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

const request = window.indexedDB.open('sportSiteDB', 5);
let db;

request.onerror = function (event) {
  console.log('ERROR');
};

request.onsuccess = function (event) {
  console.log('success');
  db = event.target.result;

  let transaction = db.transaction(["news"], "readwrite");
  let objectStore = transaction.objectStore("news");
  let getData = objectStore.getAll();
  if (useLocalStorage === 'false') {
    getData.onsuccess = function (event) {
      let data = getData.result;
      for (news of data) {
        const newNews = `
    <div class="col-sm-6 col-lg-3  mt-3 mb-3">
      <article class="card">
        <img class="card-img-top" src="${news.image}">
        <h5 class="text-center card-title mt-3">${news.title}</h5>
        <p class="card-text p-2">${news.text}</p>
      </article>
    </div>
    `;
      newsList.insertAdjacentHTML('afterbegin', newNews);
      }
    }
  }
};



window.addEventListener("online", function() {
  getLocNews();
});

function getLocNews() {
  if (localStorage.getItem('news') !== null) {
    const locLength = JSON.parse(localStorage.getItem('news'));
    for (let i = 0; i < locLength.length; i++) {
      const news = JSON.parse(localStorage.getItem('news'))[i];
      const newNews = `
    <div class="col-sm-6 col-lg-3  mt-3 mb-3">
      <article class="card">
        <img class="card-img-top" src="${news.image}">
        <h5 class="text-center card-title mt-3">${news.title}</h5>
        <p class="card-text p-2">${news.text}</p>
      </article>
    </div>
    `;
      newsList.insertAdjacentHTML('afterbegin', newNews);
    }
  }
};
