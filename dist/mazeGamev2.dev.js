"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var maze = document.querySelector(".maze");
var ctx = maze.getContext("2d");

var Maze = function Maze(size, rows, columns) {
  _classCallCheck(this, Maze);

  this.size = size;
  this.rows = rows;
  this.columns = columns;
  this.grid = [];
  this.stack = [];
};

var Cell = function Cell() {
  _classCallCheck(this, Cell);
};