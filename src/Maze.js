
// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array 
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export class Cell {
  constructor(x, y) {
    this.cellNeighbors = [
                [0, -1],
      [-1,  0], /* x, y */ [1,  0],
                [0,  1],
    ]
    this.coord = [ x, y ];
    this.walls = {
      'N': true,
      'S': true,
      'E': true,
      'W': true,
    };
    this.visited = false;
  }

  setStart() {
    console.log(this);
    this.isStart = true;
    const [ x, y ] = this.coord;
    if (x === 0) {
      this.walls.W = 'START';
    } else if (y === 0) {
      this.walls.N = 'START';
    } else if (x > y) {
      this.walls.E = 'START';
    } else {
      this.walls.S = 'START';
    }
  }

  link(cell) {
    const [ x, y ] = this.coord;
    const [ x2, y2 ] = cell.coord;
    if (x === x2) { 
      if (y - 1 === y2) {
        this.walls.N = false;
        cell.walls.S = false;
        return;
      } 
      if (y + 1 === y2) {
        this.walls.S = false;
        cell.walls.N = false;
        return;
      }
    }
    if (y === y2) {
      if (x - 1 === x2) {
        this.walls.W = false;
        cell.walls.E = false;
        return;
      } 
      if (x + 1 === x2) {
        this.walls.E = false;
        cell.walls.W = false;
        return;
      }
    }
    console.warn('Cannot link these cells.', this, cell);
  }

  markAsVisited() {
    this.visited = true;
  }

  getUnvisitedNeighbor(maze) {
    const perms = shuffleArray([ ...this.cellNeighbors ]);
    
    for (let i = 0; i < perms.length; i++) {
      let [offsetX, offsetY] = perms[i];
      let [ x, y ] = this.coord;
      let cell = maze.getCell(x + offsetX, y + offsetY);
      if (cell && !cell.visited) {
        return cell;
      }
    }
    return false;
  }
}

/**
 * 
 * Recursive Backtracking
 * - Make the initial cell the current cell and mark it as visited 
 * - While there are unvisited cells
 *   - If the current cell has any neighbours which have not been visited
 *     Choose randomly one of the unvisited neighbours
 *     - Push the current cell to the stack
 *     - Remove the wall between the current cell and the chosen cell
 *      - Make the chosen cell the current cell and mark it as visited
 *   - Else if stack is not empty
 *     - Pop a cell from the stack
 *     - Make it the current cell
 */
export class Maze {
  constructor(x, y) {
    this.width = x;
    this.height = y;
    this.stack = [];
    this.grid = [];
    for (let i = 0; i < x; i++)  {
      this.grid[i] = [];
      for (let j = 0; j < y; j++)  {
        this.grid[i][j] = new Cell(i, j);
      }
    }
    this.build();
  }

  getCell(x, y) {
    if (x < 0 || x >= this.grid.length) {
      return null;
    }

    if (y < 0 || y >= this.grid[0].length) {
      return null;
    }

    return this.grid[x][y];
  }

  randomCell() {
    const x = Math.floor(Math.random() * this.width);
    const y = Math.floor(Math.random() * this.height);
    return this.grid[x][y];
  }

  isEdge(cell) {
    return (
      cell.coord[0] === 0 || 
      cell.coord[0] === this.width -1 || 
      cell.coord[1] === 0 || 
      cell.coord[1] === this.height - 1
    );
  }

  randomEdgeCell() {
    let random = this.randomCell();
    while( !this.isEdge(random) ) {
      random = this.randomCell();
    }
    return random;
  }

  build() {
    let random = this.randomEdgeCell();
    random.setStart();
    random = this.randomEdgeCell();
    random.setStart();
    this.visitCells(random);
 }

  visitCells(currentCell) {
    currentCell.markAsVisited();
    let unvisited = null;
    while (unvisited = currentCell.getUnvisitedNeighbor(this)) {
      this.stack.push(currentCell);
      currentCell.link(unvisited);
      this.visitCells(unvisited);
    }

    if (this.stack.length !== 0) {
      const newCurrent = this.stack.pop();
      this.visitCells(newCurrent);
    }
  }

  /**
   * Draws the maze on whatever you send it. 
   * @param {function} drawLine Draws a line given some coordinates.
   */
  draw(drawLine) {
    this.grid.forEach((row) => {
      row.forEach(cell => {
        const { walls } = cell;
        const [ x, y ] = cell.coord;
        if (walls.N) {
          drawLine(x, y, x + 1, y, walls.N);
        }
        if (walls.E) {
          drawLine(x + 1, y, x + 1, y + 1, walls.E);
        }
        if (walls.S) {
          drawLine(x, y + 1, x + 1, y + 1, walls.S);
        }
        if (walls.W) {
          drawLine(x, y, x, y + 1, walls.W);
        }
      });
    });
  }
}

export default {
  Maze, Cell
}