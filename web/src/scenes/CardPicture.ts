import Phaser from 'phaser';
import { cardMultiplier } from '../utils/DeckManagement';


export default class CardPicture extends Phaser.GameObjects.Sprite {
  
  scaleX: number = 0;
  scaleY: number = 0;

  constructor(scene: Phaser.Scene, cardName: string, cardWidth: number, cardHeight: number) {
    super(scene, 1, 1, cardName);
    this.scaleX = cardWidth / this.width;
    this.scaleY = cardHeight / this.height;
    this.setScale(this.scaleX, this.scaleY);

  }

  playCard() {
  }

  reset() {
  }
}
