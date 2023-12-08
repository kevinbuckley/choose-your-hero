import OpenAI from 'openai';
import { Theme } from '../web/src/mechanics/Theme';

class GeneratedTheme {
    theme: string = "";
    modifier: string = "";
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
          content: `Generate a theme and modifier for a fun and silly card game.
          The theme and modifier should be singlur items on their own but when combined form a funny and engaging theme for the game.
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
