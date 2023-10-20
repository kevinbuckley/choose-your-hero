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
  name: string;


  constructor(scene: Phaser.Scene, cardName: string) {
    super(scene, 1, 1, cardName);
    
    this.setVisible(false);
    this.name = cardName;

    this.attackPower = 10;
    this.health = 20;
    // Resize the sprite to be 140x200 pixels

    const scaleX = cardWidth / this.width;
    const scaleY = cardHeight / this.height;
    this.setScale(scaleX, scaleY);
    this.setInteractive({ useHandCursor: true });

    // Add a number to the top of the card
   /* this.cardNumber = scene.add.text(x, y - this.cardHeight / 2 + 10, cardIndex.toString(), {
        fontSize: '32px'
      });
    this.cardNumber.setOrigin(0.5, 0.5); // Center the text
   */ // Listen for the 'pointerdown' event
    this.on('pointerdown', this.handleClick, this);
  }

  private handleClick(pointer: Phaser.Input.Pointer): void {
    // Handle the click event here
    this.emit('cardClicked', this);
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
