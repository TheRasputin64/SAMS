// Load questions data from the HTML script tag
const dataScript = document.getElementById('questionsData');
const data = JSON.parse(dataScript.textContent);

let shuffledDefinitions = [];
let correctAnswers = {};
let selectedTermIndex = null;
let selectedDefIndex = null;
let matchedPairs = new Set();

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function initGame() {
    shuffledDefinitions = shuffle([...data]);
    correctAnswers = {};
    selectedTermIndex = null;
    selectedDefIndex = null;
    matchedPairs = new Set();

    data.forEach((item, termIndex) => {
        const defIndex = shuffledDefinitions.indexOf(item);
        correctAnswers[termIndex] = defIndex;
    });

    const termsList = document.getElementById('termsList');
    const defsList = document.getElementById('definitionsList');
    termsList.innerHTML = '';
    defsList.innerHTML = '';

    data.forEach((item, index) => {
        termsList.innerHTML += `
            <div class="item-row">
                <div class="item-number">${index + 1}</div>
                <div class="item-content" data-term-index="${index}" onclick="selectTerm(${index})">${item.term}</div>
            </div>
        `;
    });

    shuffledDefinitions.forEach((item, index) => {
        const letter = String.fromCharCode(65 + index);
        defsList.innerHTML += `
            <div class="item-row">
                <div class="item-number">${letter}</div>
                <div class="item-content" data-def-index="${index}" onclick="selectDefinition(${index})">${item.definition}</div>
            </div>
        `;
    });

    updateStats();
}

function selectTerm(index) {
    const termContent = document.querySelector(`.item-content[data-term-index="${index}"]`);
    if (matchedPairs.has('t' + index)) return;

    document.querySelectorAll('.item-content[data-term-index]').forEach(item => {
        if (!matchedPairs.has('t' + item.dataset.termIndex)) {
            item.classList.remove('selected');
        }
    });

    if (selectedTermIndex === index) {
        selectedTermIndex = null;
    } else {
        selectedTermIndex = index;
        termContent.classList.add('selected');
        if (selectedDefIndex !== null) {
            tryMatch(selectedTermIndex, selectedDefIndex);
        }
    }
}

function selectDefinition(defIndex) {
    const defContent = document.querySelector(`.item-content[data-def-index="${defIndex}"]`);
    if (matchedPairs.has('d' + defIndex)) return;

    document.querySelectorAll('.item-content[data-def-index]').forEach(item => {
        if (!matchedPairs.has('d' + item.dataset.defIndex)) {
            item.classList.remove('selected');
        }
    });

    if (selectedDefIndex === defIndex) {
        selectedDefIndex = null;
    } else {
        selectedDefIndex = defIndex;
        defContent.classList.add('selected');
        if (selectedTermIndex !== null) {
            tryMatch(selectedTermIndex, selectedDefIndex);
        }
    }
}

function tryMatch(termIndex, defIndex) {
    const termContent = document.querySelector(`.item-content[data-term-index="${termIndex}"]`);
    const defContent = document.querySelector(`.item-content[data-def-index="${defIndex}"]`);

    if (correctAnswers[termIndex] === defIndex) {
        termContent.classList.remove('selected', 'wrong');
        termContent.classList.add('matched');
        defContent.classList.remove('selected', 'wrong');
        defContent.classList.add('matched');

        matchedPairs.add('t' + termIndex);
        matchedPairs.add('d' + defIndex);

        selectedTermIndex = null;
        selectedDefIndex = null;

        updateStats();
        checkCompletion();
    } else {
        termContent.classList.remove('selected');
        termContent.classList.add('wrong');
        defContent.classList.remove('selected');
        defContent.classList.add('wrong');

        setTimeout(() => {
            termContent.classList.remove('wrong');
            defContent.classList.remove('wrong');
        }, 500);

        selectedTermIndex = null;
        selectedDefIndex = null;
    }
}

function updateStats() {
    const matched = matchedPairs.size / 2;
    document.getElementById('matchedCount').textContent = matched;
    document.getElementById('remainingCount').textContent = data.length - matched;
}

function checkCompletion() {
    const matched = matchedPairs.size / 2;
    if (matched === data.length) {
        setTimeout(() => showResults(matched), 500);
    }
}

function showResults(correct) {
    document.getElementById('matchingArea').style.display = 'none';
    document.getElementById('results').classList.add('active');

    const percentage = ((correct / data.length) * 100).toFixed(1);
    document.getElementById('finalScore').textContent = `${correct}/${data.length}`;
    document.getElementById('correctMatches').textContent = correct;
    document.getElementById('percentage').textContent = percentage + '%';
}

function resetGame() {
    document.getElementById('results').classList.remove('active');
    document.getElementById('matchingArea').style.display = 'block';
    initGame();
}

// Initialize the game when the page loads
initGame();