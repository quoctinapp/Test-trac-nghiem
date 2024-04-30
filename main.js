const quizTimer = document.querySelector("#timer");
const quizProgress = document.querySelector("#progress");
const quizProgressText = document.querySelector("#progress_text");
const quizSubmit = document.querySelector("#quiz_submit");
const quizPrev = document.querySelector("#quiz_prev");
const quizNext = document.querySelector("#quiz_next");
const quizCount = document.querySelector(".quiz_question h5");
const quizAnswers = document.querySelectorAll(".quiz_question ul li");
let quizQuestions = document.querySelectorAll(".quiz_numbers ul li");
const quizQuestionList = document.querySelector(".quiz_numbers ul");
const quizAnswersItem = document.querySelectorAll(".quiz_answer_item");
const quizTitle = document.querySelector("#quiz_title");
const ready = document.getElementById("ready");
const home = document.getElementById("cancel");
const begin_scene = document.querySelector(".begin");
const main_scene = document.querySelector(".quiz_wrapper");
const begin = document.querySelector(".begin");
let questions;
let currentIndex = null;
let listSubmit = []; 
let listResults = []; 
let isSubmit = false;
let submitTime = 0;
const API ="https://script.google.com/macros/s/AKfycbxGgFeXihHaWdIcHlwJzk5v4QtkbStE5eOc0rxhRTUJxht7HR-Zm2u7pZXkZs4Kqxjr_w/exec";
function randomArray(array) {
  return (array = array.sort(() => Math.random() - Math.random()));
}
ready.addEventListener("click", function(e){
  setTimeout(() => {
    begin.innerHTML = "3";
    setTimeout(() => {
      begin.innerHTML = "2";
      setTimeout(() => {
        setTimeout(() => {
          begin.innerHTML = "1";
          setTimeout(() => {
            begin_scene.style.opacity = 0;
            begin_scene.style.pointerEvents = "none"; 
            begin_scene.style.zIndex = "0";
            main_scene.style.opacity = 1;
            main_scene.style.pointerEvents = "auto"; 
            main_scene.style.zIndex = "10";
            main_scene.style.animation = "zoom ease-in-out 3s";
            setTimeout(() => {
              quiz.start();
            }, 800);
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);  
  }, 1000);
});
home.addEventListener("click", function(e){
  alert("Bạn có chắc muốn trở về trang chủ khi chưa làm bài không?");
  window.location.href = "home.html";
});
const quiz = {
  randomQuestion: function () {
    questions = randomArray(questions);
    questions.forEach((q) => {
      q.answers = randomArray(q.answers);
    });
  },
  getQuestions: async function () {
    try {
      const response = await fetch(`${API}?category=DailyQuestionChemical`);
      const data = await response.json();
      questions = data;
      console.log(data);
    } catch (error) {
      console.log("An error appear when catching data", error);
    }
  },
  getResults: async function () {
    quizSubmit.innerText = "Đang nộp...";
    const postData = {
      category: "DailyQuestionChemical",
      questions: questions,
    };
    try {
      const response = await fetch(API, {
        method: "POST",
        body: JSON.stringify(postData),
      });
      const results = await response.json();
      this.handleCheckResults(results);
      quizSubmit.innerText = "Kết quả";
      quizSubmit.style = "pointer-events:none";
    } catch (error) {
      alert("Da xay ra loi");
    }
  },
  renderQuestionList: function () {
    let render = "";
    questions.forEach((question, index) => {
      render += `<li>${index + 1}</li>`;
    });
    quizQuestionList.innerHTML = render;
    quizQuestions = document.querySelectorAll(".quiz_numbers ul li");
  },
  renderCurrentQuestion: function () {
    quizCount.innerText = `Câu ${currentIndex + 1} trên ${questions.length}`;
    quizTitle.innerText = questions[currentIndex].question;
    quizAnswersItem.forEach((answer, index) => {
      answer.innerText = questions[currentIndex].answers[index];
    });
  },
  renderProgress: function () {
    quizProgress.style = `stroke-dasharray: 0 9999;`;
    quizProgressText.innerText = `0/${questions.length}`;
  },
  renderTimer: function () {
    var timer = 60*15; start_time = timer; 
    let _this = this;
    var countdownElement = document.getElementById("timer");
    function updateTimer() {
      var minutes = Math.floor(timer / 60);
      var seconds = timer % 60;
      var timerString = (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
      countdownElement.innerHTML = timerString;
      timer--;
      if (timer < 0) {
        countdownElement.innerHTML = "Hết thời gian!";
        _this.getResults();
        if(timer === 0){
          localStorage.setItem("Totaltime", start_time);
        }else{
          localStorage.setItem("Totaltime", timer);
        }
      }
      if (isSubmit) {
        if(timer === 0){
          localStorage.setItem("Totaltime", start_time);
        }else{
          localStorage.setItem("Totaltime", timer);
        }
        clearInterval(intervalId);
      }
    }
    var intervalId = setInterval(updateTimer, 1000);
  },
  handleProgress: function (correct) {
    const r = quizProgress.getAttribute("r");
    if (!isSubmit) {
      const progressLen = listSubmit.filter((item) => item >= 0);
      quizProgress.style = `stroke-dasharray: ${
        (2 * Math.PI * r * progressLen.length) / questions.length
      } 9999;`;
      quizProgressText.innerText = `${progressLen.length}/${questions.length}`;
    } else {
      quizProgress.style = `stroke-dasharray: ${
        (2 * Math.PI * r * correct) / questions.length
      } 9999;`;
      quizProgressText.innerText = `${correct}/${questions.length}`;
    }
  },
  handleQuestionList: function () {
    quizQuestions.forEach((item, index) => {
      item.addEventListener("click", () => {
        item.scrollIntoView({
          behavior: "smooth",
          inline: "center",
        });
        quizQuestions.forEach((item) => item.classList.remove("active"));
        item.classList.add("active");
        currentIndex = index;
        this.renderCurrentQuestion();
        quizAnswers.forEach((item) => item.classList.remove("active"));
        const selected = listSubmit[currentIndex];
        selected >= 0 && quizAnswers[selected].click();
        if (isSubmit) {
          this.renderResults();
        }
      });
    });
    quizQuestions[0].click();
  },
  handleNext: function () {
    quizNext.addEventListener("click", () => {
      ++currentIndex;
      if (currentIndex > questions.length - 1) {
        currentIndex = 0;
      }
      quizQuestions[currentIndex].click();
    });
  },
  handlePrev: function () {
    quizPrev.addEventListener("click", () => {
      --currentIndex;
      if (currentIndex < 0) {
        currentIndex = questions.length - 1;
      }
      quizQuestions[currentIndex].click();
    });
  },
  renderResults: function () {
    quizAnswers.forEach((item) => {
      item.classList.remove("active");
      item.classList.remove("correct"); 
      item.classList.remove("incorrect");
    });
    if (listResults[currentIndex] === listSubmit[currentIndex]) {
      quizAnswers[listResults[currentIndex]].classList.add("correct");
    } else {
      quizAnswers[listResults[currentIndex]].classList.add("correct"); 
      quizAnswers[listSubmit[currentIndex]].classList.add("incorrect"); 
    }
  },
  handleAnswer: function () {
    quizAnswers.forEach((answer, index) => {
      answer.addEventListener("click", () => {
        if (!isSubmit) {
          quizAnswers.forEach((item) => item.classList.remove("active"));
          answer.classList.add("active");
          quizQuestions[currentIndex].classList.add("selected");
          listSubmit[currentIndex] = index;
          this.handleProgress();
          quizNext.click();
        } else {
          return;
        }
      });
    });
  },
  saveToLocalStorage: function (id, data) {
    localStorage.setItem(id, JSON.stringify(data));
  },
  handleSubmit: function () {
    quizSubmit.addEventListener("click", () => {
      const progressLen = listSubmit.filter((item) => item >= 0);
      if (progressLen.length === questions.length) {
        this.getResults();
        const delaySubmit = () => {
          const checkLocalStorage = () => {
            const totalTime = localStorage.getItem("Totaltime");
            if (totalTime !== null) {
              clearInterval(intervalId);
              submitTime += 1; 
              console.log("Total time: ", totalTime);
              const correctCount = listResults.filter((result, index) => result === listSubmit[index]).length;
              const incorrectCount = listResults.length - correctCount; 
              const totalQuestions = questions.length; 
              const score = (totalQuestions / 10) * correctCount; 
              const data = {
                time: totalTime,
                correct: correctCount,
                incorrect: incorrectCount,
                score: score
              };
              const id = "Lần " + submitTime; 
              this.saveToLocalStorage(id, data);
            }
          };
          const intervalId = setInterval(checkLocalStorage, 1000); 
        };
        delaySubmit();
      } else {
        alert("Bạn chưa chọn hết đáp án");
      }
    });
  },
  handleCheckResults: function (results) {
    let correct = 0;
    questions.forEach((item, index) => {
      const result = results.find((r) => r.quiz_id === item.quiz_id);
      if (item.answers[listSubmit[index]] === result.answer) {
        listResults[index] = listSubmit[index];
        quizQuestions[index].classList.add("correct");
        correct++;
      } else {
        quizQuestions[index].classList.add("incorrect");
        listResults[index] = item.answers.indexOf(result.answer);
      }
    });
    isSubmit = true;
    this.handleProgress(correct);
    quizQuestions[0].click();
  },
  handleKeyDown: function () {
    document.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowRight":
          return quizNext.click();
        case "ArrowLeft":
          return quizPrev.click();
        default:
          return false;
      }
    });
  },
  render: function () {
    this.renderQuestionList();
    this.renderProgress();
    this.renderTimer();
  },
  handle: function () {
    this.handleQuestionList();
    this.handleAnswer();
    this.handleNext();
    this.handlePrev();
    this.handleKeyDown();
    this.handleSubmit();
  },
  start: async function () {
    await this.getQuestions();
    this.randomQuestion();
    this.render();
    this.handle();
  },
};
