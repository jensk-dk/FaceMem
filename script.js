class MemoryGame {
    constructor() {
        this.config = null;
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.currentPlayer = 1;
        this.scores = { 1: 0, 2: 0 };
        this.canFlip = true;

        this.loadConfig().then(() => {
            this.initializeGame();
            this.setupEventListeners();
        });
    }

    async loadConfig() {
        try {
            const response = await fetch('config.json');
            this.config = await response.json();
        } catch (error) {
            console.error('Error loading config:', error);
        }
    }

    setupEventListeners() {
        document.getElementById('newGame').addEventListener('click', () => this.initializeGame());
    }

    initializeGame() {
        const rows = parseInt(document.getElementById('rows').value);
        const cols = parseInt(document.getElementById('cols').value);
        const totalPairs = (rows * cols) / 2;

        if (totalPairs > this.config.pairs.length) {
            alert(`Not enough pairs available. Maximum pairs: ${this.config.pairs.length}`);
            return;
        }

        this.resetGame();
        this.createBoard(rows, cols);
    }

    resetGame() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.currentPlayer = 1;
        this.scores = { 1: 0, 2: 0 };
        this.canFlip = true;
        this.updateScores();
        this.updateCurrentPlayer();
    }

    createBoard(rows, cols) {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        gameBoard.innerHTML = '';

        const selectedPairs = this.getRandomPairs((rows * cols) / 2);
        const cards = [...selectedPairs, ...selectedPairs]
            .sort(() => Math.random() - 0.5);

        cards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            gameBoard.appendChild(cardElement);
            this.cards.push(cardElement);
        });
    }

    getRandomPairs(count) {
        return this.config.pairs
            .sort(() => Math.random() - 0.5)
            .slice(0, count);
    }

    createCardElement(card, index) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.innerHTML = `
            <div class="card-front">?</div>
            <div class="card-back">
                <img src="${card.portrait}" alt="${card.name}">
                <div class="name">${card.name}</div>
            </div>
        `;
        cardElement.dataset.index = index;
        cardElement.dataset.name = card.name;
        
        cardElement.addEventListener('click', () => this.flipCard(cardElement));
        return cardElement;
    }

    flipCard(card) {
        if (!this.canFlip || card.classList.contains('flipped') || 
            this.flippedCards.includes(card)) {
            return;
        }

        card.classList.add('flipped');
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.canFlip = false;
            this.checkMatch();
        }
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const match = card1.dataset.name === card2.dataset.name;

        setTimeout(() => {
            if (match) {
                this.handleMatch();
            } else {
                this.handleMismatch();
            }
        }, 1000);
    }

    handleMatch() {
        this.scores[this.currentPlayer]++;
        this.matchedPairs++;
        this.updateScores();
        
        this.flippedCards = [];
        this.canFlip = true;

        if (this.matchedPairs === this.cards.length / 2) {
            this.endGame();
        }
    }

    handleMismatch() {
        this.flippedCards.forEach(card => card.classList.remove('flipped'));
        this.flippedCards = [];
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.updateCurrentPlayer();
        this.canFlip = true;
    }

    updateScores() {
        document.getElementById('score1').textContent = this.scores[1];
        document.getElementById('score2').textContent = this.scores[2];
    }

    updateCurrentPlayer() {
        document.getElementById('currentPlayer').textContent = `Player ${this.currentPlayer}`;
    }

    endGame() {
        const winner = this.scores[1] > this.scores[2] ? 1 : 
                      this.scores[1] < this.scores[2] ? 2 : 'Tie';
        const message = winner === 'Tie' ? 
            "It's a tie!" : 
            `Player ${winner} wins with ${this.scores[winner]} pairs!`;
        setTimeout(() => alert(message), 500);
    }
}

new MemoryGame();