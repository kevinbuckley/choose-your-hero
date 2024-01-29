import axios from 'axios';
import runmModel from './LocalLLM'

class ThemeGenerator {

  async generateTheme(themes: string[]): Promise<string> {
    
    let theme = themes[0];
      while(themes.includes(theme)) {

      const prompt =  `###Instructions### 
            Create a single theme for a pop-culture card game.  The theme must be of 1 serious than AS another silly thing. 
            For example, Mathemeticians as Pro Wrestlers.
            You must be creative and original and not copy an example theme.
            You MUST only return a theme name with under 5 words in it. 
            You MUST only return the name of the theme with no explanation. 
            You will be penalized if you include wizards or pirates or zombies. 
            You will be penalized if you return anything but the theme name.
            You will be penalized if you return a theme name that is more than 5 words.

            ### Response:\nOkay, here is a theme for a fun and slightly edgy card game:\n\n

            ###EXAMPLE###
            Physists and Mathematicians as Pro Wrestlers
            Chrismas Ziggy Stardust
            Beauty and the Beast as ninjas
            Weightlifting My Little Ponies`;

      theme = await runmModel(prompt);
      theme = theme?.split('\n').pop() ?? '';
      theme = theme.replace(/[^a-zA-Z ]/g, '');
    }
    return theme.replace(/"/g, '');
  }

  validTheme(theme: string, themes: string[]): boolean {
    if (theme.length == 0 || 
      theme.length > 100 ||
      themes.includes(theme)) {
      return false;
    }
    return true;
  }
}
export default ThemeGenerator;

if (require.main === module) {
  (async () => {
    const movieTitles = [
      '1980s Rock Stars',
      'Alien Gladiators Hosting a Galactic Game Show',
      'Animal Monarchs',
      'Avengers: Endgame',
      'Avengers: Infinity War',
      'Beauty and the Beast as ninjas',
      'Captain America: The First Avenger',
      'Chrismas Ziggy Stardust',
      'Cyberpunk',
      'Cyborg Wizards Competing in an Intergalactic Skateboarding Contest',
      'Dinosaur Chefs',
      'Doctor Strange',
      'Famous Classical Composer Cats',
      'Famous Viking',
      'Guardians of the Galaxy',
      'Harry Potter and the Chamber of Secrets',
      'Harry Potter and the Goblet of Fire',
      'Harry Potter and the Prisoner of Azkaban',
      "Harry Potter and the Sorcerer's Stone",
      'Large Birds Football Players',
      'Man of Steel',
      'Medieval War',
      'Mutant Celebrity Chefs in an Underground Cooking Tournament',
      'Physicists and Mathematicians as Pro Wrestlers',
      'Pirate Penguins Running a Space Station',
      'Pop Star Fairtale Villains',
      'Punk Rock Muppets',
      'Spider-Man: Into the Spider-Verse',
      'Spy Animals in a High-Stakes Heist Movie',
      'Star Wars: A New Hope',
      'Star Wars: Revenge of the Sith',
      'Star Wars: The Empire Strikes Back',
      'Star Wars: The Force Awakens',
      'Star Wars: The Last Jedi',
      'Superhero Baristas Brewing Cosmic Coffee',
      'Swol My Little Ponies',
      'The Dark Knight',
      'The Dark Knight Rises',
      'The Hobbit: An Unexpected Journey',
      'The Lord of the Rings: The Fellowship of the Ring',
      'The Matrix',
      'Thor: Ragnarok',
      'Thor: The Dark World',
      'Time-Traveling Wizards in a Battle of the Bands',
      'Woodland Creatures',
      'Sci-Fi Witches'
    ];
    
    const themeGenerator = new ThemeGenerator();
    const output = await themeGenerator.generateTheme(movieTitles);
    console.log(output);
  })();
}