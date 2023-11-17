import Phaser from 'phaser';
import BossCard from './BossCard';
import PlayerCard from './PlayerCard';
import Card, {State, ICard} from '../mechanics/Card';
import GameState, {
  EVENT_DECK_SHUFFLE, 
  EVENT_CARD_DRAWN, 
  EVENT_GAME_OVER,
  EVENT_NEXT_TURN,
  EVENT_CARD_PLAYED,
  EVENT_CARD_ATTACKED
} from '../mechanics/GameState';

import { 
    canvasWidth,
    cardWidth,
    padding,
    startingX
} from '../utils/DeckManagement';
import Boss from '../mechanics/Boss';

export default class MainScene extends Phaser.Scene {
  private boss?: BossCard;
  private deck: PlayerCard[] = [];
  private roundsText!: Phaser.GameObjects.Text;
  private state: GameState;
  private chooseHero: Phaser.GameObjects.Container;

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
    this.load.image('background', '/background2.png');
    let request = new XMLHttpRequest();
    request.open('GET', '/assets/game_file.json', false);  // `false` makes the request synchronous
    request.send(null);

    if (request.status === 200) {
      const iCards = JSON.parse(request.responseText);
      const cards = iCards.filter((c:ICard) => !c.isBoss).map((c: ICard) => new Card(c.name, c.health, c.attack));
      const boss = iCards.filter((c:ICard) => c.isBoss).map((c: ICard) => new Boss(c.name, c.health, c.attack)).pop();
      this.load.image(boss.name, `/assets/${boss.name}.png`);
      this.state = new GameState(this.handleCardAttack, this.handleCardPlayed);
      for (const card of cards) {
        this.load.image(card.name, `/assets/${card.name}.png`);
      }
      this.state.create(cards, boss);
    }
  }

  create() {
    // Initialize BossCard
    this.createBackground();
    this.boss = new BossCard(this, (canvasWidth - cardWidth) / 2, 100, this.state.boss);
    this.add.existing(this.boss);
    this.state.on(EVENT_DECK_SHUFFLE, (eventArgs) => this.handleShuffledDeck(eventArgs));
    this.state.on(EVENT_CARD_DRAWN, (eventArgs) => this.handleCardDrawn(eventArgs));
    this.state.on(EVENT_GAME_OVER, (eventArgs) => this.handleEndGame(eventArgs));
    this.state.on(EVENT_NEXT_TURN, (eventArgs) => this.handleNextTurn(eventArgs));
    this.state.on(EVENT_CARD_PLAYED, (eventArgs) => this.handleCardPlayed(eventArgs));
    this.state.on(EVENT_CARD_ATTACKED, (eventArgs) => this.handleCardAttacked(eventArgs));
    // Initialize Deck
    for (let i = 0; i < this.state.deck.length; i++) {
      // Pick a random card from the deck 
      const card = new PlayerCard(this, this.state.deck[i]);
      this.add.existing(card);
      this.deck.push(card);
      // Listen for the 'cardClicked' event on the card
      card.on('cardClicked', this.handleCardClicked, this);
    }
    this.roundsText = this.add.text(40, 20, '', {
      fontSize: '24px',
      fill: '#eee'
    });
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

  createBackground() {
    // Add the image as the background
    const bg = this.add.image(0, 0, 'background');

    // Position the background
    bg.setOrigin(0, 0);

    // Create a semi-transparent black rectangle
    const darkenOverlay = this.add.graphics({ x: 0, y: 0 });
    darkenOverlay.fillStyle(0x000000, 0.7); // Adjust the alpha value to control darkness
    darkenOverlay.fillRect(0, 0, this.sys.game.config.width, this.sys.game.config.height);


    // Optionally, adjust the scale of the background to fit the game canvas
    bg.displayWidth = this.sys.game.config.width;
    bg.displayHeight = this.sys.game.config.height;
  }

  createChooseHero() {
    this.chooseHero = this.add.container(400, 300).setVisible(false);

    // Create a translucent background
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.8); // 40% translucent black
    const bgWidth = 400; // Adjust as needed
    const bgHeight = 100; // Adjust as needed
    bg.fillRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight); // Position relative to container
  
    // Create fancy text
    const text = this.add.text(0, 0, 'Choose Your Hero', {
      font: '40px Arial', // Change font style as needed
      fill: '#ffffff',
      align: 'center'
    });
    text.setOrigin(0.5); // Center align the text
  
    // Add background and text to the container
    this.chooseHero.add(bg);
    this.chooseHero.add(text);
  }


  async handleCardAttack(card: Card): Promise<void> {
    const playerCard = this.getCard(card.name);
    console.log(card.name);
    await this.animateAttack(playerCard, this.boss!);
  }

  animateAttack(attackerCard: PlayerCard, targetCard: BossCard) {
    const originalPositionX = attackerCard.x;
    const originalPositionY = attackerCard.y;
    const originalAngle = attackerCard.angle; // Store original angle
  
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
            y: targetCard.y + 70,
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
  
  handleCardAttacked(card: Card) {
    const playerCard = this.getCard(card.name);

  }

  handleEndGame() {
    // Check win/loss conditions
    if (this.boss!.boss.isDead()) {
      this.roundsText.setText(`You beat the boss!`);
    } else {
      this.roundsText.setText(`The boss escaped with ${this.boss!.boss.health} health!`);
    }
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

  handleCardPlayed(card: Card): Promise<void> {
    const playerCard = this.getCard(card.name);
    const played = this.getCards(State.Played);
    return new Promise(resolve => {
      this.tweens.add({
        targets: playerCard,
        x: startingX + played.length * (cardWidth + padding),
        y: 300,
        ease: 'Quart.easeOut', 
        duration: 350, // Duration of the tween (in milliseconds)
        onComplete: () => {
          resolve();
        }
      });
    });
  }

  getCards(cardState: State): PlayerCard[] {
    return this.deck.filter((card) => card.card.state === cardState);
  }

  getCard(name: string): PlayerCard {
    return this.deck.find((card) => card.card.name === name)!;
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
    
