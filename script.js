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
  var drawBtn = document.getElementById("drawBtn");
  var autoBtn = document.getElementById("autoBtn");
  var resetBtn = document.getElementById("resetBtn");
  var historyEl = document.getElementById("history");
  var boardEl = document.getElementById("board");
  var drawCount = document.getElementById("drawCount");
  var statusMsg = document.getElementById("statusMsg");
  var ballTray = document.getElementById("ballTray");

  function letterFor(n) {
    return LETTERS[Math.floor((n - 1) / PER_ROW)];
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
    var cell = boardEl.querySelector('[data-n="' + n + ""]");
    if (cell) cell.classList.toggle("hit", on);
  }

  function addCalledBall(n) {
    // Check if already called
    if (called.includes(n)) return;

    called.push(n);
    var letter = letterFor(n);

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

    // If no pool left, game complete
    if (called.length >= TOTAL) {
      drawBtn.disabled = true;
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
      statusMsg.textContent = "Enter balls to track";
    }
  }

  function startAuto() {
    autoTimer = setInterval(function () {
      // Auto mode now just calls the last manually added ball, or we could skip this
      // Since user wants manual, we'll just stop auto if somehow triggered
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

  // Manual add ball function
  function manualAddBall() {
    var input = document.getElementById("manualNumber");
    if (!input) return;

    var n = parseInt(input.value, 10);
    if (isNaN(n) || n < 1 || n > 75) {
      alert("Please enter a number between 1 and 75");
      input.value = "";
      input.focus();
      return;
    }

    // Validate letter based on number range
    var letter = letterFor(n);
    var letterInput = document.getElementById("manualLetter");
    if (letterInput) {
      var enteredLetter = letterInput.value.trim().toUpperCase();
      if (LETTERS.includes(enteredLetter)) {
        letter = enteredLetter;
      }
    }

    // Find the actual number based on letter and position
    // For manual entry, we'll just use the number entered
    addCalledBall(n);

    input.value = "";
    input.focus();
  }

  function newGame() {
    stopAuto();
    called = [];
    historyEl.innerHTML = "";
    ball.className = "ball empty";
    ball.removeAttribute("data-letter");
    ball.querySelector(".ball-letter").textContent = "—";
    ball.querySelector(".ball-number").textContent = "—";
    callout.textContent = "Seventy-five balls in the cage. Ready when you are.";
    drawBtn.disabled = false;
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

  // Add manual ball input UI and event listeners
  function initManualUI() {
    // Create manual input UI
    var controls = document.querySelector(".controls");
    if (!controls) return;

    // Add manual input box
    var manualHTML = `
      <div class="manual-input" style="display: flex; gap: 0.5rem; align-items: center; margin-top: 0.5rem;">
        <input type="number" id="manualNumber" min="1" max="75" placeholder="1-75" style="flex: 1; padding: 0.5rem; border: 1px solid rgba(244,236,216,0.3); border-radius: 6px; background: rgba(0,0,0,0.2); color: var(--cream);">
        <select id="manualLetter" style="padding: 0.5rem; border: 1px solid rgba(244,236,216,0.3); border-radius: 6px; background: rgba(0,0,0,0.2); color: var(--cream);">
          <option value="">Letter</option>
          <option value="B">B</option>
          <option value="I">I</option>
          <option value="N">N</option>
          <option value="G">G</option>
          <option value="O">O</option>
        </select>
        <button id="addBallBtn" class="btn btn-ghost" style="padding: 0.5rem 0.8rem;">Add</button>
      </div>
    `;
    controls.insertAdjacentHTML("beforeend", manualHTML);

    document.getElementById("addBallBtn").addEventListener("click", manualAddBall);

    // Allow Enter key to add ball
    document.getElementById("manualNumber").addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        manualAddBall();
      }
    });
  }

  initManualUI();

  // Keep existing drawBtn functionality disabled since we're doing manual selection
  drawBtn.disabled = true;
  drawBtn.style.opacity = "0.45";
  drawBtn.style.cursor = "not-allowed";

  // History strip animation support
  var historyStrip = document.querySelector(".history-strip");
  if (historyStrip) {
    historyStrip.style.minHeight = "3rem";
  }
})();