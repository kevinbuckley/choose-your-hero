import Phaser from 'phaser';
import PlayerCard from './PlayerCard';
import Boss from '../mechanics/Boss';
import CardPicture from './CardPicture';

export default class BossCard  extends Phaser.GameObjects.Container {
  private healthText!: Phaser.GameObjects.Text;
  private attackText!: Phaser.GameObjects.Text;
  boss: Boss;

  constructor(scene: Phaser.Scene, x: number, y: number, boss: Boss) {
    super(scene, x, y);
    this.boss = boss;
    // Resize the sprite to be 140x200 pixels
    const newWidth = 100;
    const newHeight = 160;
    const characterSprite = new CardPicture(scene, 'bossSprite', newWidth, newHeight);
    this.add(characterSprite);
    
    // Add health
    this.healthText = scene.add.text(-40, 60, '', {
      fontSize: '12px',
      backgroundColor: 'black'
    });

    // Add attack power
    this.attackText = scene.add.text(-40, 45, `Attack: ${this.boss.attack}`, {
      fontSize: '12px',
      backgroundColor: 'black'
    });


    this.setHealth(400);
    this.add(this.healthText);
    this.add(this.attackText);
  }

  setHealth(health: number) {
    this.boss.health = health;
    this.healthText.setText(`Health: ${health}`);
  }

  attack(target: PlayerCard) {
    

    // Implement your attack animation here
    // ...
  }

  takeDamage(amount: number) {
    this.boss.health -= amount;
    if (this.boss.health < 0) {
      this.boss.health = 0;
    }

    // Implement any damage-taking animation or logic here
    // ...
  }
}
