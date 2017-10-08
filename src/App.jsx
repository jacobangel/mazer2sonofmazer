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



class Maze extends Component {
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

  drawMaze (context, canvas) {
    console.log('draw');
    this.drawGrid(context);
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

Maze.defaultProps = {
  height: 10,
  width: 10,
  gridSize: 40,
}

const App = () => {
  return (
    <div>
      <div className={styles.mazeWrapper}>
        <Maze width={10} height={10} /> 
      </div> 
    </div>
  );
}

export default App;