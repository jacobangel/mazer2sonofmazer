import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './App.css';

// draw a grid on a canvas. 
// can simply generate a maze from that. 
// let's start at 10 x 10

class Canvas extends Component {
  componentDidMount() {
    this.props.onDraw(this.ctx, this.canvas);
  }

  componentDidUpdate() {
    this.props.onDraw(this.ctx, this.canvas)
  }

  render() {
    const { width, height } = this.props;
    return (
      <div>
        <canvas ref={(canvas) => { 
          this.canvas = canvas; 
          this.ctx = null;
          if (canvas && canvas.getContext) {
            this.ctx = canvas.getContext('2d');
          }
        }} width={width} height={height} />
      </div>
    );
  }
}

Canvas.propTypes = {
  onDraw: PropTypes.func,
  width: PropTypes.number,
  heigth: PropTypes.number,
  gridSize: PropTypes.number,
}

Canvas.defaultProps = {
  width: 10,
  height: 10,
  onDraw: (context, canvas) => { console.log(context, canvas); }
}


class Cell {
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
    const perms = this.cellNeighbors;
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

class Maze {
  constructor(x, y) {
    const grid = new Array(x);
    for (let i = 0; i < x; i++)  {
      grid[i] = new Array(y);
      for (let j = 0; j < y; j++)  {
        grid[i][j] = new Cell(i, j);
      }
    }
    this.grid = grid;
    this.width = x;
    this.height = y;
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
    return this.grid[
      Math.floor(Math.random() * this.width)
    ][
      Math.floor(Math.random() * this.height)
    ];
  }

  visit() {
    this.stack = [];
    this.visitCells(this.randomCell());
 }

  visitCells(currentCell) {
    console.log('[currentCell', currentCell);
    currentCell.markAsVisited();
    let unvisited = null;
    while(unvisited = currentCell.getUnvisitedNeighbor(this)) {
      this.stack.push(currentCell);
      currentCell.link(unvisited);
      this.visitCells(unvisited);
    }
    if (this.stack.length !== 0) {
      const newCurrent = this.stack.pop();
      this.visitCells(newCurrent);
    }
 
  }

  draw(context, gridSize) {
    const drawLine = (x, y, x2, y2) => {
      context.moveTo(x * gridSize, y * gridSize);  
      context.lineTo(x2 * gridSize, y2 * gridSize);
      context.stroke(); 
    }
    this.grid.forEach((row) => {
      row.forEach(cell => {
        const [ x, y ] = cell.coord;
        if (cell.N) {
          drawLine(x, y, x + 1, y);
        }
        if (cell.E) {
          drawLine(x + 1, y, x + 1, y + 1);
        }
        if (cell.S) {
          drawLine(x, y + 1, x + 1, y + 1);
        }
        if (cell.W) {
          drawLine(x, y, x, y + 1);
        }

      });
    });
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
function getRBT(x, y) {
  const maze = new Maze(x, y);
  maze.visit();
  return maze;
}


class MazeExample extends Component {
  constructor() {
    super();
    this.drawGrid = this.drawGrid.bind(this);
    this.drawMaze = this.drawMaze.bind(this);
  }

  componentDidMount() {

  }

  drawGrid(context) {
    console.log('drawing grid');
    const { height, width, gridSize } = this.props;
    // draw longitiude
    for (let i = 0; i <= height; ++i) {
      const x = i * gridSize;
      context.moveTo(0, x);  
      context.lineTo(width * gridSize, x);
      context.stroke();
    }

    // draw latitude
    for (let i = 0; i <= width; ++i) {
      const y = i * gridSize;
      context.moveTo(y, 0);  
      context.lineTo(y, height * gridSize);
      context.stroke();
    }
  }

  /**
   * Return an array of coordiantes given a type of maze. 
   * @param {string} type the type of maze togenerate.
   */
  getMaze(type) {
    switch (type) {
      case 'RBT': 
        return getRBT(this.props.width, this.props.height);
    }
    return [];
  }

  clear(context) {
    context.clearRect(
      0, 
      0, 
      this.props.width * this.props.gridSize, 
      this.props.width * this.props.gridSize
    );
  }

  drawMaze (context, canvas) {
    console.log('draw');
    this.clear(context);
    const maze = this.getMaze(this.props.type);
    if (maze) {
      maze.draw(context, this.props.gridSize); 
    } else {
      this.drawGrid(context);
    }
    console.log(maze);
  }

  handleReset() {
    console.log('reset')
  }

  handleDraw() {
    console.log('draw')
  }

  render() {
    const { gridSize, height, width } = this.props;
    return (
      <div className={styles.maze}>
        <Canvas 
          height={gridSize * height} 
          width={gridSize * width} 
          onDraw={this.drawMaze}
        />
        <ul>
          <li><button onClick={this.handleReset}>Reset Grid</button></li>
          <li><button onClick={this.handleDraw}>Draw</button></li>
        </ul>
      </div>
    );
  }
}

MazeExample.defaultProps = {
  height: 10,
  width: 10,
  gridSize: 40,
  type: 'RBT'
}

const App = () => {
  return (
    <div>
      <div className={styles.mazeWrapper}>
        <MazeExample width={10} height={10} /> 
      </div> 
    </div>
  );
}

export default App;