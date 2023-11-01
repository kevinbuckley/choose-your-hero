
import Boss from './Boss';
import Card, { State } from '../mechanics/Card';
import { Events } from 'phaser';

export const EVENT_HEALTH_CHANGED: string = 'healthChanged';
export const EVENT_CARD_DIED: string = 'cardDied';
export const EVENT_DECK_SHUFFLE: string = 'deckShuffled';
export const EVENT_CARD_STATE_CHANGED: string = 'cardStateChanged';
export const EVENT_CARD_DRAWN: string = 'cardDrawn';
export const EVENT_GAME_OVER: string = 'gameOver';
export const EVENT_NEXT_TURN: string = 'nextTurn';
export const EVENT_CARD_PLAYED: string = 'cardPlayed';

class GameState extends Events.EventEmitter {
  deck: Card[] = [];
  totalTurns: number = 5;
  currentTurn: number = 0;
  private boss: Boss;
  private played: Card[] = [];
  cardNames: string[] = [
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
    super();
    // Initialize boss and cards if needed
  }

  getCards(cardState: State): Card[] {
    return this.deck.filter((card) => card.state === cardState);
  }
  
  create(cards: Card[] = [], boss: Boss) {
    this.boss = boss;
    this.deck = cards;
    this.shuffleDeck();
  }

  // Method to perform an attack
  attackBoss(card: Card): void {
    if (this.boss.health <= 0) {
      this.emit('bossDefeated', this.boss);
      return;
    }

    this.boss.attacked(card.attack);
    this.emit('bossAttacked', this.boss);

    if (this.boss.health <= 0) {
      this.emit('bossDefeated', this.boss);
    }
  }

  nextTurn() {
    if (this.currentTurn >= this.totalTurns || this.boss.isDead()) {
      this.endGame();
      return;
    }      
    const played = this.getCards(State.PlayedButDead);
    played.forEach((card) => { card.revive(); });
    this.drawCards();
    this.currentTurn++;
    this.emit(EVENT_NEXT_TURN, this.currentTurn);
  }
  
  endGame() {
    this.emit(EVENT_GAME_OVER, this.boss);
  }

  playCard(card: Card) {
    this.emit(EVENT_CARD_PLAYED, card);
    card.state = State.Played;
    this.getCards(State.Hand).forEach(card => card.discard());
    this.attack();
    this.nextTurn();
  }

  attack() {
    let played = this.getCards(State.Played);
    
    // Execute attacks until all played cards are dead
    while (played.length > 0) {
        // get played cards that aren't dead, iterate through them
        played
          .filter((card) => !card.isDead())
          .forEach((card) =>  this.boss.attacked(card.attack));

        // BossCard attacks one of the cards at random
        const target = played[Math.floor(Math.random() * played.length)];
        target.attacked(this.boss.attack);
        played = this.getCards(State.Played);
    }
  }

  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
    this.emit(EVENT_DECK_SHUFFLE, this.deck);
  }

  drawCards(numCards: number = 3) {
    for (let i = 0; i < numCards; i++) {
      let deck = this.getCards(State.Deck);
      if (deck.length === 0) {
        // Reshuffle the deck if it's empty
        // update cards in deck if discarded, make them deck
        this.getCards(State.Discarded).forEach(card => {
          card.state = State.Deck;
        });
        this.shuffleDeck();
      }
      deck = this.getCards(State.Deck);
      const card = deck.pop();
      if (card) {
        card.state = State.Hand;
        this.emit(EVENT_CARD_DRAWN, card);
      }
    }
  }    
}
  
  export default GameState;