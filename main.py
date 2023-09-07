import requests
import time
import os

url_base = "https://cloud.leonardo.ai/api/rest/v1/"

LEONARDO_API_KEY = os.environ.get('LEONARDO_API_KEY')


def post(payload, url):
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": f"bearer {LEONARDO_API_KEY}"
    }
    response = requests.post(
        f"{url_base}/{url}", json=payload, headers=headers)
    return response.json()


def get(url):
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": f"bearer {LEONARDO_API_KEY}"
    }
    response = requests.get(f"{url_base}/{url}", headers=headers)
    return response.json()


def poll_download(generationId):
    while True:
        response = get(f"generations/{generationId}")
        image = response["generations_by_pk"]["generated_images"]
        print('polling for image')
        if len(image) > 0:
            image_response = requests.get(image[0]["url"])
            if image_response.status_code == 200:
                with open("./image.png", 'wb') as f:
                    f.write(image_response.content)
            else:
                print(
                    f"Failed to download image. HTTP Status Code: {response.status_code}")

            return
        else:
            time.sleep(1)  # sleep for one second

            # do nothing


def get_image(prompt):
    payload = {
        "prompt": prompt,
        "negative_prompt": "",
        "modelId": "ac614f96-1082-45bf-be9d-757f2d31c174",  # dream shaper
        "sd_version": "v1_5",
        "num_images": 1,
        "width": 512,
        "height": 512,
        "num_inference_steps": None,
        "guidance_scale": 7,
        "scheduler": "LEONARDO",
        "presetStyle": "LEONARDO",
        "tiling": False,
        "public": True,
        "promptMagic": True,
        "promptMagicVersion": "v2",
        "highContrast": True,
    }
    # create image
    response = post(payload, "generations")
    generationId = response["sdGenerationJob"]["generationId"]
    poll_download(generationId)


p1 = "Magestic looking bullfrog with crimson fur.  To be used in a card game following the style of Hearthstone."
get_image(p1)
