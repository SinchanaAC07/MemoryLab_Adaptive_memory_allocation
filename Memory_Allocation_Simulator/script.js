function simulate() {

    let blocks = document.getElementById("blocks")
        .value.split(",").map(Number);

    let processes = document.getElementById("processes")
        .value.split(",").map(Number);

    let algorithm = document.getElementById("algorithm").value;

    if (
        blocks.length === 0 ||
        processes.length === 0 ||
        blocks.some(n => !Number.isFinite(n) || n <= 0) ||
        processes.some(n => !Number.isFinite(n) || n <= 0)
    ) {
        alert("Please enter valid positive memory and process sizes.");
        return;
    }

    let totalMemory = blocks.reduce((a, b) => a + b, 0);

    let success = 0;
    let failed = 0;
    let nextPosition = 0;

    let output = "";
    let memoryDisplay = "";

    let initialFree = [...blocks];

    // Adaptive selection
    let selectedAlgorithm = algorithm;

    if (algorithm === "adaptive") {

        let totalFree = initialFree.reduce((a, b) => a + b, 0);

        let largest = Math.max(...initialFree);

        let fragmentation = totalFree > 0
            ? (totalFree - largest) / totalFree
            : 0;

        selectedAlgorithm = fragmentation > 0.4
            ? "best"
            : "first";
    }

    for (let i = 0; i < processes.length; i++) {

        let processSize = processes[i];
        let selected = -1;

        if (selectedAlgorithm === "first") {

            for (let j = 0; j < blocks.length; j++) {

                if (blocks[j] >= processSize) {
                    selected = j;
                    break;
                }
            }
        }

        else if (selectedAlgorithm === "best") {

            let minimum = Infinity;

            for (let j = 0; j < blocks.length; j++) {

                if (
                    blocks[j] >= processSize &&
                    blocks[j] < minimum
                ) {
                    minimum = blocks[j];
                    selected = j;
                }
            }
        }

        else if (selectedAlgorithm === "worst") {

            let maximum = -1;

            for (let j = 0; j < blocks.length; j++) {

                if (
                    blocks[j] >= processSize &&
                    blocks[j] > maximum
                ) {
                    maximum = blocks[j];
                    selected = j;
                }
            }
        }

        else if (selectedAlgorithm === "next") {

            for (let count = 0; count < blocks.length; count++) {

                let j = (nextPosition + count) % blocks.length;

                if (blocks[j] >= processSize) {

                    selected = j;
                    nextPosition = (j + 1) % blocks.length;
                    break;
                }
            }
        }

        if (selected !== -1) {

            output += `
                <div class="result-line success">
                    Process ${i + 1} (${processSize} KB)
                    allocated to Block ${selected + 1}
                </div>
            `;

            blocks[selected] -= processSize;

            success++;

        } else {

            output += `
                <div class="result-line failed">
                    Process ${i + 1} (${processSize} KB)
                    could not be allocated.
                </div>
            `;

            failed++;
        }
    }

    let usedMemory = totalMemory -
        blocks.reduce((a, b) => a + b, 0);

    let freeMemory = blocks.reduce((a, b) => a + b, 0);

    let largestFree = Math.max(...blocks);

    let externalFragmentation = freeMemory - largestFree;

    let utilization = totalMemory > 0
        ? ((usedMemory / totalMemory) * 100).toFixed(2)
        : 0;


    // Memory visualization

    for (let i = 0; i < blocks.length; i++) {

        let used = initialFree[i] - blocks[i];

        memoryDisplay += `
            <div class="memory-block ${used > 0 ? 'allocated' : ''}">
                <strong>Memory Block ${i + 1}</strong>
                Initial Size: ${initialFree[i]} KB<br>
                Used: ${used} KB<br>
                Free: ${blocks[i]} KB
            </div>
        `;
    }


    document.getElementById("memory").innerHTML =
        memoryDisplay;


    // Statistics

    document.getElementById("totalStat").innerText =
        totalMemory + " KB";

    document.getElementById("usedStat").innerText =
        usedMemory + " KB";

    document.getElementById("freeStat").innerText =
        freeMemory + " KB";

    document.getElementById("utilStat").innerText =
        utilization + "%";


    // Results

    document.getElementById("results").innerHTML = `

        <div class="result-line">
            <strong>Selected Algorithm:</strong>
            ${algorithm === "adaptive" ? "Adaptive (" +
            (selectedAlgorithm === "best" ? "Best Fit" : "First Fit") +
            ")" : algorithm.toUpperCase() + " FIT"}
        </div>

        ${output}

        <div class="result-line">
            Successful Allocations: ${success}
        </div>

        <div class="result-line">
            Failed Allocations: ${failed}
        </div>

        <div class="result-line">
            Total Free Memory: ${freeMemory} KB
        </div>

        <div class="result-line">
            Largest Free Block: ${largestFree} KB
        </div>

        <div class="result-line">
            External Fragmentation Indicator:
            ${externalFragmentation} KB
        </div>

        <div class="result-line">
            Memory Utilization: ${utilization}%
        </div>

    `;
}


function resetSimulator() {

    document.getElementById("blocks").value =
        "100,200,300,400";

    document.getElementById("processes").value =
        "150,250,100,350";

    document.getElementById("algorithm").value =
        "first";

    document.getElementById("memory").innerHTML =
        '<p class="empty-message">Run a simulation to view memory allocation.</p>';

    document.getElementById("results").innerHTML =
        '<p class="empty-message">Simulation results will appear here.</p>';

    document.getElementById("totalStat").innerText = "1000 KB";
    document.getElementById("usedStat").innerText = "0 KB";
    document.getElementById("freeStat").innerText = "1000 KB";
    document.getElementById("utilStat").innerText = "0%";
}