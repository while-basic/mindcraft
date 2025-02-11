import gradio as gr
import json
import re
import os
from pathlib import Path

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

def load_profile(profile_path):
    try:
        with open(profile_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading profile: {e}")
        return {}

def save_profile(name, model, embedding, conversing, coding, saving_memory, modes, npc_settings):
    try:
        profile_data = {
            "name": name,
            "model": model,
            "embedding": embedding,
            "conversing": conversing,
            "coding": coding,
            "saving_memory": saving_memory,
            "modes": json.loads(modes),
            "npc": json.loads(npc_settings)
        }
        
        profile_path = os.path.join("profiles", f"{name}.json")
        with open(profile_path, 'w') as f:
            json.dump(profile_data, f, indent=4)
        return f"✅ Profile {name} saved successfully!"
    except Exception as e:
        return f"❌ Error saving profile: {str(e)}"

def save_settings(minecraft_version, host, port, auth, base_profile, init_message):
    try:
        current_settings = load_settings()
        
        new_settings = {
            "minecraft_version": minecraft_version,
            "host": host,
            "port": int(port),
            "auth": auth,
            "base_profile": base_profile,
            "init_message": init_message
        }
        current_settings.update(new_settings)
        
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

def list_profiles():
    profiles_dir = Path("profiles")
    if not profiles_dir.exists():
        return []
    return [f.stem for f in profiles_dir.glob("*.json")]

def load_profile_for_editing(profile_name):
    if not profile_name:
        return ["", "", "", "", "", "{}", "{}"]
    
    profile_path = os.path.join("profiles", f"{profile_name}.json")
    profile = load_profile(profile_path)
    
    return [
        profile.get("model", ""),
        profile.get("embedding", ""),
        profile.get("conversing", ""),
        profile.get("coding", ""),
        profile.get("saving_memory", ""),
        json.dumps(profile.get("modes", {}), indent=2),
        json.dumps(profile.get("npc", {}), indent=2)
    ]

def create_ui():
    settings = load_settings()
    
    with gr.Blocks(title="🎮 Mindcraft Settings") as demo:
        gr.Markdown("# 🎮 Mindcraft Settings")
        
        with gr.Tab("Server Settings"):
            minecraft_version = gr.Dropdown(
                choices=["1.20.4", "1.21.1"],
                value=settings.get("minecraft_version", "1.20.4"),
                label="Minecraft Version"
            )
            host = gr.Textbox(
                value=settings.get("host", "127.0.0.1"),
                label="Host"
            )
            port = gr.Number(
                value=settings.get("port", 55916),
                label="Port"
            )
            auth = gr.Radio(
                choices=["offline", "microsoft"],
                value=settings.get("auth", "offline"),
                label="Authentication"
            )
            base_profile = gr.Dropdown(
                choices=["./profiles/defaults/survival.json", "./profiles/defaults/creative.json"],
                value=settings.get("base_profile", "./profiles/defaults/survival.json"),
                label="Base Profile"
            )
            init_message = gr.Textbox(
                value=settings.get("init_message", ""),
                label="Init Message"
            )
            server_status = gr.Textbox(label="Status")
            save_server = gr.Button("💾 Save Server Settings")
            
            save_server.click(
                fn=save_settings,
                inputs=[minecraft_version, host, port, auth, base_profile, init_message],
                outputs=server_status
            )
        
        with gr.Tab("Profile Manager"):
            with gr.Row():
                profile_list = gr.Dropdown(
                    choices=list_profiles(),
                    label="Select Profile",
                    value=None
                )
                profile_name = gr.Textbox(
                    label="Profile Name",
                    placeholder="Enter new profile name"
                )
            
            with gr.Column():
                model = gr.Dropdown(
                    choices=["claude-3-5-sonnet-20240620", "gpt-4-turbo-preview", "gpt-3.5-turbo"],
                    label="Model"
                )
                embedding = gr.Dropdown(
                    choices=["openai", "local"],
                    label="Embedding"
                )
                conversing = gr.TextArea(
                    label="Conversing Prompt",
                    lines=5
                )
                coding = gr.TextArea(
                    label="Coding Prompt",
                    lines=5
                )
                saving_memory = gr.TextArea(
                    label="Memory Saving Prompt",
                    lines=5
                )
                modes = gr.TextArea(
                    label="Modes (JSON)",
                    lines=10,
                    value=json.dumps({
                        "self_preservation": True,
                        "unstuck": True,
                        "cowardice": True,
                        "self_defense": True,
                        "hunting": True,
                        "item_collecting": True,
                        "torch_placing": True,
                        "idle_staring": True,
                        "cheat": False
                    }, indent=2)
                )
                npc_settings = gr.TextArea(
                    label="NPC Settings (JSON)",
                    lines=10,
                    value=json.dumps({
                        "do_routine": True,
                        "do_set_goal": True,
                        "goals": [
                            "wooden_pickaxe",
                            "dirt_shelter",
                            "stone_pickaxe",
                            "stone_axe",
                            "small_wood_house",
                            "furnace",
                            "iron_pickaxe",
                            "iron_sword"
                        ]
                    }, indent=2)
                )
                
            profile_status = gr.Textbox(label="Status")
            save_profile_btn = gr.Button("💾 Save Profile")
            
            profile_list.change(
                fn=load_profile_for_editing,
                inputs=[profile_list],
                outputs=[model, embedding, conversing, coding, saving_memory, modes, npc_settings]
            )
            
            save_profile_btn.click(
                fn=save_profile,
                inputs=[profile_name, model, embedding, conversing, coding, saving_memory, modes, npc_settings],
                outputs=profile_status
            )
    
    return demo

if __name__ == "__main__":
    demo = create_ui()
    
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
