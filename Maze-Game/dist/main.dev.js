"use strict";

//Build random Maze
//Inspire from
//#region Maze Generator
// Variables
var width = 10; //Canvas width

var height = 10; // Canvas height

var startPos = [1, height];
var endPos = [width, 1];
var color = {
  startCell: "green",
  finishCell: "purple",
  mazeBackground: "white",
  path: "red"
};

var $ = function $(id) {
  return document.getElementById(id);
}; //#region  Functions


function createTable(w, h) {
  mazeWidth = w;
  mazeHeight = h;
  var mazeTable = document.createElement("table");
  var mazeBody = document.createElement("tbody");

  for (var col = 1; col <= mazeHeight; col++) {
    var mazeRow = document.createElement("tr");

    for (var row = 1; row <= mazeWidth; row++) {
      var mazeColumn = document.createElement("td");
      mazeColumn.setAttribute("id", "cell_".concat(row, "_").concat(col));
      mazeRow.appendChild(mazeColumn);
    }

    mazeBody.appendChild(mazeRow);
  }

  mazeTable.appendChild(mazeBody);
  $("mazeContainer").appendChild(mazeTable);
  $("cell_".concat(startPos[0], "_").concat(startPos[1])).style.backgroundColor = color.startCell;
  $("cell_".concat(endPos[0], "_").concat(endPos[1])).style.backgroundColor = color.finishCell;
} // Fisher–Yates Shuffle https://bost.ocks.org/mike/shuffle/


function shuffle(array) {
  var currentIndex = array.length,
      temporaryValue,
      randomIndex; // While there remain elements to shuffle...

  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1; // And swap it with the current element.

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
} //#endregion End Function
//#region  Objects


var player = {
  start: function start() {
    this.positionX = startPos[0];
    this.positionY = startPos[1];
  },
  positionX: null,
  positionY: null
}; //  Construct shortest Exit path

var exit = {
  direction: null,
  validExit: ["left", "right", "top", "bottom"],
  path: [],
  solution: [],
  found: false,
  directionOpposite: function directionOpposite() {
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
  visited: []
};
var currentCell = {
  positionX: null,
  positionY: null,
  position: function position() {
    return [this.positionX, this.positionY];
  },
  validNeighbour: [],
  top: null,
  bottom: null,
  right: null,
  left: null,
  move: function move(d) {
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
  checkNeighbour: function checkNeighbour() {
    this.validNeighbour = []; //   Top

    nextCell = $("cell_".concat(currentCell.positionX, "_").concat(currentCell.positionY - 1));

    if (nextCell != null && nextCell.classList.contains("visited") == false) {
      this.validNeighbour.push("top");
    } //  Bottom


    nextCell = $("cell_".concat(currentCell.positionX, "_").concat(currentCell.positionY + 1));

    if (nextCell != null && nextCell.classList.contains("visited") == false) {
      this.validNeighbour.push("bottom");
    } // Right


    nextCell = $("cell_".concat(currentCell.positionX + 1, "_").concat(currentCell.positionY));

    if (nextCell != null && nextCell.classList.contains("visited") == false) {
      this.validNeighbour.push("right");
    } // Left


    nextCell = $("cell_".concat(currentCell.positionX - 1, "_").concat(currentCell.positionY));

    if (nextCell != null && nextCell.classList.contains("visited") == false) {
      this.validNeighbour.push("left");
    }
  },
  id: function id() {
    return "cell_".concat(currentCell.positionX, "_").concat(currentCell.positionY);
  }
}; //#endregion Object
//  Creat blank table

createTable(width, height);
player.start(); //  Shortest path to the destination
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

currentCell.positionX = startPos[0];
currentCell.positionY = startPos[1];
$(currentCell.id()).classList.add("visited");
exit.path.push([currentCell.positionX, currentCell.positionY]); // current correct cell

exit.visited.push([currentCell.positionX, currentCell.positionY]); //visited cell

for (i = 0; i <= width * height; i++) {
  // Notify when exit found
  if (currentCell.positionX == endPos[0] && currentCell.positionY == endPos[1]) {
    exit.solution = exit.path.slice(); //Make copy of the exit path

    exit.found = true;
    console.log("Exit Found");
  } //  Check avaiable direction from current cell


  currentCell.checkNeighbour(); //   action when reach dead end

  if (currentCell.validNeighbour.length == 0) {
    moveBack = exit.path[exit.path.length - 1];

    if (moveBack != undefined) {
      currentCell.positionX > moveBack[0] ? direction = "left" : direction = "right";
      currentCell.positionY > moveBack[0] ? direction = "top" : direction = "bottom";
      currentCell.positionX = moveBack[0];
      currentCell.positionY = moveBack[1]; // exit.fullPath.push(direction);

      currentCell.checkNeighbour();
      exit.path.pop();
      i--;
    } else {
      console.log("exit path is empty");
    }
  } else {
    //   Filter avaiable direction of current cell for exit Path)
    // Check for direction
    randomPick = Math.floor(Math.random() * currentCell.validNeighbour.length); //Pick random an exit from the

    exit.direction = currentCell.validNeighbour[randomPick]; // when weight direction doesn't include the path

    if (exit.direction == undefined) {
      exit.direction = currentCell.validNeighbour[0];
    } else {
      a = document.getElementById(currentCell.id());
      a.style["border-".concat(exit.direction)] = "none";
    } //  Continue to create deadend


    exit.path.push([currentCell.positionX, currentCell.positionY]); // solution array
    // break the wall in front

    currentCell.move(exit.direction); //Move following direction

    exit.visited.push([currentCell.positionX, currentCell.positionY]); //visited array

    a = document.getElementById(currentCell.id());
    a.classList.add("visited");
    a.style["border-".concat(exit.directionOpposite())] = "none"; //break the wall behind
  }
}

exit.solution.forEach(function (a) {
  $("cell_".concat(a[0], "_").concat(a[1])).style.backgroundColor = color.path;
});
$("cell_".concat(startPos[0], "_").concat(startPos[1])).style.backgroundColor = color.startCell;
$("cell_".concat(endPos[0], "_").concat(endPos[1])).style.backgroundColor = color.finishCell; //#endregion  End MAZE GENERATOR
//  check exit.found false then re run the program