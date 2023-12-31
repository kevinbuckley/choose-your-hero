import Phaser from 'phaser';
import { Boss } from '../mechanics/Boss';
import CardPicture from './CardPicture';
import { EVENT_HEALTH_CHANGED, EVENT_CARD_RESET } from '../mechanics/GameEvents';

export default class BossCard  extends Phaser.GameObjects.Container {
  private healthText!: Phaser.GameObjects.Text;
  private attackText!: Phaser.GameObjects.Text;
  boss: Boss;

  constructor(scene: Phaser.Scene, x: number, y: number, boss: Boss) {
    super(scene, x, y);
    this._setHealth = this._setHealth.bind(this);
    this.boss = boss;
    // Resize the sprite to be 140x200 pixels
    const newWidth = 130;
    const newHeight = 180;
    const characterSprite = new CardPicture(scene, boss.name, newWidth, newHeight);
    this.add(characterSprite);
    
    // Add title
    const title = scene.add.text(0, -80, boss.name, {
      fontSize: '16px',
      fontStyle: 'normal',
      align: 'center',
      resolution: 1,
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5);
    this.add(title);


    // Add health
    this.healthText = scene.add.text(newWidth / 2 - 25, newHeight / 2 - 12, '', {
      font: '20px Arial',
      color: '#ffff88',
      stroke: '#000000',
      strokeThickness: 5
    });
    this.healthText.setOrigin(0.5);
  
    // Add attack power  
    this.attackText = scene.add.text(-newWidth / 2 + 20, newHeight / 2 - 12, `${this.boss.attack}\u2694`, {
      font: '20px Arial',
      color: '#ff7777',
      stroke: '#000000',
      strokeThickness: 5 
    });
    this.attackText.setOrigin(0.5);
  
    boss.on(EVENT_HEALTH_CHANGED, (eventArgs) => this._setHealth(eventArgs));
    boss.on(EVENT_CARD_RESET, () => this._resetCard());
    this._setHealth(boss.health);
    this.add(this.healthText);
    this.add(this.attackText);
  }

  _setHealth(health: number) {
    this.healthText.setText(`${health}\u2665`);
  }

  _resetCard() {    
    this.setVisible(true);

  }

  attack() {
    

    // Implement your attack animation here
    // ...
  }
}
