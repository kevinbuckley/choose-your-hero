import Phaser from 'phaser';
import Boss from '../classes/Boss';
import Card from '../classes/Card';
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
  private boss?: Boss;
  private deck: Card[] = [];
  private hand: Card[] = [];
  private played: Card[] = [];
  private discarded: Card[] = [];
  private turns: number = 5;
  private currentTurn: number = 0;

  private cards: string[] = [
    'Boba Fett',
    'Captain Phasma',
    'Clone Trooper',
    'DarthMaul',
    'General Grievous',
    'Jango Fett',
    'Stormtrooper',
    'Tusken Raider',
    'Vader'
  ];


  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.load.image('bossSprite', '../assets/bossSprite.png');
    for (const card of this.cards) {
      this.load.image(card, `../assets/${card}.png`);
    }
  }

  create() {
    // Initialize Boss
    this.boss = new Boss(this, (canvasWidth - cardWidth) / 2, 100);
    this.add.existing(this.boss);

    // Initialize Deck
    for (let i = 0; i < this.cards.length; i++) {
      // Pick a random card from the deck 
      const card = new Card(this, this.cards[i]);

      this.add.existing(card);
      this.deck.push(card);
      // Listen for the 'cardClicked' event on the card
      card.on('cardClicked', this.playCard, this);
    }
    this.deck = shuffleDeck(this.deck);

    // Start the game
    this.startGame();
  }

  startGame() {
    this.nextTurn();
  }

  endGame() {
    // Check win/loss conditions
    if (this.boss && this.boss.health <= 0) {
      console.log('You win!');
    } else {
      console.log('You lose!');
    }
  }

  nextTurn() {
    this.currentTurn++;
    if (this.currentTurn >= this.turns) {
      this.endGame();
      return;
    }
    this.hand = drawCards(this.deck, this.discarded);
  }

  attack() {
    // Execute attacks until all played cards are dead
    //while (this.played.length > 0) {
        // Cards attack the boss
        this.played.forEach((card) => {
          card.attack(this.boss!);
        });

        // Boss attacks one of the played cards (for demonstration, attacking the first card)
        this.boss!.attack(this.played[0]);

        // Remove dead cards from played array
     //   this.played = this.played.filter((card) => card.health > 0);
   // }
  }

  playCard(card: Card) {
    console.log(card.name + ' clicked!');

    card.x = startingX + this.played.length * (cardWidth + padding);
    card.y = 300;
    this.played.push(card);
    // discard from hand  
    this.hand = this.hand.filter((handCard) => handCard.name !== card.name);
    // Discard the other cards
    this.discarded.push(...this.hand);
    this.discarded.forEach(card => card.setVisible(false)); // set discarded cards to invisible

    this.attack();
    this.nextTurn();
  }
}
