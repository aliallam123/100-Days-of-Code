const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const symbols = `!"#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~`;
const digits = "0123456789";

const passwordInput = document.getElementById("password");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const message = document.getElementById("message");

function getRandomCharacter(characters) {
  return characters[Math.floor(Math.random() * characters.length)];
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

function generatePassword() {
  const numberOfLetters = Number(document.getElementById("letters").value);
  const numberOfSymbols = Number(document.getElementById("symbols").value);
  const numberOfNumbers = Number(document.getElementById("numbers").value);

  let password = [];

  for (let i = 0; i < numberOfLetters; i++) {
    password.push(getRandomCharacter(alphabet));
  }

  for (let i = 0; i < numberOfSymbols; i++) {
    password.push(getRandomCharacter(symbols));
  }

  for (let i = 0; i < numberOfNumbers; i++) {
    password.push(getRandomCharacter(digits));
  }

  password = shuffleArray(password);

  passwordInput.value = password.join("");
  message.textContent = "Password generated!";
}

function copyPassword() {
  if (passwordInput.value === "") {
    message.textContent = "Generate a password first!";
    return;
  }

  navigator.clipboard.writeText(passwordInput.value);
  message.textContent = "Copied to clipboard!";
}

generateBtn.addEventListener("click", generatePassword);
copyBtn.addEventListener("click", copyPassword);
