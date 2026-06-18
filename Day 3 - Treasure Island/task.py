print('''              _,._      
  .||,       /_ _\\    
 \.`',/      |'L'| |    
 = ,. =      | -,| L    
 / || \    ,-'\"/,'`.  
   ||     ,'   `,,. `.  
   ,|____,' , ,;' \| |  
  (3|\    _/|/'   _| |  
   ||/,-''  | >-'' _,\\
   ||'      ==\ ,-'  ,'
   ||       |  V \ ,|  
   ||       |    |` |  
   ||       |    |   \  
   ||       |    \    \
   ||       |     |    \
   ||       |      \_,-'
   ||       |___,,--")_\
   ||         |_|   ccc/
   ||        ccc/      
   ||                hjm''')

print("Welcome to Treasure Island.")
print("Your mission is to find the treasure.")

direction = input("left or right? \n").lower()
if direction == "left":
    swim_or_wait = input("swim or wait \n").lower()
    if swim_or_wait == "wait":
        door = input("Which door?\nred, blue, or yellow \n").lower()
        if door == "red":
            print("Burned by fire.\nGame Over.")
        elif door == "yellow":
            print("You win!")
        elif door == "blue":
            print("Eaten by beasts.\nGame Over.")
        else:
            print("Game Over.")
    elif swim_or_wait == "swim":
        print("Attacked by trout.\nGame Over.")
    else:
        print("Attacked by trout.\nGame Over.")

elif direction == "right":
    print("Fall into a hole.")
    print("Game Over.")
else:
    print("Fall into a hole.")
    print("Game Over.")
