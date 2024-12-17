import { Agent } from '../agent/agent.js';
import { readFileSync } from 'fs';
import { CollaborativeBuildTask } from '../agent/tasks.js';
import settings from '../../settings.js';

async function runTest() {
    console.log("Starting collaborative build test...");

    try {
        // Load test blueprint
        const blueprint = JSON.parse(
            readFileSync('./src/agent/npc/construction/test_house.json', 'utf8')
        );

        // Initialize and start agents with profiles and unique usernames
        const agent1 = new Agent();
        const agent2 = new Agent();
        
        console.log("Starting agents with profiles...");
        
        // Start agents with better error handling and unique usernames
        try {
            await agent1.start('./profiles/andy_npc.json', false, 'builder1', 0);
            console.log("Agent 1 started successfully");
        } catch (error) {
            console.error("Failed to start agent1:", error);
            throw error;
        }

        // Wait a moment before starting second agent
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            await agent2.start('./profiles/grok.json', false, 'builder2', 1);
            console.log("Agent 2 started successfully");
        } catch (error) {
            console.error("Failed to start agent2:", error);
            throw error;
        }

        console.log("Both agents started, initializing build task...");
        
        // Wait for both agents to be fully initialized
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Start collaborative build task with error handling
        try {
            const task = new CollaborativeBuildTask(agent1, blueprint);
            task.otherAgent = agent2;
            console.log("Created build task, initializing...");
            await task.init().catch(error => {
                console.error("Task initialization failed:", error);
                throw error;
            });
            console.log("Build task initialized successfully");
        } catch (error) {
            console.error("Failed during task setup:", error);
            throw error;
        }

        // Set up error handlers with detailed logging
        agent1.bot.on('error', (err) => console.error('Agent 1 error:', err));
        agent2.bot.on('error', (err) => console.error('Agent 2 error:', err));
        
        // Monitor agent status
        agent1.bot.on('end', () => console.log('Agent 1 disconnected'));
        agent2.bot.on('end', () => console.log('Agent 2 disconnected'));
        
        // Keep process alive and monitor progress with error handling
        const checkProgress = setInterval(() => {
            try {
                if (!agent1.bot.entity || !agent2.bot.entity) {
                    console.error("One or more agents disconnected!");
                    clearInterval(checkProgress);
                    process.exit(1);
                }

                const progress1 = agent1.buildGoal?.buildProgress?.get(agent1.name);
                const progress2 = agent2.buildGoal?.buildProgress?.get(agent2.name);
                
                if (progress1 && progress2) {
                    console.log('\n--- Building Progress ---');
                    console.log(`${agent1.name} (${blueprint.agent_roles[0].role}): ${progress1.placedBlocks}/${progress1.totalBlocks}`);
                    console.log(`${agent2.name} (${blueprint.agent_roles[1].role}): ${progress2.placedBlocks}/${progress2.totalBlocks}`);
                }
            } catch (error) {
                console.error("Error during progress check:", error);
            }
        }, 5000);
        
        // Prevent immediate exit
        process.on('SIGINT', () => {
            console.log("Shutting down gracefully...");
            if (agent1) agent1.cleanKill();
            if (agent2) agent2.cleanKill();
            process.exit(0);
        });

    } catch (error) {
        console.error("Test failed:", error);
        process.exit(1);
    }
}

// Add global error handlers
process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});

runTest(); 