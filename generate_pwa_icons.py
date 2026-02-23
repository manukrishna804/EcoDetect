from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename, color="#2ecc71"):
    # Create a square image with the theme color
    image = Image.new("RGBA", (size, size), color)
    draw = ImageDraw.Draw(image)
    
    # Try to draw a simple 'E' in the center
    try:
        # Simplified 'E' drawing or just a white circle for now if fonts are tricky
        margin = size // 4
        draw.ellipse([margin, margin, size - margin, size - margin], outline="white", width=size//20)
        # Draw a leaf-like shape (simplified)
        draw.polygon([(size//2, margin), (size-margin, size//2), (size//2, size-margin), (margin, size//2)], fill="white")
    except Exception as e:
        print(f"Drawing error: {e}")

    image.save(filename)
    print(f"Saved {filename}")

# Ensure directory exists
public_path = r"d:\MINI PROJ main\EcoDetect\frontend\public"
os.makedirs(public_path, exist_ok=True)

create_icon(192, os.path.join(public_path, "pwa-192x192.png"))
create_icon(512, os.path.join(public_path, "pwa-512x512.png"))
create_icon(512, os.path.join(public_path, "maskable-icon.png"), color="#16a34a") # Darker green for maskable
