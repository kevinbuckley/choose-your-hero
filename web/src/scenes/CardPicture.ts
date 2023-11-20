import Phaser from 'phaser';


export default class CardPicture extends Phaser.GameObjects.Sprite {
  
  scaleX: number = 0;
  scaleY: number = 0;

  constructor(scene: Phaser.Scene, cardName: string, cardWidth: number, cardHeight: number) {
    super(scene, 1, 1, cardName);
/*
    const graphics = scene.add.graphics({x:0, y:0});
    graphics.fillStyle(0x000000, 1);
    graphics.fillRoundedRect(this.scaleX, this.scaleY, this.width, this.height, 20);
    const mask = new Phaser.Display.Masks.GeometryMask(scene, graphics);
    this.setMask(mask);
  */    
    this.scaleX = cardWidth / this.width;
    this.scaleY = cardHeight / this.height;
    this.setScale(this.scaleX, this.scaleY);

  }
}
