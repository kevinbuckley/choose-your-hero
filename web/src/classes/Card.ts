import Phaser from 'phaser';
import Boss from './Boss';
import { 
    shuffleDeck, 
    drawCards,
    canvasWidth,
    canvasHeight,
    cardHeight,
    cardWidth,
    padding,
    startingX
} from '../utils/DeckManagement';

export default class Card extends Phaser.GameObjects.Sprite {
  attackPower: number;
  health: number;

  constructor(scene: Phaser.Scene) {
    super(scene, 1, 1, 'cardSprite');
    //dthis.setVisible(false);

    this.attackPower = 10;
    this.health = 20;
    // Resize the sprite to be 140x200 pixels

    const scaleX = cardWidth / this.width;
    const scaleY = cardHeight / this.height;
    this.setScale(scaleX, scaleY);

    // Add a number to the top of the card
   /* this.cardNumber = scene.add.text(x, y - this.cardHeight / 2 + 10, cardIndex.toString(), {
        fontSize: '32px'
      });
    this.cardNumber.setOrigin(0.5, 0.5); // Center the text
   */ 
  }

  attack(boss: Boss) {
    // Implement your attack logic here
    boss.health -= this.attackPower;
    if (boss.health < 0) {
      boss.health = 0;
    }

    // Implement your attack animation here
    // ...
  }

  die() {
    // Implement your death logic here
    // ...

    // Implement your death animation here
    // ...
  }

  revive() {
    // Implement your revive logic here
    this.health = 20;

    // Implement your revive animation here
    // ...
  }
}
