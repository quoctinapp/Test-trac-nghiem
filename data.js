import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import { getStorage, ref as sRef, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBYbY0ANxyvkY0d45uxBYUYnMrqDeKlf18",
  authDomain: "sock-khkt-2023-2024.firebaseapp.com",
  projectId: "sock-khkt-2023-2024",
  storageBucket: "sock-khkt-2023-2024.appspot.com",
  messagingSenderId: "799639384657",
  appId: "1:799639384657:web:ce7f2491b8e6af6b0cfe70",
  measurementId: "G-L9TMRSGQY9"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

function fetchDataFromFirebase(classLevel, ) {
  const classDisplay = document.getElementById("class_id");
  classDisplay.innerText = classLevel;
  const dataBody = document.getElementById('data-body');
  dataBody.innerHTML = '';

  const resultExamRef = ref(db, `ResultExam/${classLevel}`);
  get(resultExamRef).then((snapshot) => {
    if (snapshot.exists()) {
      const classData = snapshot.val().User;
      Object.values(classData).forEach(childData => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${childData.IdentificationNumber}</td>
          <td>${childData.username}</td>
          <td>${childData.class}</td>
          <td>${childData.time}</td>
          <td>${childData.correct}</td>
          <td>${childData.incorrect}</td>
          <td>${childData.percentage}</td>
          <td>${childData.score}</td>
        `;
        dataBody.appendChild(row);
      });
    } else {
      console.error("No data available for the specified class.");
    }
  }).catch((error) => {
    console.error("Error fetching data:", error);
  });
}

document.addEventListener("DOMContentLoaded", function (e) {
  const GetDataFromLocalStorage = localStorage.getItem("DataExamConfig");
  const DataExamConfig = JSON.parse(GetDataFromLocalStorage);
  if (DataExamConfig) {
    let classData = DataExamConfig.class;
    fetchDataFromFirebase(classData);
  }

  function EncodeBase64(password){
    return btoa(unescape(encodeURIComponent(password)));
  }
  function GetIDSheetFromLinkGoogleSheet(link) {
    const regex = /\/d\/([a-zA-Z0-9-_]+)/;
    const match = link.match(regex);
    return match ? match[1] : null;
  }

  const form = document.querySelector('form');
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const examName = document.getElementById('ExamName').value;
    const sheetName = document.getElementById('SheetName').value;
    const time = document.getElementById('TimeExam').value;
    const questionCount = document.getElementById('QuestionLength').value;
    const classLevel = document.getElementById('ClassExam').value;
    const pointScale = document.getElementById('PointLadder').value;
    const LinkDataBaseInp = document.getElementById("LinkDataBase").value;
    const IDDataBase = GetIDSheetFromLinkGoogleSheet(LinkDataBaseInp);
    const passwordExamInp = document.getElementById("PassExam").value;
    const PassExam = EncodeBase64(passwordExamInp);
    const jsonData = {
      ExamCode: examName,
      category: sheetName,
      time: (time * 60),
      questionLength: questionCount,
      class: classLevel,
      pointScale: pointScale,
      passExam: PassExam,
      IDSheet: IDDataBase
    };
    const jsonDataStr = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonDataStr], { type: 'application/json' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FileConfigExam${classLevel}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const configRef = ref(db, `ResultExam/${classLevel}/ConfigFile`);
    set(configRef, JSON.stringify(jsonData)).then(() => {
      console.log('Configuration saved to database');
      alert("Saved to FireBase successfully")
    }).catch((error) => {
      console.error('Error saving configuration:', error);
      alert("An error appeared when trying saving data to firebase: ", error);
    });
  });

  const DataScene = document.getElementById("DataScene");
  const openConfigScene = document.getElementById("OpenConfigScene");
  const ConfigScene = document.getElementById("ConfigScene");
  const closeConfigScene = document.getElementById("closeConfigScene");

  openConfigScene.addEventListener("click", function (e) {
    ConfigScene.style.opacity = "1";
    ConfigScene.style.pointerEvents = "auto";
    ConfigScene.style.zIndex = "10";

    DataScene.style.opacity = "0";
    DataScene.style.pointerEvents = "none";
    DataScene.style.zIndex = "0";
  });

  closeConfigScene.addEventListener("click", function (e) {
    ConfigScene.style.opacity = "0";
    ConfigScene.style.pointerEvents = "none";
    ConfigScene.style.zIndex = "0";

    DataScene.style.opacity = "1";
    DataScene.style.pointerEvents = "auto";
    DataScene.style.zIndex = "10";
  });

  function isJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  function checkFileJson(file) {
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop().toLowerCase();
    return fileExtension === 'json';
  }

  function extractDataFromJson(jsonString) {
    const jsonObject = JSON.parse(jsonString);
    return jsonObject;
  }

  function getDataFromFile() {
    const file = fileInput.files[0];
    if (!file) {
      alert("Please insert the file config");
      return;
    }
    if (!checkFileJson(file)) {
      alert("Error, Please input a json file");
      return;
    }
    const reader = new FileReader();
    reader.onload = function (event) {
      const fileContent = event.target.result;
      if (isJsonString(fileContent)) {
        const data = extractDataFromJson(fileContent);
        localStorage.setItem("DataExamConfig", JSON.stringify(data));
        location.reload(true);
      } else {
        alert("File must be a Json structure");
      }
    };
    reader.readAsText(file);
  }

  const fileInput = document.getElementById("FileInp");
  fileInput.addEventListener("change", function (e) {
    getDataFromFile();
  });

  const resetBtn = document.getElementById("resetBtn");
  resetBtn.addEventListener("click", function(e){
    location.reload(true);
  });
});