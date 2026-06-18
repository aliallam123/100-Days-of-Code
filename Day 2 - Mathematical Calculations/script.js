function calculateTip() {
  const bill = Number(document.getElementById("bill").value);
  const tip = Number(document.getElementById("tip").value);
  const people = Number(document.getElementById("people").value);
  const result = document.getElementById("result");

  if (bill <= 0 || tip < 0 || people <= 0) {
    result.textContent = "Please enter valid numbers 🙂";
    return;
  }

  const totalWithTip = bill + (bill * (tip / 100));
  const amountPerPerson = totalWithTip / people;

  result.textContent = `Each person should pay: $${amountPerPerson.toFixed(2)}`;
}
