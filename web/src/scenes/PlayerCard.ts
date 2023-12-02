import Phaser from 'phaser';
import CardPicture from './CardPicture';
import { EVENT_HEALTH_CHANGED, EVENT_CARD_STATE_CHANGED, EVENT_CARD_RESET } from '../mechanics/GameEvents';
import { Card, State } from '../mechanics/Card'
import { CARD_STATE_DISCARDED } from '../mechanics/CardStates';

import { 
    cardHeight,
    cardWidth,
    cardMultiplier
} from '../utils/DeckManagement';

export default class PlayerCard extends Phaser.GameObjects.Container {
  private healthText!: Phaser.GameObjects.Text;
  private attackText!: Phaser.GameObjects.Text;
  private title!: Phaser.GameObjects.Text;
  card: Card;
  characterSprite: CardPicture;

  constructor(scene: Phaser.Scene, card: Card) {
    super(scene, 1, 1);
    this._setHealth = this._setHealth.bind(this);
    this._setCardState = this._setCardState.bind(this);
    const healthStyle = { 
      font: '20px Arial',
      fill: '#ffff88',
      stroke: '#000000',
      strokeThickness: 5
    };
    const attackStyle = { 
      font: '20px Arial',
       fill: '#ff7777',
       stroke: '#000000',
       strokeThickness: 5 };

    this.card = card;
    
    // Create character sprite
    this.characterSprite = new CardPicture(scene, card.name, cardWidth, cardHeight);
    this.add(this.characterSprite);

    // Add title
    this.title = scene.add.text(0, -80, card.name.replace(' ', '\n'), {
      fontSize: '16px',
      fontStyle: 'normal',
      align: 'center',
      resolution: 1,
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5);
    this.add(this.title);

    // Health text on the bottom left
    this.healthText = scene.add.text(this.x + cardWidth / 2 - 16, this.y + cardHeight / 2 - 12, `${card.health.toString()}\u2665`, healthStyle);
    this.healthText.setOrigin(0.5);
  
    // Attack text on the bottom right
    this.attackText = scene.add.text(this.x - cardWidth / 2  + 13, this.y + cardHeight / 2 - 12 ,`${card.attack.toString()}\u2694`, attackStyle);
    this.attackText.setOrigin(0.5);
  
    // Add the text on top of the circles
    this.add(this.healthText);
    this.add(this.attackText);
    
    this.setInteractive({
      hitArea: new Phaser.Geom.Rectangle((cardWidth/-2), (cardHeight/-2), cardWidth, cardHeight),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true
    });
    
    card.on(EVENT_HEALTH_CHANGED, (eventArgs) => this._setHealth(eventArgs));
    card.on(EVENT_CARD_STATE_CHANGED, () => this._setCardState());
    card.on(EVENT_CARD_RESET, () => this.reset());
    this.on('pointerdown', this.handleClick, this);
    this.setVisible(false);
    this._setHealth(card.health);
  }

  _setHealth(health: number) {
    this.healthText.setText(`${health}\u2665`);
  }

  _setCardState() {
    if(this.card.state.toString() == CARD_STATE_DISCARDED) {
      this.setVisible(false);
    }
  }

  private handleClick(): void {
    console.log(`${this.card.state.toString()})`);
    if(this.card.state.toString() != State.Hand) {
      return;
    }
      // Handle the click event here
      this.emit('cardClicked', this);
      //this.removeInteractive();
      this.characterSprite.playCard();
      this.setScale(cardMultiplier);
  }

  die() {
    // Implement your death logic here
    // ...

    // Implement your death animation here
    // ...
  }

  revive() {
    this.card.revive();
    // Implement your revive animation here
    // ...
  }
  reset() {
    this.characterSprite.reset();
    this.setScale(1);
    this.setVisible(false);
  }
}
