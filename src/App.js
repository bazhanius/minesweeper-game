import React from 'react';
import logo from './images/bomb.svg';
import './App.css';
import helperFunctions from './modules/helper-functions';
import fieldFunctions from "./modules/field-function";

function AppHeader(props) {
    return (
        <header className="App-header">
            <div>Minesweeper <img src={logo} className="App-logo" alt="logo" /></div>
        </header>
    )
}

function FlagsCounter(props) {
    return (
        <div className="control-panel__counter">💣 {props.flags}</div>
    );
}

function Reset(props) {
    let button = {
        'init': '🙂',
        'playing': '🤩',
        'ended': '😭',
        'won': '🥳',
    }
    return (
        <div className="control-panel__button-reset" onClick={props.callback}>
            {button[props.stage]}
        </div>
    );
}

class Timer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            seconds: 0,
        };
    }

    componentDidMount() {
        this.timerID = setInterval(() => {
            if (this.props.stage === 'init') {
                this.setState({
                    seconds: 0
                });
            }
            if (this.props.stage === 'playing') {
                this.tick()
            }
            }, 1000
        );

        if (this.props.stage === 'ended' || this.props.stage === 'won') {
            if (this.timerID) {
                clearInterval(this.timerID);
                this.timerID = null;
            }
        }
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    tick() {
        this.setState({
            seconds: this.state.seconds + 1
        });
    }

    render() {
        return (
            <div className="control-panel__timer">{helperFunctions.secondsToMinutes(this.state.seconds)}</div>
        )
    }
}

class Field extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            field: [],
            flags: 10,
            stage: 'init', // init, playing, ended, won
            firstMove: true
        };
    }

    componentDidMount() {
        this.setState(state => ({
            field: fieldFunctions.generateField(8, 9, 10)
        }));
    }

    handleResetClick() {
        this.setState(state => ({
            field: fieldFunctions.generateField(8, 9, 10),
            flags: 10,
            stage: 'init',
            firstMoveDone: false
        }));
    }

    handleCellClick(cell, e) {
        e.preventDefault();
        if (this.state.stage === 'init') {
            this.setState(state => ({
                stage: 'playing'
            }));
            if (!this.state.firstMoveDone) {
                this.setState(state => ({
                    firstMoveDone: true
                }));
            }
        }
        if (cell.isOpened === false
            && this.state.stage !== 'ended'
            && this.state.stage !== 'won') {
            let tempArr = this.state.field;
            tempArr[cell.cellID].isOpened = true;
            if (cell.bombsAround === 0) {
                tempArr = fieldFunctions.findEmptyCellsAroundCell(tempArr);
            }
            this.setState(state => ({
                field: tempArr
            }));
        }
        if (cell.containBomb) {
            if (!this.state.firstMoveDone) {
                this.handleResetClick();
            } else {
                let tempArr = this.state.field;
                this.setState(state => ({
                    stage: 'ended'
                }));
                tempArr.forEach(cell =>{
                    if (cell.containBomb) {
                        cell.isOpened = true;
                    }
                });
                this.setState(state => ({
                    field: tempArr
                }));
            }
        }
        if (fieldFunctions.checkWin(this.state.field, this.state.flags)) {
            this.setState(state => ({
                stage: 'won'
            }));
        }
    }

    handleCellContextMenu(cell, e) {
        e.preventDefault();
        if (this.state.stage === 'init') {
            this.setState(state => ({
                stage: 'playing'
            }));
        }
        if (cell.isOpened === false
            && this.state.stage !== 'ended'
            && this.state.stage !== 'won') {
            let increment = cell.isFlagged ? 1 : -1;
            let flagsAfterIncrement = this.state.flags + increment;
            if (flagsAfterIncrement >= 0  && flagsAfterIncrement <= 10) {
                let tempArr = this.state.field;
                tempArr[cell.cellID].isFlagged = !cell.isFlagged;
                this.setState(state => ({
                    field: tempArr,
                    flags: flagsAfterIncrement
                }));
            }
        }
        if (fieldFunctions.checkWin(this.state.field, this.state.flags)) {
            this.setState(state => ({
                stage: 'won'
            }));
        }
    }

    generateStyle(cell) {
        if (cell.isOpened === false) {
            return cell.isFlagged ? 'cell flagged' : 'cell'
        } else {
            return cell.containBomb ? 'cell fired' : 'cell opened'
        }
    }

    generateContent(cell) {
        if (cell.isOpened && !cell.containBomb && cell.bombsAround > 0) {
            return cell.bombsAround
        } else {
            return '';
        }
    }

    render() {
        return (
            <div>
                <div className="control-panel">
                    <FlagsCounter flags={this.state.flags} />
                    <Reset stage={this.state.stage}
                           callback={this.handleResetClick.bind(this)} />
                    <Timer stage={this.state.stage} />
                </div>
                <div className='field'>
                    {this.state.field.map(cell => (
                        <div
                            className={this.generateStyle(cell)}
                            key={cell.cellID}
                            onClick={(e) => this.handleCellClick(cell, e)}
                            onContextMenu={(e) => this.handleCellContextMenu(cell, e)}
                        >
                            {this.generateContent(cell)}
                        </div>
                    ))}
                </div>
            </div>
        )
    }
}

function App() {
  return (
    <div className="App">
        <AppHeader />
        <Field />
    </div>
  );
}

export default App;
