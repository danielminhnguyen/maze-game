"use strict";

//Build random Maze
//Inspire from
//https://medium.com/swlh/how-to-create-a-maze-with-javascript-36f3ad8eebc1
function createTable(w, h) {
  mazeWidth = w;
  mazeHeight = h;
  var mazeTable = document.createElement("table");
  var mazeBody = document.createElement("tbody");

  for (var col = 0; col <= mazeHeight; col++) {
    var mazeRow = document.createElement("tr");

    for (var row = 0; row <= mazeWidth; row++) {
      var mazeColumn = document.createElement("td");

      if (row == startPos[0] && col == startPos[1]) {
        // set starting cell color
        mazeColumn.style.backgroundColor = "green";
      } else if (row == endPos[0] && col == endPos[1]) {
        // set finish cell color
        mazeColumn.style.backgroundColor = "purple";
      } else {
        mazeColumn.style.backgroundColor = "white";
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
} // Variables


var width = 10; //Canvas width

var height = 10; // Canvas height

startPos = [0, height];
endPos = [width, 0]; //  Creat blank table

createTable(width, height); //  Construct shortest Exit path

var exit = {
  direction: null,
  validExit: ["left", "right", "top", "bottom"],
  fullPath: [],
  path: [],
  solution: [],
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
  } //   htmlObject: function () {
  //     document.getElementById(this.id());
  //   },

}; //  Shortest path to the destination

var xmin = endPos[0] - startPos[0];
var ymin = endPos[1] - startPos[1]; // Vertical distance

xmin >= 0 ? exit.direction = "right" : exit.direction = "left";
exit.fullPath = exit.fullPath.concat(Array(Math.abs(xmin)).fill(exit.direction)); // Horizontal distance

ymin >= 0 ? exit.direction = "bottom" : exit.direction = "top";
exit.fullPath = exit.fullPath.concat(Array(Math.abs(ymin)).fill(exit.direction)); // Randomize exitpath

exit.fullPath = shuffle(exit.fullPath);
debugger;
currentCell.positionX = startPos[0];
currentCell.positionY = startPos[1];
a = document.getElementById(currentCell.id());
a.style.backgroundColor = "red";

for (i = 0; i < 1000 - 1; i++) {
  //  Check avaiable direction from current cell
  currentCell.checkNeighbour(); //   action when reach dead end

  if (currentCell.validNeighbour.length == 0) {
    moveBack = exit.path[exit.path.length - 1];
    currentCell.positionX > moveBack[0] ? direction = "left" : direction = "right";
    currentCell.positionY > moveBack[0] ? direction = "top" : direction = "bottom";
    currentCell.positionX = moveBack[0];
    currentCell.positionY = moveBack[1];
    exit.fullPath.push(direction);
    currentCell.checkNeighbour();
    exit.path.pop();
  } else {
    //   Filter avaiable direction of current cell for exit Path
    var filterPath = exit.fullPath.filter(function (f) {
      return currentCell.validNeighbour.includes(f);
    }); // Check for direction

    randomPick = Math.floor(Math.random() * filterPath.length); //Pick random an exit from the

    exit.direction = filterPath[randomPick];

    if (exit.direction == undefined) {
      exit.direction = currentCell.validNeighbour[0];
    }

    if (currentCell.positionX == endPos[0] && currentCell.positionY == endPos[1]) {
      alert("Exit Found");
    }

    debugger;

    if (currentCell.positionX == 10 && currentCell.positionY == 0) {
      alert("Exit Found");
    }

    exit.fullPath.splice(exit.fullPath.indexOf(exit.direction), 1); //Remove 1st available move from path
    // document.getElementById(currentCell.id()).style.background = "green";

    a = document.getElementById(currentCell.id());
    a.style["border-".concat(exit.direction)] = "none";
    exit.path.push([currentCell.positionX, currentCell.positionY]);
    exit.visited.push([currentCell.positionX, currentCell.positionY]);

    switch (exit.direction) {
      //   Every move will add another opposite direction to the mix
      case "right":
        currentCell.positionX++;
        exit.fullPath.push("left");
        break;

      case "left":
        currentCell.positionX--;
        exit.fullPath.push("right");
        break;

      case "top":
        currentCell.positionY--;
        exit.fullPath.push("bottom");
        break;

      case "bottom":
        currentCell.positionY++;
        exit.fullPath.push("top");
        break;
    }

    a = document.getElementById(currentCell.id());
    a.style.backgroundColor = "red";
    a.style["border-".concat(exit.directionOpposite())] = "none";
  }
}