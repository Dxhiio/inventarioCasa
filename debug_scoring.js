const fs = require('fs');
const path = require('path');

const query = "Huevos Orgánicos";
const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

console.log(`Query: "${query}" -> Words: [${queryWords.join(', ')}]`);

const debugDir = path.join(process.cwd(), 'scdebug');
const files = fs.readdirSync(debugDir).filter(f => f.endsWith('.html'));
const file = files.find(f => f.includes("Huevos")) || files[0];

if (!file) { console.log("No file"); process.exit(0); }

const html = fs.readFileSync(path.join(debugDir, file), 'utf8');
const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json"[^>]*>(.*?)<\/script>/);

if (nextDataMatch && nextDataMatch[1]) {
    const json = JSON.parse(nextDataMatch[1]);
    const items = json?.props?.pageProps?.initialData?.searchResult?.itemStacks?.[0]?.items || [];

    console.log(`\n--- Scoring Simulation ---`);
    let bestItem = null;
    let maxScore = -1;

    items.forEach(item => {
        if (!item.name) return;
        
        const itemNameNorm = item.name.toLowerCase();
        let score = 0;
        let matches = [];

        queryWords.forEach(word => {
            // Simple singularize hack
            const root = word.endsWith('s') ? word.slice(0, -1) : word;
            
            if (itemNameNorm.includes(word)) {
                score += 1;
                matches.push(word);
            } else if (itemNameNorm.includes(root)) {
                score += 0.8; // Partial/Singular match
                matches.push(root + "(root)");
            }
        });

        // Exact Start Bonus
        if (itemNameNorm.startsWith(queryWords[0])) {
             score += 0.5;
             matches.push("HEAD_MATCH");
        }

        console.log(`[${score.toFixed(1)}] ${item.name} | Matches: ${matches.join(', ')}`);

        if (score > maxScore) {
            maxScore = score;
            bestItem = item;
        }
    });

    console.log(`\nWINNER: ${bestItem ? bestItem.name : 'NONE'}`);
}
