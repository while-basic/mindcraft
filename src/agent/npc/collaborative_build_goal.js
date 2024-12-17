import { BuildGoal } from './build_goal.js';
import { Vec3 } from 'vec3';

export class CollaborativeBuildGoal extends BuildGoal {
    constructor(agent) {
        super(agent);
        this.buildZones = new Map();
        this.collaborators = new Set();
        this.buildProgress = new Map();
    }

    async init(agents) {
        try {
            console.log("Initializing CollaborativeBuildGoal...");
            if (!agents || agents.length < 2) {
                throw new Error("Not enough agents provided for collaboration");
            }
            
            agents.forEach(agent => {
                if (agent && agent.name) {
                    console.log(`Adding collaborator: ${agent.name}`);
                    this.collaborators.add(agent.name);
                } else {
                    throw new Error("Invalid agent reference");
                }
            });
            
            console.log("CollaborativeBuildGoal initialized with agents:", Array.from(this.collaborators));
        } catch (error) {
            console.error("Failed to initialize CollaborativeBuildGoal:", error);
            throw error;
        }
    }

    async assignBuildZone(blueprint, basePosition) {
        try {
            console.log("Assigning build zones...");
            const agentNames = Array.from(this.collaborators);
            
            // Assign zones based on roles
            agentNames.forEach((agentName, index) => {
                console.log(`Assigning zone for ${agentName}`);
                const zone = {
                    startX: basePosition.x,
                    startY: basePosition.y + (index * blueprint.blocks.length),
                    startZ: basePosition.z,
                    endX: basePosition.x + blueprint.blocks[0][0].length,
                    endY: basePosition.y + ((index + 1) * blueprint.blocks.length),
                    endZ: basePosition.z + blueprint.blocks[0].length
                };
                this.buildZones.set(agentName, zone);
                console.log(`Zone assigned for ${agentName}:`, zone);
            });
        } catch (error) {
            console.error("Failed to assign build zones:", error);
            throw error;
        }
    }

    async coordinateBuild(blueprint) {
        try {
            console.log("Starting coordinated build...");
            const myZone = this.buildZones.get(this.agent.name);
            if (!myZone) {
                throw new Error(`No build zone assigned for ${this.agent.name}`);
            }

            // Initialize progress tracking
            this.buildProgress.set(this.agent.name, {
                placedBlocks: 0,
                totalBlocks: 0
            });

            console.log(`${this.agent.name} starting build in zone:`, myZone);
            return await this.executeNext(blueprint, myZone);
        } catch (error) {
            console.error("Failed to coordinate build:", error);
            throw error;
        }
    }
} 