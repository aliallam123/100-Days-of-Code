dict = {}
game = True
while game is True:
    def bid():
        print("Welcome to the Secret Auction")
        name = input("Please enter your name:\n")
        bid_price = int(input("Please enter your bid price:\n£"))

        dict.update({name: bid_price})

    bid()
    def ask_again():
        global game
        another_bid = input("Are there any other bidders? (y/n) \n").lower()
        if another_bid == "y":
            print("\n" * 100)
            #bid()
            #ask_again()
        elif another_bid == "n":
            highest_bidder = max(dict, key=dict.get)
            print("The highest bidder was:\n" + highest_bidder)
            game = False
        else:
            print("yes or no")
    ask_again()
