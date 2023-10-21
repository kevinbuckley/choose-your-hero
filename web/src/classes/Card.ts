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

export enum State {
  Played = 'played',
  Deck = 'deck',
  Discarded = 'discarded'
}
import Phaser from 'phaser';
import CardCharacter from './CardCharacter';

export default class Card extends Phaser.GameObjects.Container {
  attackPower: number;
  health: number;
  name: string;
  cardState: State = State.Deck;


  constructor(scene: Phaser.Scene, cardName: string) {
    super(scene, 1, 1);
    
    this.attackPower = Math.floor(Math.random() * (10 - 2 + 1) + 2);  // Random integer between 2 and 10
    this.health = Math.floor(Math.random() * (20 - 10 + 1) + 10);     // Random integer between 10 and 20
    this.name = cardName;

    // Create character sprite
    const characterSprite = new CardCharacter(scene, cardName);
    this.add(characterSprite);

    // Add title
    const title = scene.add.text(0, -80, cardName, {
      fontSize: '12px',
      align: 'center'
    }).setOrigin(0.5);
    this.add(title);

    // Add attack power
    const attackPower = scene.add.text(-40, 40, `Attack: ${this.attackPower}`, {
      fontSize: '12px',
      backgroundColor: 'black'
    });
    this.add(attackPower);

    // Add health
    const health = scene.add.text(-40, 55, `Health: ${this.health}`, {
      fontSize: '12px',
      backgroundColor: 'black'
    });
    this.add(health);

    // Add description
   /* const description = scene.add.text(0, 80, `Dope character named ${cardName}`, {
      fontSize: '10px',
      align: 'center',
      wordWrap: { width: 140 }
    }).setOrigin(0.5);
    this.add(description);
*/
    this.setVisible(false);
    
    const bounds = this.getBounds();
    this.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, bounds.width, bounds.height),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true
    });
    this.on('pointerdown', this.handleClick, this);
    
  }

  private handleClick(pointer: Phaser.Input.Pointer): void {
    // Handle the click event here
    console.log(`Card ${this.name} was clicke with the state ${this.state}!`)
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
