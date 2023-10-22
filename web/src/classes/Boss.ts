import Phaser from 'phaser';
import Card from './Card';
import CharacterPicture from './CharacterPicture';

export default class Boss  extends Phaser.GameObjects.Container {
  health: number;
  attack: number;
  private healthText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    // Resize the sprite to be 140x200 pixels
    const newWidth = 220;
    const newHeight = 300;
    const characterSprite = new CharacterPicture(scene, 'bossSprite', newWidth, newHeight);
    this.add(characterSprite);
    
    // Add health
    this.healthText = scene.add.text(-40, 55, '', {
      fontSize: '12px',
      backgroundColor: 'black'
    });
    this.setHealth(100);
    this.attack = 10;
    this.add(this.healthText);
  }

  setHealth(health: number) {
    this.health = health;
    this.healthText.setText(`Health: ${health}`);
  }

  attack(target: Card) {
    

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
