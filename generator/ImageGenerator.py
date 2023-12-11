import argparse
from diffusers import AutoPipelineForText2Image, DiffusionPipeline
import torch
import datetime
import os
import time

class ImageGenerator:
    def __init__(self, name, theme, file_save_name):
        self.name = name
        self.theme = theme
        self.file_save_name = file_save_name
        self.device = torch.device("mps")  # Metal device
        self.pipe = AutoPipelineForText2Image.from_pretrained("stabilityai/sdxl-turbo", torch_dtype=torch.float32 , variant="fp16")
        self.pipe.to(self.device)

    def generate_image(self):
        prompt = f'''
        Portrait of ({self.name}) in a {self.theme} theme. High Quality, zoomed in (perfect face: 1. 1).
        Extremely detailed eyes and face.
        '''

        image = self.pipe(prompt=prompt, num_inference_steps=50, strength=0.5, guidance_scale=10.0).images[0]

        #refiner = DiffusionPipeline.from_pretrained(
        #    "stabilityai/stable-diffusion-xl-refiner-1.0",
        #    text_encoder_2=self.pipe.text_encoder_2,
        #    vae=self.pipe.vae,
        #    torch_dtype=torch.float32,
        #    use_safetensors=True,
        #    variant="fp16",
        #    local_files_only=True
        #)
        image.save(self.file_save_name)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Generate an image.')
    parser.add_argument('--name', type=str, required=True)
    parser.add_argument('--theme', type=str, required=True)
    parser.add_argument('--file_save_name', type=str, required=True)

    args = parser.parse_args()

    start_time = time.time()

    generator = ImageGenerator(args.name, args.theme, args.file_save_name)
    generator.generate_image()
    end_time = time.time()
    print(f"Time taken: {end_time - start_time} seconds")