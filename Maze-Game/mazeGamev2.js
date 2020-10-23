let maze = document.querySelector(".maze");
let ctx = maze.getContext("2d");

class Maze{
    constructor(size, rows, columns) {
        this.size = size;
        this.rows = rows;
        this.columns = columns;
        this.grid = [];
        this.stack = [];
    }
}

class Cell {
    constructor(rowNum, colNum, parentGrid) 
}