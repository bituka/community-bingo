(function () {
  "use strict";

  var LETTERS = ["B", "I", "N", "G", "O"];
  var PER_ROW = 15;
  var TOTAL = 75;

  // Track called balls manually
  var called = [];
  var autoTimer = null;

  // DOM elements
  var ball = document.getElementById("currentBall");
  var callout = document.getElementById("callout");
  var resetBtn = document.getElementById("resetBtn");
  var historyEl = document.getElementById("history");
  var boardEl = document.getElementById("board");
  var drawCount = document.getElementById("drawCount");
  var statusMsg = document.getElementById("statusMsg");
  var ballTray = document.getElementById("ballTray");

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

  function buildBoard() {
    boardEl.innerHTML = "";
    for (var n = 1; n <= TOTAL; n++) {
      var cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = n;
      cell.dataset.n = n;
      cell.setAttribute("aria-label", letterFor(n) + "-" + n);
      boardEl.appendChild(cell);
    }
  }

  function markBoard(n, on) {
    var cell = boardEl.querySelector('[data-n="' + n + ""]');
    if (cell) cell.classList.toggle("hit", on);
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

    // Mark board
    markBoard(n, true);

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
      stopAuto();
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

  function startAuto() {
    autoTimer = setInterval(function () {
      // Since user wants manual selection, stop auto if triggered
      stopAuto();
    }, 100);
    autoBtn.setAttribute("aria-pressed", "true");
    autoBtn.textContent = "Auto: on";
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    autoBtn.setAttribute("aria-pressed", "false");
    autoBtn.textContent = "Auto-call";
  }

  // Manual add ball from input field
  function manualAddBall() {
    var input = document.getElementById("ballNumberInput");
    if (!input) return;

    var value = input.value.trim();

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
    } else {
      alert("Please enter a valid ball number (1-75), e.g., '52' or 'G-52'");
      input.value = "";
      input.focus();
    }
  }

  function newGame() {
    stopAuto();
    called = [];
    historyEl.innerHTML = "";
    ball.className = "ball empty";
    ball.removeAttribute("data-letter");
    ball.querySelector(".ball-letter").textContent = "—";
    ball.querySelector(".ball-number").textContent = "—";
    callout.textContent = "Enter a ball number (1-75) to start";
    updateLedger();
    markAllOff();
  }

  function markAllOff() {
    boardEl.querySelectorAll(".cell.hit").forEach(function (c) {
      c.classList.remove("hit");
      c.style.transform = "";
    });
  }

  // Initialize
  buildBoard();
  newGame();

  // Add manual input UI
  function initManualUI() {
    var controls = document.querySelector(".controls");
    if (!controls) return;

    // Add input field for ball number
    var inputHTML = `
      <div class="manual-input" style="display: flex; gap: 0.5rem; align-items: center; margin-top: 0.5rem;">
        <input type="text" id="ballNumberInput" placeholder="e.g., 52 or G-52" 
               style="flex: 1; padding: 0.5rem; border: 1px solid rgba(244,236,216,0.3); border-radius: 6px; background: rgba(0,0,0,0.2); color: var(--cream);"
               maxlength="10">
        <button id="addBallBtn" class="btn btn-ghost" style="padding: 0.5rem 0.8rem;">Add</button>
      </div>
    `;
    controls.insertAdjacentHTML("beforeend", inputHTML);

    document.getElementById("addBallBtn").addEventListener("click", manualAddBall);

    // Allow Enter key to add ball
    document.getElementById("ballNumberInput").addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        manualAddBall();
      }
    });
  }

  initManualUI();

  // Remove draw button styling - no longer needed
  // (draw button is gone from HTML)

  // History strip animation support
  var historyStrip = document.querySelector(".history-strip");
  if (historyStrip) {
    historyStrip.style.minHeight = "3rem";
  }
})();