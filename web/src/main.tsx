import Phaser from 'phaser';
import MainScene from './scenes/MainScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scene: [MainScene],
  transparent: true, // This will make the game background transparent
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true,
    },
  },
  parent: 'game-container', // The div ID where you want to place the game
  scale: {
    mode: Phaser.Scale.RESIZE, // Scales the game to fit the parent container
    autoCenter: Phaser.Scale.CENTER_BOTH, // Centers the game canvas in the parent
    width: '100%', // Take up 100% of the parent container's width
    height: '100%' // Take up 100% of the parent container's height
  },
};

new Phaser.Game(config);
