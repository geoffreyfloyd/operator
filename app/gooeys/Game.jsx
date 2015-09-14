(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('./Game/robot.png'),
        require('./Game/drop.png')
    );
}(function (React, robot, drop) {
    
    var ReactDomGame = React.createClass({
        /******************************************************************
         * DEFINITIONS
         *****************************************************************/
        statics: {
            HEIGHT: 600,
            WIDTH: 800,
            FPS: 30
        },
        
        initializeDomGameEngine: function () {
            this.keysDown = {};
            this.obstacles = [];
            this.counter = 0;
            this.canvas = this.refs.viewport.getDOMNode().getContext('2d');
            this.sprite = {image: new Image(), height: 28, width: 20, position: { x: 0, y: 0 }, isInCollision: false };
            this.obstacleImage = new Image();
            this.sprite.image.src = robot;
            this.obstacleImage.src = drop;
        },
        
        /******************************************************************
         * COMPONENT LIFECYCLE
         *****************************************************************/
        componentDidMount: function () {
            // Set instance variables needed for game engine
            this.initializeDomGameEngine();
            
            // Subscribe to interval and events
            this.intervalId = setInterval(this.handleTick, 1000 / ReactDomGame.FPS);
            document.addEventListener('keydown', this.handleKeyDown);
            document.addEventListener('keyup', this.handleKeyUp);
        },
        
        componentWillUnmount: function () {
            // Unsubscribe from interval and events
            clearInterval(this.intervalId);
            document.removeEventListener('keydown', this.handleKeyDown);
            document.removeEventListener('keyup', this.handleKeyUp);
        },

        /******************************************************************
         * EVENT HANDLING
         *****************************************************************/
        handleKeyDown: function (e) {
            this.keysDown[e.which] = true;
        },
        
        handleKeyUp: function (e) {
            this.keysDown[e.which] = false;
        },
        
        handleTick: function () {
            this.update();
            this.draw();
        },
        
        /******************************************************************
         * GAME ENGINE
         *****************************************************************/
        update: function () {

            // move obstacles
            this.sprite.isInCollision = false;
            for (var i = 0; i < this.obstacles.length; i++) {

                // check for collision
                if ((Math.abs(this.obstacles[i].position.x - this.sprite.position.x) * 2 < (this.obstacles[i].width + this.sprite.width)) &&
                    (Math.abs(this.obstacles[i].position.y - this.sprite.position.y) * 2 < (this.obstacles[i].height + this.sprite.height))) {
                    this.sprite.isInCollision = true;
                }

                // move the obstacles
                if (this.obstacles[i].position.y > ReactDomGame.HEIGHT) {
                    this.obstacles[i].position.y = -20;
                } else {
                    this.obstacles[i].position.y = this.obstacles[i].position.y + 10;
                }
            }

            // move character
            if (this.keysDown[37] === true && this.sprite.position.x > 0) {
                // move left
                this.sprite.position.x = this.sprite.position.x - 10;
            }
            if (this.keysDown[38] === true && this.sprite.position.y > 0) {
                // move up
                this.sprite.position.y = this.sprite.position.y - 10;
            }
            if (this.keysDown[39] === true && this.sprite.position.x < 780) {
                // move right
                this.sprite.position.x = this.sprite.position.x + 10;
            }
            if (this.keysDown[40] === true && this.sprite.position.y < 570) {
                // move down
                this.sprite.position.y = this.sprite.position.y + 10;
            }

            // generate more raindrops
            this.counter = this.counter + 1;
            if (this.counter > 300) {
                this.counter = 0;
                this.obstacles.push(this.generateObstacle());
            }

            return;
        },

        draw: function () {

            // clear
            this.canvas.clearRect(0, 0, this.width, this.height);

            // draw border
            this.canvas.fillStyle = "#000000";
            this.canvas.fillRect(0, 0, this.width, this.height);

            // draw sprite (TODO: canvas.drawImage(img, x, y);)
            this.canvas.drawImage(this.sprite.image, this.sprite.position.x, this.sprite.position.y);

            if (this.sprite.isInCollision === true) {
                // Fill with gradient
                this.canvas.font = "80px Georgia";
                this.canvas.fillStyle = 'yellow';
                this.canvas.fillText('YOU\'RE TOAST!!!', 100, ReactDomGame.HEIGHT);
            }


            // draw obstacles
            for (var i = 0; i < this.obstacles.length; i++) {
                this.canvas.drawImage(this.obstacleImage, this.obstacles[i].position.x, this.obstacles[i].position.y);
                //this.obstacleImage
                //this.canvas.strokeRect(this.obstacles[i].position.x, this.obstacles[i].position.y, this.obstacles[i].width, this.obstacles[i].height);
            }
        },
        
        generateObstacle: function () {
            return { height: 20, width: 20, position: { x: Math.floor((Math.random() * 780)), y: -20 } };
        },
        
        /******************************************************************
         * RENDERING
         *****************************************************************/
        render: function () {
            return (
                <canvas ref="viewport" height={ReactDomGame.HEIGHT} width={ReactDomGame.WIDTH} style={styles.canvas} />  
            );
        }
    });
    
    var styles = {
        canvas: {
            height: ReactDomGame.HEIGHT,
            width: ReactDomGame.WIDTH
        }  
    };
    
    return ReactDomGame;
    
}));