import OpenAI from 'openai';
import { Theme } from '../web/src/mechanics/Theme';

class GeneratedTheme {
    theme: string = "";
}
class ThemeGenerator {
  private OPEN_AI_KEY: string | undefined = process.env.OPEN_AI_KEY;
 
  public async getGeneratedTheme(themes: Theme[]): Promise<GeneratedTheme> {
    const openai = new OpenAI({
        apiKey: this.OPEN_AI_KEY,
    });
        
    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      messages: [
        {
          role: 'user',
          content: `Create a theme for a fun, slightly edgy card game, using well-known pop culture franchises from the last 30 years as references. 
          Please provide specific combinations where one part is a direct reference to a popular franchise such as Harry Potter, Star Wars, or Marvel superheroes (excluding zombies). 
          Each part should be a singular item or concept on its own. 
          However, when paired together, they should form a humorous and engaging theme for the game. 
          For example, combine a distinct element from Harry Potter with another unrelated, amusing concept to create a unique and funny theme.
          Please only return JSON.  The format should be ${JSON.stringify(new GeneratedTheme())}.
          In this JSON, the "theme" should be in the same vein as previous themes including ${themes.map(t => t.prompt)}.
          Please remember to only return JSON.`,
        },
      ],
      model: 'gpt-4-1106-preview',
      temperature:0.1,

    };
        
    const response: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create(params);
    const jsonStr: string = response.choices[0].message.content!;
    const parsedJson = jsonStr.replace("```json", "").replace("```", "");
    console.log(parsedJson);
    return JSON.parse(parsedJson);
  }
}


export default ThemeGenerator;
