// Day 10 - Angela Yu 100 Days of Code: Modular Calculator
// First-class operations dictionary matching calculator.py
const operations = {
  "+": (n1, n2) => n1 + n2,
  "-": (n1, n2) => n1 - n2,
  "*": (n1, n2) => n1 * n2,
  "/": (n1, n2) => (n2 === 0 ? "Cannot divide by 0" : n1 / n2),
};

const opSymbols = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
};

// State variables
let currentInput = "0";
let previousInput = null;
let currentOperator = null;
let isAccumulating = false; // Angela Yu 'continue calculating with answer'
let shouldResetDisplayOnNextDigit = false;
let historyTape = [];

// DOM elements
const mainDisplay = document.getElementById("mainDisplay");
const historyDisplay = document.getElementById("historyDisplay");
const statusChip = document.getElementById("statusChip");
const historyList = document.getElementById("historyList");
const btnClearHistory = document.getElementById("btnClearHistory");

function updateDisplay() {
  mainDisplay.textContent = currentInput;

  // Dynamic font sizing for long strings
  if (currentInput.length > 12) {
    mainDisplay.style.fontSize = "1.5rem";
  } else if (currentInput.length > 8) {
    mainDisplay.style.fontSize = "1.85rem";
  } else {
    mainDisplay.style.fontSize = "2.25rem";
  }

  // Update history line
  if (previousInput !== null && currentOperator) {
    historyDisplay.textContent = `${previousInput} ${opSymbols[currentOperator] || currentOperator}`;
  } else {
    historyDisplay.innerHTML = "&nbsp;";
  }

  // Update status badge
  if (isAccumulating) {
    statusChip.textContent = "Chaining Result";
    statusChip.className = "status-chip accumulating";
  } else {
    statusChip.textContent = "Ready";
    statusChip.className = "status-chip";
  }

  // Highlight active operator button
  document.querySelectorAll(".btn-operator").forEach((btn) => {
    if (currentOperator && btn.dataset.op === currentOperator && shouldResetDisplayOnNextDigit) {
      btn.classList.add("active-op");
    } else {
      btn.classList.remove("active-op");
    }
  });
}

function handleNumber(numStr) {
  if (currentInput === "Error" || currentInput === "Cannot divide by 0") {
    currentInput = numStr;
    shouldResetDisplayOnNextDigit = false;
    updateDisplay();
    return;
  }

  if (shouldResetDisplayOnNextDigit) {
    currentInput = numStr;
    shouldResetDisplayOnNextDigit = false;
  } else {
    if (currentInput === "0") {
      currentInput = numStr;
    } else {
      currentInput += numStr;
    }
  }
  updateDisplay();
}

function handleDecimal() {
  if (shouldResetDisplayOnNextDigit) {
    currentInput = "0.";
    shouldResetDisplayOnNextDigit = false;
    updateDisplay();
    return;
  }
  if (!currentInput.includes(".")) {
    currentInput += ".";
    updateDisplay();
  }
}

function handleOperator(op) {
  if (currentInput === "Error" || currentInput === "Cannot divide by 0") return;

  const currentVal = parseFloat(currentInput);

  if (previousInput !== null && currentOperator && !shouldResetDisplayOnNextDigit) {
    // Chained calculation before next operator
    compute();
  }

  previousInput = parseFloat(currentInput);
  currentOperator = op;
  shouldResetDisplayOnNextDigit = true;
  isAccumulating = true;
  updateDisplay();
}

function compute() {
  if (previousInput === null || !currentOperator) return;

  const num1 = previousInput;
  const num2 = parseFloat(currentInput);

  const calcFunc = operations[currentOperator];
  if (!calcFunc) return;

  const rawResult = calcFunc(num1, num2);
  let finalResult;

  if (typeof rawResult === "number") {
    // Avoid floating point oddities (e.g. 0.1 + 0.2 = 0.30000000000000004)
    finalResult = parseFloat(rawResult.toPrecision(12));
  } else {
    finalResult = rawResult;
  }

  const calculationRecord = `${num1} ${opSymbols[currentOperator]} ${num2} = ${finalResult}`;
  addHistory(calculationRecord);

  // Set up state for continued accumulation
  historyDisplay.textContent = `${num1} ${opSymbols[currentOperator]} ${num2} =`;
  currentInput = String(finalResult);
  previousInput = typeof finalResult === "number" ? finalResult : null;
  currentOperator = null;
  shouldResetDisplayOnNextDigit = true;
  isAccumulating = typeof finalResult === "number";

  updateDisplay();
}

function allClear() {
  currentInput = "0";
  previousInput = null;
  currentOperator = null;
  isAccumulating = false;
  shouldResetDisplayOnNextDigit = false;
  historyDisplay.innerHTML = "&nbsp;";
  updateDisplay();
}

function deleteDigit() {
  if (shouldResetDisplayOnNextDigit) return;
  if (currentInput.length <= 1) {
    currentInput = "0";
  } else {
    currentInput = currentInput.slice(0, -1);
  }
  updateDisplay();
}

function toggleSign() {
  if (currentInput === "0" || currentInput === "Error") return;
  if (currentInput.startsWith("-")) {
    currentInput = currentInput.slice(1);
  } else {
    currentInput = "-" + currentInput;
  }
  updateDisplay();
}

function addHistory(record) {
  historyTape.unshift(record);
  if (historyTape.length > 10) historyTape.pop();
  renderHistory();
}

function renderHistory() {
  if (historyTape.length === 0) {
    historyList.innerHTML = `<li class="empty-state">No calculations yet</li>`;
    return;
  }

  historyList.innerHTML = historyTape
    .map(
      (item) => `
      <li class="history-item" onclick="loadHistoryItem('${item}')" title="Click to inspect">
        <span>${item}</span>
      </li>
    `
    )
    .join("");
}

window.loadHistoryItem = function (item) {
  const parts = item.split(" = ");
  if (parts.length === 2 && !isNaN(parts[1])) {
    currentInput = parts[1];
    previousInput = parseFloat(parts[1]);
    isAccumulating = true;
    updateDisplay();
  }
};

btnClearHistory.addEventListener("click", () => {
  historyTape = [];
  renderHistory();
});

// Event Listeners for Keypad
document.querySelectorAll(".btn-number[data-num]").forEach((btn) => {
  btn.addEventListener("click", () => handleNumber(btn.dataset.num));
});

document.querySelectorAll(".btn-operator[data-op]").forEach((btn) => {
  btn.addEventListener("click", () => handleOperator(btn.dataset.op));
});

document.getElementById("btnDot").addEventListener("click", handleDecimal);
document.getElementById("btnClear").addEventListener("click", allClear);
document.getElementById("btnDelete").addEventListener("click", deleteDigit);
document.getElementById("btnToggleSign").addEventListener("click", toggleSign);
document.getElementById("btnEquals").addEventListener("click", compute);

// Keyboard Support
window.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") {
    handleNumber(e.key);
  } else if (e.key === ".") {
    handleDecimal();
  } else if (e.key === "+" || e.key === "-" || e.key === "*" || e.key === "/") {
    handleOperator(e.key);
  } else if (e.key === "Enter" || e.key === "=") {
    e.preventDefault();
    compute();
  } else if (e.key === "Backspace") {
    deleteDigit();
  } else if (e.key === "Escape") {
    allClear();
  }
});

// Initial render
updateDisplay();
