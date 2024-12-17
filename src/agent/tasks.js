import pkg from 'prismarine-item';
const { Item } = pkg;
import { readFileSync } from 'fs';
import { executeCommand } from './commands/index.js';
import { getPosition } from './library/world.js'
import settings from '../../settings.js';
import { CollaborativeBuildGoal } from './npc/collaborative_build_goal.js';


export class TaskValidator {
    constructor(data, agent) {
        this.target = data.target;
        this.number_of_target = data.number_of_target;
        this.agent = agent;
    }

    validate() {
        try{
            let valid = false;
            let total_targets = 0;
            this.agent.bot.inventory.slots.forEach((slot) => {
                if (slot && slot.name.toLowerCase() === this.target) {
                    total_targets += slot.count;
                }
                if (slot && slot.name.toLowerCase() === this.target && slot.count >= this.number_of_target) {
                    valid = true;
                    console.log('Task is complete');
                }
            });
            if (total_targets >= this.number_of_target) {
                valid = true;
                console.log('Task is complete');
            }
            return valid;
        } catch (error) {
            console.error('Error validating task:', error);
            return false;
        }
    }
}


export class Task {
    constructor(agent, task_path, task_id) {
        this.agent = agent;
        this.data = null;
        this.taskTimeout = 300;
        this.taskStartTime = Date.now();
        this.validator = null;
        this.blocked_actions = [];
        if (task_path && task_id) {
            this.data = this.loadTask(task_path, task_id);
            this.taskTimeout = this.data.timeout || 300;
            this.taskStartTime = Date.now();
            this.validator = new TaskValidator(this.data, this.agent);
            this.blocked_actions = this.data.blocked_actions || [];
            if (this.data.goal)
                this.blocked_actions.push('!endGoal');
            if (this.data.conversation)
                this.blocked_actions.push('!endConversation');
        }
    }

    loadTask(task_path, task_id) {
        try {
            const tasksFile = readFileSync(task_path, 'utf8');
            const tasks = JSON.parse(tasksFile);
            const task = tasks[task_id];
            if (!task) {
                throw new Error(`Task ${task_id} not found`);
            }
            if ((!task.agent_count || task.agent_count <= 1) && this.agent.count_id > 0) {
                task = null;
            }

            return task;
        } catch (error) {
            console.error('Error loading task:', error);
            process.exit(1);
        }
    }

    isDone() {
        if (this.validator && this.validator.validate())
            return {"message": 'Task successful', "code": 2};
        // TODO check for other terminal conditions
        // if (this.task.goal && !this.self_prompter.on)
        //     return {"message": 'Agent ended goal', "code": 3};
        // if (this.task.conversation && !inConversation())
        //     return {"message": 'Agent ended conversation', "code": 3};
        if (this.taskTimeout) {
            const elapsedTime = (Date.now() - this.taskStartTime) / 1000;
            if (elapsedTime >= this.taskTimeout) {
                console.log('Task timeout reached. Task unsuccessful.');
                return {"message": 'Task timeout reached', "code": 4};
            }
        }
        return false;
    }

    async initBotTask() {
        try {
            console.log("Initializing bot task...");
            
            // Clear inventory before starting task
            await this.agent.bot.creative.clearInventory();
            console.log(`Cleared ${this.agent.name}'s inventory.`);
            
            // Check if we have agent roles defined
            if (!this.data || !this.data.agent_roles) {
                throw new Error("No agent roles defined in task data");
            }
            
            // Find the role for this agent
            const agentRole = this.data.agent_roles.find(role => 
                role.responsibility === (this.agent === this.otherAgent ? "walls" : "base")
            );
            
            if (!agentRole) {
                throw new Error(`No role found for agent ${this.agent.name}`);
            }
            
            // Set up initial inventory based on role
            console.log(`Setting up inventory for ${this.agent.name} with role ${agentRole.role}`);
            
            // Wait for inventory to be ready
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Set inventory slots sequentially
            for (const [itemName, count] of Object.entries(agentRole.initial_inventory)) {
                try {
                    const mcItemName = itemName.toLowerCase();
                    const item = this.agent.bot.registry.itemsByName[mcItemName];
                    
                    if (!item) {
                        console.error(`Unknown item: ${mcItemName}`);
                        continue;
                    }
                    
                    // Wait between each slot setting
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // Create the item stack
                    const itemStack = {
                        type: item.id,
                        count: count,
                        metadata: 0,
                        nbt: {}
                    };
                    
                    // Set the slot with proper await
                    await this.agent.bot.creative.setInventorySlot(
                        Object.keys(agentRole.initial_inventory).indexOf(itemName), 
                        itemStack
                    );
                    
                    console.log(`Added ${count} ${mcItemName} to inventory`);
                    
                } catch (error) {
                    console.error(`Failed to add item ${itemName}:`, error);
                }
            }
            
            console.log(`Bot task initialized for ${this.agent.name}`);
        } catch (error) {
            console.error("Error in initBotTask:", error);
            if (error.stack) {
                console.error("Stack trace:", error.stack);
            }
            throw error;
        }
    }
}

export class CollaborativeBuildTask extends Task {
    constructor(agent, data) {
        super(agent);
        this.data = data;
        this.buildGoal = new CollaborativeBuildGoal(agent);
        this.otherAgent = null; // Will be set after construction
    }

    async init() {
        try {
            console.log("Starting CollaborativeBuildTask initialization...");
            console.log("Task data:", this.data); // Debug log
            
            if (!this.data || this.data.type !== 'collaborative_build') {
                throw new Error("Invalid task data or type");
            }
            
            // Initialize base task
            console.log("Initializing base task...");
            await super.initBotTask();
            console.log("Base task initialized");
            
            // Verify agents are ready
            if (!this.agent || !this.otherAgent) {
                throw new Error("Missing agent references");
            }
            
            // Initialize build goal with both agents
            console.log("Initializing build goal...");
            await this.buildGoal.init([this.agent, this.otherAgent]);
            console.log("Build goal initialized");
            
            // Wait for all agents to be ready
            console.log("Waiting for collaborators...");
            await this.waitForCollaborators();
            console.log("All collaborators ready");
            
            // Share blueprint with all agents
            console.log("Getting base position...");
            const blueprint = this.data.blueprint;
            const basePosition = this.agent.bot.entity.position;
            
            // Assign build zones
            console.log("Assigning build zones...");
            await this.buildGoal.assignBuildZone(blueprint, basePosition);
            console.log("Build zones assigned");
            
            // Start coordinated build
            console.log("Starting coordinated build...");
            await this.buildGoal.coordinateBuild(blueprint);
            console.log("Build coordination initialized");
        } catch (error) {
            console.error("CollaborativeBuildTask initialization failed:", error);
            if (error.stack) {
                console.error("Stack trace:", error.stack);
            }
            throw error;
        }
    }

    async waitForCollaborators() {
        try {
            const expectedAgents = this.data.agent_roles.length;
            let connectedAgents = 0;
            let attempts = 0;
            const maxAttempts = 30; // 30 second timeout
            
            console.log(`Waiting for ${expectedAgents} agents to connect...`);
            
            while (connectedAgents < expectedAgents && attempts < maxAttempts) {
                connectedAgents = Object.keys(this.agent.bot.players).length;
                console.log(`Connected agents: ${connectedAgents}/${expectedAgents}`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                attempts++;
            }
            
            if (attempts >= maxAttempts) {
                throw new Error(`Timeout waiting for agents to connect. Only ${connectedAgents}/${expectedAgents} connected.`);
            }
            
            console.log("All agents connected successfully");
        } catch (error) {
            console.error("Error in waitForCollaborators:", error);
            throw error;
        }
    }

    isDone() {
        try {
            if (!this.buildGoal) return false;
            const progress1 = this.buildGoal.buildProgress.get(this.agent.name);
            const progress2 = this.buildGoal.buildProgress.get(this.otherAgent.name);
            return progress1?.placedBlocks === progress1?.totalBlocks && 
                   progress2?.placedBlocks === progress2?.totalBlocks;
        } catch (error) {
            console.error("Error checking isDone:", error);
            return false;
        }
    }
}
