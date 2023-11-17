import axios from 'axios';
import path from 'path';
import OpenAI from 'openai';
//import { ICard } from '../web/src/mechanics/Card';


class MechanicsGenerator {
  private OPEN_AI_KEY: string | undefined = process.env.OPEN_AI_KEY;

  private cardTemplate = {
    name: 'MyCard',
    attack: 5,
    health: 10,
    isBoss: false,
  };

  public async getJsonAsDictionary(prompt: string): Promise<any> {
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
              The health of a card should be between 9 and 19 health.  
              The attack should be between 3 and 8.  
              The boss's health should be 500. 
              Please remember to ONLY return the JSON, no other text or content, only JSON.  
              
              card template: ${JSON.stringify(this.cardTemplate)}`,
            },
            {
              role: 'user',
              content: `Theme: ${prompt}`,
            },
          ],
        model: 'gpt-4-0613',
        temperature:0.1
      };
      const response: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create(params);
    
    const jsonStr: string = response.choices[0].message.content!;
    return JSON.parse(jsonStr);
  }
}

export default MechanicsGenerator;
