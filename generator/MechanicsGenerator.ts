import OpenAI from 'openai';
import { ICard } from '../web/src/mechanics/Card';

class CardTemplate {
    name: string = "";
    attack: number = 0;
    health: number = 0;
    bio: string = "";
    stable_diffusion_prompt: string = "";
    isBoss: boolean = false;
}
class MechanicsGenerator {
  private OPEN_AI_KEY: string | undefined = process.env.OPEN_AI_KEY;
 
  public async getJsonAsDictionary(prompt: string,
    bossHealth: number,
    attackLower: number,
    attackUpper: number,
    healthLower: number,
    healthUpper: number,
    localGeneration: boolean): Promise<ICard[]> {
    const openai = new OpenAI({
        apiKey: this.OPEN_AI_KEY,
    });

    const fullPrompt: string = localGeneration ?
    `You are a game developer creating a new card game. You'll be returning only the JSON required to define
    each card in the deck.  There will be 10 player cards and 1 boss enemy card. 
    You'll be given a name of a movie and will create cards for the player and 1 boss card enemy that follow that theme. 
    Each card should represent a unique and visually memorable character in the movie with the Boss being the main villain.
    The health of a card should be between 9and 20 health.  
    The attack should be between 9 and 16 attack.  
    If a card has high health, then they should have relatively low attack and visa versa.
    The boss's health should be 500. The boss's attack should be 16.
    Please remember to ONLY return the JSON, no other text or content, only JSON.  
    Theme: Avengers Infinity War


    card template: ${JSON.stringify(new CardTemplate())}` : 
    `You are a game developer creating a new card game. You'll be returning only the JSON required to define
          each card in the deck.  There will be 10 player cards and 1 boss enemy card. 
          You'll be given a theme and will create cards for the player and 1 boss card enemy that follow that theme. 
          The health of a card should be between ${healthLower} and ${healthUpper} health.  
          The attack should be between ${attackLower} and ${attackUpper} attack.  
          If a card has high health, then they should have relatively low attack and visa versa.
          The boss's health should be ${bossHealth}. The boss's attack should be ${Math.floor(healthUpper*.8)}.
          Please remember to ONLY return the JSON, no other text or content, only JSON.  
          
          card template: ${JSON.stringify(new CardTemplate())}`;
        
    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      messages: [
        {
          role: 'system',
          content: fullPrompt,
        },
        {
          role: 'user',
          content: `Theme: ${prompt}`,
        },
      ],
      model: 'gpt-4-1106-preview',
      temperature:0.4,

    };
    
    console.log('sending params');
    
    const response: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create(params);
    
    console.log('got params');
    const jsonStr: string = response.choices[0].message.content!;
    const parsedJson = jsonStr.replace("```json", "").replace("```", "");
    console.log(parsedJson);
    const cards: ICard[] = JSON.parse(parsedJson) as ICard[];
    this.cleanTheme(cards);
    return cards;
  }

  public cleanTheme(cards: ICard[]) {
    cards.forEach(c => {
      c.name = c.name.replace('\\', '');
    });
  }
  
  chanceToChange: number = .3;
  public async getNewCards(cards: CardTemplate[], adjustment: number): Promise<any> {
    for(let i = 0; i < cards.length-1; i++) { // -1 to exclude boss
      if(Math.random() > this.chanceToChange) {
        switch(Math.floor(Math.random()*2)) {
          case 0: cards[i].attack += adjustment; break;
          case 1: cards[i].health += adjustment; break;
        }
      }
    }
    return cards;
  }
}


export default MechanicsGenerator;
