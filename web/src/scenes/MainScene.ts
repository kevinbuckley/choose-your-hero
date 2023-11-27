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
    cardMultiplier,
    getBaseURL
} from '../utils/DeckManagement';
import { Boss } from '../mechanics/Boss';

export default class MainScene extends Phaser.Scene {
  private boss?: BossCard;
  private deck: PlayerCard[] = [];
  private roundsText!: Phaser.GameObjects.Text;
  private state!: GameState;
  private chooseHero!: Phaser.GameObjects.Container;
  private titleScreen!: Phaser.GameObjects.Container;
  private endGameStatusText!: Phaser.GameObjects.Text;
  private widthWithPadding: number = cardWidth + 5;
  private widthWithPaddingPlayed: number = (cardWidth * cardMultiplier) + 5;
    
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
    const baseURL = getBaseURL();

    this.load.image('chooseyourhero', `${baseURL}chooseyourhero.png`);

    let request = new XMLHttpRequest();
    request.open('GET', `${baseURL}assets/game_file.json`, false);  // `false` makes the request synchronous
    request.send(null);

    if (request.status === 200) {
      const iCards = JSON.parse(request.responseText);
      const cards = iCards.filter((c:ICard) => !c.isBoss).map((c: ICard) => new Card(c.name, c.attack, c.health));
      const boss = iCards.filter((c:ICard) => c.isBoss).map((c: ICard) => new Boss(c.name, c.attack, c.health )).pop();
      this.load.image(boss.name, `${baseURL}assets/${boss.name}.png`);

      for (const card of cards) {
        this.load.image(card.name, `${baseURL}assets/${card.name}.png`);
      }
      this.state.create(cards, boss);
    }
  }

  get centerX(): number {
    return this.cameras.main.width / 2;
  }

  create() {
    // Initialize BossCard
    this.boss = new BossCard(this, this.centerX, 100, this.state.boss).setVisible(false);
    this.add.existing(this.boss);
    this.state.on(EVENT_DECK_SHUFFLE, (eventArgs) => this.handleShuffledDeck(eventArgs));
    this.state.on(EVENT_CARD_DRAWN, () => this.handleCardDrawn());
    this.state.on(EVENT_GAME_OVER, () => this.handleEndGame());
    this.state.on(EVENT_NEXT_TURN, () => this.handleNextTurn());
   
    this.createTitleScreen();
    this.createChooseHero();
    this.createDeck();
  }

  createDeck() {
    // Initialize Deck
    for (let i = 0; i < this.state.deck.length; i++) {
      // Pick a random card from the deck 
      const card = new PlayerCard(this, this.state.deck[i]);
      this.add.existing(card);
      this.deck.push(card);
      // Listen for the 'cardClicked' event on the card
      card.on('cardClicked', this.handleCardClicked, this);
    }
  }

  handleShuffledDeck(cardDeck: Card[]) { 
    this.deck = cardDeck.map(sortedCard => {
      return this.deck.find(playerCard => playerCard.card.name === sortedCard.name)!;
    });
  }

  startGame() {
     if (this.state.currentTurn === this.state.totalTurns) {
        this.state.reset();
     }
    this.boss!.setVisible(true);
    this.state.nextTurn();
  }

  createChooseHero() {
    this.chooseHero = this.add.container(this.centerX, 400).setVisible(false);

    // Create a translucent background
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.5); 
    const bgWidth = 500; // Adjust as needed
    const bgHeight = 200; // Adjust as needed
    bg.fillRect(-bgWidth / 2, -bgHeight / 2-45, bgWidth, bgHeight); // Position relative to container
    
    this.roundsText = this.add.text(0, -50, '', {
      fontSize: '24px',
      resolution: 5,
      stroke: '#000000',
      strokeThickness: 5,
      align: 'center',
      color: '#ffffff'
    }).setOrigin(0.5);
    // Add background and text to the container
    this.chooseHero.add(bg);
    this.chooseHero.add(this.roundsText);
    this.chooseHero.setDepth(10);

  }
  createTitleScreen() {
    this.titleScreen = this.add.container(this.centerX, 400).setVisible(true);

    // Create a translucent background
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.8); // 40% translucent black
    const bgWidth = 350; // Adjust as needed
    const bgHeight = 500; // Adjust as needed
    bg.fillRect(-bgWidth / 2, -bgHeight / 2-45, bgWidth, bgHeight); // Position relative to container
    const sprite = this.add.sprite(0, -150, 'chooseyourhero').setOrigin(0.5);
    sprite.setScale(.4, .4);

    const playGameText = this.add.text(0, 50, 'Play Game', {
      fontSize: '20px',
      resolution: 2,
      stroke: '#000000',
      strokeThickness: 5,
      align: 'center',
      color: 'yellow'
    }).setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    const openVault = this.add.text(0, 100, 'Open Vault', {
      fontSize: '20px',
      resolution: 2,
      stroke: '#000000',
      strokeThickness: 5,
      align: 'center',
      color: 'yellow'
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        window.location.href = './vault.html';
      });


    this.endGameStatusText = this.add.text(0, 150, '', {
      fontSize: '16px',
      resolution: 2,
      stroke: '#000000',
      strokeThickness: 5,
      align: 'center',
      color: 'white'
    }).setOrigin(0.5)


    // Add a click event listener
    playGameText.on('pointerdown', () => {
      this.titleScreen.setVisible(false);
      this.startGame();
    });

    // Add background and text to the container
    this.titleScreen.add(bg);
    this.titleScreen.add(playGameText);
    this.titleScreen.add(sprite);
    this.titleScreen.add(this.endGameStatusText);
    this.titleScreen.add(openVault);
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
    
    let txt = '';
    if (this.boss!.boss.isDead()) {
      txt =`You beat the boss!`;
    } else {
      txt = `The boss escaped with ${this.boss!.boss.health} health!`;
    }
   
    this.endGameStatusText.setText(`${txt}\n\nClick Play Game to play again`);

    this.titleScreen.setVisible(true);
    this.boss?.setVisible(false);
    this.deck.forEach(card => card.setVisible(false)); // set discarded cards to invisible
  }

  handleNextTurn() {
    this.roundsText.setText(`Rounds Left:${this.state.totalTurns - this.state.currentTurn+1} \n\nChoose your Hero`);
    this.chooseHero.setVisible(true);
  }

  handleCardClicked(card: PlayerCard) {
    this.chooseHero.setVisible(false);
    this.state.playCard(card.card);
  }

  async updateCardPositions(card: PlayerCard): Promise<void> {
    const played = this.getCards(State.Played);
    const cardY = 365;
    const startX = (this.centerX) - (this.widthWithPaddingPlayed * played.length) / 2 ; // Start from the leftmost position

    // move the existing cards left
    for (let i = 0; i < played.length; i++) {
      const playedCard = played[i];
      playedCard.x = startX + i * (this.widthWithPaddingPlayed);
      playedCard.y = cardY;
    }
    return new Promise(resolve => {
      this.tweens.add({
        targets: card,
        x: startX + played.length * (this.widthWithPaddingPlayed),
        y: cardY,
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
      playedCard.y = 575;
    }
  }
}
    
