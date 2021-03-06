import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './App.css';
import { Cell, Maze, BORDER } from './Maze';


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

class MazeExample extends Component {
  constructor(props) {
    super();
    this.drawGrid = this.drawGrid.bind(this);
    this.drawMaze = this.drawMaze.bind(this);
    this.handleDraw = this.handleDraw.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleAStar = this.handleAStar.bind(this);
    this.state = {
      gridSize: props.gridSize,
      width: props.width,
      height: props.height,
      maze: this.getMaze(props.type, props.height, props.width),
    };
  }

  drawGrid(context) {
    const { height, width } = this.state;
    const { gridSize } = this.state;
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
  getMaze(type, width, height) {
    if (!width && !height) {
      width = this.state.width;
      height = this.state.height; 
    }
    switch (type) {
      case 'RBT': 
        return new Maze(width, height);
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
    const { maze } = this.state;
    if (maze) {
      const { gridSize } = this.state;
      const fillBorder = (x, y, type, cost = 0, maxCost) => {
        let pathColor = [255, 100, 235];
        let scanColor = [255, 255, 0];
        const clampColor = (x) => Math.min(255, Math.max(0, x));
        const adjustColor = (color) => {
          return 'rgb(' + color.map(
            (v, i) => v - Math.round((((3 - i) / 10)) * v * cost / maxCost)
          ).map(clampColor).join(',') 
            + ')'
         };
        const fillMap = {
          PATH: adjustColor(pathColor), 
          SCANNED: adjustColor(scanColor),
          EMPTY: '#FFFFFF'
        }

        ctx.fillStyle = fillMap[type] || fillMap.EMPTY;
        ctx.fillRect(
          2+ x * gridSize, 2 + y * gridSize,
          2+ (1 + x) * gridSize, 2 + (1 + y) * gridSize
        )
        // if (type === 'SCANNED' || type === 'PATH') {
        //   ctx.fillStyle = 'black';
        //   ctx.font = '10px Helvetica';
        //   ctx.fillText(cost, 10 + x * gridSize, 10 + y * gridSize)
        // }
      }
      const drawLine = (x, y, x2, y2, type) => {
        if (type instanceof Cell) {
          return;
        }
        // draw borders
        ctx.beginPath();
        ctx.moveTo(2+ x * gridSize, 2 + y * gridSize);  
        ctx.lineTo(2+ x2 * gridSize, 2 + y2 * gridSize);
        if (type === BORDER.ENTRANCE) {
          ctx.strokeStyle = '#FF0000';
          ctx.lineWidth = Math.max(gridSize/8, 1);
        } else if (type === true){
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = Math.max(gridSize/20, 0.5);
        }
        ctx.stroke(); 
      }; 
      maze.draw(fillBorder, drawLine);
    } else {
      this.drawGrid(ctx);
    }
  }


  handleReset() {
    this.clear(this.comp.ctx, this.comp.canvas)
    const maze = this.getMaze(this.props.type);
    this.setState({
       maze,
    });
  }

  handleDraw() {
    this.setState({ 
      seed: Math.random() 
    });
  }

  handleAStar() {
    const result = this.state.maze.aStar();
    this.drawMaze(this.comp.ctx, this.comp.canvas);  
  }

  componentDidUpdate() {
    this.drawMaze(this.comp.ctx, this.comp.canvas);
  }

  render() {
    const { height, width, gridSize } = this.state;
    return (
      <div className={styles.maze}>
        {this.props.title && <h3>{this.props.title}</h3>}
        <Canvas 
          ref={(comp) => { this.comp = comp;}}
          height={gridSize * height + 4} 
          width={gridSize * width + 4} 
          onDraw={this.drawMaze}
        />
        <ul>
          <li><button onClick={this.handleReset}>Reset</button></li>
          <li><button onClick={this.handleDraw}>Draw</button></li>
          <li><button onClick={this.handleAStar}>Traverse A*</button></li>
          <li>Grid Size: <input type='range' value={this.state.gridSize} min={5} max={80} step={1} onChange={(e) => {
            const { value } = e.target;
            this.setState({ gridSize: value });
          }} /></li>
          <li>Columns: <input type='range' value={this.state.width} min={5} max={80} step={1} onChange={(e) => {
            const { value } = e.target;
            const maze = this.getMaze(this.props.type);
            this.setState({ width: value, maze });
          }} /></li>
          <li>Rows: <input type='range' value={this.state.height} min={5} max={40} step={1} onChange={(e) => {
            const { value } = e.target;
            const maze = this.getMaze(this.props.type);
            this.setState({ height: value, maze });
          }} /></li>
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