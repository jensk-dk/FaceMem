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
            // Set default size from config
            document.getElementById('rows').value = this.config.defaultSize.rows;
            document.getElementById('cols').value = this.config.defaultSize.cols;
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
        const cards = [];
        
        // Create name and portrait cards for each pair
        selectedPairs.forEach(pair => {
            cards.push(
                { type: 'name', name: pair.name, id: pair.name },
                { type: 'portrait', portrait: pair.portrait, name: pair.name, id: pair.name }
            );
        });

        // Shuffle all cards
        cards.sort(() => Math.random() - 0.5);

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
        
        if (card.type === 'name') {
            cardElement.innerHTML = `
                <div class="card-front">?</div>
                <div class="card-back name-card">
                    <div class="name">${card.name}</div>
                </div>
            `;
        } else {
            cardElement.innerHTML = `
                <div class="card-front">?</div>
                <div class="card-back portrait-card">
                    <img src="${card.portrait}" alt="Portrait">
                </div>
            `;
        }
        
        cardElement.dataset.index = index;
        cardElement.dataset.id = card.id;
        cardElement.dataset.type = card.type;
        
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
        const match = card1.dataset.id === card2.dataset.id && 
                     card1.dataset.type !== card2.dataset.type;

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