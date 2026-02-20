try:
    from google import genai
    print("Successfully imported genai from google")
    print(f"genai dir: {dir(genai)}")
    if hasattr(genai, 'types'):
        print("genai.types exists")
        print(f"genai.types dir: {dir(genai.types)}")
        if hasattr(genai.types, 'GenerateContentConfig'):
            print("genai.types.GenerateContentConfig FOUND")
        else:
            print("genai.types.GenerateContentConfig NOT FOUND")
    else:
        print("genai.types DOES NOT EXIST")
except ImportError as e:
    print(f"ImportError: {e}")
except Exception as e:
    print(f"Error: {e}")
