import Phaser from 'phaser';
import PlayerCard from './PlayerCard';
import Boss from '../mechanics/Boss';
import CardPicture from './CardPicture';
import { EVENT_HEALTH_CHANGED } from '../mechanics/GameState';

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

    boss.on(EVENT_HEALTH_CHANGED, this._setHealth, this);
    this._setHealth(boss.health);
    this.add(this.healthText);
    this.add(this.attackText);
  }

  _setHealth(health: number) {
    this.healthText.setText(`Health: ${health}`);
  }

  attack(target: PlayerCard) {
    

    // Implement your attack animation here
    // ...
  }
}
