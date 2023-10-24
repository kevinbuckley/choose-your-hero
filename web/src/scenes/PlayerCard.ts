import Phaser from 'phaser';
import BossCard from './BossCard';
import CardPicture from './CardPicture';

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

export enum State {
  Played = 'played',
  Deck = 'deck',
  Discarded = 'discarded'
}

export default class PlayerCard extends Phaser.GameObjects.Container {
  attackPower: number;
  _health: number = 0;
  _healthOriginal: number = 0;
  name: string;
  cardState: State = State.Deck;
  private healthText!: Phaser.GameObjects.Text;


  constructor(scene: Phaser.Scene, cardName: string) {
    super(scene, 1, 1);
    
    this.attackPower = Math.floor(Math.random() * (10 - 2 + 1) + 2);  // Random integer between 2 and 10
    this.name = cardName;

    // Create character sprite
    const characterSprite = new CardPicture(scene, cardName, cardWidth, cardHeight);
    this.add(characterSprite);

    // Add title
    const title = scene.add.text(0, -80, cardName, {
      fontSize: '12px',
      align: 'center'
    }).setOrigin(0.5);
    this.add(title);

    // Add attack power
    const attackPower = scene.add.text(-35, 35, `Attack: ${this.attackPower}`, {
      fontSize: '12px',
      backgroundColor: 'black'
    });
    this.add(attackPower);

    // Add health
    this.healthText = scene.add.text(-35, 50, '', {
      fontSize: '12px',
      backgroundColor: 'black'
    });
    this.add(this.healthText);
    this.health = this._healthOriginal = Math.floor(Math.random() * (20 - 10 + 1) + 10);     // Random integer between 10 and 20
    
    // Add description
   /* const description = scene.add.text(0, 80, `Dope character named ${cardName}`, {
      fontSize: '10px',
      align: 'center',
      wordWrap: { width: 140 }
    }).setOrigin(0.5);
    this.add(description);
*/
    
    const bounds = this.getBounds();
    console.log(bounds);
    this.setInteractive({
      hitArea: new Phaser.Geom.Rectangle((cardWidth/-2), (cardHeight/-2), cardWidth, cardHeight),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true
    });
    
    this.on('pointerdown', this.handleClick, this);
    this.setVisible(false);
    
  }

  get health(): number { return this._health; }
  set health(newHealth: number) {
    this._health = newHealth;
    this.healthText.setText(`Health: ${newHealth}`);
    console.log(`Health of ${this.name} is now ${newHealth}`);
  }

  private handleClick(pointer: Phaser.Input.Pointer): void {
    // Handle the click event here
    console.log(`PlayerCard ${this.name} was clicke with the state ${this.state}!`)
    this.emit('cardClicked', this);
    this.removeInteractive();
  }

  attack(boss: BossCard) {

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
    this.health = this._healthOriginal;

    // Implement your revive animation here
    // ...
  }
}
