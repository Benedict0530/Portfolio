// game.js
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);


let isAttacking = false;
let lastAttackTime = 0;
let playerHealth = 100;  // Initial health points for the player
let maxPlayerHealth = 100;  // Maximum health points for the player
let healthBar;
let score = 0;
let scoreText;
let attackCooldown = 1000;  // Cooldown time in milliseconds
let cooldownBar;
let cooldownStartTime;
let gameOverText;
let isgameOver = false;



function preload() {


    // Load your assets here
    this.load.image('background', 'sky.png');

    this.load.spritesheet('player', 'player.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('playerAttack', 'playerattack.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('playerDeath', 'playerdead.png', { frameWidth: 128, frameHeight: 128 });
     this.load.spritesheet('slash', 'slashsprite.png', { frameWidth: 496, frameHeight: 321, endFrame: 2 });
     this.load.image('obstacle', 'obstacle.png');
}


function create() {
    const self = this;

    this.background1 = this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'background').setDisplaySize(window.innerWidth, window.innerHeight);
    this.background2 = this.add.image(window.innerWidth / 2 + window.innerWidth, window.innerHeight / 2, 'background').setDisplaySize(window.innerWidth, window.innerHeight);

 // Create the HP bar
    healthBar = this.add.graphics();
    updateHealthBar();



   scoreText = this.add.text(10, 40, 'Score: 0', { font: '24px Arial', fill: '#ffffff' });

   // Initialize game over text (not visible initially)
    gameOverText = this.add.text(window.innerWidth / 2, window.innerHeight / 2, '  Game Over\nTap to Restart', { fontSize: '50px', fill: '#ffffff' });
    gameOverText.setOrigin(0.5);
    gameOverText.visible = false;
    gameOverText.setDepth(Number.MAX_SAFE_INTEGER);
    gameOverText.setShadow(2, 2, '#000000', 0);


    this.background1.x = window.innerWidth / 2;
    this.background2.x = window.innerWidth / 2 + window.innerWidth;

    this.sceneReference = self;

// Create animated player death
this.anims.create({
    key: 'playerDeathAnim',
    frames: this.anims.generateFrameNumbers('playerDeath', { start: 0, end: 5 }),
    frameRate: 20,
    repeat: 0  // 0 means play the animation once, set to -1 to loop indefinitely
});

     // Create animated player
        this.anims.create({
            key: 'playerAnim',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 7 }),
            frameRate: 20,
            repeat: -1  // -1 means loop indefinitely
        });

         // Set the initial position of the player at the bottom-left corner
         this.player = this.add.sprite(250, window.innerHeight - 200, 'player');
         this.player.setDisplaySize(128, 128);
         this.player.setScale(2);
         this.player.play('playerAnim');

          // Create an animated slash sprite initially hidden
             this.slash = this.add.sprite(0, 0, 'slash').setVisible(false);
             this.slash.setScale(0.5);

                // Create the animation for the slash sprite
                 this.anims.create({
                     key: 'slashAnim',
                     frames: this.anims.generateFrameNumbers('slash', { start: 0, end: 2 }),
                     frameRate: 20, // Adjust the frame rate as needed
                     repeat: 0 // 0 means play the animation once, set to -1 to loop indefinitely
                 });

          // Create animated player attack
            this.anims.create({
                key: 'playerAttackAnim',
                frames: this.anims.generateFrameNumbers('playerAttack', { start: 0, end: 3 }),
                frameRate: 30,
                repeat: 0  // 0 means play the animation once, set to -1 to loop indefinitely
            });

             this.obstacles = this.physics.add.group();

                 // Call the spawnObstacle function at regular intervals
                 this.time.addEvent({
                     delay: 2000,  // Set the delay between spawns (in milliseconds)
                     callback: spawnObstacle,
                     callbackScope: this,
                     loop: true  // Set to true for continuous spawning
                 });

                    this.physics.world.enable(this.obstacles);
                     this.physics.world.enable(this.slash);
                     this.physics.world.enable(this.player);

}
function spawnObstacle() {
    const obstacle = this.obstacles.create(window.innerWidth, window.innerHeight - 100, 'obstacle');
    obstacle.setVelocityX(-1000);  // Set the horizontal velocity for scrolling
    obstacle.setAngularVelocity(-720);
    obstacle.setScale(0.2);
}
function updateHealthBar() {
    // Clear the previous content of the health bar
    healthBar.clear();

    // Set the style for the health bar
    healthBar.fillStyle(0x00ff00);  // Green color for the bar
    healthBar.fillRect(10, 10, (playerHealth / maxPlayerHealth) * 200, 20);

    // Set the style for the border of the health bar
    healthBar.lineStyle(4, 0x000000);  // Black color with a line thickness of 4 pixels
    healthBar.strokeRect(10, 10, 200, 20);
}







function update() {
    // Update background scrolling
if(!isgameOver){
    this.background1.x -= 6;
    this.background2.x -= 6;

    if (this.background1.x <= -window.innerWidth / 2) {
        this.background1.x = this.background2.x + window.innerWidth;
    }

    if (this.background2.x <= -window.innerWidth / 2) {
        this.background2.x = this.background1.x + window.innerWidth;
    }
    }
     this.player.x = 150;
    this.player.y = window.innerHeight - 130;

    // Check for player input (click or tap) and cooldown using Phaser time events
        if (this.input.activePointer.isDown && !isAttacking && this.time.now - lastAttackTime > 1000) {
            // Play the attack animation
            isAttacking = true;
            this.player.setTexture('playerAttack'); // Change the player texture to attack
            this.player.play('playerAttackAnim');

            // Display the slash sprite
            this.slash.setPosition(this.player.x + 150, this.player.y + 60).setVisible(true); // Adjust position as needed
            this.slash.play('slashAnim');

            // Record the time of the attack
            lastAttackTime = this.time.now;

         // After the player attack animation completes, trigger the slash animation
              this.player.once('animationcomplete', () => {
                  // Play the slash animation
                  this.slash.setPosition(this.player.x + 50, this.player.y + 50).setVisible(true); // Adjust position as needed
                  this.slash.play('slashAnim');

                  // After the slash animation completes, reset to the idle animation and hide the slash sprite
                  this.slash.once('animationcomplete', () => {
                      this.player.setTexture('player'); // Change back to the original texture
                      this.player.play('playerAnim');
                      isAttacking = false;
                      this.slash.setVisible(false);
                  });
              });
          }



 // Update obstacle positions
    this.obstacles.children.iterate((obstacle) => {
        if (obstacle.x < -obstacle.width) {
            obstacle.x = window.innerWidth;  // Respawn on the right side
        }
    });

      // Check for collision between player and obstacles
        this.physics.overlap(this.player, this.obstacles, handlePlayerObstacleCollision, null, this);

   // Check for collision between slash and obstacles only if the slash is visible
     if (this.slash.visible) {
         this.physics.overlap(this.slash, this.obstacles, handleObstacleCollision, null, this);
     }


  if (playerHealth <= 0) {
        // Set playerHealth to 0 to avoid repeated game over triggers
        playerHealth = 0;

        // Call the gameOver function with the current scene reference
        gameOver(this);
    }


}
function handlePlayerObstacleCollision(player, obstacle) {
 // Decrease player health when colliding with an obstacle
      playerHealth = Math.max(0, playerHealth - 10);  // Adjust the amount as needed

    // Destroy the obstacle
    obstacle.destroy();

    // Update the HP bar
    updateHealthBar();
}

function handleObstacleCollision(slash, obstacle) {
    // Check if the obstacle has already been scored
    if (!obstacle.getData('scored')) {
        // Apply a bounce effect to the obstacle
        obstacle.setVelocity(200, -200); // Adjust the velocity as needed for the bounce

        // Mark the obstacle as scored to prevent earning multiple scores
        obstacle.setData('scored', true);

        // Wait for a short delay before removing the obstacle
        this.time.delayedCall(200, () => {
            // Destroy the obstacle after the delay
            obstacle.destroy();

            // Increase the score
            score += 10;  // Adjust the score increment as needed

            // Update the displayed score
            updateScore();
        });
    }
}



function updateScore() {
    // Update the displayed score
    scoreText.setText('Score: ' + score);
}

function gameOver(scene) {
    // Show game over text
    gameOverText.visible = true;
      // Set the game over flag to true
        isgameOver = true;

    // Set up a click event listener to restart the game
    scene.input.on('pointerdown', function () {
        // Reset variables
        playerHealth = 100;
        score = 0;
        scoreText.setText('Score: ' + score);
        isgameOver = false;
        // Hide game over text
        gameOverText.visible = false;

        // Restart the scene
        scene.scene.restart();
    });


}
