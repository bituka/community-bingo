(function () {
  "use strict";

  var LETTERS = ["B", "I", "N", "G", "O"];
  var PER_ROW = 15;
  var TOTAL = 75;

  // Track called balls manually
  var called = [];

  // DOM elements
  var ball = document.getElementById("currentBall");
  var callout = document.getElementById("callout");
  var resetBtn = document.getElementById("resetBtn");
  var historyEl = document.getElementById("history");
  var drawCount = document.getElementById("drawCount");
  var statusMsg = document.getElementById("statusMsg");

  function letterFor(n) {
    return LETTERS[Math.floor((n - 1) / PER_ROW)];
  }

  function getLetterFromNumber(n) {
    if (n >= 1 && n <= 15) return "B";
    if (n >= 16 && n <= 30) return "I";
    if (n >= 31 && n <= 45) return "N";
    if (n >= 46 && n <= 60) return "G";
    if (n >= 61 && n <= 75) return "O";
    return "";
  }

  function addCalledBall(n) {
    // Check if already called
    if (called.includes(n)) return;

    called.push(n);
    var letter = getLetterFromNumber(n);

    // Update the current ball display
    ball.className = "ball";
    ball.setAttribute("data-letter", letter);
    ball.querySelector(".ball-letter").textContent = letter;
    ball.querySelector(".ball-number").textContent = n;
    void ball.offsetWidth;
    ball.classList.add("pop");

    callout.textContent = letter + " \u2013 " + n + "!";

    // Add to history
    var li = document.createElement("li");
    var small = document.createElement("small");
    small.textContent = letter;
    var strong = document.createElement("strong");
    strong.textContent = n;
    li.appendChild(small);
    li.appendChild(strong);
    li.style.backgroundColor = "";
    historyEl.insertBefore(li, historyEl.firstChild);
    while (historyEl.children.length > 10) historyEl.removeChild(historyEl.lastChild);

    // Update ledger
    updateLedger();

    // If all balls called, game complete
    if (called.length >= TOTAL) {
      callout.textContent = "All balls called — full house!";
      statusMsg.textContent = "Game complete";
    }
  }

  function updateLedger() {
    drawCount.textContent = called.length + " of " + TOTAL + " drawn";
    if (called.length && called.length < TOTAL) {
      statusMsg.textContent = Math.round((called.length / TOTAL) * 100) + "% called";
    } else if (!called.length) {
      statusMsg.textContent = "Enter a ball number (1-75)";
    }
  }

  // Manual add ball from input field
  function manualAddBall() {
    var input = document.getElementById("ballNumberInput");
    if (!input) return;

    var value = input.value.trim();
    
    // Give feedback if input is empty
    if (value === "") {
      statusMsg.textContent = "Please enter a ball number (1-75)";
      input.focus();
      return;
    }

    // Parse input: accept "52" or "G-52" or "G52"
    var n = null;
    var letter = "";

    // Try to extract number from various formats
    var numMatch = value.match(/(\d+)/);
    if (numMatch) {
      n = parseInt(numMatch[1], 10);
    }

    // Try to extract letter
    var letterMatch = value.match(/([BINGO])/i);
    if (letterMatch) {
      letter = letterMatch[1].toUpperCase();
    }

    // If we have a number, validate it
    if (n !== null && !isNaN(n) && n >= 1 && n <= 75) {
      // If letter was specified, validate it matches the number range
      if (letter) {
        var expectedLetter = getLetterFromNumber(n);
        if (letter !== expectedLetter) {
          alert("Number " + n + " is in the " + expectedLetter + " range, not " + letter);
          input.value = "";
          input.focus();
          return;
        }
      }
      addCalledBall(n);
      statusMsg.textContent = called.length + " of " + TOTAL + " drawn";
    } else {
      alert("Please enter a valid ball number (1-75), e.g., '52' or 'G-52'");
      input.value = "";
      input.focus();
    }
  }

  function newGame() {
    called = [];
    historyEl.innerHTML = "";
    ball.className = "ball empty";
    ball.removeAttribute("data-letter");
    ball.querySelector(".ball-letter").textContent = "—";
    ball.querySelector(".ball-number").textContent = "—";
    callout.textContent = "Enter a ball number (1-75) to start";
    updateLedger();
  }

  resetBtn.addEventListener("click", newGame);

  // Initialize
  newGame();

  // Attach manual input listeners (input lives in index.html)
  function initManualUI() {
    var addBtn = document.getElementById("addBallBtn");
    var input = document.getElementById("ballNumberInput");

    if (addBtn) addBtn.addEventListener("click", manualAddBall);

    // Allow Enter key to add ball
    if (input) input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        manualAddBall();
      }
    });
  }

  initManualUI();
})();