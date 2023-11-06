import axios from 'axios';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { ICard } from '../web/src/mechanics/Card';

const urlBase = 'https://cloud.leonardo.ai/api/rest/v1/';



class MechanicsGenerator {
  private OPEN_AI_KEY: string | undefined = process.env.OPEN_AI_KEY;

  private cardTemplate: ICard = {
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
              each card in the deck.  There will be 10 player cards and 1 boss enemy card.  The health of a 
              card should be between 9 and 21 health.  You'll be given a theme and will create cards for the player
              and 1 boss card enemy that follow that theme.  The boss's relative power to the player cards should 
              result in the boss losing 10% of it's life after fighting 5 player cards concurrently. 
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
    fs.writeFileSync('game_file.json', jsonStr);
    return JSON.parse(jsonStr);
  }
}

export default MechanicsGenerator;