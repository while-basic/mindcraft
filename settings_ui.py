import gradio as gr
import json
import re

def load_settings():
    try:
        with open('settings.js', 'r') as f:
            content = f.read()
            json_str = content.replace('export default', '').strip()
            json_str = re.sub(r'//.*?\n|/\*.*?\*/', '\n', json_str, flags=re.DOTALL)
            json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)
            json_str = '\n'.join(line for line in json_str.split('\n') if line.strip())
            return json.loads(json_str)
    except Exception as e:
        print(f"Error loading settings: {e}")
        return {}

def save_settings(minecraft_version, host, port, auth, base_profile, init_message):
    try:
        current_settings = load_settings()
        
        # Update only the fields we're managing
        new_settings = {
            "minecraft_version": minecraft_version,
            "host": host,
            "port": int(port),
            "auth": auth,
            "base_profile": base_profile,
            "init_message": init_message
        }
        current_settings.update(new_settings)
        
        # Format with comments
        settings_text = f"""export default 
{{
    "minecraft_version": "{minecraft_version}", // supports up to 1.21.1
    "host": "{host}", // or "localhost", "your.ip.address.here"
    "port": {port},
    "auth": "{auth}", // or "microsoft"

    // the mindserver manages all agents and hosts the UI
    "host_mindserver": {json.dumps(current_settings.get("host_mindserver", True))},
    "mindserver_host": "{current_settings.get("mindserver_host", "localhost")}",
    "mindserver_port": {current_settings.get("mindserver_port", 8080)},
    
    "base_profile": "{base_profile}",
    "profiles": ["./andy.json"],
    "load_memory": {json.dumps(current_settings.get("load_memory", False))},
    "init_message": "{init_message}",
    "only_chat_with": [],
    
    "language": "{current_settings.get("language", "en")}",
    "show_bot_views": {json.dumps(current_settings.get("show_bot_views", False))},
    "allow_insecure_coding": {json.dumps(current_settings.get("allow_insecure_coding", True))},
    "code_timeout_mins": {current_settings.get("code_timeout_mins", -1)},
    "relevant_docs_count": {current_settings.get("relevant_docs_count", 5)},

    "max_messages": {current_settings.get("max_messages", 15)},
    "num_examples": {current_settings.get("num_examples", 2)},
    "max_commands": {current_settings.get("max_commands", -1)},
    "verbose_commands": {json.dumps(current_settings.get("verbose_commands", True))},
    "narrate_behavior": {json.dumps(current_settings.get("narrate_behavior", True))},
    "chat_bot_messages": {json.dumps(current_settings.get("chat_bot_messages", True))}
}}"""
        
        with open('settings.js', 'w') as f:
            f.write(settings_text)
        return "✅ Settings saved successfully!"
    except Exception as e:
        return f"❌ Error: {str(e)}"

def create_ui():
    settings = load_settings()
    
    return gr.Interface(
        fn=save_settings,
        inputs=[
            gr.Dropdown(
                choices=["1.20.4", "1.21.1"],
                value=settings.get("minecraft_version", "1.20.4"),
                label="Minecraft Version"
            ),
            gr.Textbox(
                value=settings.get("host", "127.0.0.1"),
                label="Host"
            ),
            gr.Number(
                value=settings.get("port", 55916),
                label="Port"
            ),
            gr.Radio(
                choices=["offline", "microsoft"],
                value=settings.get("auth", "offline"),
                label="Authentication"
            ),
            gr.Dropdown(
                choices=["./profiles/defaults/survival.json", "./profiles/defaults/creative.json"],
                value=settings.get("base_profile", "./profiles/defaults/survival.json"),
                label="Base Profile"
            ),
            gr.Textbox(
                value=settings.get("init_message", ""),
                label="Init Message"
            )
        ],
        outputs=gr.Textbox(label="Status"),
        title="🎮 Mindcraft Settings",
        description="Configure your Mindcraft server settings"
    )

if __name__ == "__main__":
    demo = create_ui()
    
    # Try different ports
    for port in range(7860, 7960):
        try:
            print(f"Starting server on port {port}...")
            demo.launch(
                server_name="127.0.0.1",
                server_port=port,
                share=False
            )
            break
        except OSError:
            continue
        except Exception as e:
            print(f"Error starting server: {e}")
            break
