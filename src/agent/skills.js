async function goToPosition(bot, x, y, z, options = {}) {
    try {
        // Set reasonable defaults
        const defaultOptions = {
            timeout: 30000, // 30 second timeout
            maxDistance: 1, // How close to get to target
            maxRetries: 3   // Number of retry attempts
        };
        options = { ...defaultOptions, ...options };
        
        let attempts = 0;
        while (attempts < options.maxRetries) {
            try {
                await bot.pathfinder.goto(new goals.GoalNear(x, y, z, options.maxDistance), options.timeout);
                return true;
            } catch (err) {
                attempts++;
                if (err.name === 'PathStopped' && attempts < options.maxRetries) {
                    console.log(`Path was stopped, retrying (attempt ${attempts}/${options.maxRetries})...`);
                    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between attempts
                    continue;
                }
                throw err;
            }
        }
    } catch (err) {
        console.log(`Failed to reach position after ${options.maxRetries} attempts:`, err.message);
        return false;
    }
}

// Similar pattern for other movement functions like goToPlayer, followPlayer, etc.
async function goToPlayer(bot, playerName, distance = 2) {
    try {
        const player = bot.players[playerName];
        if (!player || !player.entity) {
            console.log(`Cannot find player ${playerName}`);
            return false;
        }

        return await goToPosition(bot, 
            player.entity.position.x,
            player.entity.position.y,
            player.entity.position.z,
            { maxDistance: distance }
        );
    } catch (err) {
        console.log(`Failed to go to player ${playerName}:`, err.message);
        return false;
    }
} 