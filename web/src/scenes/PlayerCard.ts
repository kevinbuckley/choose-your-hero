import Phaser from 'phaser';
import BossCard from './BossCard';
import CardPicture from './CardPicture';
import Card, { State } from '../mechanics/Card'
import { EVENT_HEALTH_CHANGED, EVENT_CARD_STATE_CHANGED } from '../mechanics/GameState';

import { 
    cardHeight,
    cardWidth,
} from '../utils/DeckManagement';


export default class PlayerCard extends Phaser.GameObjects.Container {
  private healthText!: Phaser.GameObjects.Text;
  private attackText!: Phaser.GameObjects.Text;
  card: Card;
  
  constructor(scene: Phaser.Scene, card: Card) {
    super(scene, 1, 1);
    this.card = card;
    
    // Create character sprite
    const characterSprite = new CardPicture(scene, card.name, cardWidth, cardHeight);
    this.add(characterSprite);

    // Add title
    const title = scene.add.text(0, -80, card.name, {
      fontSize: '12px',
      align: 'center'
    }).setOrigin(0.5);
    this.add(title);

    // Add attack power
    const attackPower = scene.add.text(-35, 35, `Attack: ${card.attack}`, {
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
    this._setHealth(card.health);
    
    const bounds = this.getBounds();
    this.setInteractive({
      hitArea: new Phaser.Geom.Rectangle((cardWidth/-2), (cardHeight/-2), cardWidth, cardHeight),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true
    });
    
    card.on(EVENT_HEALTH_CHANGED, this._setHealth, this);
    card.on(EVENT_CARD_STATE_CHANGED, this._setCardState, this);
    this.on('pointerdown', this.handleClick, this);
    this.setVisible(false);
    
  }

  _setHealth(health: number) {
    this.healthText.setText(`Health: ${health}`);
  }

  _setCardState() {
    switch(this.card.state) {
      case State.Discarded:
        this.setVisible(false);
        break;
        
    }
  }


  private handleClick(pointer: Phaser.Input.Pointer): void {
    // Handle the click event here
    this.emit('cardClicked', this);
    this.removeInteractive();
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
}
