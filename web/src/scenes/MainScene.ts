import Phaser from 'phaser';
import BossCard from './BossCard';
import PlayerCard from './PlayerCard';
import {Card, State, ICard} from '../mechanics/Card';
import { GameState } from '../mechanics/GameState';
import {
  EVENT_DECK_SHUFFLE, 
  EVENT_CARD_DRAWN, 
  EVENT_GAME_OVER,
  EVENT_NEXT_TURN,
} from '../mechanics/GameEvents';

import { 
    cardWidth,
} from '../utils/DeckManagement';
import { Boss } from '../mechanics/Boss';

export default class MainScene extends Phaser.Scene {
  private boss?: BossCard;
  private deck: PlayerCard[] = [];
  private roundsText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private state!: GameState;
  private chooseHero!: Phaser.GameObjects.Container;
  private roundIndicator!: Phaser.GameObjects.Container;

  private widthWithPadding: number = cardWidth + 10;
    
  constructor() {
    super({ key: 'MainScene' });
    this.handleShuffledDeck = this.handleShuffledDeck.bind(this);
    this.handleCardDrawn = this.handleCardDrawn.bind(this);
    this.handleEndGame = this.handleEndGame.bind(this);
    this.handleNextTurn = this.handleNextTurn.bind(this);
    this.handleCardPlayed = this.handleCardPlayed.bind(this);
    this.handleCardAttack = this.handleCardAttack.bind(this);
    this.handleCardAttacked = this.handleCardAttacked.bind(this);
  }

  preload() {
    this.state = new GameState(this.handleCardAttack, this.handleCardAttacked, this.handleCardPlayed);
      
    let request = new XMLHttpRequest();
    request.open('GET', 'assets/game_file.json', false);  // `false` makes the request synchronous
    request.send(null);

    if (request.status === 200) {
      const iCards = JSON.parse(request.responseText);
      const cards = iCards.filter((c:ICard) => !c.isBoss).map((c: ICard) => new Card(c.name, c.attack, c.health));
      const boss = iCards.filter((c:ICard) => c.isBoss).map((c: ICard) => new Boss(c.name, c.attack, c.health )).pop();
      this.load.image(boss.name, `assets/${boss.name}.png`);

      for (const card of cards) {
        this.load.image(card.name, `assets/${card.name}.png`);
      }
      this.state.create(cards, boss);
    }
  }

  get centerX(): number {
    return this.cameras.main.width / 2;
  }

  create() {
    // Initialize BossCard
    this.boss = new BossCard(this, this.centerX, 150, this.state.boss);
    this.add.existing(this.boss);
    this.state.on(EVENT_DECK_SHUFFLE, (eventArgs) => this.handleShuffledDeck(eventArgs));
    this.state.on(EVENT_CARD_DRAWN, () => this.handleCardDrawn());
    this.state.on(EVENT_GAME_OVER, () => this.handleEndGame());
    this.state.on(EVENT_NEXT_TURN, () => this.handleNextTurn());
    // Initialize Deck
    for (let i = 0; i < this.state.deck.length; i++) {
      // Pick a random card from the deck 
      const card = new PlayerCard(this, this.state.deck[i]);
      this.add.existing(card);
      this.deck.push(card);
      // Listen for the 'cardClicked' event on the card
      card.on('cardClicked', this.handleCardClicked, this);
    }
    this.roundsText = this.add.text(this.centerX, 20, '', {
      fontSize: '24px',
      fontStyle: 'bold',
      resolution: 5,
      stroke: '#000000',
      strokeThickness: 5

    }).setOrigin(0.5);
    this.createChooseHero();
    // Start the game
    this.startGame();
  }

  handleShuffledDeck(cardDeck: Card[]) { 
    this.deck = cardDeck.map(sortedCard => {
      return this.deck.find(playerCard => playerCard.card.name === sortedCard.name)!;
    });
  }

  startGame() {
    this.state.nextTurn();
  }

  createChooseHero() {
    this.chooseHero = this.add.container(this.centerX, 400).setVisible(false);

    // Create a translucent background
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.8); // 40% translucent black
    const bgWidth = 500; // Adjust as needed
    const bgHeight = 150; // Adjust as needed
    bg.fillRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight); // Position relative to container
  
    // Create fancy text
    this.statusText = this.add.text(0, 0, 'Choose Your Hero', {
      font: '40px Arial', // Change font style as needed
      align: 'center',
      resolution: 5
    }).setOrigin(0.5); // Center align the text
  
    // Add background and text to the container
    this.chooseHero.add(bg);
    this.chooseHero.add(this.statusText);
  }

  createRoundIndicator() {
    this.roundIndicator = this.add.container(this.centerX, 300).setVisible(false);

    // Create a translucent background
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.8); // 40% translucent black
    const bgWidth = 400; // Adjust as needed
    const bgHeight = 100; // Adjust as needed
    bg.fillRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight); // Position relative to container
  
    // Create fancy text
    const text = this.add.text(0, 0, 'Combat Round, Fight!', {
      font: '40px Arial', // Change font style as needed
      align: 'center',
      resolution: 5
    }).setOrigin(0.5); // Center align the text
  
    // Add background and text to the container
    this.roundIndicator.add(bg);
    this.roundIndicator.add(text);
  }


  async handleCardAttack(card: Card): Promise<void> {
    const playerCard = this.getCard(card.name);
    console.log(card.name);
    await this.animateAttack(playerCard, this.boss!, true);
  }

  animateAttack(
    attackerCard: Phaser.GameObjects.Container, 
    targetCard: Phaser.GameObjects.Container,
    attackFromBelow: boolean): Promise<void> {
    const originalPositionX = attackerCard.x;
    const originalPositionY = attackerCard.y;
    const originalAngle = attackerCard.angle; // Store original angle
    const yAdjustment = attackFromBelow ? 70 : -70;

    return new Promise(resolve => {
      // Rotate card before moving
      this.tweens.add({
        targets: attackerCard,
        angle: 7, // Rotate by 15 degrees
        ease: 'Power2',
        duration: 100,
        onComplete: () => {
          // Forward movement
          this.tweens.add({
            targets: attackerCard,
            x: targetCard.x,
            y: targetCard.y + yAdjustment,
            ease: 'Power2',
            duration: 250,
            onComplete: () => {
              // Move card back to original position
              this.tweens.add({
                targets: attackerCard,
                x: originalPositionX,
                y: originalPositionY,
                ease: 'Power2',
                duration: 200,
                onComplete: () => {
                  // Rotate card back to original angle
                  this.tweens.add({
                    targets: attackerCard,
                    angle: originalAngle, // Rotate back to original angle
                    duration: 50,
                    onComplete: () => {
                      resolve(); // Resolve the promise once all animations are complete
                    }
                  });
                }
              });
            }
          });
        }
      });
    });
  }
  
  async handleCardAttacked(card: Card): Promise<void> {
    const playerCard = this.getCard(card.name);
    // Animate card being attacked
    await this.animateAttack(this.boss!, playerCard, false);
  }

  handleEndGame() {
    // Check win/loss conditions
    if (this.boss!.boss.isDead()) {
      this.statusText.setText(`You beat the boss!`);
    } else {
      this.statusText.setText(`The boss escaped with \n${this.boss!.boss.health} health!`);
    }
    this.roundsText.setText(`Rounds Left: 0`);

    this.chooseHero.setVisible(true);
    const deck = this.getCards(State.Deck);
    deck.forEach(card => card.setVisible(false)); // set discarded cards to invisible
  }

  handleNextTurn() {
    this.roundsText.setText(`Rounds Left: ${this.state.totalTurns - this.state.currentTurn+1}`);
    this.chooseHero.setVisible(true);
  }

  handleCardClicked(card: PlayerCard) {
    this.chooseHero.setVisible(false);
    this.state.playCard(card.card);
  }

  async updateCardPositions(card: PlayerCard): Promise<void> {
    const played = this.getCards(State.Played);
    
    const startX = (this.centerX) - (this.widthWithPadding * played.length) / 2 ; // Start from the leftmost position

    // move the existing cards left
    for (let i = 0; i < played.length; i++) {
      const playedCard = played[i];
      playedCard.x = startX + i * (this.widthWithPadding);
      playedCard.y = 450;
    }
    return new Promise(resolve => {
      this.tweens.add({
        targets: card,
        x: startX + played.length * (this.widthWithPadding),
        y: 450,
        ease: 'Quart.easeOut', 
        duration: 350, // Duration of the tween (in milliseconds)
        onComplete: () => {
          resolve();
        }
      });
    });
  }

  async handleCardPlayed(card: Card): Promise<void> {
    const playerCard = this.getCard(card.name);

    await this.updateCardPositions(playerCard);
  }

  getCards(cardState: State): PlayerCard[] {
    return this.deck.filter((card) => card.card.state === cardState);
  }

  getCard(name: string): PlayerCard {
    return this.deck.find((card) => card.card.name === name)!;
  }
    
  handleCardDrawn() {
    const hand = this.getCards(State.Hand);
    const startX = (this.centerX) - (this.widthWithPadding * (hand.length-1)) / 2 ; // Start from the leftmost position

    // move the existing cards left
    for (let i = 0; i < hand.length; i++) {
      const playedCard = hand[i];
      playedCard.setVisible(true);  
      playedCard.x = startX + i * (this.widthWithPadding);
      playedCard.y = 650;
    }
  }
}
    
