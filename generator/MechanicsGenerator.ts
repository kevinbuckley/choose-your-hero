import OpenAI from 'openai';

class CardTemplate {
    name: string = "";
    attack: number = 0;
    health: number = 0;
    bio: string = "";
    isBoss: boolean = false;
}
class MechanicsGenerator {
  private OPEN_AI_KEY: string | undefined = process.env.OPEN_AI_KEY;
 
  public async getJsonAsDictionary(prompt: string,
    bossHealth: number,
    attackLower: number,
    attackUpper: number,
    healthLower: number,
    healthUpper: number): Promise<any> {
    const openai = new OpenAI({
        apiKey: this.OPEN_AI_KEY,
    });
        
    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      messages: [
        {
          role: 'system',
          content: `You are a game developer creating a new card game. You'll be returning only the JSON required to define
          each card in the deck.  There will be 10 player cards and 1 boss enemy card. 
          You'll be given a theme and will create cards for the player and 1 boss card enemy that follow that theme. 
          The health of a card should be between ${healthLower} and ${healthUpper} health.  
          The attack should be between ${attackLower} and ${attackUpper} attack.  
          If a card has high health, then they should have relatively low attack and visa versa.
          The boss's health should be ${bossHealth}. The boss's attack should be ${Math.floor(healthUpper*.8)}.
          Please remember to ONLY return the JSON, no other text or content, only JSON.  
          
          card template: ${JSON.stringify(new CardTemplate())}`,
        },
        {
          role: 'user',
          content: `Theme: ${prompt}`,
        },
      ],
      model: 'gpt-4-1106-preview',
      temperature:0.1,

    };
    
    console.log('sending params');
    
    const response: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create(params);
    
    console.log('got params');
    const jsonStr: string = response.choices[0].message.content!;
    const parsedJson = jsonStr.replace("```json", "").replace("```", "");
    console.log(parsedJson);
    return JSON.parse(parsedJson);
    
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
