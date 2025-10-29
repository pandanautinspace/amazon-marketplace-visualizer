import { db } from '../../modules/firebase.js';
import {
    getCountFromServer,
    where,
    writeBatch,
    query,
    collection,
    doc,
    getDocs
} from 'firebase/firestore';

const SAMPLE_CATEGORIES = [
    {
        pageType: 'storefront',
        navData: {
            storeNavPath: [
                'stores',
                'page',
                '0E911CE6-5EEC-464C-B2E4-D0BD5EF9C64C',
            ],
        },
        displayData: { storefrontBreadcumbs: ['Samsung'], title: 'Amazon.fr' },
    },
    {
        pageType: 'browse',
        navData: { node: '11961521031' },
        displayData: { departmentInfo: [], title: 'Amazon Fashion' },
    },
    {
        pageType: 'browse',
        navData: { node: '13921051' },
        displayData: { departmentInfo: ['Electronics'], title: 'High-Tech' },
    },
    {
        pageType: 'browse',
        navData: { node: '57004031' },
        displayData: { departmentInfo: [], title: 'Home and Kitchen' },
    },
    {
        pageType: 'browse',
        navData: { node: '197858031' },
        displayData: { departmentInfo: ['Beauty'], title: 'Beauty' },
    },
    {
        pageType: 'search',
        navData: { i: null, k: 'laptop', rh: null },
        displayData: { departmentInfo: [], title: 'Amazon.fr' },
    },
];

async function createNPCs(desiredCount = 20) {
    try {
        // First check current NPC count
        const countQuery = query(
            collection(db, 'users'),
            where('isNPC', '==', true)
        );
        const countSnap = await getCountFromServer(countQuery);
        const currentCount = countSnap.data().count;

        console.log(`Current NPC count: ${currentCount}`);

        if (currentCount >= desiredCount) {
            console.log('Already have enough NPCs');
            return;
        }

        // Calculate how many NPCs to create
        const numToCreate = desiredCount - currentCount;
        console.log(`Creating ${numToCreate} new NPCs`);

        const batch = writeBatch(db);

        for (let i = 0; i < numToCreate; i++) {
            const npcRef = doc(collection(db, 'users'));
            const randomCategory =
                SAMPLE_CATEGORIES[
                Math.floor(Math.random() * SAMPLE_CATEGORIES.length)
                ];
            batch.set(npcRef, {
                location: randomCategory,
                isNPC: true,
            });
        }

        await batch.commit();
        console.log(`Successfully created ${numToCreate} NPCs`);
    } catch (error) {
        console.error('Error managing NPCs:', error);
    }
}

async function deleteAllNPCUsers() {
    try {
        let deleted = 0;
        const npcQuery = query(
            collection(db, 'users'),
            where('isNPC', '==', true)
        );
        const snapshot = await getDocs(npcQuery);

        if (!snapshot.empty) {
            // Use multiple batches if needed (Firestore limit is 500 ops per batch)
            const batches = [];
            let currentBatch = writeBatch(db);
            let operationCount = 0;

            snapshot.forEach((doc) => {
                currentBatch.delete(doc.ref);
                operationCount++;

                if (operationCount >= 450) {
                    // Stay safely under the 500 limit
                    batches.push(currentBatch);
                    currentBatch = writeBatch(db);
                    operationCount = 0;
                }
            });

            // Push the last batch if it has operations
            if (operationCount > 0) {
                batches.push(currentBatch);
            }

            // Execute all batches
            await Promise.all(batches.map((batch) => batch.commit()));
            console.log(`Successfully deleted ${snapshot.size} NPCs`);
        } else {
            console.log('No NPCs to delete');
        }
    } catch (error) {
        console.error('Error deleting NPCs:', error);
    }
}

// Function to update all NPCs with random locations
async function updateAllNPCLocations() {
    try {
        const npcQuery = query(
            collection(db, 'users'),
            where('isNPC', '==', true)
        );
        const snapshot = await getDocs(npcQuery);

        const batch = writeBatch(db);
        snapshot.forEach((npcDoc) => {
            const randomCategory =
                SAMPLE_CATEGORIES[
                Math.floor(Math.random() * SAMPLE_CATEGORIES.length)
                ];
            batch.update(npcDoc.ref, {
                location: randomCategory,
            });
        });

        await batch.commit();
    } catch (error) {
        console.error('Error updating NPCs:', error);
    }
}

// Start the periodic update
let updateInterval;

function startNPCUpdates(intervalSeconds = 10) {
    // Clear any existing interval
    if (updateInterval) {
        clearInterval(updateInterval);
    }

    // Start new interval
    updateInterval = setInterval(() => {
        updateAllNPCLocations();
    }, intervalSeconds * 1000);

    console.log(
        `NPC location updates started (every ${intervalSeconds} seconds)`
    );
}

// Export the functions
export { startNPCUpdates };

// Uncomment below to reset NPCs on module load
//await deleteAllNPCUsers();
console.log('Creating NPCs...');
// Comment below line to prevent automatic NPC creation on load
await createNPCs(20);
console.log('NPC creation process completed.');
