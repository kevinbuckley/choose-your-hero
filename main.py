from jsongenerator import JsonGenerator
import json
import asyncio
from imagegenerator import ImageGenerator
from dotenv import load_dotenv
load_dotenv()


async def main():
    jsonGen = JsonGenerator()
    game_file = jsonGen.get_json_as_dictionary(
        "the star wars universe")

   # semaphore = asyncio.Semaphore(5)
   # await generate_images(game_file, semaphore)


async def generate_images(game_file, semaphore):
    gen = ImageGenerator()
    tasks = []
    for card in game_file:
        name = card['name']
        p1 = f"Magestic and fantasy looking {name}.  To be used in a card game following the style of Hearthstone."
        tasks.append(gen.get_image(p1, "game", name, semaphore))

    await asyncio.gather(*tasks)


if __name__ == "__main__":
    asyncio.run(main())
