import Phaser from 'phaser';
import BossCard from './BossCard';
import PlayerCard, {State} from './PlayerCard';
import GameState from '../mechanics/GameState';

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

export default class MainScene extends Phaser.Scene {
  private boss?: BossCard;
  private deck: PlayerCard[] = [];
  private hand: PlayerCard[] = [];
  private played: PlayerCard[] = [];
  private playedoriginal: PlayerCard[] = [];
  private discarded: PlayerCard[] = [];
  private turns: number = 5;
  private currentTurn: number = 0;
  private roundsText!: Phaser.GameObjects.Text;
  private state: GameState = new GameState();



  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.load.image('bossSprite', '../assets/bossSprite.png');
    for (const card of this.state.cardNames) {
      this.load.image(card, `../assets/${card}.png`);
    }
  }

  create() {
    // Initialize BossCard
    this.boss = new BossCard(this, (canvasWidth - cardWidth) / 2, 100, this.state.boss);
    this.add.existing(this.boss);

    // Initialize Deck
    for (let i = 0; i < this.state.cardNames.length; i++) {
      // Pick a random card from the deck 
      const card = new PlayerCard(this, this.state.cardNames[i]);
      this.add.existing(card);
      this.deck.push(card);
      // Listen for the 'cardClicked' event on the card
      card.on('cardClicked', this.playCard, this);
    }
    this.deck = shuffleDeck(this.deck);
    this.roundsText = this.add.text(680, 20, '', {
      fontSize: '32px',
      fill: '#fff'
    });

    // Start the game
    this.startGame();
  }

  startGame() {
    this.nextTurn();
  }

  endGame() {
    // Check win/loss conditions
    if (this.boss && this.boss.boss.health <= 0) {
      this.roundsText.setText(`You beat the boss!`);
    } else {
      this.roundsText.setText(`The boss escaped with ${this.boss!.boss.health} health!`);
    }
  }

  nextTurn() {
    this.roundsText.setText(`Rounds Left: ${this.turns - this.currentTurn}`);
    if (this.currentTurn >= this.turns || this.boss!.boss.health <= 0) {
      this.endGame();
      return;
    }
    this.hand = drawCards(this.deck, this.discarded);
    this.played.forEach((card) => { card.revive(); });
    this.currentTurn++;
  }

  attack() {
    // Execute attacks until all played cards are dead
    this.playedoriginal = this.played;

    while (this.played.length > 0) {
        // Cards attack the boss
        this.played.forEach((card) => {
          this.boss!.boss.attacked(card.attackPower);
          card.attack(this.boss!);
        });

        // BossCard attacks one of the cards at random
        const target = this.played[Math.floor(Math.random() * this.played.length)];
        // Implement your attack logic here
        target.health -= this.boss!.boss.attack;
        if (target.health <= 0) {
          target.die();
        }
        // Remove dead cards from played array
        this.played = this.played.filter((card) => card.health > 0);
    }
    this.played = this.playedoriginal;
  }

  playCard(card: PlayerCard) {
    card.x = startingX + this.played.length * (cardWidth + padding);
    card.y = 300;
    this.played.push(card);
    card.cardState = State.Played;
    // discard from hand  
    this.hand = this.hand.filter((handCard) => handCard.name !== card.name);
    // Discard the other cards
    this.discarded.push(...this.hand);
    this.discarded.forEach(card => card.setVisible(false)); // set discarded cards to invisible

    this.attack();
    this.nextTurn();
  }
}
