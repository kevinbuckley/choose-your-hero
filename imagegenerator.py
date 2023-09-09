import requests
import time
import os
import asyncio

url_base = "https://cloud.leonardo.ai/api/rest/v1/"


class ImageGenerator:

    def __init__(self):
        self.LEONARDO_API_KEY = os.environ.get('LEONARDO_API_KEY')

    async def post(self, payload, url):
        headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": f"bearer {self.LEONARDO_API_KEY}"
        }
        response = requests.post(
            f"{url_base}/{url}", json=payload, headers=headers)
        return response.json()

    async def get(self, url):
        headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": f"bearer {self.LEONARDO_API_KEY}"
        }
        response = requests.get(f"{url_base}/{url}", headers=headers)
        return response.json()

    async def poll_download(self, generationId, folder, image_name):
        while True:
            response = await self.get(f"generations/{generationId}")
            image = response["generations_by_pk"]["generated_images"]
            print(f'polling for image {image_name}')
            if len(image) > 0:
                image_response = requests.get(image[0]["url"])
                if image_response.status_code == 200:
                    if not os.path.exists(folder):
                        os.makedirs(folder)
                    with open(f"./{folder}/{image_name}.png", 'wb') as f:
                        f.write(image_response.content)
                else:
                    print(
                        f"Failed to download image. HTTP Status Code: {response.status_code}")

                return
            else:
                await asyncio.sleep(1)

                # do nothing

    async def get_image(self, prompt, folder, image_name, semaphore):
        async with semaphore:
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
            response = await self.post(payload, "generations")
            if "sdGenerationJob" in response:
                generationId = response["sdGenerationJob"]["generationId"]
                await self.poll_download(generationId, folder, image_name)
            else:
                print(
                    f"Failed generation for {image_name} with error: {response}")
