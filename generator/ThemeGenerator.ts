import axios from 'axios';
import runmModel from './LocalLLM'

class ThemeGenerator {

  checkCommonWords(themes: string[], newTheme: string) {
    // Split the sentences into words
    let words1 = newTheme.toLowerCase().split(' ');
    let set1 = new Set(words1);
      
    for(let theme in themes) {
      let words2 = theme.toLowerCase().split(' ');
      let set2 = new Set(words2);

      // Count the common words
      let commonWords = 0;
      for (let word of set1) {
          if (set2.has(word)) {
              commonWords++;
          }
      }

      // Return true if at least 2 words are the same
      if(commonWords >= 2) {
        console.log(`theme ${theme} matched ${newTheme}`)
        return true;
      }
    }
    return false;
  }


  async generateTheme(themes: string[]): Promise<string> {
    
    let theme = themes[0];
    while(this.checkCommonWords(themes, theme)) {

      const prompt =  `###Instructions###  
            Create a single funny theme for a pop-culture card game.  The theme must be of 1 serious, well known thing AS another silly thing.
            The theme is funny because a person would never expect the serious thing to be the silly thing. 
            You must be creative and original and not copy an example theme.
            You MUST only return a theme name with under 6 words in it. 
            You MUST only return the name of the theme with no explanation. 
            You will be penalized if you include wizards, pirates, zombies, or nazis. 
            You will be penalized if you return anything but the theme name.
            You will be penalized if you return a theme name that is more than 5 words.
            You will be penalized if you return the theme ${theme}
    
            ###EXAMPLE###
            Beauty and the Beast as ninjas
            Scientists as Pro Wrestlers
            Celebrities as Superheroes
            Historical Figures as Baristas`;

      theme = await runmModel(prompt);
      theme = theme?.split('\n').pop() ?? '';
      theme = theme.replace(/[^a-zA-Z ]/g, '');
      console.log("Trying theme: " + theme);
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