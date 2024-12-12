const { test, expect } = require('@playwright/test');

test.describe('Memory Game Grid Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8000');
    });

    test('should load default grid size from config.json', async ({ page }) => {
        const rows = await page.locator('#rows').inputValue();
        const cols = await page.locator('#cols').inputValue();
        expect(rows).toBe('4');
        expect(cols).toBe('4');
    });

    test('should create correct grid layout', async ({ page }) => {
        const gameBoard = await page.locator('.game-board');
        const gridStyle = await gameBoard.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return {
                display: style.display,
                gridTemplateColumns: style.gridTemplateColumns,
                aspectRatio: style.aspectRatio
            };
        });

        expect(gridStyle.display).toBe('grid');
        expect(gridStyle.gridTemplateColumns.split(' ').length).toBe(4);
        expect(gridStyle.aspectRatio).toBe('1');
    });

    test('should handle 6x6 grid', async ({ page }) => {
        await page.locator('#rows').fill('6');
        await page.locator('#cols').fill('6');
        await page.locator('#newGame').click();

        const cards = await page.locator('.card').count();
        expect(cards).toBe(36);

        const gameBoard = await page.locator('.game-board');
        const gridStyle = await gameBoard.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return {
                gridTemplateColumns: style.gridTemplateColumns
            };
        });

        expect(gridStyle.gridTemplateColumns.split(' ').length).toBe(6);
    });

    test('should maintain card aspect ratio', async ({ page }) => {
        const card = await page.locator('.card').first();
        const cardStyle = await card.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return {
                aspectRatio: style.aspectRatio
            };
        });

        expect(cardStyle.aspectRatio).toBe('0.75');
    });

    test('should fit within viewport', async ({ page }) => {
        const container = await page.locator('.container');
        const containerStyle = await container.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return {
                maxWidth: style.maxWidth
            };
        });

        expect(containerStyle.maxWidth).toBe('min(95vh, 1200px)');
    });
});