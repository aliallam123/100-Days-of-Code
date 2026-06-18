#The secret is to have Reeborg follow along the right edge of the maze,
#turning right if it can, going straight ahead if it can’t turn right,
# or turning left as a last resort.

#What you need to know
#The functions move() and turn_left().
#Either the test front_is_clear() or wall_in_front(), right_is_clear() or wall_on_right(), and at_goal().
#How to use a while loop and if/elif/else statements.
#It might be useful to know how to use the negation of a test (not in Python).

def move_two():
    move()
    move()
   
def turn_right():
    turn_left()
    turn_left()
    turn_left()

def jump():
    turn_left()
    move()
    turn_right()
    move()
    turn_right()
    move()
    turn_left()
   
while not at_goal():
    if right_is_clear() == True:
        turn_right()
        move()
    elif front_is_clear() == True:
        move()
    else:
        turn_left()
