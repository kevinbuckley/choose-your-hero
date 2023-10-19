import Phaser from 'phaser';
import Card from './Card';

export default class Boss extends Phaser.GameObjects.Sprite {
  health: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bossSprite');
    this.health = 100;
    // Resize the sprite to be 140x200 pixels
    const newWidth = 220;
    const newHeight = 300;
    const scaleX = newWidth / this.width;
    const scaleY = newHeight / this.height;
    this.setScale(scaleX, scaleY);
  }

  attack(target: Card) {
    // Implement your attack logic here
    const damage = 10; // Replace with the boss's actual attack power
    target.health -= damage;
    if (target.health <= 0) {
      target.die();
    }

    // Implement your attack animation here
    // ...
  }

  takeDamage(amount: number) {
    this.health -= amount;
    if (this.health < 0) {
      this.health = 0;
    }

    // Implement any damage-taking animation or logic here
    // ...
  }
}
