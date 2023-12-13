import OpenAI from 'openai';
import { Theme } from '../web/src/mechanics/Theme';

class GeneratedTheme {
    theme: string = "";
}
class ThemeGenerator {
  private OPEN_AI_KEY: string | undefined = process.env.OPEN_AI_KEY;
 
  public async getGeneratedTheme(themes: Theme[], useLocal: boolean): Promise<GeneratedTheme> {
    const openai = new OpenAI({
        apiKey: this.OPEN_AI_KEY,
    });
        
    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      messages: [
        {
          role: 'user',
          content: useLocal ? 
          `Pick return in the "theme' json property the name of Star Wars, Marvel, or DC Comics movie.  Things like Harry Potter, Iron Man, Avengers, Batman.
          Even though it's called "theme", don't describe it, return the name of the movie in the theme property.
          Please only return JSON.  The format should be ${JSON.stringify(new GeneratedTheme())}.  Make sure it doesn't already exist
          in  this list: ${themes.map(t => t.prompt)}
          Please remember to only return JSON.`
          :
           `Create a theme for a fun, slightly edgy card game, using well-known pop culture franchises from the last 30 years as references. 
          Please provide specific combinations where one part is a direct reference to a popular sci-fi or fantasy franchises (excluding zombies). 
          Each part should be a singular item or concept on its own. 
          However, when paired together, they should form a humorous and engaging theme for the game. 
          Please only return JSON.  The format should be ${JSON.stringify(new GeneratedTheme())}.
          In this JSON, the "theme" should be similar but not the same reference as ${themes.map(t => t.prompt)}.
          Please remember to only return JSON.`
        },
      ],
      model: 'gpt-4-1106-preview',
      temperature:0.9,
    };
    const response: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create(params);
    const jsonStr: string = response.choices[0].message.content!;
    const parsedJson = jsonStr.replace("```json", "").replace("```", "");
    console.log(parsedJson);
    return JSON.parse(parsedJson);
  }
}

/* SAVE
 content: `Create a theme for a fun, slightly edgy card game, using well-known pop culture franchises from the last 30 years as references. 
          Please provide specific combinations where one part is a direct reference to a popular sci-fi or fantasy franchises (excluding zombies). 
          Each part should be a singular item or concept on its own. 
          However, when paired together, they should form a humorous and engaging theme for the game. 
          Please only return JSON.  The format should be ${JSON.stringify(new GeneratedTheme())}.
          In this JSON, the "theme" should be similar but not the same reference as ${themes.map(t => t.prompt)}.
          Please remember to only return JSON.`
*/


export default ThemeGenerator;
