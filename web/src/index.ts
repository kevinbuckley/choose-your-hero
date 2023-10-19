import 'phaser';
import MainScene from './scenes/MainScene';
import OtherScene from './scenes/OtherScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1392,
  height: 642,
  scene: [OtherScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true,
    },
  },
};

const game = new Phaser.Game(config);
