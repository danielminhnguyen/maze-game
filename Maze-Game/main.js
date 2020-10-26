//Build random Maze
// TODO:
//

// Variables
const color = {
  startCell: "green",
  finishCell: "purple",
  mazeBackground: "white",
  path: "red",
  visualise: "red",
};
var $ = function (id) {
  return document.getElementById(id);
};
let width = 20; // default canvas width
let height = 20; // default canvas height
let startPos;
let endPos;
let mazeTable;
let rightPressed = false;
let leftPressed = false;
let upPressed = false;
let downPressed = false;
let refresh = 100;
let playerInput;
let speed;
// var KeyboardHelper = { left: 37, up: 38, right: 39, down: 40 };

// Event listener
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// Modal box
var modal = document.getElementById("intro");
var span = document.getElementsByClassName("close")[0];
span.onclick = function () {
  modal.style.display = "none";
};
// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// visualise on click
$("VisualiseMaze").onclick = function () {
  switch ($("VisualiseMaze").checked) {
    case true:
      $("speed").style.display = "block";
      break;
    case false:
      $("speed").style.display = "none";
      break;
    default:
      break;
  }
};

//#region  Functions
function keyDownHandler(event) {
  if ("code" in event) {
    switch (event.code) {
      case "Unidentified":
        break;
      case "ArrowRight":
      case "Right": // IE <= 9 and FF <= 36
      case "KeyD":
        rightPressed = true;
        return;
      case "ArrowLeft":
      case "Left": // IE <= 9 and FF <= 36
      case "KeyA":
        leftPressed = true;
        return;
      case "ArrowUp":
      case "Up": // IE <= 9 and FF <= 36
      case "KeyW":
        upPressed = true;
        return;
      case "ArrowDown":
      case "Down": // IE <= 9 and FF <= 36
      case "KeyS":
        downPressed = true;
        return;
      default:
        return;
    }
  }

  if (event.keyCode == 39) {
    rightPressed = true;
  } else if (event.keyCode == 37) {
    leftPressed = true;
  }
  if (event.keyCode == 40) {
    downPressed = true;
  } else if (event.keyCode == 38) {
    upPressed = true;
  }
  // // event.stopImmediatePropagation();

  if ([32, 37, 38, 39, 40].indexOf(event.keyCode) > -1) {
    event.preventDefault();
  }
}

function keyUpHandler(event) {
  if ("code" in event) {
    switch (event.code) {
      case "Unidentified":
        break;
      case "ArrowRight":
      case "Right": // IE <= 9 and FF <= 36
      case "KeyD":
        rightPressed = false;
        return;
      case "ArrowLeft":
      case "Left": // IE <= 9 and FF <= 36
      case "KeyA":
        leftPressed = false;
        return;
      case "ArrowUp":
      case "Up": // IE <= 9 and FF <= 36
      case "KeyW":
        upPressed = false;
        return;
      case "ArrowDown":
      case "Down": // IE <= 9 and FF <= 36
      case "KeyS":
        downPressed = false;
        return;
      default:
        return;
    }
  }

  if (event.keyCode == 39) {
    rightPressed = false;
  } else if (event.keyCode == 37) {
    leftPressed = false;
  }
  if (event.keyCode == 40) {
    downPressed = false;
  } else if (event.keyCode == 38) {
    upPressed = false;
  }
}

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createTable(w, h) {
  resetShowSolution();
  $("mazeContainer").innerHTML = "";
  mazeWidth = w;
  mazeHeight = h;
  startPos = [1, mazeHeight];
  endPos = [mazeWidth, 1];
  // get drawing size
  // canvasWidth = document.getElementsByClassName("maze")[0].clientWidth;
  // canvasHeight = document.getElementsByClassName("maze")[0].clientHeight;
  // canvasCell = (Math.min(canvasHeight, canvasWidth) - 50) / Math.max(mazeWidth, mazeHeight) - 2;
  canvasCell = 70 / Math.max(mazeWidth, mazeHeight);

  let mazeTable = document.createElement("table");
  let mazeBody = document.createElement("tbody");

  for (let col = 1; col <= mazeHeight; col++) {
    var mazeRow = document.createElement("tr");
    for (let row = 1; row <= mazeWidth; row++) {
      var mazeColumn = document.createElement("td");
      mazeColumn.setAttribute("id", `cell_${row}_${col}`);
      mazeColumn.style.height = mazeColumn.style.width = `${canvasCell}vmin`;
      mazeRow.appendChild(mazeColumn);
    }
    mazeBody.appendChild(mazeRow);
  }
  mazeTable.appendChild(mazeBody);
  $("mazeContainer").appendChild(mazeTable);
  $(`cell_${startPos[0]}_${startPos[1]}`).style.backgroundColor = color.startCell;
  $(`cell_${endPos[0]}_${endPos[1]}`).style.backgroundColor = color.finishCell;
}

async function buildMaze() {
  speed = 1000 / $("speed").value;
  exit.path = exit.solution = [];
  currentCell.positionX = startPos[0];
  currentCell.positionY = startPos[1];

  $(currentCell.id()).classList.add("visited");
  exit.visited.push([currentCell.positionX, currentCell.positionY]);
  //visited cell

  for (i = 0; i <= width * height - 2; i++) {
    // Notify when exit found
    if ($("VisualiseMaze").checked == true) {
      a = $(currentCell.id());
      a.classList.add("currentcell");
      await this.timeout(1000 / $("speed").value);
      a.classList.remove("currentcell");
    }

    //  Check avaiable direction from current cell
    currentCell.checkNeighbour();
    //   action when reach dead end
    if (currentCell.validNeighbour.length == 0) {
      moveBack = exit.path[exit.path.length - 1];
      // move back 1 step because of dead
      if (moveBack != undefined) {
        currentCell.positionX > moveBack[0] ? (direction = "left") : (direction = "right");
        currentCell.positionY > moveBack[0] ? (direction = "top") : (direction = "bottom");
        currentCell.positionX = moveBack[0];
        currentCell.positionY = moveBack[1];
        // exit.fullPath.push(direction);
        currentCell.checkNeighbour();
        exit.path.pop();
        i--;
      } else {
        console.log("exit path is empty");
      }
    } else {
      //   Filter avaiable direction of current cell for exit Path)

      //Pick random an exit from the
      randomPick = Math.floor(Math.random() * currentCell.validNeighbour.length);
      exit.direction = currentCell.validNeighbour[randomPick];

      // Clear border infront of exit direction
      $(currentCell.id()).style[`border-${exit.direction}`] = "none";

      // Keep track of path taken
      exit.path.push([currentCell.positionX, currentCell.positionY]);

      currentCell.move(exit.direction); //Move following direction

      // keep track of visited cell
      exit.visited.push([currentCell.positionX, currentCell.positionY]);

      if (currentCell.positionX == endPos[0] && currentCell.positionY == endPos[1]) {
        exit.solution = exit.path.slice(); //Make copy of the exit path
        exit.found = true;
        console.log("Exit Found");
      }

      a = document.getElementById(currentCell.id());
      a.classList.add("visited");
      //break the wall behind
      a.style[`border-${exit.directionOpposite()}`] = "none";
    }
  }
}
// $(`cell_${startPos[0]}_${startPos[1]}`).style.backgroundColor = color.startCell;
// $(`cell_${endPos[0]}_${endPos[1]}`).style.backgroundColor = color.finishCell;

function showSolution() {
  switch ($("solution").innerHTML) {
    case "Show Solution":
      exit.solution.forEach((a) => {
        console.log(`cell_${a[0]}_${a[1]}`);
        $(`cell_${a[0]}_${a[1]}`).classList.add("solution");
      });
      $("solution").innerHTML = "Hide Solution";
      break;
    case "Hide Solution":
      exit.solution.forEach((a) => {
        $(`cell_${a[0]}_${a[1]}`).classList.remove("solution");
      });
      $("solution").innerHTML = "Show Solution";
      break;
    default:
      break;
  }
}

function resetShowSolution() {
  $("solution").innerHTML = "Show Solution";
  $("solution").disabled = true;
}
// GUI Funfction
function activatePlayerInput() {
  playerInput = setInterval(() => {
    if (rightPressed) {
      player.move("right");
    }
    if (leftPressed) {
      player.move("left");
    }
    if (upPressed) {
      player.move("top");
    }
    if (downPressed) {
      player.move("bottom");
    }
    if (player.positionX == endPos[0] && player.positionY == endPos[1]) {
      clearInterval(playerInput);
      alert("You Win");
    }
  }, refresh);
  $("solution").disabled = false;
}

function reset() {
  getmode();
  createTable(width, height);
}

function getmode() {
  let mode = $("mode");
  switch (mode.value) {
    case "easy":
      width = 10;
      height = 10;
      break;
    case "medium":
      width = 20;
      height = 20;
      break;
    case "hard":
      width = 30;
      height = 30;
      break;
    case "insane":
      width = 50;
      height = 50;
      break;
    default:
      break;
  }
}

function remaze() {
  getmode();
  createTable(width, height);
  buildMaze();
  player.start();
  activatePlayerInput();
}

//#endregion End Function

//#region  Objects
let exit = {
  direction: null,
  validExit: ["left", "right", "top", "bottom"],
  path: [],
  solution: [],
  found: false,
  directionOpposite: function () {
    switch (this.direction) {
      case "top":
        return "bottom";
      case "bottom":
        return "top";
      case "left":
        return "right";
      case "right":
        return "left";
    }
  },
  visited: [],
};

let currentCell = {
  positionX: null,
  positionY: null,
  position: function () {
    return [this.positionX, this.positionY];
  },
  validNeighbour: [],
  top: null,
  bottom: null,
  right: null,
  left: null,
  move: function (d) {
    switch (d) {
      case "right":
        this.positionX++;
        break;
      case "left":
        this.positionX--;
        break;
      case "top":
        this.positionY--;
        break;
      case "bottom":
        this.positionY++;
        break;
      default:
        console.log("Moving Error!!");
        break;
    }
  },
  checkNeighbour: function () {
    this.validNeighbour = [];
    //   Top
    nextCell = $(`cell_${currentCell.positionX}_${currentCell.positionY - 1}`);
    if (nextCell != null && nextCell.classList.contains("visited") == false) {
      this.validNeighbour.push("top");
    }
    //  Bottom
    nextCell = $(`cell_${currentCell.positionX}_${currentCell.positionY + 1}`);
    if (nextCell != null && nextCell.classList.contains("visited") == false) {
      this.validNeighbour.push("bottom");
    }
    // Right
    nextCell = $(`cell_${currentCell.positionX + 1}_${currentCell.positionY}`);
    if (nextCell != null && nextCell.classList.contains("visited") == false) {
      this.validNeighbour.push("right");
    }
    // Left
    nextCell = $(`cell_${currentCell.positionX - 1}_${currentCell.positionY}`);

    if (nextCell != null && nextCell.classList.contains("visited") == false) {
      this.validNeighbour.push("left");
    }
  },
  id: function () {
    return `cell_${currentCell.positionX}_${currentCell.positionY}`;
  },
};

let player = {
  start: function () {
    this.positionX = startPos[0];
    this.positionY = startPos[1];
    this.icon = document.createElement("i");
    this.icon.classList.add("fas");
    this.icon.classList.add("fa-chess-king");
    this.initiate = true;
    this.show();
    this.check;
  },

  positionX: null,
  positionY: null,
  icon: null,
  totalMove: [],
  availableMove: ["right", "left", "top", "bottom"],
  validMove: [],
  checkPath: function () {
    this.validMove = [];
    a = $(`cell_${player.positionX}_${player.positionY}`);
    for (let i = 0; i <= 3; i++) {
      if (a.style[`border-${this.availableMove[i]}`] == "none") {
        this.validMove.push(this.availableMove[i]);
      }
    }
  },
  show: function () {
    if (this.initiate) {
      $(`cell_${player.positionX}_${player.positionY}`).appendChild(this.icon);
    } else {
      console.log("Please Initiate Player");
    }
  },
  hide: function () {
    if (this.initiate) {
      $(`cell_${player.positionX}_${player.positionY}`).removeChild(this.icon);
    } else {
      console.log("Please Initiate Player");
    }
  },
  move: function (d) {
    this.checkPath();
    if (this.validMove.indexOf(d) >= 0) {
      this.hide();
      switch (d) {
        case "top":
          this.totalMove.push["top"];
          this.positionY--;
          upPressed = false;
          break;
        case "bottom":
          this.totalMove.push["bottom"];
          this.positionY++;
          downPressed = false;
          break;
        case "left":
          this.totalMove.push["left"];
          this.positionX--;
          leftPressed = false;
          break;
        case "right":
          this.totalMove.push["right"];
          this.positionX++;
          rightPressed = false;
          break;
        default:
          console("Invalid Move");
          break;
      }
      this.show();
      console.log(d);
    }
  },
};

//#endregion Object

// Inititate programe

createTable(width, height);
buildMaze();
// showSolution();

player.start();
activatePlayerInput();
