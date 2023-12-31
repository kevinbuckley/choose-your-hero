import { EventEmitter } from 'events';
import { 
  EVENT_HEALTH_CHANGED, 
  EVENT_CARD_DIED,
  EVENT_CARD_STATE_CHANGED,
  EVENT_CARD_RESET
} from './GameEvents';

export const enum State {
  Deck = 'deck',
  Discarded = 'discarded',
  Hand = 'hand',
  Played = 'played',
  PlayedButDead = 'playedButDead'
}

export interface ICard {
  name: string;
  attack: number;
  health: number;
  isBoss: boolean;
}

export class Card extends EventEmitter implements ICard {
  name: string;
  attack: number;
  health: number;
  healthOriginal: number;
  state: State = State.Deck;
  isBoss: boolean = false;
  constructor(name: string, attack: number, health: number) {
    super();
    this.name = name;
    this.attack = attack;
    this.health = health;
    this.healthOriginal = health;
    this.isBoss = false
  }

  attacked(attackPower: number) {
      this.health = Math.max(0, this.health - attackPower);
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

  reset() {
    this.health = this.healthOriginal;
    this.state = State.Deck;
    this.emit(EVENT_CARD_RESET);
    this.emit(EVENT_HEALTH_CHANGED, this.health);
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
  
  discard() {
    this.state = State.Discarded;
    this.emit(EVENT_CARD_STATE_CHANGED, this);
  }

}
  