
// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array 
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

  /**
   * Manhattan distance 
   * function heuristic(node) =
    dx = abs(node.x - goal.x)
    dy = abs(node.y - goal.y)
    return D * (dx + dy)} cb 
   */
function manhattanDist(node, goal) {
  const dx = Math.abs(node.coord.x - goal.coord.x);
  const dy = Math.abs(node.coord.y - goal.coord.y);
  const D = 1; // cost to move.
  return D * (dx + dy); 
}
/**
 * I kkonw this is a very lazy construction.
 */
class PriorityQueue {
  constructor() {
    this._interior = []
  }

  put(item, priority) {
    this._interior.push({ item, priority });
    this._interior.sort((a, b) => {
      return b.priority - a.priority;
    })
  }

  isEmpty() {
    return this._interior.length === 0;
  }

  get() {
    const head = this._interior.shift();
    return head.item;
  }

  peek() {
    return this._interior[0];
  }
}

export const BORDER = {
  ENTRANCE: 'ENTRANCE',
  WALL: 'WALL',
  NONE: 'NONE',
};

export class Cell {
  constructor(x, y) {
    // it would have been better probably to just link them all together. i know.
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
    this.traversed = false;
  }
  setAsPath() {
    this.bestPath = true;
  }
  markAsTraversed(cost) {
    this.traversed = true;
    this.cost = cost;
  }

  getKey() {
    return this.coord.join(',');
  }

  getCheapestNeighbor(goal) {
    let cheapest = null;
    let cost = Infinity;
    Object.values(this.walls).forEach(cell => {
      if (!(cell instanceof Cell) || cell.visited) { return; } 
      if (cheapest && cell.cost === cost && 
        manhattanDist(cell, goal) < manhattanDist(cheapest, goal)
      ) {
        cell.markAsVisited();
        cheapest = cell;
        cost = cell.cost; 
      } else if(cell.cost < cost) {
        cell.markAsVisited();
        cheapest = cell;
        cost = cell.cost;
      }
    })
    return cheapest;
  }
  markAsUnvisited() {
    this.visited = false;
  }
  setEntrance() {
    this.isEntrance = true;
    const [ x, y ] = this.coord;
    if (x === 0) {
      this.walls.W = BORDER.ENTRANCE;
    } else if (y === 0) {
      this.walls.N = BORDER.ENTRANCE;
    } else if (x > y) {
      this.walls.E = BORDER.ENTRANCE;
    } else {
      this.walls.S = BORDER.ENTRANCE;
    }
  }

  link(cell) {
    const [ x, y ] = this.coord;
    const [ x2, y2 ] = cell.coord;
    if (x === x2) { 
      if (y - 1 === y2) {
        this.walls.N = cell;
        cell.walls.S = this;
        return;
      } 
      if (y + 1 === y2) {
        this.walls.S = cell;
        cell.walls.N = this;
        return;
      }
    }
    if (y === y2) {
      if (x - 1 === x2) {
        this.walls.W = cell;
        cell.walls.E = this;
        return;
      } 
      if (x + 1 === x2) {
        this.walls.E = cell;
        cell.walls.W = this;
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
    this.start = null;
    this.end = null;
    for (let i = 0; i < x; i++)  {
      this.grid[i] = [];
      for (let j = 0; j < y; j++)  {
        this.grid[i][j] = new Cell(i, j);
      }
    }
    this.build();
  }

  getCell(x, y) {
    if (
      x < 0 || x >= this.grid.length || 
      y < 0 || y >= this.grid[0].length
    ) {
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
    this.start = this.randomEdgeCell();
    this.start.setEntrance();
    this.end = this.randomEdgeCell();
    this.end.setEntrance();
    this.visitCells(this.start);
    this.resetVisited();
  }

  resetVisited() {
    this.grid.forEach(row => {
      row.forEach(cell => {
        cell.markAsUnvisited();
      });
    });
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
  draw(fillBorder, drawLine) {
    this.grid.forEach((row) => {
      row.forEach(cell => {
        const { walls } = cell;
        const [ x, y ] = cell.coord;
        // rewrite this to leverage cell neighbors yo.
        let fillType = 'EMPTY';
        if (cell.traversed) {
          fillType = 'SCANNED';
        }
        if (cell.bestPath) {
          fillType = 'PATH';
        }
        fillBorder(x, y, fillType, cell.cost);
        drawLine(x, y, x + 1, y, walls.N);
        drawLine(x + 1, y, x + 1, y + 1, walls.E);
        drawLine(x, y + 1, x + 1, y + 1, walls.S);
        drawLine(x, y, x, y + 1, walls.W);
      });
    });
  }

  // cost is always one cuz we r basic af.
  getCost() {
    return 1;
  }

  // boy i really should have used a graph lol.
  getNeighbors(node) {
    const neighbors = [];
    Object.values(node.walls).forEach((side) => {
      console.log(side);
      if (side instanceof Cell) {
        neighbors.push(side);
      }
    })
    return neighbors; 
  }
  walkCheapest(node, goal) {
    if (!node) {
      return;
    }

    node.setAsPath();
    node.markAsVisited();
    this.walkCheapest(node.getCheapestNeighbor(goal), goal)
  }
  aStar() {
    this._aStar(this.start, this.end);
    this.walkCheapest(this.end, this.start);
    this.resetVisited();
  }
  _aStar(node = this.start, goal = this.end) {
    const frontier = new PriorityQueue(); 
    const from = {};
    const cost = {};

    frontier.put(node, 0);
    from[node.getKey()] = node;
    cost[node.getKey()] = 0;

    while(!frontier.isEmpty()) {
      let current = frontier.get();
      if (current.getKey() === goal.getKey()) {
        Object.keys(from).forEach((f, i) => { 
          const cell = from[f]
          if (!cell) { return }
          cell.markAsTraversed(cost[f]);
        });
        goal.markAsTraversed();
        return { from, cost };
      }

      const neighbors = this.getNeighbors(current);
      for (let next of neighbors) {
        const newCost = cost[current.getKey()] + this.getCost(current, next);
        if (cost[next.getKey()] === undefined || newCost < cost[next.getKey()]) {
          cost[next.getKey()] = newCost;
          let priority = newCost + manhattanDist(next, goal);
          frontier.put(next, priority);
          from[next.getKey()] = current;
        }
      }
    }
  }
}

export default {
  Maze, Cell
}