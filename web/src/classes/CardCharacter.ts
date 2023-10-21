import Phaser from 'phaser';
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


export default class CardCharacter extends Phaser.GameObjects.Sprite {
  
  constructor(scene: Phaser.Scene, cardName: string) {
    super(scene, 1, 1, cardName);
  
    const scaleX = cardWidth / this.width;
    const scaleY = cardHeight / this.height;
    this.setScale(scaleX, scaleY);

  }
}
