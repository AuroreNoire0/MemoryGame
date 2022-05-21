"use strict";
import * as config from "./config.js";

const easyBtn = document.querySelector(".button--easy");
const mediumBtn = document.querySelector(".button--medium");
const hardBtn = document.querySelector(".button--hard");
const playBtn = document.querySelector(".button--play");
const playAgainBtn = document.querySelector(".button--play--again");
const exitBtn = document.querySelector(".button--exit");
const shuffleBtn = document.querySelector(".shuffle-btn");
const backBtn = document.querySelector(".back-btn");

const levelWindow = document.querySelector(".level-window");
const playWindow = document.querySelector(".play-window");
const headerStart = document.querySelector(".header-start");
const headerPlay = document.querySelector(".header-play");
const statisticsStart = document.querySelector(".statistics-start");
const statisticsPlay = document.querySelector(".statistics-play");
const modalReady = document.querySelector(".modal-ready");
const overlay = document.querySelector(".overlay");
const icons = document.querySelectorAll("i");
const timerValue = document.querySelector(".timer");
let theBestTimeLabels = document.querySelectorAll(".the-best-time");
const maxTimeLabel = document.querySelector(".max-time");

let timer;
let timerStatus = false;
let time = 0;
let theBestTime;
let cardsEasy = [];
let maxTime = 120;

//////////// FUNCTIONS

const setTime = function () {
  const min = String(Math.trunc(config.MAX_TIME / 60)).padStart(2, 0);
  const sec = String(Math.trunc(config.MAX_TIME % 60)).padStart(2, 0);
  maxTimeLabel.textContent = `${min}:${sec}`;
};
setTime();
console.log(typeof MAX_TIME);

const checkMatch = function () {
  const allCards = document.querySelectorAll(".main-card");
  const activeCards = document.querySelectorAll(".active");

  const hide = function () {
    activeCards.forEach((card) => card.classList.remove("active"));
    playWindow.addEventListener("click", flip);
  };

  const markAsMatched = function () {
    activeCards.forEach((card) => {
      card.classList.replace("active", "matched");
    });

    playWindow.addEventListener("click", flip);

    const matchedCards = document.querySelectorAll(".matched");
    if (matchedCards.length === allCards.length) {
      gameWon();
    }
  };

  if (activeCards.length === 2) {
    const [card1, card2] = [...activeCards];

    if (card1.getAttribute("id") === card2.getAttribute("id")) {
      setTimeout(markAsMatched, 1500);
    } else {
      setTimeout(hide, 1500);
    }

    playWindow.removeEventListener("click", flip);
  }
};

const flip = function (e) {
  const clicked = e.target.closest(".main-card");
  if (!clicked) return;

  clicked.classList.toggle("active");

  checkMatch();
};

const generateModal = function (modal) {
  playWindow.innerHTML = "";
  playWindow.innerHTML = modal;

  document
    .querySelector(".button--playagain")
    .addEventListener("click", shuffleCards);

  document
    .querySelector(".button--exit--again")
    .addEventListener("click", exitGame);

  clearInterval(timer);
};

const gameWon = function () {
  const modalWin = `
  <div class="modal-win">
    <h3> Congratulations! 🎉</h3>
    <p> Your time: ${timerValue.textContent}<p>
    <button class="button--playagain">Play again!</button>
    <button class="button--exit--again">Exit</button>
  </div>`;

  generateModal(modalWin);

  if (time < theBestTime || !theBestTime) {
    theBestTime = time - 1;
    const min = String(Math.trunc(theBestTime / 60)).padStart(2, 0);
    const sec = String(Math.trunc(theBestTime % 60)).padStart(2, 0);

    theBestTimeLabels.forEach(
      (btLabel) => (btLabel.textContent = `${min}:${sec}`)
    );
  }
};

const gameOver = function () {
  const modalLose = `
  <div class="modal-lose">
    <h3> Game over! 💥</h3>
    <button class="button--playagain">Play again!</button>
    <button class="button--exit--again">Exit</button>
  </div>`;

  generateModal(modalLose);
};

const startTimer = function () {
  time = 0;
  timerStatus = true;
  const countingDown = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(Math.trunc(time % 60)).padStart(2, 0);

    timerValue.textContent = `${min}:${sec}`;
    if (time === config.MAX_TIME) {
      clearInterval(timer);
      gameOver();
    }
    time++;
  };

  countingDown();
  timer = setInterval(countingDown, 1000);
  return timer;
};

const createCard = function (level) {
  let items;
  let i;
  let x;
  let arrIcons;

  if (level === "easy") {
    items = 16;
    arrIcons = config.iconsEasy;
  }
  if (level === "medium") {
    items = 36;
    arrIcons = config.iconsMedium;
  } else if (level === "hard") {
    items = 64;
    arrIcons = config.iconsHard;
  }

  for (x = 0; x < 2; x++) {
    for (i = 0; i < items / 2; i++) {
      const card = `
      <div id='icon-${i}' class='main-card main-card-${level}'>
          <div id='icon-${i}' class='card--front card--front-${level}'></div>
          <div id='icon-${i}' class='card--back card--back-${level}'>${arrIcons[i]}</div>
      </div>
      `;
      playWindow.insertAdjacentHTML("beforeend", card);
      cardsEasy.push(card);
    }
  }

  shuffleCards(level);
};

const shuffleCards = function (lvl) {
  let shuffledCards = [];
  let level = `${this ? this.dataset.level : lvl}`;
  let i;

  for (i = 0; i < cardsEasy.length + shuffledCards.length; i++) {
    let randomNum = Math.floor(Math.random() * cardsEasy.length);
    shuffledCards.push(cardsEasy[randomNum]);
    cardsEasy.splice(randomNum, 1);
  }

  cardsEasy = shuffledCards;

  playWindow.innerHTML = "";

  let newCard;
  let y;
  for (y = 0; y < cardsEasy.length; y++) {
    newCard = cardsEasy[y];
    playWindow.insertAdjacentHTML("beforeend", newCard);
  }

  if (timer && timerStatus) {
    clearInterval(timer);
    timer = startTimer();
  }
};

const startView = [headerStart, statisticsStart, levelWindow];
const playView = [playWindow, headerPlay, modalReady, overlay];

const loadGame = function (level) {
  // startView.forEach((el) => {
  //   el.style.opacity = "0";
  //   setTimeout(el.classList.add("hidden"), 1000);
  // });

  $(".level-window").fadeOut(500);
  $(".statistics-start").fadeOut(500);
  $(".header-start").fadeOut(500);

  const showGame = function () {
    $(".play-window").fadeIn(400, function () {
      this.classList.remove("hidden");
      this.style.display = "flex";
    });
    $(".header-play").fadeIn(400, function () {
      this.classList.remove("hidden");
      this.style.display = "flex";
    });
    $(".modal-ready").fadeIn(500, function () {
      this.classList.remove("hidden");
    });
    $(".overlay").fadeIn(400, function () {
      this.classList.remove("hidden");
    });
  };

  setTimeout(showGame, 500);

  createCard(level);
};

const exitGame = function () {
  if (timer) clearInterval(timer);
  timerStatus = false;

  const disappear = function () {
    this.classList.add("hidden");
  };

  $(".header-play").fadeOut(600, function () {
    setTimeout(disappear.bind(this), 500);
  });
  $(".play-window").fadeOut(600, function () {
    setTimeout(disappear.bind(this), 500);
  });
  $(".modal-ready").fadeOut(600, function () {
    setTimeout(disappear.bind(this), 500);
  });
  $(".overlay").fadeOut(600, function () {
    setTimeout(disappear.bind(this), 500);
  });

  const showWelcomePage = function () {
    $(".level-window").fadeIn(700);
    $(".statistics-start").fadeIn(700);
    $(".header-start").fadeIn(700);
    playWindow.innerHTML = "";
  };

  setTimeout(showWelcomePage, 900);

  cardsEasy = [];
};

const addHandlerLoadGame = function () {
  let level = this.dataset.level;
  shuffleBtn.dataset.level = level;
  loadGame(level);
  console.log(level);
};

const startGame = function () {
  modalReady.classList.add("hidden");
  overlay.classList.add("hidden");
  startTimer();
};

//////// HANDLERS

easyBtn.addEventListener("click", addHandlerLoadGame);
mediumBtn.addEventListener("click", addHandlerLoadGame);
hardBtn.addEventListener("click", addHandlerLoadGame);
exitBtn.addEventListener("click", exitGame);
playBtn.addEventListener("click", startGame);
shuffleBtn.addEventListener("click", shuffleCards);
backBtn.addEventListener("click", exitGame);
playWindow.addEventListener("click", flip);
