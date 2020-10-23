"use strict";

var Node = require("./node");

var launchAnimations = require("./animations/launchAnimations");

var launchInstantAnimations = require("./animations/launchInstantAnimations");

var mazeGenerationAnimations = require("./animations/mazeGenerationAnimations");

var weightedSearchAlgorithm = require("./pathfindingAlgorithms/weightedSearchAlgorithm");

var unweightedSearchAlgorithm = require("./pathfindingAlgorithms/unweightedSearchAlgorithm");

var recursiveDivisionMaze = require("./mazeAlgorithms/recursiveDivisionMaze");

var otherMaze = require("./mazeAlgorithms/otherMaze");

var otherOtherMaze = require("./mazeAlgorithms/otherOtherMaze");

var astar = require("./pathfindingAlgorithms/astar");

var stairDemonstration = require("./mazeAlgorithms/stairDemonstration");

var weightsDemonstration = require("./mazeAlgorithms/weightsDemonstration");

var simpleDemonstration = require("./mazeAlgorithms/simpleDemonstration");

var bidirectional = require("./pathfindingAlgorithms/bidirectional");

var getDistance = require("./getDistance");

function Board(height, width) {
  this.height = height;
  this.width = width;
  this.start = null;
  this.target = null;
  this.object = null;
  this.boardArray = [];
  this.nodes = {};
  this.nodesToAnimate = [];
  this.objectNodesToAnimate = [];
  this.shortestPathNodesToAnimate = [];
  this.objectShortestPathNodesToAnimate = [];
  this.wallsToAnimate = [];
  this.mouseDown = false;
  this.pressedNodeStatus = "normal";
  this.previouslyPressedNodeStatus = null;
  this.previouslySwitchedNode = null;
  this.previouslySwitchedNodeWeight = 0;
  this.keyDown = false;
  this.algoDone = false;
  this.currentAlgorithm = null;
  this.currentHeuristic = null;
  this.numberOfObjects = 0;
  this.isObject = false;
  this.buttonsOn = false;
  this.speed = "fast";
}

Board.prototype.initialise = function () {
  this.createGrid();
  this.addEventListeners();
  this.toggleTutorialButtons();
};

Board.prototype.createGrid = function () {
  var tableHTML = "";

  for (var r = 0; r < this.height; r++) {
    var currentArrayRow = [];
    var currentHTMLRow = "<tr id=\"row ".concat(r, "\">");

    for (var c = 0; c < this.width; c++) {
      var newNodeId = "".concat(r, "-").concat(c),
          newNodeClass = void 0,
          newNode = void 0;

      if (r === Math.floor(this.height / 2) && c === Math.floor(this.width / 4)) {
        newNodeClass = "start";
        this.start = "".concat(newNodeId);
      } else if (r === Math.floor(this.height / 2) && c === Math.floor(3 * this.width / 4)) {
        newNodeClass = "target";
        this.target = "".concat(newNodeId);
      } else {
        newNodeClass = "unvisited";
      }

      newNode = new Node(newNodeId, newNodeClass);
      currentArrayRow.push(newNode);
      currentHTMLRow += "<td id=\"".concat(newNodeId, "\" class=\"").concat(newNodeClass, "\"></td>");
      this.nodes["".concat(newNodeId)] = newNode;
    }

    this.boardArray.push(currentArrayRow);
    tableHTML += "".concat(currentHTMLRow, "</tr>");
  }

  var board = document.getElementById("board");
  board.innerHTML = tableHTML;
};

Board.prototype.addEventListeners = function () {
  var _this = this;

  var board = this;

  for (var r = 0; r < board.height; r++) {
    var _loop = function _loop(c) {
      var currentId = "".concat(r, "-").concat(c);
      var currentNode = board.getNode(currentId);
      var currentElement = document.getElementById(currentId);

      currentElement.onmousedown = function (e) {
        e.preventDefault();

        if (_this.buttonsOn) {
          board.mouseDown = true;

          if (currentNode.status === "start" || currentNode.status === "target" || currentNode.status === "object") {
            board.pressedNodeStatus = currentNode.status;
          } else {
            board.pressedNodeStatus = "normal";
            board.changeNormalNode(currentNode);
          }
        }
      };

      currentElement.onmouseup = function () {
        if (_this.buttonsOn) {
          board.mouseDown = false;

          if (board.pressedNodeStatus === "target") {
            board.target = currentId;
          } else if (board.pressedNodeStatus === "start") {
            board.start = currentId;
          } else if (board.pressedNodeStatus === "object") {
            board.object = currentId;
          }

          board.pressedNodeStatus = "normal";
        }
      };

      currentElement.onmouseenter = function () {
        if (_this.buttonsOn) {
          if (board.mouseDown && board.pressedNodeStatus !== "normal") {
            board.changeSpecialNode(currentNode);

            if (board.pressedNodeStatus === "target") {
              board.target = currentId;

              if (board.algoDone) {
                board.redoAlgorithm();
              }
            } else if (board.pressedNodeStatus === "start") {
              board.start = currentId;

              if (board.algoDone) {
                board.redoAlgorithm();
              }
            } else if (board.pressedNodeStatus === "object") {
              board.object = currentId;

              if (board.algoDone) {
                board.redoAlgorithm();
              }
            }
          } else if (board.mouseDown) {
            board.changeNormalNode(currentNode);
          }
        }
      };

      currentElement.onmouseleave = function () {
        if (_this.buttonsOn) {
          if (board.mouseDown && board.pressedNodeStatus !== "normal") {
            board.changeSpecialNode(currentNode);
          }
        }
      };
    };

    for (var c = 0; c < board.width; c++) {
      _loop(c);
    }
  }
};

Board.prototype.getNode = function (id) {
  var coordinates = id.split("-");
  var r = parseInt(coordinates[0]);
  var c = parseInt(coordinates[1]);
  return this.boardArray[r][c];
};

Board.prototype.changeSpecialNode = function (currentNode) {
  var element = document.getElementById(currentNode.id),
      previousElement;
  if (this.previouslySwitchedNode) previousElement = document.getElementById(this.previouslySwitchedNode.id);

  if (currentNode.status !== "target" && currentNode.status !== "start" && currentNode.status !== "object") {
    if (this.previouslySwitchedNode) {
      this.previouslySwitchedNode.status = this.previouslyPressedNodeStatus;
      previousElement.className = this.previouslySwitchedNodeWeight === 15 ? "unvisited weight" : this.previouslyPressedNodeStatus;
      this.previouslySwitchedNode.weight = this.previouslySwitchedNodeWeight === 15 ? 15 : 0;
      this.previouslySwitchedNode = null;
      this.previouslySwitchedNodeWeight = currentNode.weight;
      this.previouslyPressedNodeStatus = currentNode.status;
      element.className = this.pressedNodeStatus;
      currentNode.status = this.pressedNodeStatus;
      currentNode.weight = 0;
    }
  } else if (currentNode.status !== this.pressedNodeStatus && !this.algoDone) {
    this.previouslySwitchedNode.status = this.pressedNodeStatus;
    previousElement.className = this.pressedNodeStatus;
  } else if (currentNode.status === this.pressedNodeStatus) {
    this.previouslySwitchedNode = currentNode;
    element.className = this.previouslyPressedNodeStatus;
    currentNode.status = this.previouslyPressedNodeStatus;
  }
};

Board.prototype.changeNormalNode = function (currentNode) {
  var element = document.getElementById(currentNode.id);
  var relevantStatuses = ["start", "target", "object"];
  var unweightedAlgorithms = ["dfs", "bfs"];

  if (!this.keyDown) {
    if (!relevantStatuses.includes(currentNode.status)) {
      element.className = currentNode.status !== "wall" ? "wall" : "unvisited";
      currentNode.status = element.className !== "wall" ? "unvisited" : "wall";
      currentNode.weight = 0;
    }
  } else if (this.keyDown === 87 && !unweightedAlgorithms.includes(this.currentAlgorithm)) {
    if (!relevantStatuses.includes(currentNode.status)) {
      element.className = currentNode.weight !== 15 ? "unvisited weight" : "unvisited";
      currentNode.weight = element.className !== "unvisited weight" ? 0 : 15;
      currentNode.status = "unvisited";
    }
  }
};

Board.prototype.drawShortestPath = function (targetNodeId, startNodeId, object) {
  var currentNode;

  if (this.currentAlgorithm !== "bidirectional") {
    currentNode = this.nodes[this.nodes[targetNodeId].previousNode];

    if (object) {
      while (currentNode.id !== startNodeId) {
        this.objectShortestPathNodesToAnimate.unshift(currentNode);
        currentNode = this.nodes[currentNode.previousNode];
      }
    } else {
      while (currentNode.id !== startNodeId) {
        this.shortestPathNodesToAnimate.unshift(currentNode);
        document.getElementById(currentNode.id).className = "shortest-path";
        currentNode = this.nodes[currentNode.previousNode];
      }
    }
  } else {
    if (this.middleNode !== this.target && this.middleNode !== this.start) {
      currentNode = this.nodes[this.nodes[this.middleNode].previousNode];
      secondCurrentNode = this.nodes[this.nodes[this.middleNode].otherpreviousNode];

      if (secondCurrentNode.id === this.target) {
        this.nodes[this.target].direction = getDistance(this.nodes[this.middleNode], this.nodes[this.target])[2];
      }

      if (this.nodes[this.middleNode].weight === 0) {
        document.getElementById(this.middleNode).className = "shortest-path";
      } else {
        document.getElementById(this.middleNode).className = "shortest-path weight";
      }

      while (currentNode.id !== startNodeId) {
        this.shortestPathNodesToAnimate.unshift(currentNode);
        document.getElementById(currentNode.id).className = "shortest-path";
        currentNode = this.nodes[currentNode.previousNode];
      }

      while (secondCurrentNode.id !== targetNodeId) {
        this.shortestPathNodesToAnimate.unshift(secondCurrentNode);
        document.getElementById(secondCurrentNode.id).className = "shortest-path";

        if (secondCurrentNode.otherpreviousNode === targetNodeId) {
          if (secondCurrentNode.otherdirection === "left") {
            secondCurrentNode.direction = "right";
          } else if (secondCurrentNode.otherdirection === "right") {
            secondCurrentNode.direction = "left";
          } else if (secondCurrentNode.otherdirection === "up") {
            secondCurrentNode.direction = "down";
          } else if (secondCurrentNode.otherdirection === "down") {
            secondCurrentNode.direction = "up";
          }

          this.nodes[this.target].direction = getDistance(secondCurrentNode, this.nodes[this.target])[2];
        }

        secondCurrentNode = this.nodes[secondCurrentNode.otherpreviousNode];
      }
    } else {
      document.getElementById(this.nodes[this.target].previousNode).className = "shortest-path";
    }
  }
};

Board.prototype.addShortestPath = function (targetNodeId, startNodeId, object) {
  var currentNode = this.nodes[this.nodes[targetNodeId].previousNode];

  if (object) {
    while (currentNode.id !== startNodeId) {
      this.objectShortestPathNodesToAnimate.unshift(currentNode);
      currentNode.relatesToObject = true;
      currentNode = this.nodes[currentNode.previousNode];
    }
  } else {
    while (currentNode.id !== startNodeId) {
      this.shortestPathNodesToAnimate.unshift(currentNode);
      currentNode = this.nodes[currentNode.previousNode];
    }
  }
};

Board.prototype.drawShortestPathTimeout = function (targetNodeId, startNodeId, type, object) {
  var board = this;
  var currentNode;
  var secondCurrentNode;
  var currentNodesToAnimate;

  if (board.currentAlgorithm !== "bidirectional") {
    currentNode = board.nodes[board.nodes[targetNodeId].previousNode];

    if (object) {
      board.objectShortestPathNodesToAnimate.push("object");
      currentNodesToAnimate = board.objectShortestPathNodesToAnimate.concat(board.shortestPathNodesToAnimate);
    } else {
      currentNodesToAnimate = [];

      while (currentNode.id !== startNodeId) {
        currentNodesToAnimate.unshift(currentNode);
        currentNode = board.nodes[currentNode.previousNode];
      }
    }
  } else {
    if (board.middleNode !== board.target && board.middleNode !== board.start) {
      currentNode = board.nodes[board.nodes[board.middleNode].previousNode];
      secondCurrentNode = board.nodes[board.nodes[board.middleNode].otherpreviousNode];

      if (secondCurrentNode.id === board.target) {
        board.nodes[board.target].direction = getDistance(board.nodes[board.middleNode], board.nodes[board.target])[2];
      }

      if (object) {} else {
        currentNodesToAnimate = [];
        board.nodes[board.middleNode].direction = getDistance(currentNode, board.nodes[board.middleNode])[2];

        while (currentNode.id !== startNodeId) {
          currentNodesToAnimate.unshift(currentNode);
          currentNode = board.nodes[currentNode.previousNode];
        }

        currentNodesToAnimate.push(board.nodes[board.middleNode]);

        while (secondCurrentNode.id !== targetNodeId) {
          if (secondCurrentNode.otherdirection === "left") {
            secondCurrentNode.direction = "right";
          } else if (secondCurrentNode.otherdirection === "right") {
            secondCurrentNode.direction = "left";
          } else if (secondCurrentNode.otherdirection === "up") {
            secondCurrentNode.direction = "down";
          } else if (secondCurrentNode.otherdirection === "down") {
            secondCurrentNode.direction = "up";
          }

          currentNodesToAnimate.push(secondCurrentNode);

          if (secondCurrentNode.otherpreviousNode === targetNodeId) {
            board.nodes[board.target].direction = getDistance(secondCurrentNode, board.nodes[board.target])[2];
          }

          secondCurrentNode = board.nodes[secondCurrentNode.otherpreviousNode];
        }
      }
    } else {
      currentNodesToAnimate = [];
      var target = board.nodes[board.target];
      currentNodesToAnimate.push(board.nodes[target.previousNode], target);
    }
  }

  timeout(0);

  function timeout(index) {
    if (!currentNodesToAnimate.length) currentNodesToAnimate.push(board.nodes[board.start]);
    setTimeout(function () {
      if (index === 0) {
        shortestPathChange(currentNodesToAnimate[index]);
      } else if (index < currentNodesToAnimate.length) {
        shortestPathChange(currentNodesToAnimate[index], currentNodesToAnimate[index - 1]);
      } else if (index === currentNodesToAnimate.length) {
        shortestPathChange(board.nodes[board.target], currentNodesToAnimate[index - 1], "isActualTarget");
      }

      if (index > currentNodesToAnimate.length) {
        board.toggleButtons();
        return;
      }

      timeout(index + 1);
    }, 40);
  }

  function shortestPathChange(currentNode, previousNode, isActualTarget) {
    if (currentNode === "object") {
      var element = document.getElementById(board.object);
      element.className = "objectTransparent";
    } else if (currentNode.id !== board.start) {
      if (currentNode.id !== board.target || currentNode.id === board.target && isActualTarget) {
        var currentHTMLNode = document.getElementById(currentNode.id);

        if (type === "unweighted") {
          currentHTMLNode.className = "shortest-path-unweighted";
        } else {
          var direction;

          if (currentNode.relatesToObject && !currentNode.overwriteObjectRelation && currentNode.id !== board.target) {
            direction = "storedDirection";
            currentNode.overwriteObjectRelation = true;
          } else {
            direction = "direction";
          }

          if (currentNode[direction] === "up") {
            currentHTMLNode.className = "shortest-path-up";
          } else if (currentNode[direction] === "down") {
            currentHTMLNode.className = "shortest-path-down";
          } else if (currentNode[direction] === "right") {
            currentHTMLNode.className = "shortest-path-right";
          } else if (currentNode[direction] === "left") {
            currentHTMLNode.className = "shortest-path-left";
          } else {
            currentHTMLNode.className = "shortest-path";
          }
        }
      }
    }

    if (previousNode) {
      if (previousNode !== "object" && previousNode.id !== board.target && previousNode.id !== board.start) {
        var previousHTMLNode = document.getElementById(previousNode.id);
        previousHTMLNode.className = previousNode.weight === 15 ? "shortest-path weight" : "shortest-path";
      }
    } else {
      var _element = document.getElementById(board.start);

      _element.className = "startTransparent";
    }
  }
};

Board.prototype.createMazeOne = function (type) {
  var _this2 = this;

  Object.keys(this.nodes).forEach(function (node) {
    var random = Math.random();
    var currentHTMLNode = document.getElementById(node);
    var relevantClassNames = ["start", "target", "object"];
    var randomTwo = type === "wall" ? 0.25 : 0.35;

    if (random < randomTwo && !relevantClassNames.includes(currentHTMLNode.className)) {
      if (type === "wall") {
        currentHTMLNode.className = "wall";
        _this2.nodes[node].status = "wall";
        _this2.nodes[node].weight = 0;
      } else if (type === "weight") {
        currentHTMLNode.className = "unvisited weight";
        _this2.nodes[node].status = "unvisited";
        _this2.nodes[node].weight = 15;
      }
    }
  });
};

Board.prototype.clearPath = function (clickedButton) {
  var _this3 = this;

  if (clickedButton) {
    var start = this.nodes[this.start];
    var target = this.nodes[this.target];
    var object = this.numberOfObjects ? this.nodes[this.object] : null;
    start.status = "start";
    document.getElementById(start.id).className = "start";
    target.status = "target";
    document.getElementById(target.id).className = "target";

    if (object) {
      object.status = "object";
      document.getElementById(object.id).className = "object";
    }
  }

  document.getElementById("startButtonStart").onclick = function () {
    if (!_this3.currentAlgorithm) {
      document.getElementById("startButtonStart").innerHTML = '<button class="btn btn-default navbar-btn" type="button">Pick an Algorithm!</button>';
    } else {
      _this3.clearPath("clickedButton");

      _this3.toggleButtons();

      var weightedAlgorithms = ["dijkstra", "CLA", "greedy"];
      var unweightedAlgorithms = ["dfs", "bfs"];
      var success;

      if (_this3.currentAlgorithm === "bidirectional") {
        if (!_this3.numberOfObjects) {
          success = bidirectional(_this3.nodes, _this3.start, _this3.target, _this3.nodesToAnimate, _this3.boardArray, _this3.currentAlgorithm, _this3.currentHeuristic, _this3);
          launchAnimations(_this3, success, "weighted");
        } else {
          _this3.isObject = true;
        }

        _this3.algoDone = true;
      } else if (_this3.currentAlgorithm === "astar") {
        if (!_this3.numberOfObjects) {
          success = weightedSearchAlgorithm(_this3.nodes, _this3.start, _this3.target, _this3.nodesToAnimate, _this3.boardArray, _this3.currentAlgorithm, _this3.currentHeuristic);
          launchAnimations(_this3, success, "weighted");
        } else {
          _this3.isObject = true;
          success = weightedSearchAlgorithm(_this3.nodes, _this3.start, _this3.object, _this3.objectNodesToAnimate, _this3.boardArray, _this3.currentAlgorithm, _this3.currentHeuristic);
          launchAnimations(_this3, success, "weighted", "object", _this3.currentAlgorithm, _this3.currentHeuristic);
        }

        _this3.algoDone = true;
      } else if (weightedAlgorithms.includes(_this3.currentAlgorithm)) {
        if (!_this3.numberOfObjects) {
          success = weightedSearchAlgorithm(_this3.nodes, _this3.start, _this3.target, _this3.nodesToAnimate, _this3.boardArray, _this3.currentAlgorithm, _this3.currentHeuristic);
          launchAnimations(_this3, success, "weighted");
        } else {
          _this3.isObject = true;
          success = weightedSearchAlgorithm(_this3.nodes, _this3.start, _this3.object, _this3.objectNodesToAnimate, _this3.boardArray, _this3.currentAlgorithm, _this3.currentHeuristic);
          launchAnimations(_this3, success, "weighted", "object", _this3.currentAlgorithm, _this3.currentHeuristic);
        }

        _this3.algoDone = true;
      } else if (unweightedAlgorithms.includes(_this3.currentAlgorithm)) {
        if (!_this3.numberOfObjects) {
          success = unweightedSearchAlgorithm(_this3.nodes, _this3.start, _this3.target, _this3.nodesToAnimate, _this3.boardArray, _this3.currentAlgorithm);
          launchAnimations(_this3, success, "unweighted");
        } else {
          _this3.isObject = true;
          success = unweightedSearchAlgorithm(_this3.nodes, _this3.start, _this3.object, _this3.objectNodesToAnimate, _this3.boardArray, _this3.currentAlgorithm);
          launchAnimations(_this3, success, "unweighted", "object", _this3.currentAlgorithm);
        }

        _this3.algoDone = true;
      }
    }
  };

  this.algoDone = false;
  Object.keys(this.nodes).forEach(function (id) {
    var currentNode = _this3.nodes[id];
    currentNode.previousNode = null;
    currentNode.distance = Infinity;
    currentNode.totalDistance = Infinity;
    currentNode.heuristicDistance = null;
    currentNode.direction = null;
    currentNode.storedDirection = null;
    currentNode.relatesToObject = false;
    currentNode.overwriteObjectRelation = false;
    currentNode.otherpreviousNode = null;
    currentNode.otherdistance = Infinity;
    currentNode.otherdirection = null;
    var currentHTMLNode = document.getElementById(id);
    var relevantStatuses = ["wall", "start", "target", "object"];

    if ((!relevantStatuses.includes(currentNode.status) || currentHTMLNode.className === "visitedobject") && currentNode.weight !== 15) {
      currentNode.status = "unvisited";
      currentHTMLNode.className = "unvisited";
    } else if (currentNode.weight === 15) {
      currentNode.status = "unvisited";
      currentHTMLNode.className = "unvisited weight";
    }
  });
};

Board.prototype.clearWalls = function () {
  var _this4 = this;

  this.clearPath("clickedButton");
  Object.keys(this.nodes).forEach(function (id) {
    var currentNode = _this4.nodes[id];
    var currentHTMLNode = document.getElementById(id);

    if (currentNode.status === "wall" || currentNode.weight === 15) {
      currentNode.status = "unvisited";
      currentNode.weight = 0;
      currentHTMLNode.className = "unvisited";
    }
  });
};

Board.prototype.clearWeights = function () {
  var _this5 = this;

  Object.keys(this.nodes).forEach(function (id) {
    var currentNode = _this5.nodes[id];
    var currentHTMLNode = document.getElementById(id);

    if (currentNode.weight === 15) {
      currentNode.status = "unvisited";
      currentNode.weight = 0;
      currentHTMLNode.className = "unvisited";
    }
  });
};

Board.prototype.clearNodeStatuses = function () {
  var _this6 = this;

  Object.keys(this.nodes).forEach(function (id) {
    var currentNode = _this6.nodes[id];
    currentNode.previousNode = null;
    currentNode.distance = Infinity;
    currentNode.totalDistance = Infinity;
    currentNode.heuristicDistance = null;
    currentNode.storedDirection = currentNode.direction;
    currentNode.direction = null;
    var relevantStatuses = ["wall", "start", "target", "object"];

    if (!relevantStatuses.includes(currentNode.status)) {
      currentNode.status = "unvisited";
    }
  });
};

Board.prototype.instantAlgorithm = function () {
  var weightedAlgorithms = ["dijkstra", "CLA", "greedy"];
  var unweightedAlgorithms = ["dfs", "bfs"];
  var success;

  if (this.currentAlgorithm === "bidirectional") {
    if (!this.numberOfObjects) {
      success = bidirectional(this.nodes, this.start, this.target, this.nodesToAnimate, this.boardArray, this.currentAlgorithm, this.currentHeuristic, this);
      launchInstantAnimations(this, success, "weighted");
    } else {
      this.isObject = true;
    }

    this.algoDone = true;
  } else if (this.currentAlgorithm === "astar") {
    if (!this.numberOfObjects) {
      success = weightedSearchAlgorithm(this.nodes, this.start, this.target, this.nodesToAnimate, this.boardArray, this.currentAlgorithm, this.currentHeuristic);
      launchInstantAnimations(this, success, "weighted");
    } else {
      this.isObject = true;
      success = weightedSearchAlgorithm(this.nodes, this.start, this.object, this.objectNodesToAnimate, this.boardArray, this.currentAlgorithm, this.currentHeuristic);
      launchInstantAnimations(this, success, "weighted", "object", this.currentAlgorithm);
    }

    this.algoDone = true;
  }

  if (weightedAlgorithms.includes(this.currentAlgorithm)) {
    if (!this.numberOfObjects) {
      success = weightedSearchAlgorithm(this.nodes, this.start, this.target, this.nodesToAnimate, this.boardArray, this.currentAlgorithm, this.currentHeuristic);
      launchInstantAnimations(this, success, "weighted");
    } else {
      this.isObject = true;
      success = weightedSearchAlgorithm(this.nodes, this.start, this.object, this.objectNodesToAnimate, this.boardArray, this.currentAlgorithm, this.currentHeuristic);
      launchInstantAnimations(this, success, "weighted", "object", this.currentAlgorithm, this.currentHeuristic);
    }

    this.algoDone = true;
  } else if (unweightedAlgorithms.includes(this.currentAlgorithm)) {
    if (!this.numberOfObjects) {
      success = unweightedSearchAlgorithm(this.nodes, this.start, this.target, this.nodesToAnimate, this.boardArray, this.currentAlgorithm);
      launchInstantAnimations(this, success, "unweighted");
    } else {
      this.isObject = true;
      success = unweightedSearchAlgorithm(this.nodes, this.start, this.object, this.objectNodesToAnimate, this.boardArray, this.currentAlgorithm);
      launchInstantAnimations(this, success, "unweighted", "object", this.currentAlgorithm);
    }

    this.algoDone = true;
  }
};

Board.prototype.redoAlgorithm = function () {
  this.clearPath();
  this.instantAlgorithm();
};

Board.prototype.reset = function (objectNotTransparent) {
  this.nodes[this.start].status = "start";
  document.getElementById(this.start).className = "startTransparent";
  this.nodes[this.target].status = "target";

  if (this.object) {
    this.nodes[this.object].status = "object";

    if (objectNotTransparent) {
      document.getElementById(this.object).className = "visitedObjectNode";
    } else {
      document.getElementById(this.object).className = "objectTransparent";
    }
  }
};

Board.prototype.resetHTMLNodes = function () {
  var start = document.getElementById(this.start);
  var target = document.getElementById(this.target);
  start.className = "start";
  target.className = "target";
};

Board.prototype.changeStartNodeImages = function () {
  var unweighted = ["bfs", "dfs"];
  var strikethrough = ["bfs", "dfs"];
  var guaranteed = ["dijkstra", "astar"];
  var name = "";

  if (this.currentAlgorithm === "bfs") {
    name = "Breath-first Search";
  } else if (this.currentAlgorithm === "dfs") {
    name = "Depth-first Search";
  } else if (this.currentAlgorithm === "dijkstra") {
    name = "Dijkstra's Algorithm";
  } else if (this.currentAlgorithm === "astar") {
    name = "A* Search";
  } else if (this.currentAlgorithm === "greedy") {
    name = "Greedy Best-first Search";
  } else if (this.currentAlgorithm === "CLA" && this.currentHeuristic !== "extraPoweredManhattanDistance") {
    name = "Swarm Algorithm";
  } else if (this.currentAlgorithm === "CLA" && this.currentHeuristic === "extraPoweredManhattanDistance") {
    name = "Convergent Swarm Algorithm";
  } else if (this.currentAlgorithm === "bidirectional") {
    name = "Bidirectional Swarm Algorithm";
  }

  if (unweighted.includes(this.currentAlgorithm)) {
    if (this.currentAlgorithm === "dfs") {
      document.getElementById("algorithmDescriptor").innerHTML = "".concat(name, " is <i><b>unweighted</b></i> and <i><b>does not guarantee</b></i> the shortest path!");
    } else {
      document.getElementById("algorithmDescriptor").innerHTML = "".concat(name, " is <i><b>unweighted</b></i> and <i><b>guarantees</b></i> the shortest path!");
    }

    document.getElementById("weightLegend").className = "strikethrough";

    for (var i = 0; i < 14; i++) {
      var j = i.toString();
      var backgroundImage = document.styleSheets["1"].rules[j].style.backgroundImage;
      document.styleSheets["1"].rules[j].style.backgroundImage = backgroundImage.replace("triangle", "spaceship");
    }
  } else {
    if (this.currentAlgorithm === "greedy" || this.currentAlgorithm === "CLA") {
      document.getElementById("algorithmDescriptor").innerHTML = "".concat(name, " is <i><b>weighted</b></i> and <i><b>does not guarantee</b></i> the shortest path!");
    }

    document.getElementById("weightLegend").className = "";

    for (var _i = 0; _i < 14; _i++) {
      var _j = _i.toString();

      var _backgroundImage = document.styleSheets["1"].rules[_j].style.backgroundImage;
      document.styleSheets["1"].rules[_j].style.backgroundImage = _backgroundImage.replace("spaceship", "triangle");
    }
  }

  if (this.currentAlgorithm === "bidirectional") {
    document.getElementById("algorithmDescriptor").innerHTML = "".concat(name, " is <i><b>weighted</b></i> and <i><b>does not guarantee</b></i> the shortest path!");
    document.getElementById("bombLegend").className = "strikethrough";
    document.getElementById("startButtonAddObject").className = "navbar-inverse navbar-nav disabledA";
  } else {
    document.getElementById("bombLegend").className = "";
    document.getElementById("startButtonAddObject").className = "navbar-inverse navbar-nav";
  }

  if (guaranteed.includes(this.currentAlgorithm)) {
    document.getElementById("algorithmDescriptor").innerHTML = "".concat(name, " is <i><b>weighted</b></i> and <i><b>guarantees</b></i> the shortest path!");
  }
};

var counter = 1;

Board.prototype.toggleTutorialButtons = function () {
  var _this7 = this;

  document.getElementById("skipButton").onclick = function () {
    document.getElementById("tutorial").style.display = "none";

    _this7.toggleButtons();
  };

  if (document.getElementById("nextButton")) {
    document.getElementById("nextButton").onclick = function () {
      if (counter < 9) counter++;
      nextPreviousClick();

      _this7.toggleTutorialButtons();
    };
  }

  document.getElementById("previousButton").onclick = function () {
    if (counter > 1) counter--;
    nextPreviousClick();

    _this7.toggleTutorialButtons();
  };

  var board = this;

  function nextPreviousClick() {
    if (counter === 1) {
      document.getElementById("tutorial").innerHTML = "<h3>Welcome to Pathfinding Visualizer!</h3><h6>This short tutorial will walk you through all of the features of this application.</h6><p>If you want to dive right in, feel free to press the \"Skip Tutorial\" button below. Otherwise, press \"Next\"!</p><div id=\"tutorialCounter\">1/9</div><img id=\"mainTutorialImage\" src=\"public/styling/c_icon.png\"><button id=\"nextButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Next</button><button id=\"previousButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Previous</button><button id=\"skipButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Skip Tutorial</button>";
    } else if (counter === 2) {
      document.getElementById("tutorial").innerHTML = "<h3>What is a pathfinding algorithm?</h3><h6>At its core, a pathfinding algorithm seeks to find the shortest path between two points. This application visualizes various pathfinding algorithms in action, and more!</h6><p>All of the algorithms on this application are adapted for a 2D grid, where 90 degree turns have a \"cost\" of 1 and movements from a node to another have a \"cost\" of 1.</p><div id=\"tutorialCounter\">".concat(counter, "/9</div><img id=\"mainTutorialImage\" src=\"public/styling/path.png\"><button id=\"nextButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Next</button><button id=\"previousButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Previous</button><button id=\"skipButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Skip Tutorial</button>");
    } else if (counter === 3) {
      document.getElementById("tutorial").innerHTML = "<h3>Picking an algorithm</h3><h6>Choose an algorithm from the \"Algorithms\" drop-down menu.</h6><p>Note that some algorithms are <i><b>unweighted</b></i>, while others are <i><b>weighted</b></i>. Unweighted algorithms do not take turns or weight nodes into account, whereas weighted ones do. Additionally, not all algorithms guarantee the shortest path. </p><img id=\"secondTutorialImage\" src=\"public/styling/algorithms.png\"><div id=\"tutorialCounter\">".concat(counter, "/9</div><button id=\"nextButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Next</button><button id=\"previousButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Previous</button><button id=\"skipButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Skip Tutorial</button>");
    } else if (counter === 4) {
      document.getElementById("tutorial").innerHTML = "<h3>Meet the algorithms</h3><h6>Not all algorithms are created equal.</h6><ul><li><b>Dijkstra's Algorithm</b> (weighted): the father of pathfinding algorithms; guarantees the shortest path</li><li><b>A* Search</b> (weighted): arguably the best pathfinding algorithm; uses heuristics to guarantee the shortest path much faster than Dijkstra's Algorithm</li><li><b>Greedy Best-first Search</b> (weighted): a faster, more heuristic-heavy version of A*; does not guarantee the shortest path</li><li><b>Swarm Algorithm</b> (weighted): a mixture of Dijkstra's Algorithm and A*; does not guarantee the shortest-path</li><li><b>Convergent Swarm Algorithm</b> (weighted): the faster, more heuristic-heavy version of Swarm; does not guarantee the shortest path</li><li><b>Bidirectional Swarm Algorithm</b> (weighted): Swarm from both sides; does not guarantee the shortest path</li><li><b>Breath-first Search</b> (unweighted): a great algorithm; guarantees the shortest path</li><li><b>Depth-first Search</b> (unweighted): a very bad algorithm for pathfinding; does not guarantee the shortest path</li></ul><div id=\"tutorialCounter\">".concat(counter, "/9</div><button id=\"nextButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Next</button><button id=\"previousButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Previous</button><button id=\"skipButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Skip Tutorial</button>");
    } else if (counter === 5) {
      document.getElementById("tutorial").innerHTML = "<h3>Adding walls and weights</h3><h6>Click on the grid to add a wall. Click on the grid while pressing W to add a weight. Generate mazes and patterns from the \"Mazes & Patterns\" drop-down menu.</h6><p>Walls are impenetrable, meaning that a path cannot cross through them. Weights, however, are not impassable. They are simply more \"costly\" to move through. In this application, moving through a weight node has a \"cost\" of 15.</p><img id=\"secondTutorialImage\" src=\"public/styling/walls.gif\"><div id=\"tutorialCounter\">".concat(counter, "/9</div><button id=\"nextButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Next</button><button id=\"previousButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Previous</button><button id=\"skipButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Skip Tutorial</button>");
    } else if (counter === 6) {
      document.getElementById("tutorial").innerHTML = "<h3>Adding a bomb</h3><h6>Click the \"Add Bomb\" button.</h6><p>Adding a bomb will change the course of the chosen algorithm. In other words, the algorithm will first look for the bomb (in an effort to diffuse it) and will then look for the target node. Note that the Bidirectional Swarm Algorithm does not support adding a bomb.</p><img id=\"secondTutorialImage\" src=\"public/styling/bomb.png\"><div id=\"tutorialCounter\">".concat(counter, "/9</div><button id=\"nextButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Next</button><button id=\"previousButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Previous</button><button id=\"skipButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Skip Tutorial</button>");
    } else if (counter === 7) {
      document.getElementById("tutorial").innerHTML = "<h3>Dragging nodes</h3><h6>Click and drag the start, bomb, and target nodes to move them.</h6><p>Note that you can drag nodes even after an algorithm has finished running. This will allow you to instantly see different paths.</p><img src=\"public/styling/dragging.gif\"><div id=\"tutorialCounter\">".concat(counter, "/9</div><button id=\"nextButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Next</button><button id=\"previousButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Previous</button><button id=\"skipButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Skip Tutorial</button>");
    } else if (counter === 8) {
      document.getElementById("tutorial").innerHTML = "<h3>Visualizing and more</h3><h6>Use the navbar buttons to visualize algorithms and to do other stuff!</h6><p>You can clear the current path, clear walls and weights, clear the entire board, and adjust the visualization speed, all from the navbar. If you want to access this tutorial again, click on \"Pathfinding Visualizer\" in the top left corner of your screen.</p><img id=\"secondTutorialImage\" src=\"public/styling/navbar.png\"><div id=\"tutorialCounter\">".concat(counter, "/9</div><button id=\"nextButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Next</button><button id=\"previousButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Previous</button><button id=\"skipButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Skip Tutorial</button>");
    } else if (counter === 9) {
      document.getElementById("tutorial").innerHTML = "<h3>Enjoy!</h3><h6>I hope you have just as much fun playing around with this visualization tool as I had building it!</h6><p>If you want to see the source code for this application, check out my <a href=\"https://github.com/clementmihailescu/Pathfinding-Visualizer\">github</a>.</p><div id=\"tutorialCounter\">".concat(counter, "/9</div><button id=\"finishButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Finish</button><button id=\"previousButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Previous</button><button id=\"skipButton\" class=\"btn btn-default navbar-btn\" type=\"button\">Skip Tutorial</button>");

      document.getElementById("finishButton").onclick = function () {
        document.getElementById("tutorial").style.display = "none";
        board.toggleButtons();
      };
    }
  }
};

Board.prototype.toggleButtons = function () {
  var _this8 = this;

  document.getElementById("refreshButton").onclick = function () {
    window.location.reload(true);
  };

  if (!this.buttonsOn) {
    this.buttonsOn = true;

    document.getElementById("startButtonStart").onclick = function () {
      if (!_this8.currentAlgorithm) {
        document.getElementById("startButtonStart").innerHTML = '<button class="btn btn-default navbar-btn" type="button">Pick an Algorithm!</button>';
      } else {
        _this8.clearPath("clickedButton");

        _this8.toggleButtons();

        var weightedAlgorithms = ["dijkstra", "CLA", "CLA", "greedy"];
        var unweightedAlgorithms = ["dfs", "bfs"];
        var success;

        if (_this8.currentAlgorithm === "bidirectional") {
          if (!_this8.numberOfObjects) {
            success = bidirectional(_this8.nodes, _this8.start, _this8.target, _this8.nodesToAnimate, _this8.boardArray, _this8.currentAlgorithm, _this8.currentHeuristic, _this8);
            launchAnimations(_this8, success, "weighted");
          } else {
            _this8.isObject = true;
            success = bidirectional(_this8.nodes, _this8.start, _this8.object, _this8.nodesToAnimate, _this8.boardArray, _this8.currentAlgorithm, _this8.currentHeuristic, _this8);
            launchAnimations(_this8, success, "weighted");
          }

          _this8.algoDone = true;
        } else if (_this8.currentAlgorithm === "astar") {
          if (!_this8.numberOfObjects) {
            success = weightedSearchAlgorithm(_this8.nodes, _this8.start, _this8.target, _this8.nodesToAnimate, _this8.boardArray, _this8.currentAlgorithm, _this8.currentHeuristic);
            launchAnimations(_this8, success, "weighted");
          } else {
            _this8.isObject = true;
            success = weightedSearchAlgorithm(_this8.nodes, _this8.start, _this8.object, _this8.objectNodesToAnimate, _this8.boardArray, _this8.currentAlgorithm, _this8.currentHeuristic);
            launchAnimations(_this8, success, "weighted", "object", _this8.currentAlgorithm);
          }

          _this8.algoDone = true;
        } else if (weightedAlgorithms.includes(_this8.currentAlgorithm)) {
          if (!_this8.numberOfObjects) {
            success = weightedSearchAlgorithm(_this8.nodes, _this8.start, _this8.target, _this8.nodesToAnimate, _this8.boardArray, _this8.currentAlgorithm, _this8.currentHeuristic);
            launchAnimations(_this8, success, "weighted");
          } else {
            _this8.isObject = true;
            success = weightedSearchAlgorithm(_this8.nodes, _this8.start, _this8.object, _this8.objectNodesToAnimate, _this8.boardArray, _this8.currentAlgorithm, _this8.currentHeuristic);
            launchAnimations(_this8, success, "weighted", "object", _this8.currentAlgorithm, _this8.currentHeuristic);
          }

          _this8.algoDone = true;
        } else if (unweightedAlgorithms.includes(_this8.currentAlgorithm)) {
          if (!_this8.numberOfObjects) {
            success = unweightedSearchAlgorithm(_this8.nodes, _this8.start, _this8.target, _this8.nodesToAnimate, _this8.boardArray, _this8.currentAlgorithm);
            launchAnimations(_this8, success, "unweighted");
          } else {
            _this8.isObject = true;
            success = unweightedSearchAlgorithm(_this8.nodes, _this8.start, _this8.object, _this8.objectNodesToAnimate, _this8.boardArray, _this8.currentAlgorithm);
            launchAnimations(_this8, success, "unweighted", "object", _this8.currentAlgorithm);
          }

          _this8.algoDone = true;
        }
      }
    };

    document.getElementById("adjustFast").onclick = function () {
      _this8.speed = "fast";
      document.getElementById("adjustSpeed").innerHTML = 'Speed: Fast<span class="caret"></span>';
    };

    document.getElementById("adjustAverage").onclick = function () {
      _this8.speed = "average";
      document.getElementById("adjustSpeed").innerHTML = 'Speed: Average<span class="caret"></span>';
    };

    document.getElementById("adjustSlow").onclick = function () {
      _this8.speed = "slow";
      document.getElementById("adjustSpeed").innerHTML = 'Speed: Slow<span class="caret"></span>';
    };

    document.getElementById("startStairDemonstration").onclick = function () {
      _this8.clearWalls();

      _this8.clearPath("clickedButton");

      _this8.toggleButtons();

      stairDemonstration(_this8);
      mazeGenerationAnimations(_this8);
    };

    document.getElementById("startButtonBidirectional").onclick = function () {
      document.getElementById("startButtonStart").innerHTML = '<button id="actualStartButton" class="btn btn-default navbar-btn" type="button">Visualize Bidirectional Swarm!</button>';
      _this8.currentAlgorithm = "bidirectional";
      _this8.currentHeuristic = "manhattanDistance";

      if (_this8.numberOfObjects) {
        var objectNodeId = _this8.object;
        document.getElementById("startButtonAddObject").innerHTML = '<a href="#">Add a Bomb</a></li>';
        document.getElementById(objectNodeId).className = "unvisited";
        _this8.object = null;
        _this8.numberOfObjects = 0;
        _this8.nodes[objectNodeId].status = "unvisited";
        _this8.isObject = false;
      }

      _this8.clearPath("clickedButton");

      _this8.changeStartNodeImages();
    };

    document.getElementById("startButtonDijkstra").onclick = function () {
      document.getElementById("startButtonStart").innerHTML = '<button id="actualStartButton" class="btn btn-default navbar-btn" type="button">Visualize Dijkstra\'s!</button>';
      _this8.currentAlgorithm = "dijkstra";

      _this8.changeStartNodeImages();
    };

    document.getElementById("startButtonAStar").onclick = function () {
      document.getElementById("startButtonStart").innerHTML = '<button id="actualStartButton" class="btn btn-default navbar-btn" type="button">Visualize Swarm!</button>';
      _this8.currentAlgorithm = "CLA";
      _this8.currentHeuristic = "manhattanDistance";

      _this8.changeStartNodeImages();
    };

    document.getElementById("startButtonAStar2").onclick = function () {
      document.getElementById("startButtonStart").innerHTML = '<button id="actualStartButton" class="btn btn-default navbar-btn" type="button">Visualize A*!</button>';
      _this8.currentAlgorithm = "astar";
      _this8.currentHeuristic = "poweredManhattanDistance";

      _this8.changeStartNodeImages();
    };

    document.getElementById("startButtonAStar3").onclick = function () {
      document.getElementById("startButtonStart").innerHTML = '<button id="actualStartButton" class="btn btn-default navbar-btn" type="button">Visualize Convergent Swarm!</button>';
      _this8.currentAlgorithm = "CLA";
      _this8.currentHeuristic = "extraPoweredManhattanDistance";

      _this8.changeStartNodeImages();
    };

    document.getElementById("startButtonGreedy").onclick = function () {
      document.getElementById("startButtonStart").innerHTML = '<button id="actualStartButton" class="btn btn-default navbar-btn" type="button">Visualize Greedy!</button>';
      _this8.currentAlgorithm = "greedy";

      _this8.changeStartNodeImages();
    };

    document.getElementById("startButtonBFS").onclick = function () {
      document.getElementById("startButtonStart").innerHTML = '<button id="actualStartButton" class="btn btn-default navbar-btn" type="button">Visualize BFS!</button>';
      _this8.currentAlgorithm = "bfs";

      _this8.clearWeights();

      _this8.changeStartNodeImages();
    };

    document.getElementById("startButtonDFS").onclick = function () {
      document.getElementById("startButtonStart").innerHTML = '<button id="actualStartButton" class="btn btn-default navbar-btn" type="button">Visualize DFS!</button>';
      _this8.currentAlgorithm = "dfs";

      _this8.clearWeights();

      _this8.changeStartNodeImages();
    };

    document.getElementById("startButtonCreateMazeOne").onclick = function () {
      _this8.clearWalls();

      _this8.clearPath("clickedButton");

      _this8.createMazeOne("wall");
    };

    document.getElementById("startButtonCreateMazeTwo").onclick = function () {
      _this8.clearWalls();

      _this8.clearPath("clickedButton");

      _this8.toggleButtons();

      recursiveDivisionMaze(_this8, 2, _this8.height - 3, 2, _this8.width - 3, "horizontal", false, "wall");
      mazeGenerationAnimations(_this8);
    };

    document.getElementById("startButtonCreateMazeWeights").onclick = function () {
      _this8.clearWalls();

      _this8.clearPath("clickedButton");

      _this8.createMazeOne("weight");
    };

    document.getElementById("startButtonClearBoard").onclick = function () {
      document.getElementById("startButtonAddObject").innerHTML = '<a href="#">Add Bomb</a></li>';
      var navbarHeight = document.getElementById("navbarDiv").clientHeight;
      var textHeight = document.getElementById("mainText").clientHeight + document.getElementById("algorithmDescriptor").clientHeight;
      var height = Math.floor((document.documentElement.clientHeight - navbarHeight - textHeight) / 28);
      var width = Math.floor(document.documentElement.clientWidth / 25);
      var start = Math.floor(height / 2).toString() + "-" + Math.floor(width / 4).toString();
      var target = Math.floor(height / 2).toString() + "-" + Math.floor(3 * width / 4).toString();
      Object.keys(_this8.nodes).forEach(function (id) {
        var currentNode = _this8.nodes[id];
        var currentHTMLNode = document.getElementById(id);

        if (id === start) {
          currentHTMLNode.className = "start";
          currentNode.status = "start";
        } else if (id === target) {
          currentHTMLNode.className = "target";
          currentNode.status = "target";
        } else {
          currentHTMLNode.className = "unvisited";
          currentNode.status = "unvisited";
        }

        currentNode.previousNode = null;
        currentNode.path = null;
        currentNode.direction = null;
        currentNode.storedDirection = null;
        currentNode.distance = Infinity;
        currentNode.totalDistance = Infinity;
        currentNode.heuristicDistance = null;
        currentNode.weight = 0;
        currentNode.relatesToObject = false;
        currentNode.overwriteObjectRelation = false;
      });
      _this8.start = start;
      _this8.target = target;
      _this8.object = null;
      _this8.nodesToAnimate = [];
      _this8.objectNodesToAnimate = [];
      _this8.shortestPathNodesToAnimate = [];
      _this8.objectShortestPathNodesToAnimate = [];
      _this8.wallsToAnimate = [];
      _this8.mouseDown = false;
      _this8.pressedNodeStatus = "normal";
      _this8.previouslyPressedNodeStatus = null;
      _this8.previouslySwitchedNode = null;
      _this8.previouslySwitchedNodeWeight = 0;
      _this8.keyDown = false;
      _this8.algoDone = false;
      _this8.numberOfObjects = 0;
      _this8.isObject = false;
    };

    document.getElementById("startButtonClearWalls").onclick = function () {
      _this8.clearWalls();
    };

    document.getElementById("startButtonClearPath").onclick = function () {
      _this8.clearPath("clickedButton");
    };

    document.getElementById("startButtonCreateMazeThree").onclick = function () {
      _this8.clearWalls();

      _this8.clearPath("clickedButton");

      _this8.toggleButtons();

      otherMaze(_this8, 2, _this8.height - 3, 2, _this8.width - 3, "vertical", false);
      mazeGenerationAnimations(_this8);
    };

    document.getElementById("startButtonCreateMazeFour").onclick = function () {
      _this8.clearWalls();

      _this8.clearPath("clickedButton");

      _this8.toggleButtons();

      otherOtherMaze(_this8, 2, _this8.height - 3, 2, _this8.width - 3, "horizontal", false);
      mazeGenerationAnimations(_this8);
    };

    document.getElementById("startButtonAddObject").onclick = function () {
      var innerHTML = document.getElementById("startButtonAddObject").innerHTML;

      if (_this8.currentAlgorithm !== "bidirectional") {
        if (innerHTML.includes("Add")) {
          var r = Math.floor(_this8.height / 2);
          var c = Math.floor(2 * _this8.width / 4);
          var objectNodeId = "".concat(r, "-").concat(c);

          if (_this8.target === objectNodeId || _this8.start === objectNodeId || _this8.numberOfObjects === 1) {
            console.log("Failure to place object.");
          } else {
            document.getElementById("startButtonAddObject").innerHTML = '<a href="#">Remove Bomb</a></li>';

            _this8.clearPath("clickedButton");

            _this8.object = objectNodeId;
            _this8.numberOfObjects = 1;
            _this8.nodes[objectNodeId].status = "object";
            document.getElementById(objectNodeId).className = "object";
          }
        } else {
          var _objectNodeId = _this8.object;
          document.getElementById("startButtonAddObject").innerHTML = '<a href="#">Add Bomb</a></li>';
          document.getElementById(_objectNodeId).className = "unvisited";
          _this8.object = null;
          _this8.numberOfObjects = 0;
          _this8.nodes[_objectNodeId].status = "unvisited";
          _this8.isObject = false;

          _this8.clearPath("clickedButton");
        }
      }
    };

    document.getElementById("startButtonClearPath").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonClearWalls").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonClearBoard").className = "navbar-inverse navbar-nav";

    if (this.currentAlgorithm !== "bidirectional") {
      document.getElementById("startButtonAddObject").className = "navbar-inverse navbar-nav";
    }

    document.getElementById("startButtonCreateMazeOne").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonCreateMazeTwo").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonCreateMazeThree").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonCreateMazeFour").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonCreateMazeWeights").className = "navbar-inverse navbar-nav";
    document.getElementById("startStairDemonstration").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonDFS").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonBFS").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonDijkstra").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonAStar").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonAStar2").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonAStar3").className = "navbar-inverse navbar-nav";
    document.getElementById("adjustFast").className = "navbar-inverse navbar-nav";
    document.getElementById("adjustAverage").className = "navbar-inverse navbar-nav";
    document.getElementById("adjustSlow").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonBidirectional").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonGreedy").className = "navbar-inverse navbar-nav";
    document.getElementById("actualStartButton").style.backgroundColor = "";
  } else {
    this.buttonsOn = false;
    document.getElementById("startButtonDFS").onclick = null;
    document.getElementById("startButtonBFS").onclick = null;
    document.getElementById("startButtonDijkstra").onclick = null;
    document.getElementById("startButtonAStar").onclick = null;
    document.getElementById("startButtonGreedy").onclick = null;
    document.getElementById("startButtonAddObject").onclick = null;
    document.getElementById("startButtonAStar2").onclick = null;
    document.getElementById("startButtonAStar3").onclick = null;
    document.getElementById("startButtonBidirectional").onclick = null;
    document.getElementById("startButtonCreateMazeOne").onclick = null;
    document.getElementById("startButtonCreateMazeTwo").onclick = null;
    document.getElementById("startButtonCreateMazeThree").onclick = null;
    document.getElementById("startButtonCreateMazeFour").onclick = null;
    document.getElementById("startButtonCreateMazeWeights").onclick = null;
    document.getElementById("startStairDemonstration").onclick = null;
    document.getElementById("startButtonClearPath").onclick = null;
    document.getElementById("startButtonClearWalls").onclick = null;
    document.getElementById("startButtonClearBoard").onclick = null;
    document.getElementById("startButtonStart").onclick = null;
    document.getElementById("adjustFast").onclick = null;
    document.getElementById("adjustAverage").onclick = null;
    document.getElementById("adjustSlow").onclick = null;
    document.getElementById("adjustFast").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("adjustAverage").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("adjustSlow").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonClearPath").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonClearWalls").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonClearBoard").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonAddObject").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonCreateMazeOne").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonCreateMazeTwo").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonCreateMazeThree").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonCreateMazeFour").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonCreateMazeWeights").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startStairDemonstration").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonDFS").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonBFS").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonDijkstra").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonAStar").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonGreedy").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonAStar2").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonAStar3").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonBidirectional").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("actualStartButton").style.backgroundColor = "rgb(185, 15, 15)";
  }
};

var navbarHeight = $("#navbarDiv").height();
var textHeight = $("#mainText").height() + $("#algorithmDescriptor").height();
var height = Math.floor(($(document).height() - navbarHeight - textHeight) / 28);
var width = Math.floor($(document).width() / 25);
var newBoard = new Board(height, width);
newBoard.initialise();

window.onkeydown = function (e) {
  newBoard.keyDown = e.keyCode;
};

window.onkeyup = function (e) {
  newBoard.keyDown = false;
};