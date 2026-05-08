import {
  renderHTML,
  typingArea,
  renderResult,
} from "./generateHTML.js";
import {
  wpmDisplay,
  accuracyDisplay,
  stopTyping,
  setResult,
} from "./typing.js";


const best = document.querySelector("#best");
const timer = document.querySelector("#timer");
const easyBtn = document.querySelector("#easy");
const mediumBtn = document.querySelector("#medium");
const hardBtn = document.querySelector("#hard");
const timed = document.querySelector("#timed");
const startBtn = document.querySelector("#start-btn");
const diffSelect = document.querySelector("#diff-select");
export const hiddenInput = document.querySelector("#hidden-input");

export const diffBtns = [easyBtn, mediumBtn, hardBtn];
export let difficultLevel = "hard";
export let time = 60;
let timeTaken = 60;
let interval = null;

function setTimer() {
  clearInterval(interval);
  time = 60;
  timer.textContent = `0:${time.toString().padStart(2, "0")}`;

  interval = setInterval(() => {
    time--;
    timer.textContent = `0:${time.toString().padStart(2, "0")}`;
    if (time === 0) {
      finish(timeTaken);
    }
  }, 1000);
}

export function finish(timerId) {
  clearInterval(interval);
  interval = null;
  stopTyping();
  const { WPM, Accuracy, correctChar, incorrectChar } = setResult(timerId);
  renderResult(WPM, Accuracy, correctChar, incorrectChar);
}

function setActive(btn) {
  diffBtns.forEach((Btn) => {
    Btn.classList.remove("active");
  });

  btn.classList.add("active");
}

export function personal_Best() {
  const score = Number(localStorage.getItem("personalBest"));
  best.innerHTML = score
    ? `  <img src="icons/icon-personal-best.svg" alt=""> Personal best: ${score} WPM<span></span>`
    : `<img src="icons/icon-personal-best.svg" alt=""> Personal best: -- <span></span>`;
}

personal_Best();

export function focusHiddenInput() {
  if (!hiddenInput) return;
  hiddenInput.value = "";
  hiddenInput.removeAttribute("readonly");
  hiddenInput.focus();
  setTimeout(() => hiddenInput.focus(), 100);
}

export function startTest(difficulty = difficultLevel, buttons = hardBtn) {
  setTimer();
  renderHTML(difficulty);
  setActive(buttons);
  focusHiddenInput();
  wpmDisplay.textContent = `0`;
  accuracyDisplay.textContent = `100%`;
  if (diffSelect) diffSelect.value = difficulty;
}

startBtn?.addEventListener("click", () => {
  startTest();
});


easyBtn.addEventListener("click", () => {
  difficultLevel = "easy";
  startTest(difficultLevel, easyBtn);
});

mediumBtn.addEventListener("click", () => {
  difficultLevel = "medium";
  startTest(difficultLevel, mediumBtn);
});

hardBtn.addEventListener("click", () => {
  difficultLevel = "hard";
  startTest(difficultLevel, hardBtn);
});

typingArea.addEventListener("click", (e) => {
  focusHiddenInput();

  if (e.target.closest(".btn-reset")) {
    stopTyping();
    startTest(
      difficultLevel,
      diffBtns.find((b) => {
        return b.classList.contains("active");
      }),
    );
  }
});

document.addEventListener(
  "touchstart",
  (e) => {
    if (e.target.tagName === "BUTTON") return;
    focusHiddenInput();
  },
  { passive: true },
);

diffSelect.addEventListener("change" , ()=>{
  difficultLevel = diffSelect.value;
  const valueBtn = document.querySelector(`#${diffSelect.value}`);
  startTest(difficultLevel , valueBtn);
})