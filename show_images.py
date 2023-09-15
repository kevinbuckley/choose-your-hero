import os
import matplotlib.pyplot as plt
from PIL import Image
import math

# Read PNG files from a directory
directory = "./game"  # Replace with your directory path
image_files = [f for f in os.listdir(directory) if f.endswith('.png')]

# Calculate grid size
grid_size = math.ceil(math.sqrt(len(image_files)))

# Initialize matplotlib grid
fig, axes = plt.subplots(grid_size, grid_size, figsize=(12, 12))

# Flatten the grid array for easy iteration
axes_flat = axes.flatten()

# Load and display images
for ax, img_name in zip(axes_flat, image_files):
    img_path = os.path.join(directory, img_name)
    img = Image.open(img_path)
    ax.imshow(img)
    ax.axis('off')
    ax.set_title(img_name)

# Hide any remaining empty subplots
for ax in axes_flat[len(image_files):]:
    ax.axis('off')

plt.show()
