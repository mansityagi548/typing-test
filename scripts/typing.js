import { hiddenInput, finish, time } from "./script.js";
let correctChar = 0;
let incorrectChar = 0;
let cacheSpans = null;
let currentIndex = 0;
let cursorEl = null;
let elapsedSeconds = 0;
let elapsedInterval = null;
let handleTyping = null;
let handleMobileInput = null;

export const wpmDisplay = document.querySelector("#wpm");
export const accuracyDisplay = document.querySelector("#accuracy");

function cachedSpans() {
  cacheSpans = Array.from(document.querySelectorAll("#textDisplay span"));
  cursorEl = document.createElement("span");
  cursorEl.className = "typing-cursor";
  placeCursor(0);
}

function placeCursor(index) {
  if (!cacheSpans || index > cacheSpans.length) return;
  if (index < cacheSpans.length) {
    cacheSpans[index].before(cursorEl);
  }
}

function updateStats() {
  const totalTyped = correctChar + incorrectChar;
  const accuracy =
    totalTyped === 0 ? 100 : Math.round((correctChar / totalTyped) * 100);
  const minutes = elapsedSeconds > 0 ? elapsedSeconds / 60 : 1 / 60;
  const wpm = Math.round(correctChar / 5 / minutes);
  wpmDisplay.textContent = wpm;
  accuracyDisplay.textContent = accuracy + "%";
}

function backspace() {
  if (currentIndex === 0) return;
  currentIndex--;
  const charSpan = cacheSpans[currentIndex];
  if (charSpan.classList.contains("txt-success")) correctChar--;
  if (charSpan.classList.contains("txt-error")) incorrectChar--;
  charSpan.className = "txt-pending";
  updateStats();
  placeCursor(currentIndex);
}

function processChar(char) {
  if (!cacheSpans || currentIndex >= cacheSpans.length) return;
 
  const content = cacheSpans[currentIndex];
  if (char === content.textContent) {
    correctChar++;
    content.className = "txt-success";
  } else {
    incorrectChar++;
    content.className = "txt-error";
  }

  currentIndex++;
  placeCursor(currentIndex);
  updateStats();

   if (currentIndex === cacheSpans.length) {
    finish(60 - time);
  }
}

function isMobileDevice() {
  return (
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    navigator.maxTouchPoints > 1
  );
}

export function startTyping() {
  correctChar = 0;
  incorrectChar = 0;
  cacheSpans = null;
  currentIndex = 0;
  cursorEl = null;
  elapsedSeconds = 0;

  clearInterval(elapsedInterval);
  elapsedInterval = setInterval(() => {
    elapsedSeconds++;
  }, 1000);

  if (hiddenInput) {
    if (handleMobileInput) {
      hiddenInput.removeEventListener("input", handleMobileInput);
    }
    if (handleTyping) {
      hiddenInput.removeEventListener("keydown", handleTyping);
    }
  }

  cachedSpans();

  handleTyping = function (e) {
    const ignored = [
      "Shift",
      "Alt",
      "Tab",
      "Control",
      "Meta",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "CapsLock",
      "Escape",
      "F1",
      "F2",
      "F3",
      "F4",
      "F5",
      "F6",
      "F7",
      "F8",
      "F9",
      "F10",
      "F11",
      "F12",
    ];

    if (ignored.includes(e.key)) return;
    if (e.key === "Backspace") {
      e.preventDefault();
      backspace();
    }

    if (e.key.length === 1) {
      e.preventDefault();
      processChar(e.key);
    }
  };

  handleMobileInput = function (e) {
    if (e.inputType === "deleteContentBackward") {
      backspace();
    } else if (e.data) {
      for (const char of e.data) {
        processChar(char);
      }
    }

    hiddenInput.value = "";
  };

  if (hiddenInput) {
    if (isMobileDevice()) {
      hiddenInput.addEventListener("input", handleMobileInput);
    } else {
      hiddenInput.addEventListener("keydown", handleTyping);
      hiddenInput.addEventListener("input", handleMobileInput);
    }

    hiddenInput.focus();
  }
}

export function stopTyping() {
  clearInterval(elapsedInterval);
  elapsedInterval = null;
  if (hiddenInput) {
    if (handleMobileInput) {
      hiddenInput.removeEventListener("input", handleMobileInput);
    }

    if (handleTyping) {
      hiddenInput.removeEventListener("keydown", handleTyping);
    }
  }

  handleTyping = null;
  handleMobileInput = null;
}

export function setResult(timeTaken) {
  const timeMinutes = timeTaken / 60;
  const WPM = Math.round(correctChar / 5 / timeMinutes);
  const totalChar = correctChar + incorrectChar;
  const Accuracy =
    totalChar === 0 ? 0 : Math.round((correctChar / totalChar) * 100);
  return { WPM, Accuracy, correctChar, incorrectChar };
}
