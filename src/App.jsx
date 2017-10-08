import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './App.css';
import { Cell, Maze } from './Maze';


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
console.log(new Maze(1, 3));
class MazeExample extends Component {
  constructor() {
    super();
    this.drawGrid = this.drawGrid.bind(this);
    this.drawMaze = this.drawMaze.bind(this);
    this.handleDraw = this.handleDraw.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }

  drawGrid(context) {
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
        const maze = new Maze(this.props.width, this.props.height);
        maze.visit();
        return maze;
    }
    return [];
  }

  clear(context, canvas) {
    context.clearRect(
      0, 
      0, 
      canvas.width,
      canvas.height
    );
  }

  drawMaze (ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const maze = this.getMaze(this.props.type);
    if (maze) {
      console.log(maze);
      const { gridSize } = this.props;
      maze.draw((x, y, x2, y2) => {
        ctx.beginPath();
        ctx.moveTo(x * gridSize, y * gridSize);  
        ctx.lineTo(x2 * gridSize, y2 * gridSize);
        ctx.stroke(); 
      }); 
    } else {
      this.drawGrid(ctx);
    }
  }

  handleReset() {
    console.log('reset')
    this.clear(this.comp.ctx, this.comp.canvas)
  }

  handleDraw() {
    this.setState({ seed: Math.random() });
  }

  render() {
    const { gridSize, height, width } = this.props;
    return (
      <div className={styles.maze}>
        {this.props.title && <h3>{this.props.title}</h3>}
        <Canvas 
          ref={(comp) => { this.comp = comp;}}
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
        <MazeExample width={10} height={10} title="Recursive Backtracking" /> 
      </div> 
    </div>
  );
}

export default App;