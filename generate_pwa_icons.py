from PIL import Image, ImageDraw
import os

def draw_logo(draw, size, colors):
    """Draws a modern leaf + scanner logo."""
    center = size // 2
    margin = size // 10
    
    # 1. Background (Optional, here transparent)
    
    # 2. Scanner Ring (Circular)
    ring_width = size // 20
    draw.ellipse(
        [margin, margin, size - margin, size - margin],
        outline=colors['primary'],
        width=ring_width
    )
    
    # 3. Leaf Shape (Stylized)
    # Main leaf body
    leaf_margin = size // 4
    leaf_coords = [
        (center, leaf_margin), # Top
        (size - leaf_margin, center), # Right
        (center, size - leaf_margin), # Bottom
        (leaf_margin, center) # Left
    ]
    
    # Draw a leaf using two arcs/curves simulation
    # Let's use a simpler but elegant petal shape
    draw.chord(
        [leaf_margin, leaf_margin, size - leaf_margin, size - leaf_margin],
        start=45, end=225,
        fill=colors['primary']
    )
    draw.chord(
        [leaf_margin, leaf_margin, size - leaf_margin, size - leaf_margin],
        start=225, end=45,
        fill=colors['secondary']
    )
    
    # Central vein
    draw.line(
        [(center, leaf_margin), (center, size - leaf_margin)],
        fill="white",
        width=size // 40
    )

def create_pwa_assets(public_path):
    colors = {
        'primary': '#2ecc71',
        'secondary': '#16a34a',
        'bg': '#ffffff'
    }
    
    # Icon sizes and names
    icons = [
        (192, "pwa-192x192.png", 0),
        (512, "pwa-512x512.png", 0),
        (512, "maskable-icon.png", 40), # Extra padding for maskable
        (180, "apple-touch-icon.png", 10)
    ]
    
    for size, name, padding in icons:
        # Create image with transparent background
        img = Image.new("RGBA", (size, size), (255, 255, 255, 0))
        draw = ImageDraw.Draw(img)
        
        # If it's maskable, it usually needs a solid background
        if "maskable" in name:
            draw.rectangle([0, 0, size, size], fill=colors['primary'])
            # Draw a white version of logo on green background
            draw_logo_color(draw, size, {'primary': 'white', 'secondary': '#d1fae5'})
        else:
            draw_logo_color(draw, size, colors)
            
        filename = os.path.join(public_path, name)
        img.save(filename)
        print(f"Generated {filename}")

def draw_logo_color(draw, size, colors):
    center = size // 2
    margin = size // 6
    # Outer ring
    draw.ellipse([margin, margin, size - margin, size - margin], outline=colors['primary'], width=size//25)
    
    # Stylized Leaf
    leaf_box = [center - size//4, center - size//4, center + size//4, center + size//4]
    draw.pieslice(leaf_box, start=135, end=315, fill=colors['primary'])
    draw.pieslice(leaf_box, start=315, end=135, fill=colors['secondary'])
    
    # Central vein
    draw.line([center, center - size//4, center, center + size//4], fill="white", width=size//50)

# Execution
base_dir = r"d:\MINI PROJ main\EcoDetect"
public_path = os.path.join(base_dir, "frontend", "public")
os.makedirs(public_path, exist_ok=True)

create_pwa_assets(public_path)
