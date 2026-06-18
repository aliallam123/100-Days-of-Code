const choices = [
  { name: "Rock", icon: "🪨" },
  { name: "Paper", icon: "📄" },
  { name: "Scissors", icon: "✂️" }
];

function playGame(playerChoice) {
  const computerChoice = Math.floor(Math.random() * 3);

  document.getElementById("player-icon").textContent = choices[playerChoice].icon;
  document.getElementById("player-name").textContent = choices[playerChoice].name;

  document.getElementById("computer-icon").textContent = choices[computerChoice].icon;
  document.getElementById("computer-name").textContent = choices[computerChoice].name;

  const resultMessage = document.getElementById("result-message");
  resultMessage.className = "result";

  if (playerChoice === computerChoice) {
    resultMessage.textContent = "System draw detected ⚡";
    resultMessage.classList.add("tie");
  } else if (
    (playerChoice === 0 && computerChoice === 2) ||
    (playerChoice === 1 && computerChoice === 0) ||
    (playerChoice === 2 && computerChoice === 1)
  ) {
    resultMessage.textContent = "Victory protocol activated 🏆";
    resultMessage.classList.add("win");
  } else {
    resultMessage.textContent = "AI opponent wins this round 🤖";
    resultMessage.classList.add("lose");
  }
}
