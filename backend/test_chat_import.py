try:
    from routes.chat import chat_bp
    print("Successfully imported chat_bp")
except Exception as e:
    import traceback
    traceback.print_exc()
