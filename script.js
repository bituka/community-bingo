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
  var bingoToggle = document.getElementById("bingoToggle");
  var clearHighlightsBtn = document.getElementById("clearHighlightsBtn");
  var inputErrorModal = document.getElementById("inputErrorModal");
  var inputErrorMessage = document.getElementById("inputErrorMessage");
  var closeInputErrorBtn = document.getElementById("closeInputError");
  var communityNameEl = document.getElementById("communityName");
  var editCommunityNameBtn = document.getElementById("editCommunityName");
  var communityNameForm = document.getElementById("communityNameForm");
  var communityNameInput = document.getElementById("communityNameInput");
  var cancelCommunityNameBtn = document.getElementById("cancelCommunityName");
  var COMMUNITY_NAME_KEY = "communityBingoName";
  var recapMode = false;

  function applyCommunityName(name) {
    name = name.trim().slice(0, 40);
    if (!name) return;

    communityNameEl.textContent = name;
    document.title = name + " Bingo \u2014 Ball Display";
    try { window.localStorage.setItem(COMMUNITY_NAME_KEY, name); } catch (e) {}
  }

  try {
    var savedCommunityName = window.localStorage.getItem(COMMUNITY_NAME_KEY);
    if (savedCommunityName && savedCommunityName.trim()) {
      communityNameEl.textContent = savedCommunityName.trim().slice(0, 40);
    }
  } catch (e) {}
  document.title = communityNameEl.textContent + " Bingo \u2014 Ball Display";

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

    // Add to the letter's history group (order of being called preserved)
    var groupList = historyEl.querySelector('.hist-group[data-letter="' + letter + '"] .hist-list');
    if (groupList) {
      var li = document.createElement("li");
      var numberButton = document.createElement("button");
      numberButton.type = "button";
      numberButton.className = "hist-number";
      numberButton.textContent = n;
      numberButton.dataset.number = n;
      updateHistoryButton(numberButton);
      li.appendChild(numberButton);
      groupList.appendChild(li);
    }

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
    bingoToggle.disabled = called.length === 0 && !recapMode;
    if (called.length && called.length < TOTAL) {
      statusMsg.textContent = Math.round((called.length / TOTAL) * 100) + "% called";
    } else if (!called.length) {
      statusMsg.textContent = "Enter a ball number (1-75)";
    }
  }

  function showInputError(message, input) {
    inputErrorMessage.textContent = message;
    input.value = "";
    inputErrorModal.showModal();
    closeInputErrorBtn.focus();
  }

  function setRecapMode(enabled) {
    if (recapMode !== enabled) {
      document.body.classList.remove("game-restoring");
      document.body.classList.toggle("recap-mode", enabled);
      if (!enabled) document.body.classList.add("game-restoring");
    }

    recapMode = enabled;
    bingoToggle.disabled = called.length === 0 && !recapMode;
    bingoToggle.textContent = recapMode ? "Back to game" : "Bingo!";
    bingoToggle.setAttribute("aria-pressed", String(recapMode));

    historyEl.querySelectorAll(".hist-number").forEach(updateHistoryButton);
    updateRecapGroups();
  }

  function updateHistoryButton(button) {
    var n = Number(button.dataset.number);
    var letter = getLetterFromNumber(n);
    var highlighted = button.classList.contains("highlighted");

    if (recapMode) {
      button.setAttribute("aria-label", (highlighted ? "Unhighlight " : "Highlight ") + letter + " " + n);
      button.setAttribute("aria-pressed", String(highlighted));
    } else {
      button.setAttribute("aria-label", "Remove " + letter + " " + n + " from called numbers");
      button.removeAttribute("aria-pressed");
    }
  }

  function updateRecapGroups() {
    historyEl.querySelectorAll(".hist-group").forEach(function (group) {
      var list = group.querySelector(".hist-list");
      group.hidden = recapMode && list.children.length === 0;
    });
  }

  historyEl.addEventListener("click", function (e) {
    var numberButton = e.target.closest(".hist-number");
    if (!numberButton) return;

    if (recapMode) {
      numberButton.classList.toggle("highlighted");
      updateHistoryButton(numberButton);
      return;
    }

    var n = Number(numberButton.dataset.number);
    var calledIndex = called.indexOf(n);
    if (calledIndex === -1) return;

    called.splice(calledIndex, 1);
    numberButton.closest("li").remove();
    updateLedger();
    updateRecapGroups();

    if (Number(ball.querySelector(".ball-number").textContent) === n) {
      var latestCalled = called[called.length - 1];
      if (latestCalled) {
        var letter = getLetterFromNumber(latestCalled);
        ball.className = "ball";
        ball.setAttribute("data-letter", letter);
        ball.querySelector(".ball-letter").textContent = letter;
        ball.querySelector(".ball-number").textContent = latestCalled;
        callout.textContent = letter + " \u2013 " + latestCalled + "!";
      } else {
        ball.className = "ball empty";
        ball.removeAttribute("data-letter");
        ball.querySelector(".ball-letter").textContent = "\u2014";
        ball.querySelector(".ball-number").textContent = "\u2014";
        callout.textContent = "Enter a ball number (1-75) to start";
      }
    }
  });

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
          showInputError("Number " + n + " is in the " + expectedLetter + " range, not " + letter, input);
          return;
        }
      }
      addCalledBall(n);
      statusMsg.textContent = called.length + " of " + TOTAL + " drawn";
    } else {
      showInputError("Please enter a valid ball number (1-75), e.g., '52' or 'G-52'", input);
    }
  }

  function newGame() {
    called = [];
    historyEl.querySelectorAll(".hist-list").forEach(function (list) {
      list.innerHTML = "";
    });
    ball.className = "ball empty";
    ball.removeAttribute("data-letter");
    ball.querySelector(".ball-letter").textContent = "—";
    ball.querySelector(".ball-number").textContent = "—";
    callout.textContent = "Enter a ball number (1-75) to start";
    updateLedger();
  }

  resetBtn.addEventListener("click", newGame);
  closeInputErrorBtn.addEventListener("click", function () {
    inputErrorModal.close();
  });
  inputErrorModal.addEventListener("close", function () {
    document.getElementById("ballNumberInput").focus();
  });

  bingoToggle.addEventListener("click", function () {
    setRecapMode(!recapMode);
  });

  clearHighlightsBtn.addEventListener("click", function () {
    historyEl.querySelectorAll(".hist-number.highlighted").forEach(function (button) {
      button.classList.remove("highlighted");
      updateHistoryButton(button);
    });
  });

  editCommunityNameBtn.addEventListener("click", function () {
    communityNameInput.value = communityNameEl.textContent;
    communityNameForm.hidden = false;
    communityNameInput.focus();
    communityNameInput.select();
  });

  communityNameForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = communityNameInput.value.trim();
    communityNameInput.setCustomValidity(name ? "" : "Please enter a community name.");
    if (!communityNameForm.reportValidity()) return;

    applyCommunityName(name);
    communityNameForm.hidden = true;
    editCommunityNameBtn.focus();
  });

  communityNameInput.addEventListener("input", function () {
    communityNameInput.setCustomValidity("");
  });

  function cancelCommunityNameEdit() {
    communityNameInput.setCustomValidity("");
    communityNameForm.hidden = true;
    editCommunityNameBtn.focus();
  }

  cancelCommunityNameBtn.addEventListener("click", cancelCommunityNameEdit);
  communityNameInput.addEventListener("keydown", function (e) {
    if (e.key === "Escape") cancelCommunityNameEdit();
  });

  // Initialize
  newGame();

// ---------- Pattern card ----------

  var PATTERN_KEY = "communityBingoPattern";
  var FREE_RC = "2,2"; // center cell is the free space
  var cardGrid = document.getElementById("cardGrid");
  var clearPatternBtn = document.getElementById("clearPatternBtn");
  var pattern = {};

  function loadPattern() {
    try {
      pattern = JSON.parse(window.localStorage.getItem(PATTERN_KEY)) || {};
      if (typeof pattern !== "object" || Array.isArray(pattern)) pattern = {};
    } catch (e) { pattern = {}; }
    pattern[FREE_RC] = true; // free space is always on
  }

  function savePattern() {
    try { window.localStorage.setItem(PATTERN_KEY, JSON.stringify(pattern)); } catch (e) {}
  }

  function buildCard() {
    if (!cardGrid) return;
    cardGrid.innerHTML = "";
    for (var r = 0; r < 5; r++) {
      for (var c = 0; c < 5; c++) {
        var rc = r + "," + c;
        var cell = document.createElement("button");
        cell.type = "button";
        cell.className = "card-cell";
        cell.dataset.rc = rc;
        cell.setAttribute("aria-label", "Row " + (r + 1) + ", column " + (c + 1));
        if (rc === FREE_RC) {
          cell.classList.add("free");
          cell.textContent = "FREE";
          cell.disabled = true;
        }
        if (pattern[rc]) cell.classList.add("on");
        cardGrid.appendChild(cell);
      }
    }
  }

  function togglePatternCell(rc, cell) {
    if (rc === FREE_RC) return;
    if (pattern[rc]) {
      delete pattern[rc];
      cell.classList.remove("on");
    } else {
      pattern[rc] = true;
      cell.classList.add("on");
    }
    savePattern();
  }

  function clearPattern() {
    if (cardGrid) {
      cardGrid.querySelectorAll(".card-cell.on").forEach(function (cell) {
        if (!cell.classList.contains("free")) cell.classList.remove("on");
      });
    }
    pattern = {};
    pattern[FREE_RC] = true;
    savePattern();
  }

  if (cardGrid) {
    cardGrid.addEventListener("click", function (e) {
      var cell = e.target.closest(".card-cell");
      if (!cell || cell.disabled) return;
      togglePatternCell(cell.dataset.rc, cell);
    });
  }
  if (clearPatternBtn) {
    clearPatternBtn.addEventListener("click", clearPattern);
  }

  // Initialize pattern card (survives reloads and New game)
  loadPattern();
  buildCard();

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