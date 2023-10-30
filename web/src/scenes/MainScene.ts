import Phaser from 'phaser';
import BossCard from './BossCard';
import PlayerCard from './PlayerCard';
import Card, {State} from '../mechanics/Card';
import GameState, {EVENT_DECK_SHUFFLE, EVENT_CARD_DRAWN} from '../mechanics/GameState';

import { 
    canvasWidth,
    cardWidth,
    padding,
    startingX
} from '../utils/DeckManagement';

export default class MainScene extends Phaser.Scene {
  private boss?: BossCard;
  private deck: PlayerCard[] = [];
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
    this.state.on(EVENT_DECK_SHUFFLE, this.shuffledDeck, this);
    this.state.on(EVENT_CARD_DRAWN, this.handleCardDrawn, this);
    // Initialize Deck
    for (let i = 0; i < this.state.deck.length; i++) {
      // Pick a random card from the deck 
      const card = new PlayerCard(this, this.state.deck[i]);
      this.add.existing(card);
      this.deck.push(card);
      // Listen for the 'cardClicked' event on the card
      card.on('cardClicked', this.playCard, this);
    }
    this.roundsText = this.add.text(680, 20, '', {
      fontSize: '32px',
      fill: '#fff'
    });

    // Start the game
    this.startGame();
  }

  shuffledDeck(cardDeck: Card[]) { 
    this.deck = cardDeck.map(sortedCard => {
      return this.deck.find(playerCard => playerCard.card.name === sortedCard.name)!;
    });

  }

  startGame() {
    this.nextTurn();
  }

  endGame() {
    // Check win/loss conditions
    if (this.boss && this.boss.boss.isDead()) {
      this.roundsText.setText(`You beat the boss!`);
    } else {
      this.roundsText.setText(`The boss escaped with ${this.boss!.boss.health} health!`);
    }
    const deck = this.getCards(State.Deck);
    deck.forEach(card => card.setVisible(false)); // set discarded cards to invisible

  }

  nextTurn() {
    this.roundsText.setText(`Rounds Left: ${this.state.totalTurns - this.state.currentTurn}`);
    if (this.state.currentTurn >= this.state.totalTurns || this.boss!.boss.isDead()) {
      this.endGame();
      return;
    }
    const played = this.getCards(State.PlayedButDead);
    played.forEach((card) => { card.card.revive(); });
    this.state.drawCards();
    this.state.currentTurn++;
  }

  attack() {
    let played = this.getCards(State.Played);
    
    // Execute attacks until all played cards are dead
    while (played.length > 0) {
        // get played cards that aren't dead, iterate through them
        played
          .filter((card) => !card.card.isDead())
          .forEach((card) => card.attack(this.boss!));

        // BossCard attacks one of the cards at random
        const target = played[Math.floor(Math.random() * played.length)];
        target.card.attacked(this.boss!.boss.attack);
        played = this.getCards(State.Played);
    }
  }

  playCard(card: PlayerCard) {
    const played = this.getCards(State.Played);
    card.x = startingX + played.length * (cardWidth + padding);
    card.y = 300;
    card.card.state = State.Played;

    this.deck.forEach((card) => { console.log(card.card.name, card.card.state); });
   
    // discard cards not selected from hand  
    this.getCards(State.Hand)
      .forEach(card => {
        card.card.state = State.Discarded;
        card.setVisible(false);
      });

    this.attack();
    this.nextTurn();
  }


  shuffleDeck() {
    this.deck = this.state.deck.map(sortedCard => {
      return this.deck.find(playerCard => playerCard.card.name === sortedCard.name)!;
    });
  }

  getCards(cardState: State): PlayerCard[] {
    return this.deck.filter((card) => card.card.state === cardState);
  }

  getCard(name: string): PlayerCard {
    return this.deck.find((card) => card.card.name === name);
  }
  
  drawCards(numCards: number = 3) {
    for (let i = 0; i < numCards; i++) {
      let deck = this.getCards(State.Deck);
      if (deck.length === 0) {
        // Reshuffle the deck if it's empty
        // update cards in deck if discarded, make them deck
        this.getCards(State.Discarded).forEach(card => {
          card.card.state = State.Deck;
        });
        this.state.shuffleDeck();
      }
      deck = this.getCards(State.Deck);
      const card = deck.pop();
      if (card) {
        card.card.state = State.Hand;
        card.setVisible(true);  
        card.setPosition(startingX + (i * (cardWidth + padding)), 500);
        card.x = startingX + (i * (cardWidth + padding));
        card.y = 500;
      }
     }
  }
    
  handleCardDrawn(card: Card) {
    const playerCard = this.getCard(card.name);
    const i = this.getCards(State.Hand).length-1; //0th based index
    playerCard.setVisible(true);  
    playerCard.setPosition(startingX + (i * (cardWidth + padding)), 500);
    playerCard.x = startingX + (i * (cardWidth + padding));
    playerCard.y = 500;
  }
}
    
