const fansMassagesList = document.getElementById('fansMassagesList');
const fansMassageText = document.getElementById('fansMassageText');
const addFansMassage = document.getElementById('addFansMassage');
const error = document.getElementById('error');
const clearLS = document.getElementById('clearLS');
const chooseStorage = document.getElementsByName('storage');
let useLocalStorage = localStorage.getItem('db') || true;

if (useLocalStorage === 'true') {
  chooseStorage[0].setAttribute('checked', true);
  getLocMessages();
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

addFansMassage.onclick = function () {
  if (!fansMassageText.value.trim().length) {
    fansMassageText.classList.add('error');
    error.style.display = 'block';
    setTimeout(function () {
      error.style.display = 'none';
    }, 2000);
  } else {
    const date = new Date();
    function addZero(i) {
      if (i < 10) {
        i = "0" + i;
      }
      return i;
    }
    const dateTime = `${addZero(date.getDate())}.${addZero(date.getMonth() + 1)}.${date.getFullYear()}, 
    ${addZero(date.getHours())}:${addZero(date.getMinutes())}`;
    if (useLocalStorage === 'true') {
      sendMessageToLS(fansMassageText.value.trim(), dateTime);
    } else {
      let message = new Message(fansMassageText.value.trim(), dateTime);
      message.sendMessageToIDB();
    }
    fansMassageText.classList.remove('error');
    fansMassageText.value = '';
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

  let transaction = db.transaction(["comments"], "readwrite");
  let objectStore = transaction.objectStore("comments");
  let getData = objectStore.getAll();
  if (useLocalStorage === 'false') {
    getData.onsuccess = function (event) {
      let data = getData.result;
      for (message of data) {
        const newMassage = `
        <section class="col-12 mt-3 mb-3 fan-massage">
          <p>${message.text}</p>
          <time>${message.time}</time>
          <span class="float-right"><b>New Fan</b></span>
        </section>
      `;
        fansMassagesList.insertAdjacentHTML('beforeend', newMassage);
      }
    }
  }
 
  return db;
};

class Message {
  constructor(text, time) {
    this.text = text;
    this.time = time;
  }
  sendMessageToIDB() {
    const transaction = db.transaction(['comments'], 'readwrite');
    transaction.objectStore('comments').add({
      text: this.text,
      time: this.time
    });
  }
}

function sendMessageToLS(text, time) {
  const message = { text, time };
  let messagesArr;
  if (localStorage.getItem('messages') === null) {
    messagesArr = [];
  } else {
    messagesArr = JSON.parse(localStorage.getItem('messages'));
  }
  messagesArr.push(message);
  localStorage.setItem('messages', JSON.stringify(messagesArr));
}

clearLS.onclick = function () {
  localStorage.removeItem('messages');
  clearLS.classList.remove('visible');
  location.reload();
}

window.addEventListener("online", function () {
  getLocMessages();
});

function getLocMessages() {
  if (localStorage.getItem('messages') !== null && useLocalStorage === 'true') {
    const locLength = JSON.parse(localStorage.getItem('messages'));
    for (let i = 0; i < locLength.length; i++) {
      const message = JSON.parse(localStorage.getItem('messages'))[i];
      const newMassage = `
    <section class="col-12 mt-3 mb-3 fan-massage">
      <p>${message.text}</p>
      <time>${message.time}</time>
      <span class="float-right"><b>New Fan</b></span>
    </section>
  `;
      fansMassagesList.insertAdjacentHTML('beforeend', newMassage);
    }
    if (localStorage.getItem('messages')) {
      clearLS.classList.add('visible');
    }
  }
}