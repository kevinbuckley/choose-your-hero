import argparse
from diffusers import StableDiffusionXLPipeline, UNet2DConditionModel, EulerDiscreteScheduler
import torch
from typing import List
import random
import time

from huggingface_hub import hf_hub_download
from safetensors.torch import load_file


class ImageGenerator:

    def __init__(self, name, theme, style, file_save_name):
        self.name = name
        self.theme = theme
        self.file_save_name = file_save_name
        self.style = style
        self.device = torch.device("mps")  # Metal device
        #self.pipe = AutoPipelineForText2Image.from_pretrained("ByteDance/SDXL-Lightning", torch_dtype=torch.float16 , variant="fp16")
        #self.pipe = AutoPipelineForText2Image.from_pretrained("runwayml/stable-diffusion-v1-5", torch_dtype=torch.float16 , variant="fp16")
        #self.pipe.to(self.device)
    def generate_image(self):
        
        prompt = f'''
        A centered single {self.style} picture of the character ({self.name}) in the theme of [{self.theme}].
        Extremely detailed eyes and face but whole body is visible and very realistic.
        Only {self.name}, nothing else in the picture.
        '''
        
#        image = self.pipe(prompt=prompt, 
#                         # negative_prompt="ugly, deformed, disfigured, poor details, bad anatomy, blurry eyes",
#                          num_inference_steps=2, 
#                          strength=0.5, 
#                          guidance_scale=0.0).images[0]

       
        base = "stabilityai/stable-diffusion-xl-base-1.0"
        repo = "ByteDance/SDXL-Lightning"
        ckpt = "sdxl_lightning_4step_unet.safetensors" # Use the correct ckpt for your step setting!

        # Load model.
        unet = UNet2DConditionModel.from_config(base, subfolder="unet").to("mps", torch.float16)
        unet.load_state_dict(load_file(hf_hub_download(repo, ckpt), device="mps"))
        pipe = StableDiffusionXLPipeline.from_pretrained(base, unet=unet, torch_dtype=torch.float16, variant="fp16").to("mps")

        # Ensure sampler uses "trailing" timesteps.
        pipe.scheduler = EulerDiscreteScheduler.from_config(pipe.scheduler.config, timestep_spacing="trailing")

        # Ensure using the same inference steps as the loaded model and CFG set to 0.
        pipe(prompt, num_inference_steps=4, guidance_scale=0).images[0].save(self.file_save_name)


        #print(f'Image Name: {self.file_save_name}')
        #image.save(self.file_save_name)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Generate an image.')
    parser.add_argument('--name', type=str, required=True)
    parser.add_argument('--theme', type=str, required=True)
    parser.add_argument('--style', type=str, required=True)
    parser.add_argument('--file_save_name', type=str, required=True)
    
    args = parser.parse_args()

    start_time = time.time()

    generator = ImageGenerator(args.name, args.theme, args.style, args.file_save_name)
    generator.generate_image()
    end_time = time.time()
    print(f"Time taken: {end_time - start_time} seconds")