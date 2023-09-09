from imagegenerator import ImageGenerator
from dotenv import load_dotenv

load_dotenv()


def main():
    gen = ImageGenerator()
    p1 = "Magestic looking bullfrog with crimson fur.  To be used in a card game following the style of Hearthstone."
    gen.get_image(p1, "animals", "bullfrog")


if __name__ == "__main__":
    load_dotenv()
    main()
