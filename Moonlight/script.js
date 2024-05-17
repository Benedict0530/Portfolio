 document.addEventListener('DOMContentLoaded', function() {
 	const player = document.querySelector('.player');
 	const enemyContainer = document.querySelector('.enemy-container');
 	const healthBar = document.querySelector('.health-bar');
 	const ultimateButton = document.getElementById('ultimateButton');
 	const gameOverScreen = document.querySelector('.game-over-screen');
 	const restartButton = document.getElementById('restartButton');
 	const maxTime = 60; // Maximum time in seconds
 	let timeRemaining = maxTime;
 	const timerDisplay = document.createElement('div');
 	timerDisplay.className = 'timer-display';
 	timerDisplay.style.position = 'fixed';
 	timerDisplay.style.top = '10px';
 	timerDisplay.style.right = '10px';
 	timerDisplay.style.fontFamily = 'Arial, sans-serif';
 	timerDisplay.style.fontSize = '18px';
 	timerDisplay.style.color = '#fff';
 	document.body.appendChild(timerDisplay);

 	let winScreen = document.querySelector('.win-screen');
 	let winRestartButton = document.getElementById('restartButton1');
 	const numberOfEnemies = 3;
 	const enemies = [];
 	const maxRebar = 100;
 	let playerScore = 0;
 	let rebar = 0;
 	const maxPlayerHealth = 100; // Set the maximum player health
 	let playerHealth = maxPlayerHealth;

 	const hitFrames = [];
 	for (let i = 1; i <= 18; i++) {
 		const hitFrame = new Image();
 		hitFrame.src = `hit (${i}).png`;
 		hitFrames.push(hitFrame);
 	}



 	const hitSound = new Audio('attack.wav');
 	const overSound = new Audio('over.wav');
 	const ultiSound = new Audio('ulti.wav');
 	const pointSound = new Audio('point.ogg');

 	const leftButton = document.getElementById('leftButton');
 	const rightButton = document.getElementById('rightButton');
 	const attackButton = document.getElementById('attackButton');
 	const scoreContainer = document.createElement('div');
 	scoreContainer.className = 'score-container';
 	scoreContainer.style.position = 'fixed';
 	scoreContainer.style.top = '10px';
 	scoreContainer.style.left = '50%';
 	scoreContainer.style.fontFamily = 'Arial, sans-serif';
 	scoreContainer.style.fontSize = '18px';
 	scoreContainer.style.color = '#fff';
 	document.body.appendChild(scoreContainer);
 	let gameOverFlag = false;
 	let winFlag = false;
 	let ultimateMode = false;

 	function removeAllEnemies() {
 		// Remove all enemies from the DOM
 		for (let i = 0; i < enemies.length; i++) {
 			const enemy = enemies[i];
 			if (enemy && enemy.parentNode) {
 				enemy.parentNode.removeChild(enemy);
 			}
 		}

 		// Clear the enemies array
 		enemies = [];

 		// Respawn new enemies
 		for (let i = 0; i < numberOfEnemies; i++) {
 			respawnEnemy(enemies[i]);
 		}
 	}

 	 const spriteUrls = [
            'walk.png',
            'idle.png',
            'attack.png',
            'attack1.png',
            'attack2.png',
            // Add other sprite URLs here
        ];

        const preloadedSprites = [];

        function preloadSprites() {
            for (const url of spriteUrls) {
                const img = new Image();
                img.src = url;
                preloadedSprites.push(img);
            }
        }

        preloadSprites();

 	function gameloop() {

 		function updateScore() {
 			// Update the score display element
 			scoreValue.innerText = playerScore;
 		}



 		let leftButtonInterval, rightButtonInterval, attackButtonTimeout;

 		leftButton.addEventListener('touchstart', function() {
 			leftButtonInterval = setInterval(function() {
 				movePlayer('left');
 			}, 50);
 		});

 		leftButton.addEventListener('touchend', function() {
 			clearInterval(leftButtonInterval);
 			stopPlayer();
 		});

 		rightButton.addEventListener('touchstart', function() {
 			rightButtonInterval = setInterval(function() {
 				movePlayer('right');
 			}, 50);
 		});

 		rightButton.addEventListener('touchend', function() {
 			clearInterval(rightButtonInterval);
 			stopPlayer();
 		});

 		attackButton.addEventListener('touchstart', function() {
 			attackPlayer();
 			attackButtonTimeout = setInterval(function() {
 				attackPlayer();
 			}, 50);
 		});

 		attackButton.addEventListener('touchend', function() {
 			clearInterval(attackButtonTimeout);
 			stopPlayer();
 		});

 		// Initialize enemies
 		for (let i = 0; i < numberOfEnemies; i++) {
 			const enemy = document.createElement('div');
 			enemy.className = 'enemy';
 			enemyContainer.appendChild(enemy);
 			enemies.push(enemy);
 			respawnEnemy(enemy); // Set initial positions
 		}

 		let isWalking = false;
 		let isAttacking = false;
 		let lastDirection = 'right';

 		document.addEventListener('keydown', function(event) {
 			if (event.key === 'ArrowLeft') {
 				movePlayer('left');
 			} else if (event.key === 'ArrowRight') {
 				movePlayer('right');
 			} else if (event.key === ' ' && !isAttacking) {
 				attackPlayer();
 			}
 		});

 		document.addEventListener('keyup', function(event) {
 			if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
 				stopPlayer();
 			}
 		});


 		function movePlayer(direction) {
            if (!isWalking) {
                isWalking = true;
                isAttacking = false;
                lastDirection = direction;
                player.style.background = 'url("walk.png") 0 0 no-repeat';
                player.style.animation = 'walk-animation 2s steps(8) infinite';
            }

            const currentPosition = parseFloat(getComputedStyle(player).left);
            const step = 2;

            // Define the boundaries of the screen
            const minPosition = 0;
            const maxPosition = window.innerWidth - player.offsetWidth;

            // Update player position within the boundaries
            if (direction === 'left' && currentPosition - step >= minPosition) {
                player.style.left = currentPosition - step + 'px';
                player.style.transform = 'scaleX(-1)';
            } else if (direction === 'right' && currentPosition + step <= maxPosition) {
                player.style.left = currentPosition + step + 'px';
                player.style.transform = 'scaleX(1)';
            }
        }


 		function stopPlayer() {
 			isWalking = false;
 			player.style.background = 'url("idle.png") 0 0 no-repeat';
 			player.style.animation = 'walk-animation 2s steps(8) infinite';
 		}

 		function attackPlayer() {
 			if (!isAttacking) {
 				isWalking = false;
 				isAttacking = true;
 				player.style.background = `url("attack.png") 0 0 no-repeat`;
 				player.style.animation = 'attack-animation 1s steps(10)';

 				setTimeout(function() {
 					stopPlayer();
 					isAttacking = false;
 				}, 1000);
 			}
 		}

 		// Enemy Logic
 		function moveEnemy(enemy) {
 			const enemyPosition = parseFloat(getComputedStyle(enemy).left);
 			const playerPosition = parseFloat(getComputedStyle(player).left);
 			const enemySpeed = 1;

 			if (enemyPosition < playerPosition) {
 				enemy.style.left = enemyPosition + enemySpeed + 'px';
 				enemy.style.transform = 'scaleX(1)';
 			} else if (enemyPosition > playerPosition) {
 				enemy.style.left = enemyPosition - enemySpeed + 'px';
 				enemy.style.transform = 'scaleX(-1)';
 			}
 		}



 		function respawnEnemy() {
 			const enemy = document.createElement('div');
 			enemy.className = 'enemy';
 			enemyContainer.appendChild(enemy);
 			enemies.push(enemy);

 			const respawnSide = Math.random() < 0.5 ? 'left' : 'right';
 			const respawnPosition = respawnSide === 'left' ? '-100px' : '100%';
 			enemy.style.left = respawnPosition;
 		}





 		function updateEnemies() {
 			for (let i = 0; i < enemies.length; i++) {
 				moveEnemy(enemies[i]);

 				// Check for collision with the player
 				if (isColliding(player, enemies[i])) {
 					handleCollision(); // You can define a function to handle the collision with the player
 				}

 				// Check for collision with the player's attack
 				if (isAttacking && isColliding(player, enemies[i])) {
 					removeEnemy(i);
 				}
 			}
 		}

 		function updateRebar() {
 			rebar += 5;
 			if (rebar > maxRebar) {
 				rebar = maxRebar;
 				showUltimateButton();
 			}

 			const rebarElement = document.querySelector('.rebar');
 			rebarElement.style.width = (rebar / maxRebar) * 100 + '%';
 		}

 		function resetRebar() {
 			rebar = 0;
 			hideUltimateButton();
 			const rebarElement = document.querySelector('.rebar');
 			rebarElement.style.width = '0%';
 		}

 		function showUltimateButton() {
 			ultimateButton.style.display = 'block';
 		}

 		function hideUltimateButton() {
 			ultimateButton.style.display = 'none';
 		}


 	   ultimateButton.addEventListener('click', function() {
            if (!ultimateMode) {
                ultimateMode = true;
                resetRebar();
                playultiSound();
                // Play the sequence of attack sprites
                playAttackSequence();

                // Set a timeout to exit ultimate mode after 2 seconds
                setTimeout(() => {
                    ultimateMode = false;
                }, 2000);
            }
        });

 		function playAttackSequence() {
 			// Array of attack sprites with a fixed display time of 1000 milliseconds (1 second)
 			const attackSprites = [{
 					sprite: 'attack2.png',
 					displayTime: 1000
 				},
 				{
 					sprite: 'attack1.png',
 					displayTime: 1000
 				},
 				{
 					sprite: 'attack.png',
 					displayTime: 1000
 				},
 			];

 			let spriteIndex = 0;

 			// Function to change the player's attack sprite
 			function changeAttackSprite() {
 				const currentSprite = attackSprites[spriteIndex];
 				player.style.background = `url("${currentSprite.sprite}") 0 0 no-repeat`;




 				spriteIndex++;

 				// If all sprites played, reset to idle frames after a delay
 				if (spriteIndex >= attackSprites.length) {
 					setTimeout(resetToIdleFrames, 1000); // Delay in milliseconds after the last sprite
 					removeAllEnemies();
 				} else {
 					// Otherwise, schedule the next sprite
 					setTimeout(changeAttackSprite, currentSprite.displayTime);
 				}
 			}

 			// Start playing the sequence
 			changeAttackSprite();
 		}

 		function removeAllEnemies() {
 			// Play hit frames on full screen
 			playHitFramesOnFullScreen();

 			// Count the number of enemies removed
 			let enemiesRemovedCount = 0;

 			// Remove all enemies from the DOM
 			for (let i = 0; i < enemies.length; i++) {
 				const enemy = enemies[i];
 				if (enemy && enemy.parentNode) {
 					enemy.parentNode.removeChild(enemy);
 					enemiesRemovedCount++; // Increment the count
 				}
 			}

 			// Update the player score based on the number of enemies removed
 			playerScore += enemiesRemovedCount;


 			// Clear the enemies array
 			enemies = [];

 			// Reset the player to idle frames
 			resetToIdleFrames();
 		}


 		function playHitFramesOnFullScreen() {
 			// Create a full-screen overlay for hit frames
 			const fullScreenOverlay = document.createElement('div');
 			fullScreenOverlay.className = 'hit-overlay';
 			fullScreenOverlay.style.width = '100%';
 			fullScreenOverlay.style.height = '100%';
 			fullScreenOverlay.style.position = 'fixed';
 			fullScreenOverlay.style.top = '0';
 			fullScreenOverlay.style.left = '75%'; // Adjust the left position to center it
 			fullScreenOverlay.style.transform = 'translateX(-50%)'; // Center it using translateX


 			// Create a container for hit frames to center them
 			const hitFramesContainer = document.createElement('div');
 			hitFramesContainer.style.display = 'flex';
 			hitFramesContainer.style.alignItems = 'center';
 			hitFramesContainer.style.justifyContent = 'center';
 			hitFramesContainer.style.width = '100%';
 			hitFramesContainer.style.height = '100%';

 			// Add the hit frames container to the full-screen overlay
 			fullScreenOverlay.appendChild(hitFramesContainer);

 			// Add the overlay to the body
 			document.body.appendChild(fullScreenOverlay);

 			// Play hit frames on the hit frames container
 			playHitFramesOnOverlay(hitFramesContainer);

 			// Remove the full-screen overlay after the hit frames are played
 			setTimeout(() => {
 				fullScreenOverlay.remove();
 			}, hitFrames.length * 50); // Adjust the duration based on the number of hit frames and their display time
 		}






 		function resetToIdleFrames() {
 			// Reset the player to idle frames
 			player.style.background = 'url("idle.png") 0 0 no-repeat';
 			// Reset the bottom position after the ultimate attack
 			player.style.bottom = '0px';
 		}



 		function removeEnemy(index) {
 			const removedEnemy = enemies.splice(index, 1)[0];

 			// Get the position and size of the removed enemy
 			const enemyRect = removedEnemy.getBoundingClientRect();

 			// Create a temporary overlay to cover the removed enemy's area
 			const overlay = document.createElement('div');
 			overlay.className = 'hit-overlay';
 			overlay.style.width = `${enemyRect.width}px`;
 			overlay.style.height = `${enemyRect.height}px`;
 			overlay.style.position = 'absolute';
 			overlay.style.top = '70%';
 			overlay.style.left = `${enemyRect.left}px`;

 			// Add the overlay to the enemy container
 			enemyContainer.appendChild(overlay);

 			// Play hit frames on the overlay
 			playHitFramesOnOverlay(overlay);
 			// Play the hit sound
 			playHitSound();

 			setTimeout(() => {
 				removedEnemy.parentNode.removeChild(removedEnemy);
 				overlay.remove();
 				updateRebar();
 				respawnEnemy(removedEnemy);
 				// Increase the player's score when an enemy is removed
 				playerScore += 1;
 				playpointSound();
 			}, 1000);
 		}

 		function playHitFramesOnOverlay(overlay) {

 			let frameIndex = 0;

 			// Function to change the overlay's sprite with hit frames
 			function changeHitFrame() {
 				const currentFrame = hitFrames[frameIndex];
 				overlay.style.background = `url("${currentFrame.src}") 0 0 no-repeat`;
 				overlay.style.backgroundSize = 'contain'; // Adjusted to 'contain'

 				frameIndex++;


 				// If all frames played, reset to transparent background
 				if (frameIndex >= hitFrames.length) {
 					overlay.style.background = 'transparent';
 				} else {
 					// Otherwise, schedule the next frame
 					setTimeout(changeHitFrame, 50); // Adjust the display time between frames
 				}
 			}

 			// Start playing the hit frames on the overlay
 			changeHitFrame();
 		}

 		function playHitSound() {
 			// Ensure the audio is at the beginning before playing it
 			hitSound.currentTime = 0;
 			hitSound.play();
 		}

 		function playultiSound() {
 			// Ensure the audio is at the beginning before playing it
 			ultiSound.currentTime = 0;
 			ultiSound.play();
 		}

 		function playoverSound() {
 			// Ensure the audio is at the beginning before playing it
 			overSound.currentTime = 0;
 			overSound.play();
 		}

 		function playpointSound() {
 			// Ensure the audio is at the beginning before playing it
 			pointSound.currentTime = 0;
 			pointSound.play();
 		}




 		function isColliding(element1, element2) {
 			const rect1 = element1.getBoundingClientRect();
 			const rect2 = element2.getBoundingClientRect();

 			// Decrease the hitbox of the player
 			const playerHitbox = {
 				left: rect1.left + 50,
 				right: rect1.right - 50,
 				top: rect1.top,
 				bottom: rect1.bottom,
 			};

 			return (
 				playerHitbox.left < rect2.right &&
 				playerHitbox.right > rect2.left &&
 				playerHitbox.top < rect2.bottom &&
 				playerHitbox.bottom > rect2.top
 			);
 		}


 		function handleCollision() {
 		 if (!ultimateMode) {
 			// Decrease player health
 			playerHealth -= 1;

 			// Update the health bar
 			if (playerHealth > 0) {
 				healthBar.style.width = (playerHealth / maxPlayerHealth) * 100 + '%';
 			} else {


 				gameOver();





 			}

 			console.log('Collision detected! Player Health:', playerHealth);
 		}
 	}

 		function gameOver() {

 			resetRebar();
 			playoverSound();
 			gameOverFlag = true;



 			// Display the game over screen
 			gameOverScreen.style.display = 'block';

 			// Hide the player and enemy elements
 			player.style.display = 'none';
 			enemyContainer.style.display = 'none';

 			// Show the restart button
 			restartButton.style.display = 'block';


 			// Display the player's score
 			const scoreDisplay = document.getElementById('scoreDisplay');
 			const scoreValue = document.getElementById('scoreValue');
 			scoreValue.innerText = playerScore;

 			// Additional game over logic can be added here
 			removeAllEnemies();

 		}

 		// Add event listener for the restart button
 		restartButton.addEventListener('click', function() {

 			// Reset player health, score, and other relevant game state
 			playerHealth = maxPlayerHealth;
 			playerScore = 0;
 			timeRemaining = maxTime;

 			gameOverFlag = false;

 			// Reset player and enemy elements
 			player.style.display = 'block';
 			enemyContainer.style.display = 'block';

 			// Hide the game over screen and restart button
 			gameOverScreen.style.display = 'none';
 			restartButton.style.display = 'none';

 			// Reset the health bar
 			healthBar.style.width = '100%';
 			removeAllEnemies();

 			// Respawn enemies
 			for (let i = 0; i < numberOfEnemies; i++) {
 				respawnEnemy(enemies[i]);
 			}



 		});




 		// Call the updateEnemies function at regular intervals
 		setInterval(updateEnemies, 1000 / 30);

 		// Call the respawnEnemy function for each enemy at a longer interval to respawn the enemies
 		setInterval(() => {
 			for (let i = 0; i < numberOfEnemies; i++) {
 				respawnEnemy(enemies[i]);
 			}
 		}, 10000);

 		setInterval(updateScore, 100);

 	}


 	function updateTimer() {
 		if (!gameOverFlag && timeRemaining > 0) {
 			timeRemaining--;
 			timerDisplay.innerText = `Time: ${timeRemaining}s`;
 		} else if (gameOverFlag) {
 			// Timer is frozen when gameOverFlag is true
 			timerDisplay.innerText = `Time: ${timeRemaining}s (Game Over)`;
 		} else {
 			// Time is up - check for win condition
 			if (playerHealth > 0) {

 				winFlag = true;
 				pointSound.currentTime = 0;
                 			pointSound.play();
 				// Display the win screen
 				winScreen.style.display = 'block';
 				// Hide the player and enemy elements
 				player.style.display = 'none';
 				enemyContainer.style.display = 'none';
 				// Show the restart button on the win screen
 				winRestartButton.style.display = 'block';
 				// Stop the game loop or perform any other necessary actions
 				healthBar.style.width = '100%';

 				removeAllEnemies();
 			}
 		}
 	}




 	setInterval(updateTimer, 1000);

 	winRestartButton.addEventListener('click', function() {
 		const rebarElement = document.querySelector('.rebar');
 		rebarElement.style.width = '0%';
 		// Reset player health, score, and other relevant game state
 		playerHealth = maxPlayerHealth;
 		playerScore = 0;
 		timeRemaining = maxTime;

 		// Reset player and enemy elements
 		player.style.display = 'block';
 		enemyContainer.style.display = 'block';

 		// Hide the win screen and restart button
 		winScreen.style.display = 'none';
 		winRestartButton.style.display = 'none';

 		// Respawn enemies
 		for (let i = 0; i < numberOfEnemies; i++) {
 			respawnEnemy(enemies[i]);
 		}

 		// Reset the health bar
 		healthBar.style.width = '100%';
 	});



 	gameloop();
 });