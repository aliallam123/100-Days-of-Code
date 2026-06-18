const story = document.getElementById("story");

function chooseDirection(choice) {

    if (choice === "left") {

        story.innerHTML = `
            <h2>You arrive at a lake.</h2>
            <p>What do you do?</p>

            <button onclick="lakeChoice('wait')">⏳ Wait</button>
            <button onclick="lakeChoice('swim')">🏊 Swim</button>
        `;

    } else {

        gameOver("🕳️ You fell into a hole.");
    }
}

function lakeChoice(choice) {

    if (choice === "wait") {

        story.innerHTML = `
            <h2>You reach three doors.</h2>
            <p>Choose wisely.</p>

            <button onclick="doorChoice('red')">🔴 Red</button>
            <button onclick="doorChoice('blue')">🔵 Blue</button>
            <button onclick="doorChoice('yellow')">🟡 Yellow</button>
        `;

    } else {

        gameOver("🐟 Attacked by trout.");
    }
}

function doorChoice(choice) {

    if (choice === "yellow") {

        story.innerHTML = `
            <h2 class="win">🏆 You found the treasure!</h2>
            <p>You Win!</p>
        `;

    } else if (choice === "red") {

        gameOver("🔥 Burned by fire.");

    } else {

        gameOver("🐺 Eaten by beasts.");
    }
}

function gameOver(message) {

    story.innerHTML = `
        <h2 class="lose">${message}</h2>
        <p>Game Over</p>

        <button onclick="location.reload()">
            🔄 Play Again
        </button>
    `;
}
