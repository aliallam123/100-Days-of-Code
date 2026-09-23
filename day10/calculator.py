# In Python, multi-line comments are created using '#' at the start of each line.
# Shortcut: Press Ctrl + / (or Cmd + / on Mac) in your IDE to comment/uncomment multiple lines.
# Note: Triple quotes (''' or """) create multi-line strings / docstrings rather than true comments.


def add(n1, n2):
    return n1 + n2


def subtract(n1, n2):
    return n1 - n2


def multiply(n1, n2):
    return n1 * n2


def divide(n1, n2):
    return n1 / n2


operations = {
    "+": add,
    "-": subtract,
    "*": multiply,
    "/": divide,
}


def calculator():
    should_accumulate = True
    num1 = float(input("What's the first number?: "))

    while should_accumulate:
        for symbol in operations:
            print(symbol)
        operation_symbol = input("Pick an operation: ")
        num2 = float(input("What's the next number?: "))
        answer = operations[operation_symbol](num1, num2)
        print(f"{num1} {operation_symbol} {num2} = {answer}")

        choice = input(
            f"Type 'y' to continue calculating with {answer}, or type 'n' to start a new calculation: "
        ).lower()

        if choice == "y":
            num1 = answer
        else:
            should_accumulate = False
            print("\n" * 20)
            calculator()


if __name__ == "__main__":
    calculator()
