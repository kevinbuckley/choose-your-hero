from imagegenerator import ImageGenerator
from dotenv import load_dotenv
import asyncio


async def main():
    gen = ImageGenerator()
    animals = ['praying mantis', 'lynx', 'hippo',
               'giraffe', 'panda', 'baby goat', 'sloth']

    tasks = []
    for animal in animals:
        p1 = f"Magestic and fantasy looking {animal}.  To be used in a card game following the style of Hearthstone."
        tasks.append(gen.get_image(p1, "animals", animal))

    results = await asyncio.gather(*tasks)

if __name__ == "__main__":
    load_dotenv()
    asyncio.run(main())
