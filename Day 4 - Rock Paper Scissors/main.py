import random
random_int = random.randint(0,2)
rock = '''
rock!
    _______
---'   ____)
      (_____)
      (_____)
      (____)
---.__(___)

'''
paper = '''
paper!
     _______
---'    ____)____
           ______)
          _______)
         _______)
---.__________)
'''
scissors = '''
scissors!
    _______
---'   ____)____
          ______)
       __________)
      (____)
---.__(___)
'''
throw = int(input("What do you choose? \nType 0 for Rock, 1 for Paper or 2 for Scissors.\n"))

if throw == 0:
    print(rock)
elif throw ==1:
    print(paper)
elif throw == 2:
    print(scissors)
else:
    print("Invalid Choice.")


print("Computer chose:")

if random_int == 0:
        print(rock)
elif random_int == 1:
     print(paper)
elif random_int == 2:
     print(scissors)

# game logic
if throw == random_int:
    print(f"Both players selected {throw}. It's a tie!")
elif throw == 0:
    if random_int == 2:
        print("Rock smashes scissors! You win!")
    else:
        print("Paper covers rock! You lose.")
elif throw == 1:
    if random_int == 0:
        print("Paper covers rock! You win!")
    else:
        print("Scissors cuts paper! You lose.")
elif throw == 2:
    if random_int == 1:
        print("Scissors cuts paper! You win!")
    else:
        print("Rock smashes scissors! You lose.")
