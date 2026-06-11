.function generateBandName() {
  const city = document.getElementById("city").value.trim();
  const pet = document.getElementById("pet").value.trim();
  const result = document.getElementById("result");

  if (city === "" || pet === "") {
    result.textContent = "Please enter both your city and pet name 🙂";
    return;
  }

  result.textContent = `Your band name could be: ${city} ${pet}`;
}