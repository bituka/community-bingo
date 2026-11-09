(function () {
  "use strict";

  var LETTERS = ["B", "I", "N", "G", "O"];
  var PER_ROW = 15;
  var TOTAL = 75;

  var ball = document.getElementById("currentBall");
  var callout = document.getElementById("callout");
  var drawBtn = document.getElementById("drawBtn");
  var autoBtn = document.getElementById("autoBtn");
  var resetBtn = document.getElementById("resetBtn");
  var historyEl = document.getElementById("history");
  var boardEl = document.getElementById("board");
  var drawCount = document.getElementById("drawCount");
  var statusMsg = document.getElementById("statusMsg");

  var pool = [];
  var called = [];
  var autoTimer = null;

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
    var cell = boardEl.querySelector('[data-n="' + n + '"]');
    if (cell) cell.classList.toggle("hit", on);
  }

  function newGame() {
    stopAuto();
    pool = [];
    for (var n = 1; n <= TOTAL; n++) pool.push(n);
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    called = [];
    historyEl.innerHTML = "";
    markAllOff();
    ball.className = "ball empty";
    ball.removeAttribute("data-letter");
    ball.querySelector(".ball-letter").textContent = "\u2013";
    ball.querySelector(".ball-number").textContent = "\u2013";
    callout.textContent = "Seventy-five balls in the cage. Ready when you are.";
    drawBtn.disabled = false;
    updateLedger();
  }

  function markAllOff() {
    boardEl.querySelectorAll(".cell.hit").forEach(function (c) {
      c.classList.remove("hit");
      c.style.transform = "";
    });
  }

  function draw() {
    if (!pool.length) return;
    var n = pool.pop();
    called.push(n);
    var letter = letterFor(n);

    ball.className = "ball";
    ball.setAttribute("data-letter", letter);
    ball.querySelector(".ball-letter").textContent = letter;
    ball.querySelector(".ball-number").textContent = n;
    void ball.offsetWidth;
    ball.classList.add("pop");

    callout.textContent = letter + " \u2013 " + n + "!";
    markBoard(n, true);

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

    if (!pool.length) {
      drawBtn.disabled = true;
      callout.textContent = "That's the last ball \u2014 full house!";
      statusMsg.textContent = "Game complete";
      stopAuto();
    }
    updateLedger();
  }

  function updateLedger() {
    drawCount.textContent = called.length + " of 75 drawn";
    if (called.length && pool.length) {
      statusMsg.textContent = Math.round((called.length / TOTAL) * 100) + "% called";
    } else if (!called.length) {
      statusMsg.textContent = "Good luck, everybody";
    }
  }

  function startAuto() {
    autoTimer = setInterval(function () {
      if (pool.length) draw(); else stopAuto();
    }, 4000);
    autoBtn.setAttribute("aria-pressed", "true");
    autoBtn.textContent = "Auto: on";
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    autoBtn.setAttribute("aria-pressed", "false");
    autoBtn.textContent = "Auto-call";
  }

  drawBtn.addEventListener("click", function () {
    draw();
    ball.classList.remove("wobble");
    void ball.offsetWidth;
    ball.classList.add("wobble");
  });

  autoBtn.addEventListener("click", function () {
    if (autoTimer) stopAuto(); else startAuto();
  });

  resetBtn.addEventListener("click", newGame);

  document.addEventListener("keydown", function (e) {
    if (e.code === "Space" && !e.target.matches("button")) {
      e.preventDefault();
      if (!drawBtn.disabled) draw();
    }
  });

  buildBoard();
  newGame();
})();
