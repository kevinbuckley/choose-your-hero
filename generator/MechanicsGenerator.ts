import OpenAI from 'openai';


class MechanicsGenerator {
  private OPEN_AI_KEY: string | undefined = process.env.OPEN_AI_KEY;

  private cardTemplate = {
    name: 'MyCard',
    attack: 5,
    health: 10,
    isBoss: false,
  };

  public async getJsonAsDictionary(prompt: string): Promise<any> {
    console.log('getJsonAsDictionary 1');
    const openai = new OpenAI({
        apiKey: this.OPEN_AI_KEY,
    });
    
    console.log('getJsonAsDictionary 2');
    
    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      messages: [
        {
          role: 'system',
          content: `You are a game developer creating a new card game. You'll be returning only the JSON required to define
          each card in the deck.  There will be 10 player cards and 1 boss enemy card. 
          You'll be given a theme and will create cards for the player and 1 boss card enemy that follow that theme. 
          The health of a card should be between 12 and 19 health.  
          The attack should be between 7 and 16 attack.  
          The boss's health should be 500. 
          Please remember to ONLY return the JSON, no other text or content, only JSON.  
          
          card template: ${JSON.stringify(this.cardTemplate)}`,
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
}

export default MechanicsGenerator;
