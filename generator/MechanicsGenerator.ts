import OpenAI from 'openai';
import { ICard } from '../web/src/mechanics/Card';
import callModel from './LocalLLM';
class CardTemplate {
    name: string = "";
    attack: number = 0;
    health: number = 0;
    bio: string = "";
    stable_diffusion_prompt: string = "";
    isBoss: boolean = false;
}
class MechanicsGenerator {
 
  public async getJsonAsDictionary(prompt: string,
    bossHealth: number,
    attackLower: number,
    attackUpper: number,
    healthLower: number,
    healthUpper: number): Promise<ICard[]> {
    
    const fullPrompt: string = 
    `###Instructions### 
      Your task is to create a single JSON array of 11 cards for a strategy card game like Magic the Gathering. 
      You MUST only return the JSON array required to define each card in the deck.  
      There will be 11 cards total in the array, 10 player cards and 1 boss enemy card. 
      You'll be given a theme and will create cards for the player and 1 boss card enemy that follow that theme. 
      The health of a card should be between ${healthLower} and ${healthUpper} health.  
      The attack should be between ${attackLower} and ${attackUpper} attack.  
      If a card has high health, then they should have relatively low attack and visa versa.
      The boss's health should be ${bossHealth}. The boss's attack should be ${Math.floor(healthUpper*.8)}.
      I'm going to tip $99999 for a better solution!
      You will be penalized if you return anything but the JSON array. 

      Theme: ${prompt}

      ###Example###
      {"name":"","attack":0,"health":0, isBoss: false}`;
/*
    const fullPrompt2: string = 
    `You are a game developer creating a new card game. You'll be returning only the JSON required to define
          each card in the deck.  There will be 10 player cards and 1 boss enemy card. 
          You'll be given a theme and will create cards for the player and 1 boss card enemy that follow that theme. 
          The health of a card should be between ${healthLower} and ${healthUpper} health.  
          The attack should be between ${attackLower} and ${attackUpper} attack.  
          If a card has high health, then they should have relatively low attack and visa versa.
          The boss's health should be ${bossHealth}. The boss's attack should be ${Math.floor(healthUpper*.8)}.
          Please remember to ONLY return the JSON, no other text or content, only JSON.  
          
          theme: ${prompt}
          card template: ${JSON.stringify(new CardTemplate())}`;
*/
    let cards: ICard[] = []; 
    while(cards.length == 0) {
      console.log(`prompt: ${fullPrompt}`);
      const str: string = await callModel(fullPrompt)
      
      console.log(`result from model: ${str}`);
      const match = str.match(/\[([^\]]*)\]/);
      const jsonStr = match ? `[${match[1]}]` : '';
      console.log(`parsed json result: ${jsonStr}`);
      try {
        cards = JSON.parse(jsonStr) as ICard[];
        const isClean: boolean = this.cleanTheme(cards, bossHealth, attackLower, attackUpper, healthLower, healthUpper);
        if(!isClean) {
          cards = [];
        }
      }
      catch(e) { 
        console.log(e);
        console.log('failed to parse json, trying again');
      }
    }
    return cards;
  }

  public cleanTheme(cards: ICard[], bossHealth: number,
    attackLower: number,
    attackUpper: number,
    healthLower: number,
    healthUpper: number) {
    cards.forEach(c => {
      c.name = c.name.replace('\\', '');
    });
    // ensure there is only one boss
    let boss = cards.find(card => card.isBoss);
    if(boss == null) {
      return false;
    }
    boss.health = bossHealth;
    if (boss) {
      cards.forEach(card => {
        if (card !== boss) card.isBoss = false;
        if (card.attack < attackLower) card.attack = attackLower;
        if (card.attack > attackUpper) card.attack = attackUpper;
        if (card != boss && card.health < healthLower) card.health = healthLower;
        if (card != boss && card.health > healthUpper) card.health = healthUpper;
      });
    }
    return true;
  }
  
  chanceToChange: number = .3;
  public async getNewCards(cards: CardTemplate[], adjustment: number, attackLower: number, attackUpper: number, healthLower: number, healthUpper: number): Promise<any> {
    for(let i = 0; i < cards.length; i++) { // -1 to exclude boss
      if(cards[i].isBoss == false && Math.random() > this.chanceToChange) {
        switch(Math.floor(Math.random()*2)) {
          case 0: 
            cards[i].attack += adjustment; 
            cards[i].attack = Math.min(attackUpper, cards[i].attack);
            cards[i].attack = Math.max(attackLower, cards[i].attack); 
            break;
          case 1: 
            cards[i].health += adjustment; 
            cards[i].health = Math.min(healthUpper, cards[i].health);
            cards[i].health = Math.max(healthLower, cards[i].health); 
          break;
        }
      }
    }
    return cards;
  }
}


export default MechanicsGenerator;


if (require.main === module) {
  (async () => {
    const theme = 
      'Sci-Fi Witches'
    ;
    
    const gen = new MechanicsGenerator();
    const output = await gen.getJsonAsDictionary(theme, 500, 9, 20, 10, 28);
    console.log(output);
  })();
}