from imagegenerator import ImageGenerator
from dotenv import load_dotenv
import asyncio

import json


async def main():
    game_file = get_game_file()
    await generate_images(game_file)


def get_game_file():
    with open('default_game_file.json', 'r') as f:
        data = json.load(f)
        return data


async def generate_images(game_file):
    gen = ImageGenerator()

    tasks = []
    for card in game_file['deck']:
        name = card['name']
        p1 = f"Magestic and fantasy looking {name}.  To be used in a card game following the style of Hearthstone."
        tasks.append(gen.get_image(p1, "game", name))

    results = await asyncio.gather(*tasks)


if __name__ == "__main__":
    load_dotenv()
    asyncio.run(main())
