//Build random Maze
// TODO:
//

//#region Maze Generator
// Variables
let width = 10; //Canvas width
let height = 10; // Canvas height
let startPos = [1, height];
let endPos = [width, 1];
let mazeTable;
const color = {
  startCell: "green",
  finishCell: "purple",
  mazeBackground: "white",
  path: "red",
};
var $ = function (id) {
  return document.getElementById(id);
};
var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;
var interval = 1;
// var KeyboardHelper = { left: 37, up: 38, right: 39, down: 40 };

//#region  Functions
function keyDownHandler(e) {
  if ("code" in e) {
    switch (e.code) {
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

  if (e.keyCode == 39) {
    rightPressed = true;
  } else if (e.keyCode == 37) {
    leftPressed = true;
  }
  if (e.keyCode == 40) {
    downPressed = true;
  } else if (e.keyCode == 38) {
    upPressed = true;
  }
}

function keyUpHandler(e) {
  if ("code" in e) {
    switch (e.code) {
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

  if (e.keyCode == 39) {
    rightPressed = false;
  } else if (e.keyCode == 37) {
    leftPressed = false;
  }
  if (e.keyCode == 40) {
    downPressed = false;
  } else if (e.keyCode == 38) {
    upPressed = false;
  }
}

function createTable(w, h) {
  mazeWidth = w;
  mazeHeight = h;
  let mazeTable = document.createElement("table");
  let mazeBody = document.createElement("tbody");
  for (let col = 1; col <= mazeHeight; col++) {
    var mazeRow = document.createElement("tr");
    for (let row = 1; row <= mazeWidth; row++) {
      var mazeColumn = document.createElement("td");
      mazeColumn.setAttribute("id", `cell_${row}_${col}`);
      mazeColumn.style.width = `${90 / width}vmin`;
      mazeColumn.style.height = `${90 / height}vmin`;
      mazeRow.appendChild(mazeColumn);
    }
    mazeBody.appendChild(mazeRow);
  }
  mazeTable.appendChild(mazeBody);
  $("mazeContainer").appendChild(mazeTable);
  $(`cell_${startPos[0]}_${startPos[1]}`).style.backgroundColor = color.startCell;
  $(`cell_${endPos[0]}_${endPos[1]}`).style.backgroundColor = color.finishCell;
}

// Fisher–Yates Shuffle https://bost.ocks.org/mike/shuffle/
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function buildMaze() {
  currentCell.positionX = startPos[0];
  currentCell.positionY = startPos[1];

  $(currentCell.id()).classList.add("visited");

  // exit.path.push([currentCell.positionX, currentCell.positionY]); // current correct cell
  exit.visited.push([currentCell.positionX, currentCell.positionY]); //visited cell

  for (i = 0; i <= width * height; i++) {
    // (function (i) {
    //   setTimeout(function () {
    // Notify when exit found
    if (currentCell.positionX == endPos[0] && currentCell.positionY == endPos[1]) {
      exit.solution = exit.path.slice(); //Make copy of the exit path
      exit.found = true;
      console.log("Exit Found");
    }
    //  Check avaiable direction from current cell
    currentCell.checkNeighbour();
    //   action when reach dead end
    if (currentCell.validNeighbour.length == 0) {
      moveBack = exit.path[exit.path.length - 1];
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
      // when weight direction doesn't include the path
      if (exit.direction == undefined) {
        exit.direction = currentCell.validNeighbour[0];
      } else {
        a = document.getElementById(currentCell.id());
        a.style[`border-${exit.direction}`] = "none";
      }

      //  Continue to create deadend

      exit.path.push([currentCell.positionX, currentCell.positionY]); // solution array

      // break the wall in front

      currentCell.move(exit.direction); //Move following direction

      exit.visited.push([currentCell.positionX, currentCell.positionY]); //visited array

      a = document.getElementById(currentCell.id());
      a.classList.add("visited");
      a.style[`border-${exit.directionOpposite()}`] = "none"; //break the wall behind
    }
    //   }, interval * i);
    // })(i);
  }
}
// $(`cell_${startPos[0]}_${startPos[1]}`).style.backgroundColor = color.startCell;
// $(`cell_${endPos[0]}_${endPos[1]}`).style.backgroundColor = color.finishCell;

function showSolution() {
  exit.solution.forEach((a) => {
    $(`cell_${a[0]}_${a[1]}`).style.backgroundColor = color.path;
  });
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
        console.log(this.availableMove[i]);
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

function play() {
  $("mazeContainer").innerHTML = "";
  createTable(width, height);
  buildMaze();
  player.start();
  player.show();
}

//  Creat blank table
$("mazeContainer").innerHTML = "";
createTable(width, height);
buildMaze();
showSolution();
//#endregion  End MAZE GENERATOR

player.start();
player.show();

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

checkscore = setInterval(() => {
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
    clearInterval(checkscore);
    alert("You Win");
  }
}, 100);

//  Shortest path to the destination
// let xmin = endPos[0] - startPos[0];
// let ymin = endPos[1] - startPos[1];

// Vertical distance
// xmin >= 0 ? (exit.direction = "right") : (exit.direction = "left");
// exit.availablePath = exit.availablePath.concat(Array(Math.abs(xmin)).fill(exit.direction));
// // Horizontal distance
// ymin >= 0 ? (exit.direction = "bottom") : (exit.direction = "top");
// exit.availablePath = exit.availablePath.concat(Array(Math.abs(ymin)).fill(exit.direction));
// // Randomize exitpath
// exit.availablePath = shuffle(exit.availablePath);

// initiate starting point

//  check exit.found false then re run the program
