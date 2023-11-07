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
    this._setHealth = this._setHealth.bind(this);
    this.boss = boss;
    // Resize the sprite to be 140x200 pixels
    const newWidth = 100;
    const newHeight = 160;
    const characterSprite = new CardPicture(scene, boss.name, newWidth, newHeight);
    this.add(characterSprite);
    
    // Add title
    const title = scene.add.text(0, -80, boss.name, {
      fontSize: '12px',
      align: 'center'
    }).setOrigin(0.5);
    this.add(title);


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

    boss.on(EVENT_HEALTH_CHANGED, (eventArgs) => this._setHealth(eventArgs));
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
