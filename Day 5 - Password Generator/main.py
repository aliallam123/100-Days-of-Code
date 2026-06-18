import random

print("Welcome to the Password Generator")
number_of_letters = int(input("How many letters would you like in your password?\n"))
number_of_symbols = int(input("How many symbols would you like?\n"))
amount_of_numbers = int(input("How many numbers would you like?\n"))

alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

all_symbols = [
    '!', '"', '#', '$', '%', '&', "'", '(', ')', '*']

digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

password = []

print("Your password is:")
for character in range(number_of_letters):
    random_letter = random.choice(alphabet)
    password.append(random_letter)

for character in range(number_of_symbols):
    random_symbol = random.choice(all_symbols)
    password.append(random_symbol)

for character in range(amount_of_numbers):
    random_number = random.choice(digits)
    password.append(random_number)

random.shuffle(password)
generated_password = "".join(password)
print(generated_password)
