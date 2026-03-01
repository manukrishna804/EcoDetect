from ultralytics import YOLO
import os

def convert():
    # Use absolute path relative to this script
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "best.pt")
    
    if not os.path.exists(model_path):
        print(f"Error: {model_path} not found.")
        return

    print(f"Loading {model_path} for conversion...")
    model = YOLO(model_path)

    # Export to ONNX
    # format='onnx' creates a model that is much lighter for production
    print("Exporting to ONNX format...")
    path = model.export(format='onnx') 
    
    print(f"Success! Model exported to: {path}")
    print("In production, you can now use 'onnxruntime' instead of the full 'ultralytics' library to save RAM.")

if __name__ == "__main__":
    convert()
