import { Events } from 'phaser';
import { EVENT_HEALTH_CHANGED, 
  EVENT_CARD_DIED,
  EVENT_CARD_STATE_CHANGED } from './GameState';

export enum State {
  Deck = 'deck',
  Discarded = 'discarded',
  Hand = 'hand',
  Played = 'played',
  PlayedButDead = 'playedButDead'
}

export default 
class Card extends Events.EventEmitter {
  name: string;
  attack: number;
  health: number;
  healthOriginal: number;
  state: State = State.Deck;
  constructor(name: string, attack: number, health: number) {
    super();
    this.name = name;
    this.attack = attack;
    this.health = health;
    this.healthOriginal = health;
  }

  attacked(attackPower: number) {
      this.health -= attackPower;
      this.emit(EVENT_HEALTH_CHANGED, this.health);  

      if (this.isDead()) {
        this.die();
      }
  }
  isDead(): boolean {
    return this.health <= 0;
  }

  die() {
    this.state = State.PlayedButDead;
    this.emit(EVENT_CARD_DIED, this);
  }

  revive() {
    this.health = this.healthOriginal;
    this.state = State.Played;
    this.emit(EVENT_HEALTH_CHANGED, this.health);
  }

  play() {
    this.state = State.Played;
    this.emit(EVENT_CARD_STATE_CHANGED, this);
  }

}
  