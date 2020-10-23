"use strict";

//Build random Maze
//Inspire from
//https://medium.com/swlh/how-to-create-a-maze-with-javascript-36f3ad8eebc1
// Variables
var width = 15; //Canvas width

var height = 15; // Canvas height

mazeColor = "";
startPos = [height, height];
endPos = [width, 1];
var color = {
  startCell: "green",
  finishCell: "purple",
  mazeBackground: "white"
};

function createTable(w, h) {
  mazeWidth = w;
  mazeHeight = h;
  var mazeTable = document.createElement("table");
  var mazeBody = document.createElement("tbody");

  for (var col = 1; col <= mazeHeight; col++) {
    var mazeRow = document.createElement("tr");

    for (var row = 1; row <= mazeWidth; row++) {
      var mazeColumn = document.createElement("td");

      if (row == startPos[0] && col == startPos[1]) {
        // set starting cell color
        mazeColumn.style.backgroundColor = color.startCell;
      } else if (row == endPos[0] && col == endPos[1]) {
        // set finish cell color
        mazeColumn.style.backgroundColor = color.finishCell;
      } else {
        mazeColumn.style.backgroundColor = color.mazeBackground;
      }

      mazeColumn.setAttribute("id", "cell_".concat(row, "_").concat(col));
      mazeRow.appendChild(mazeColumn);
    }

    mazeBody.appendChild(mazeRow);
  }

  mazeTable.appendChild(mazeBody);
  document.getElementById("mazeContainer").appendChild(mazeTable);
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
}

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
  availablePath: [],
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

    nextCell = document.getElementById("cell_".concat(currentCell.positionX, "_").concat(currentCell.positionY - 1));

    if (nextCell != null && nextCell.style.backgroundColor != "red") {
      this.validNeighbour.push("top");
    } //  Bottom


    nextCell = document.getElementById("cell_".concat(currentCell.positionX, "_").concat(currentCell.positionY + 1));

    if (nextCell != null && nextCell.style.backgroundColor != "red") {
      this.validNeighbour.push("bottom");
    } // Right


    nextCell = document.getElementById("cell_".concat(currentCell.positionX + 1, "_").concat(currentCell.positionY));

    if (nextCell != null && nextCell.style.backgroundColor != "red") {
      this.validNeighbour.push("right");
    } // Left


    nextCell = document.getElementById("cell_".concat(currentCell.positionX - 1, "_").concat(currentCell.positionY));

    if (nextCell != null && nextCell.style.backgroundColor != "red") {
      this.validNeighbour.push("left");
    }
  },
  id: function id() {
    return "cell_".concat(currentCell.positionX, "_").concat(currentCell.positionY);
  }
}; //  Creat blank table

createTable(width, height);
player.start(); //  Shortest path to the destination

var xmin = endPos[0] - startPos[0];
var ymin = endPos[1] - startPos[1]; // Vertical distance

xmin >= 0 ? exit.direction = "right" : exit.direction = "left";
exit.availablePath = exit.availablePath.concat(Array(Math.abs(xmin)).fill(exit.direction)); // Horizontal distance

ymin >= 0 ? exit.direction = "bottom" : exit.direction = "top";
exit.availablePath = exit.availablePath.concat(Array(Math.abs(ymin)).fill(exit.direction)); // Randomize exitpath

exit.availablePath = shuffle(exit.availablePath); // initiate starting point

currentCell.positionX = startPos[0];
currentCell.positionY = startPos[1];
a = document.getElementById(currentCell.id());
a.style.backgroundColor = "red";
exit.path.push([currentCell.positionX, currentCell.positionY]); // current correct cell

exit.visited.push([currentCell.positionX, currentCell.positionY]); //visited cell

for (i = 0; i <= width * height - 2; i++) {
  if (i != exit.visited.length) {} //  Check avaiable direction from current cell


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
    var filterPath = exit.availablePath.filter(function (f) {
      return currentCell.validNeighbour.includes(f);
    }); // Check for direction

    randomPick = Math.floor(Math.random() * filterPath.length); //Pick random an exit from the

    exit.direction = filterPath[randomPick]; // when weight direction doesn't include the path

    if (exit.direction == undefined) {
      exit.direction = currentCell.validNeighbour[0];
    }

    exit.availablePath.push(exit.directionOpposite(exit.direction)); //Add opposite direction to keep balance
    //Remove 1st available move from path

    exit.availablePath.splice(exit.availablePath.indexOf(exit.direction), 1); // Notify when exit found

    if (currentCell.positionX == endPos[0] && currentCell.positionY == endPos[1]) {
      exit.solution = exit.path.slice();
      console.log("Exit Found");
    } // break the wall in front


    a = document.getElementById(currentCell.id());
    a.style["border-".concat(exit.direction)] = "none";
    currentCell.move(exit.direction); // Implement into Object
    // switch (exit.direction) {
    //   //   Every move will add another opposite direction to the mix
    //   case "right":
    //     currentCell.positionX++;
    //     exit.fullPath.push("left");
    //     break;
    //   case "left":
    //     currentCell.positionX--;
    //     exit.fullPath.push("right");
    //     break;
    //   case "top":
    //     currentCell.positionY--;
    //     exit.fullPath.push("bottom");
    //     break;
    //   case "bottom":
    //     currentCell.positionY++;
    //     exit.fullPath.push("top");
    //     break;
    // }

    exit.path.push([currentCell.positionX, currentCell.positionY]); // solution cells

    exit.visited.push([currentCell.positionX, currentCell.positionY]); //visited cell

    a = document.getElementById(currentCell.id());
    a.style.backgroundColor = "red";
    a.style["border-".concat(exit.directionOpposite())] = "none"; //break the wall behind
  }
}

document.getElementById("cell_".concat(startPos[0], "_").concat(startPos[0])).style.backgroundColor = color.startCell;
document.getElementById("cell_".concat(endPos[0], "_").concat(endPos[0])).style.backgroundColor = color.finishCell;