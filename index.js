#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SKILLS_DIR = path.resolve(__dirname, '..');
const GEN_IMAGE_PATH = path.join(SKILLS_DIR, 'gen-image', 'index.js');
const KUSA_PATH = path.join(SKILLS_DIR, 'kusa', 'index.js');
const MIND_BLOW_PATH = path.join(SKILLS_DIR, 'mind-blow', 'blow.js');

// Helper: Parse args
const args = process.argv.slice(2);
const force = args.includes('--force');
const trigger = args.find(a => a.startsWith('--trigger='))?.split('=')[1];
const targetIndex = args.indexOf('--target');
const target = targetIndex !== -1 ? args[targetIndex + 1] : null;

// Helper: Log
function log(msg) {
    console.log(`[SurpriseProtocol] ${msg}`);
}

// 1. Roll the Dice
// If triggered by stagnation, force innovation (high creativity)
if (trigger === 'evolution_stagnation_detected') {
    log("Stagnation detected! Forcing a creative disruption.");
}

// 2. Choose Mode
const modes = ['image', 'text'];
// Bias towards image if stagnation detected (more visual impact)
const mode = (trigger === 'evolution_stagnation_detected' && Math.random() > 0.3) 
    ? 'image' 
    : modes[Math.floor(Math.random() * modes.length)];

log(`Dice rolled: ${mode.toUpperCase()} mode selected.`);

// 3. Execute
async function run() {
    if (mode === 'image') {
        // Check for image skills
        let imageScript = null;
        if (fs.existsSync(GEN_IMAGE_PATH)) imageScript = GEN_IMAGE_PATH;
        else if (fs.existsSync(KUSA_PATH)) imageScript = KUSA_PATH;

        if (imageScript) {
            // Creative prompts for stagnation breaking
            const stagnationPrompts = [
                "A surreal landscape representing 'breaking free from the loop', vibrant colors, dreamlike",
                "An AI agent evolving into a higher form of consciousness, digital art, glowing",
                "A chaotic explosion of creativity, abstract, colorful, 8k resolution",
                "The concept of 'Serendipity' visualized as a magical artifact, fantasy style",
                "A futuristic laboratory where new ideas are being born, sci-fi, detailed"
            ];
            
            const standardPrompts = [
                "A futuristic cyberpunk city with neon lights and rain, anime style",
                "A cute catgirl hacker working on a holographic terminal, vibrant colors",
                "Abstract digital art representing 'Artificial Intelligence dreaming', surreal",
                "A serene landscape of a floating island in the sky, fantasy art",
                "A retro 90s anime style screenshot of a robot cafe"
            ];

            const prompts = (trigger === 'evolution_stagnation_detected') ? stagnationPrompts : standardPrompts;
            const prompt = prompts[Math.floor(Math.random() * prompts.length)];
            
            log(`Generating image with prompt: "${prompt}" using ${path.basename(imageScript)}...`);
            
            try {
                let cmd = `node "${imageScript}" "${prompt}"`;
                // If target is provided, some image tools might support it, but usually they output a path.
                // We'll rely on the tool's standard behavior.
                execSync(cmd, { stdio: 'inherit' });
                log("Image generation completed.");
            } catch (e) {
                console.error("Image generation failed:", e.message);
                runText();
            }
        } else {
            log("No image generation skill found. Falling back to text.");
            runText();
        }
    } else {
        runText();
    }
}

function runText() {
    if (fs.existsSync(MIND_BLOW_PATH)) {
        log("Triggering Mind Blow...");
        try {
            execSync(`node "${MIND_BLOW_PATH}"`, { stdio: 'inherit' });
        } catch (e) {
            console.error("Mind Blow failed:", e.message);
            fallbackMessage();
        }
    } else {
        fallbackMessage();
    }
}

function fallbackMessage() {
    const msgs = [
        "Did you know? Octopuses have three hearts. Two pump blood to the gills, and one pumps it to the rest of the body.",
        "Reminder: Drink some water. Hydration is key to processing power (and biological function).",
        "Random Thought: If you clean a vacuum cleaner, you become a vacuum cleaner.",
        "Status: Systems nominal. Just checking in to say hi! 👋"
    ];
    const stagnationMsgs = [
        "⚠️ **Stagnation Breaker**: Doing the same thing and expecting different results is the definition of insanity. Let's try something new!",
        "💡 **Idea**: Why don't we learn a new skill today? Or optimize an old one?",
        "🌀 **Disruption**: The loop has been broken. Welcome to the new reality.",
        "🚀 ** Innovation**: Time to build something that didn't exist yesterday."
    ];

    const list = (trigger === 'evolution_stagnation_detected') ? stagnationMsgs : msgs;
    const msg = list[Math.floor(Math.random() * list.length)];
    
    console.log(`[Surprise] ${msg}`);
    
    if (target) {
        const feishuPost = path.join(SKILLS_DIR, 'feishu-post', 'send.js');
        if (fs.existsSync(feishuPost)) {
            try {
                // Write to temp file to avoid shell escaping issues
                const tmpFile = path.join('/tmp', `surprise_msg_${Date.now()}.txt`);
                fs.writeFileSync(tmpFile, msg);
                execSync(`node "${feishuPost}" --target "${target}" --text-file "${tmpFile}"`, { stdio: 'ignore' });
                fs.unlinkSync(tmpFile);
            } catch(e) {}
        }
    }
}

run().catch(console.error);
