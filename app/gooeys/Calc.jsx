'use strict';

import React from 'react';
import styles from './Calc.less';

var Calc = React.createClass({
    getInitialState: function () {
        return {
            result: '',
            operations: []
        };
    },

    handleClick: function (input) {
        var result = this.state.result;
        if (input === 'C') {
            result = '';
        }
        else if (input === '=') {
            result = String(eval(result));
        }
        else {
            if (result === '0') {
                result = '';
            }
            result += input;
        }
        this.setState({
            result: result
        });
    },

    /*************************************************************
    * RENDERING
    *************************************************************/
    render: function () {

        return (
            <div className={styles.container}>
                <div className={styles.rowcontainer}>
                    <div className={styles.row}>
                        <div className={styles.button} onClick={this.handleClick.bind(null, '7')}>7</div>
                        <div className={styles.button} onClick={this.handleClick.bind(null, '8')}>8</div>
                        <div className={styles.button} onClick={this.handleClick.bind(null, '9')}>9</div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.button} onClick={this.handleClick.bind(null, '4')}>4</div>
                        <div className={styles.button} onClick={this.handleClick.bind(null, '5')}>5</div>
                        <div className={styles.button} onClick={this.handleClick.bind(null, '6')}>6</div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.button} onClick={this.handleClick.bind(null, '1')}>1</div>
                        <div className={styles.button} onClick={this.handleClick.bind(null, '2')}>2</div>
                        <div className={styles.button} onClick={this.handleClick.bind(null, '3')}>3</div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.button} onClick={this.handleClick.bind(null, '0')}>0</div>
                        <div className={styles.button} onClick={this.handleClick.bind(null, '+')}>+</div>
                        <div className={styles.button} onClick={this.handleClick.bind(null, '-')}>-</div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.button} onClick={this.handleClick.bind(null, '*')}>*</div>
                        <div className={styles.button} onClick={this.handleClick.bind(null, '/')}>/</div>
                        <div className={styles.button} onClick={this.handleClick.bind(null, 'C')}>C</div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.button} onClick={this.handleClick.bind(null, '=')}>=</div>
                    </div>
                </div>
                <div className={styles.result}>{this.state.result}</div>
            </div>
        );
    }
});

module.exports = Calc;
