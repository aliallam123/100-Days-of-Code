const COLS = 6;
const ROWS = 6;
const START = { x: 1, y: 1, dir: 1 }; // 0 = North, 1 = East, 2 = South, 3 = West
const GOAL = { x: 6, y: 4 };
const MAX_OPERATIONS = 10000;
const MAX_LOOP_ITERATIONS = 5000;

const DEFAULT_CODE = `# The secret is to have Reeborg follow along the right edge of the maze,
# turning right if it can, going straight ahead if it can't turn right,
# or turning left as a last resort.

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
`;

const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");
const codeEditor = document.getElementById("codeEditor");
const convertedCode = document.getElementById("convertedCode");
const statusEl = document.getElementById("status");
const runBadge = document.getElementById("runBadge");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const newMazeBtn = document.getElementById("newMazeBtn");
const resetCodeBtn = document.getElementById("resetCodeBtn");
const speedSlider = document.getElementById("speedSlider");

const DIRS = [
  { name: "N", dx: 0, dy: 1, dr: -1, dc: 0, opposite: "S" },
  { name: "E", dx: 1, dy: 0, dr: 0, dc: 1, opposite: "W" },
  { name: "S", dx: 0, dy: -1, dr: 1, dc: 0, opposite: "N" },
  { name: "W", dx: -1, dy: 0, dr: 0, dc: -1, opposite: "E" }
];

let maze = [];
let robot = cloneRobot(START);
let currentTrace = [];
let animationToken = 0;
let paused = false;
let resumeAnimation = null;
let lastRunResult = null;

codeEditor.value = DEFAULT_CODE;

playBtn.addEventListener("click", () => runAndAnimate());
pauseBtn.addEventListener("click", togglePause);
restartBtn.addEventListener("click", () => restartRun());
newMazeBtn.addEventListener("click", () => createNewMaze());
resetCodeBtn.addEventListener("click", () => {
  codeEditor.value = DEFAULT_CODE;
  convertedCode.textContent = "Press Play code to see the converted JavaScript.";
  setStatus("Your original right-wall code has been restored.", "Ready");
});
window.addEventListener("resize", resizeCanvas);

createNewMaze();

function createNewMaze() {
  stopAnimation();
  maze = generateInterestingMaze();
  robot = cloneRobot(START);
  currentTrace = [snapshot("Start")];
  lastRunResult = null;
  setStatus("New random maze created. Press Play code to test your program.", "Ready");
  resizeCanvas();
}

function restartRun() {
  stopAnimation();
  robot = cloneRobot(START);
  if (lastRunResult && lastRunResult.trace.length > 0) {
    animateTrace(lastRunResult.trace, lastRunResult.finalMessage, lastRunResult.badgeText, lastRunResult.badgeType);
  } else {
    setStatus("Run reset. Press Play code when you are ready.", "Ready");
    drawMaze();
  }
}

function runAndAnimate() {
  stopAnimation();
  robot = cloneRobot(START);
  let result;

  try {
    const jsCode = transpilePythonLikeCode(codeEditor.value);
    convertedCode.textContent = jsCode;
    result = simulateProgram(jsCode);
  } catch (error) {
    const message = cleanError(error);
    convertedCode.textContent = message;
    lastRunResult = null;
    setStatus(`Code could not start: ${message}`, "Error", "danger");
    drawMaze();
    return;
  }

  lastRunResult = result;
  animateTrace(result.trace, result.finalMessage, result.badgeText, result.badgeType);
}

function simulateProgram(jsCode) {
  const trace = [snapshot("Start")];
  let operations = 0;
  let loopIterations = 0;
  let printed = [];

  const guardOperation = (label) => {
    operations += 1;
    if (operations > MAX_OPERATIONS) {
      throw new Error(`Stopped after ${MAX_OPERATIONS} operations. This may be an infinite loop near ${label}.`);
    }
  };

  const loopGuard = () => {
    loopIterations += 1;
    if (loopIterations > MAX_LOOP_ITERATIONS) {
      throw new Error(`Stopped after ${MAX_LOOP_ITERATIONS} loop checks. This may be an infinite loop.`);
    }
  };

  const frontClearInternal = () => isClear(robot.dir);
  const rightClearInternal = () => isClear((robot.dir + 1) % 4);

  const api = {
    move() {
      guardOperation("move()");
      if (!frontClearInternal()) {
        trace.push(snapshot("Crash: wall in front", true));
        throw new Error(`move() hit a wall at (${robot.x}, ${robot.y}).`);
      }
      const dir = DIRS[robot.dir];
      robot.x += dir.dx;
      robot.y += dir.dy;
      trace.push(snapshot(`move() to (${robot.x}, ${robot.y})`));
    },
    turn_left() {
      guardOperation("turn_left()");
      robot.dir = (robot.dir + 3) % 4;
      trace.push(snapshot("turn_left()"));
    },
    front_is_clear() {
      guardOperation("front_is_clear()");
      return frontClearInternal();
    },
    right_is_clear() {
      guardOperation("right_is_clear()");
      return rightClearInternal();
    },
    wall_in_front() {
      guardOperation("wall_in_front()");
      return !frontClearInternal();
    },
    wall_on_right() {
      guardOperation("wall_on_right()");
      return !rightClearInternal();
    },
    at_goal() {
      guardOperation("at_goal()");
      return robot.x === GOAL.x && robot.y === GOAL.y;
    },
    is_facing_north() {
      guardOperation("is_facing_north()");
      return robot.dir === 0;
    },
    pause() {
      guardOperation("pause()");
      trace.push(snapshot("pause()"));
    },
    done() {
      guardOperation("done()");
      trace.push(snapshot("done()"));
    },
    think() {
      guardOperation("think()" );
    },
    sound() {
      guardOperation("sound()" );
    },
    take() {
      guardOperation("take()");
      throw new Error("There are no objects in this maze to take().");
    },
    put() {
      guardOperation("put()");
      throw new Error("The robot is not carrying any objects to put().");
    },
    toss() {
      guardOperation("toss()");
      throw new Error("The robot is not carrying any objects to toss().");
    },
    build_wall() {
      guardOperation("build_wall()");
      buildWallInFront();
      trace.push(snapshot("build_wall()"));
    },
    object_here() {
      guardOperation("object_here()");
      return false;
    },
    carries_object() {
      guardOperation("carries_object()");
      return false;
    },
    no_highlight() {},
    World() {
      return { rows: ROWS, cols: COLS, goal: { ...GOAL }, start: { ...START } };
    },
    UsedRobot() {
      return { x: robot.x, y: robot.y, direction: DIRS[robot.dir].name };
    },
    print(...args) {
      guardOperation("print()");
      printed.push(args.map(String).join(" "));
    },
    range(...args) {
      const [start, stop, step] = normalizeRangeArgs(args);
      const values = [];
      if (step > 0) {
        for (let value = start; value < stop; value += step) values.push(value);
      } else {
        for (let value = start; value > stop; value += step) values.push(value);
      }
      return values;
    },
    __loopGuard: loopGuard
  };

  let error = null;
  try {
    const runner = new Function(
      "move", "turn_left", "front_is_clear", "right_is_clear", "wall_in_front", "wall_on_right",
      "at_goal", "is_facing_north", "pause", "done", "think", "sound", "take", "put", "toss",
      "build_wall", "object_here", "carries_object", "no_highlight", "World", "UsedRobot", "print", "range",
      "__loopGuard",
      `${jsCode}\nreturn true;`
    );

    runner(
      api.move, api.turn_left, api.front_is_clear, api.right_is_clear, api.wall_in_front, api.wall_on_right,
      api.at_goal, api.is_facing_north, api.pause, api.done, api.think, api.sound, api.take, api.put, api.toss,
      api.build_wall, api.object_here, api.carries_object, api.no_highlight, api.World, api.UsedRobot, api.print, api.range,
      api.__loopGuard
    );
  } catch (caught) {
    error = caught;
  }

  const success = robot.x === GOAL.x && robot.y === GOAL.y;
  let finalMessage;
  let badgeText;
  let badgeType;

  if (error) {
    finalMessage = `Program stopped: ${cleanError(error)} Actions shown: ${Math.max(0, trace.length - 1)}.`;
    badgeText = "Error";
    badgeType = "danger";
  } else if (success) {
    const printText = printed.length ? ` Printed: ${printed.join(" | ")}` : "";
    finalMessage = `Great job. The robot reached the goal at (${GOAL.x}, ${GOAL.y}) in ${Math.max(0, trace.length - 1)} robot actions.${printText}`;
    badgeText = "Solved";
    badgeType = "success";
  } else {
    finalMessage = `Program finished, but the robot stopped at (${robot.x}, ${robot.y}) instead of (${GOAL.x}, ${GOAL.y}).`;
    badgeText = "Not solved";
    badgeType = "warning";
  }

  return { trace, finalMessage, badgeText, badgeType };
}

async function animateTrace(trace, finalMessage, badgeText, badgeType) {
  const token = ++animationToken;
  paused = false;
  pauseBtn.textContent = "Pause";
  runBadge.textContent = "Running";
  runBadge.className = "badge";
  currentTrace = trace;

  for (let index = 0; index < trace.length; index += 1) {
    if (token !== animationToken) return;
    await waitIfPaused(token);
    if (token !== animationToken) return;

    robot = cloneRobot(trace[index].robot);
    drawMaze();
    statusEl.textContent = `${trace[index].label}  Step ${index}/${trace.length - 1}`;
    await sleep(getDelay());
  }

  if (token === animationToken) {
    setStatus(finalMessage, badgeText, badgeType);
  }
}

function togglePause() {
  if (!currentTrace.length) return;
  paused = !paused;
  pauseBtn.textContent = paused ? "Resume" : "Pause";
  if (!paused && resumeAnimation) {
    resumeAnimation();
    resumeAnimation = null;
  }
}

function waitIfPaused(token) {
  if (!paused) return Promise.resolve();
  setStatus("Paused. Press Resume to continue the animation.", "Paused", "warning");
  return new Promise((resolve) => {
    resumeAnimation = () => {
      if (token === animationToken) runBadge.textContent = "Running";
      resolve();
    };
  });
}

function stopAnimation() {
  animationToken += 1;
  paused = false;
  pauseBtn.textContent = "Pause";
  resumeAnimation = null;
}

function getDelay() {
  const speed = Number(speedSlider.value);
  return 720 - speed * 60;
}

function setStatus(message, badgeText = "Ready", badgeType = "") {
  statusEl.textContent = message;
  runBadge.textContent = badgeText;
  runBadge.className = badgeType ? `badge ${badgeType}` : "badge";
}

function generateInterestingMaze() {
  let bestMaze = null;
  let bestDistance = -1;

  for (let attempt = 0; attempt < 120; attempt += 1) {
    const candidate = generatePerfectMaze(COLS, ROWS);
    const distance = shortestPathLength(candidate, START, GOAL);
    if (distance > bestDistance) {
      bestDistance = distance;
      bestMaze = candidate;
    }
    if (distance >= 12) return candidate;
  }

  return bestMaze || generatePerfectMaze(COLS, ROWS);
}

function generatePerfectMaze(cols, rows) {
  const cells = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ N: true, E: true, S: true, W: true, visited: false }))
  );

  const startCell = worldToCell(START.x, START.y);
  const stack = [startCell];
  cells[startCell.row][startCell.col].visited = true;

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const options = shuffledDirs()
      .map((dir) => ({ dir, row: current.row + dir.dr, col: current.col + dir.dc }))
      .filter(({ row, col }) => inCellBounds(row, col) && !cells[row][col].visited);

    if (options.length === 0) {
      stack.pop();
      continue;
    }

    const next = options[0];
    cells[current.row][current.col][next.dir.name] = false;
    cells[next.row][next.col][next.dir.opposite] = false;
    cells[next.row][next.col].visited = true;
    stack.push({ row: next.row, col: next.col });
  }

  cells.flat().forEach((cell) => delete cell.visited);
  return cells;
}

function shuffledDirs() {
  const dirs = DIRS.slice();
  for (let index = dirs.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [dirs[index], dirs[swapIndex]] = [dirs[swapIndex], dirs[index]];
  }
  return dirs;
}

function shortestPathLength(candidateMaze, start, goal) {
  const oldMaze = maze;
  maze = candidateMaze;
  const queue = [{ x: start.x, y: start.y, distance: 0 }];
  const seen = new Set([`${start.x},${start.y}`]);

  while (queue.length) {
    const current = queue.shift();
    if (current.x === goal.x && current.y === goal.y) {
      maze = oldMaze;
      return current.distance;
    }

    for (let dirIndex = 0; dirIndex < DIRS.length; dirIndex += 1) {
      if (!isClearFrom(current.x, current.y, dirIndex)) continue;
      const dir = DIRS[dirIndex];
      const next = { x: current.x + dir.dx, y: current.y + dir.dy };
      const key = `${next.x},${next.y}`;
      if (seen.has(key)) continue;
      seen.add(key);
      queue.push({ ...next, distance: current.distance + 1 });
    }
  }

  maze = oldMaze;
  return -1;
}

function isClear(dirIndex) {
  return isClearFrom(robot.x, robot.y, dirIndex);
}

function isClearFrom(x, y, dirIndex) {
  const cellPosition = worldToCell(x, y);
  if (!inCellBounds(cellPosition.row, cellPosition.col)) return false;
  const dir = DIRS[dirIndex];
  const nextX = x + dir.dx;
  const nextY = y + dir.dy;
  if (nextX < 1 || nextX > COLS || nextY < 1 || nextY > ROWS) return false;
  return maze[cellPosition.row][cellPosition.col][dir.name] === false;
}

function buildWallInFront() {
  const cellPosition = worldToCell(robot.x, robot.y);
  const dir = DIRS[robot.dir];
  const next = { row: cellPosition.row + dir.dr, col: cellPosition.col + dir.dc };
  maze[cellPosition.row][cellPosition.col][dir.name] = true;
  if (inCellBounds(next.row, next.col)) {
    maze[next.row][next.col][dir.opposite] = true;
  }
}

function inCellBounds(row, col) {
  return row >= 0 && row < ROWS && col >= 0 && col < COLS;
}

function worldToCell(x, y) {
  return { row: ROWS - y, col: x - 1 };
}

function cellCenter(x, y, geometry) {
  const { row, col } = worldToCell(x, y);
  return {
    cx: geometry.left + (col + 0.5) * geometry.cell,
    cy: geometry.top + (row + 0.5) * geometry.cell
  };
}

function snapshot(label, danger = false) {
  return { label, danger, robot: cloneRobot(robot) };
}

function cloneRobot(source) {
  return { x: source.x, y: source.y, dir: source.dir };
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(320, Math.floor(rect.width * dpr));
  canvas.height = Math.max(320, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawMaze();
}

function getGeometry() {
  const width = canvas.clientWidth || 640;
  const height = canvas.clientHeight || 640;
  const left = 42;
  const top = 24;
  const bottom = 42;
  const right = 20;
  const size = Math.min(width - left - right, height - top - bottom);
  return { width, height, left, top, size, cell: size / COLS };
}

function drawMaze() {
  if (!maze.length) return;
  const g = getGeometry();
  ctx.clearRect(0, 0, g.width, g.height);

  ctx.fillStyle = "#fbfcff";
  roundRect(0, 0, g.width, g.height, 18);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  roundRect(g.left, g.top, g.size, g.size, 13);
  ctx.fill();

  drawCellHighlights(g);
  drawWalls(g);
  drawCoordinates(g);
  drawRobot(g);
}

function drawCellHighlights(g) {
  const startCenter = cellCenter(START.x, START.y, g);
  const goalCenter = cellCenter(GOAL.x, GOAL.y, g);

  ctx.save();
  ctx.globalAlpha = 0.13;
  ctx.fillStyle = "#2f6fe4";
  ctx.beginPath();
  ctx.arc(startCenter.cx, startCenter.cy, g.cell * 0.34, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#18a957";
  roundRect(goalCenter.cx - g.cell * 0.34, goalCenter.cy - g.cell * 0.34, g.cell * 0.68, g.cell * 0.68, 10);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = "#2f6fe4";
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.arc(startCenter.cx, startCenter.cy, g.cell * 0.31, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "#18a957";
  ctx.beginPath();
  ctx.moveTo(goalCenter.cx - g.cell * 0.17, goalCenter.cy + g.cell * 0.23);
  ctx.lineTo(goalCenter.cx - g.cell * 0.17, goalCenter.cy - g.cell * 0.25);
  ctx.lineTo(goalCenter.cx + g.cell * 0.22, goalCenter.cy - g.cell * 0.12);
  ctx.lineTo(goalCenter.cx - g.cell * 0.17, goalCenter.cy + g.cell * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#0f6f39";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(goalCenter.cx - g.cell * 0.17, goalCenter.cy - g.cell * 0.25);
  ctx.lineTo(goalCenter.cx - g.cell * 0.17, goalCenter.cy + g.cell * 0.27);
  ctx.stroke();
  ctx.restore();
}

function drawWalls(g) {
  ctx.save();
  ctx.strokeStyle = "#17213a";
  ctx.lineWidth = Math.max(4, g.cell * 0.065);
  ctx.lineCap = "round";

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const cell = maze[row][col];
      const x = g.left + col * g.cell;
      const y = g.top + row * g.cell;
      if (cell.N) drawLine(x, y, x + g.cell, y);
      if (cell.E) drawLine(x + g.cell, y, x + g.cell, y + g.cell);
      if (cell.S) drawLine(x, y + g.cell, x + g.cell, y + g.cell);
      if (cell.W) drawLine(x, y, x, y + g.cell);
    }
  }
  ctx.restore();
}

function drawCoordinates(g) {
  ctx.save();
  ctx.fillStyle = "#59657d";
  ctx.font = "700 13px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let x = 1; x <= COLS; x += 1) {
    const centerX = g.left + (x - 0.5) * g.cell;
    ctx.fillText(String(x), centerX, g.top + g.size + 24);
  }

  ctx.textAlign = "right";
  for (let y = 1; y <= ROWS; y += 1) {
    const row = ROWS - y;
    const centerY = g.top + (row + 0.5) * g.cell;
    ctx.fillText(String(y), g.left - 14, centerY);
  }

  ctx.fillStyle = "#c64242";
  ctx.font = "900 14px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("x", g.left + g.size / 2, g.top + g.size + 39);
  ctx.save();
  ctx.translate(g.left - 30, g.top + g.size / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("y", 0, 0);
  ctx.restore();
  ctx.restore();
}

function drawRobot(g) {
  const center = cellCenter(robot.x, robot.y, g);
  const size = g.cell * 0.44;
  const angle = [-Math.PI / 2, 0, Math.PI / 2, Math.PI][robot.dir];

  ctx.save();
  ctx.translate(center.cx, center.cy);
  ctx.rotate(angle);

  ctx.fillStyle = "rgba(21, 31, 55, 0.16)";
  ctx.beginPath();
  ctx.ellipse(2, size * 0.62, size * 0.72, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#8e97a8";
  ctx.strokeStyle = "#26324a";
  ctx.lineWidth = 2;
  roundRect(-size * 0.42, -size * 0.38, size * 0.84, size * 0.76, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#26324a";
  ctx.beginPath();
  ctx.arc(-size * 0.16, -size * 0.09, size * 0.07, 0, Math.PI * 2);
  ctx.arc(size * 0.16, -size * 0.09, size * 0.07, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#26324a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-size * 0.18, size * 0.16);
  ctx.lineTo(size * 0.18, size * 0.16);
  ctx.stroke();

  ctx.fillStyle = "#2456d6";
  ctx.beginPath();
  ctx.moveTo(size * 0.58, 0);
  ctx.lineTo(size * 0.32, -size * 0.2);
  ctx.lineTo(size * 0.32, size * 0.2);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#26324a";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.38);
  ctx.lineTo(0, -size * 0.62);
  ctx.stroke();
  ctx.fillStyle = "#ff5c5c";
  ctx.beginPath();
  ctx.arc(0, -size * 0.68, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLine(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function roundRect(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function transpilePythonLikeCode(source) {
  const lines = source.replace(/\t/g, "    ").replace(/\r/g, "").split("\n");
  const output = [];
  const stack = [];
  const declaredNames = new Set();
  let repeatCounter = 0;

  const closeBlock = () => {
    const indent = "  ".repeat(Math.max(0, stack.length - 1));
    output.push(`${indent}}`);
    stack.pop();
  };

  for (let lineNumber = 0; lineNumber < lines.length; lineNumber += 1) {
    const withoutComment = stripInlineComment(lines[lineNumber]);
    if (!withoutComment.trim()) continue;

    const indent = countIndent(withoutComment);
    const trimmed = withoutComment.trim();
    if (/^from\s+\w+\s+import\s+/.test(trimmed)) continue;

    const isElif = /^elif\b/.test(trimmed);
    const isElse = /^else\s*:/.test(trimmed);

    while (stack.length && indent < stack[stack.length - 1].indent) closeBlock();

    if ((isElif || isElse) && stack.length && indent === stack[stack.length - 1].indent && stack[stack.length - 1].type === "if") {
      closeBlock();
    } else {
      while (stack.length && indent <= stack[stack.length - 1].indent) closeBlock();
    }

    const jsIndent = "  ".repeat(stack.length);
    const jsLine = convertLine(trimmed, jsIndent, lineNumber + 1);
    output.push(jsLine.code);
    if (jsLine.opensBlock) stack.push({ indent, type: jsLine.blockType });
  }

  while (stack.length) closeBlock();
  return output.join("\n");

  function convertLine(trimmed, jsIndent, lineNumber) {
    let match = trimmed.match(/^def\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*:\s*$/);
    if (match) {
      return { code: `${jsIndent}function ${match[1]}(${match[2].trim()}) {`, opensBlock: true, blockType: "function" };
    }

    match = trimmed.match(/^while\s+(.+)\s*:\s*$/);
    if (match) {
      return { code: `${jsIndent}while (${convertExpression(match[1])}) {\n${jsIndent}  __loopGuard();`, opensBlock: true, blockType: "loop" };
    }

    match = trimmed.match(/^if\s+(.+)\s*:\s*$/);
    if (match) {
      return { code: `${jsIndent}if (${convertExpression(match[1])}) {`, opensBlock: true, blockType: "if" };
    }

    match = trimmed.match(/^elif\s+(.+)\s*:\s*$/);
    if (match) {
      return { code: `${jsIndent}else if (${convertExpression(match[1])}) {`, opensBlock: true, blockType: "if" };
    }

    if (/^else\s*:\s*$/.test(trimmed)) {
      return { code: `${jsIndent}else {`, opensBlock: true, blockType: "if" };
    }

    match = trimmed.match(/^repeat\s+(.+)\s*:\s*$/);
    if (match) {
      repeatCounter += 1;
      const counter = `__repeat_${repeatCounter}`;
      return { code: `${jsIndent}for (let ${counter} = 0; ${counter} < (${convertExpression(match[1])}); ${counter} += 1) {\n${jsIndent}  __loopGuard();`, opensBlock: true, blockType: "loop" };
    }

    match = trimmed.match(/^for\s+([A-Za-z_]\w*)\s+in\s+range\((.*)\)\s*:\s*$/);
    if (match) {
      const variable = match[1];
      const args = splitArgs(match[2]).map(convertExpression);
      const start = args.length === 1 ? "0" : args[0];
      const stop = args.length === 1 ? args[0] : args[1];
      const step = args.length >= 3 ? args[2] : "1";
      return { code: `${jsIndent}for (let ${variable} = (${start}); ${variable} < (${stop}); ${variable} += (${step})) {\n${jsIndent}  __loopGuard();`, opensBlock: true, blockType: "loop" };
    }

    if (trimmed === "pass") return { code: `${jsIndent}// pass`, opensBlock: false };
    if (trimmed === "break") return { code: `${jsIndent}break;`, opensBlock: false };
    if (trimmed === "continue") return { code: `${jsIndent}continue;`, opensBlock: false };
    if (/^return\b/.test(trimmed)) {
      return { code: `${jsIndent}${trimmed.replace(/^return\b/, "return").replace(/return\s+(.+)/, (_, expr) => `return ${convertExpression(expr)}`)};`, opensBlock: false };
    }

    match = trimmed.match(/^([A-Za-z_]\w*)\s*=\s*(?!=)(.+)$/);
    if (match && !declaredNames.has(match[1])) {
      declaredNames.add(match[1]);
      return { code: `${jsIndent}let ${match[1]} = ${convertExpression(match[2])};`, opensBlock: false };
    }

    return { code: `${jsIndent}${convertExpression(trimmed)};`, opensBlock: false };
  }

  function convertExpression(expression) {
    let js = expression.trim();
    js = js.replace(/\bTrue\b/g, "true");
    js = js.replace(/\bFalse\b/g, "false");
    js = js.replace(/\bNone\b/g, "null");
    js = js.replace(/\bnot\b/g, "!");
    js = js.replace(/\band\b/g, "&&");
    js = js.replace(/\bor\b/g, "||");
    js = js.replace(/(?<![=!<>])==(?!=)/g, "===");
    js = js.replace(/(?<![=!<>])!=(?!=)/g, "!==");
    return js;
  }

  function stripInlineComment(line) {
    let result = "";
    let inSingle = false;
    let inDouble = false;
    let escaped = false;

    for (const character of line) {
      if (escaped) {
        result += character;
        escaped = false;
        continue;
      }
      if (character === "\\") {
        result += character;
        escaped = true;
        continue;
      }
      if (character === "'" && !inDouble) inSingle = !inSingle;
      if (character === '"' && !inSingle) inDouble = !inDouble;
      if (character === "#" && !inSingle && !inDouble) break;
      result += character;
    }
    return result;
  }

  function countIndent(line) {
    const match = line.match(/^ */);
    return match ? match[0].length : 0;
  }

  function splitArgs(text) {
    return text.split(",").map((part) => part.trim()).filter(Boolean);
  }
}

function normalizeRangeArgs(args) {
  if (args.length === 1) return [0, Number(args[0]), 1];
  if (args.length === 2) return [Number(args[0]), Number(args[1]), 1];
  if (args.length >= 3) {
    const step = Number(args[2]);
    if (step === 0) throw new Error("range() step cannot be 0.");
    return [Number(args[0]), Number(args[1]), step];
  }
  return [0, 0, 1];
}

function cleanError(error) {
  return String(error && error.message ? error.message : error).replace(/\n/g, " ");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
