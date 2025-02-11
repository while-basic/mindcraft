export default 
{
    "minecraft_version": "1.20.4", // supports up to 1.21.1
    "host": "127.0.0.1", // or "localhost", "your.ip.address.here"
    "port": 55916,
    "auth": "offline", // or "microsoft"

    // the mindserver manages all agents and hosts the UI
    "host_mindserver": true,
    "mindserver_host": "localhost",
    "mindserver_port": 8080,
    
    "base_profile": "./profiles/defaults/survival.json",
    "profiles": ["./andy.json"],
    "load_memory": false,
    "init_message": "Respond with hello world and your name",
    "only_chat_with": [],
    
    "language": "en",
    "show_bot_views": false,
    "allow_insecure_coding": true,
    "code_timeout_mins": -1,
    "relevant_docs_count": 5,

    "max_messages": 15,
    "num_examples": 2,
    "max_commands": -1,
    "verbose_commands": true,
    "narrate_behavior": true,
    "chat_bot_messages": true
}