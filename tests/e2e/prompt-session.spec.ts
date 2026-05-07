import { test, expect } from '@playwright/test';

test.describe('Prompt Session Flow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/app/new');
	});

	test('complete flow from intent to result', async ({ page }) => {
		// Step 1: Intent
		await expect(
			page.getByText('O que você quer conseguir com a IA?'),
		).toBeVisible();
		await page
			.getByLabel('Descrição da tarefa')
			.fill('Quero organizar minhas anotações de leitura em um sistema de tags');
		await page.getByRole('button', { name: 'Continuar' }).click();

		// Step 2: Role
		await expect(page.getByText('Qual o papel da IA?')).toBeVisible();
		await page.getByRole('button', { name: 'Sintetizar' }).click();
		await page.getByRole('button', { name: 'Continuar' }).click();

		// Step 3: Rulers
		await expect(page.getByText('Ajustes')).toBeVisible();
		await page.getByRole('button', { name: 'Continuar' }).click();

		// Step 4: Match (depth)
		await expect(page.getByText('Profundidade')).toBeVisible();
		await page.getByRole('button', { name: 'Continuar' }).click();

		// Step 5: Collection
		await expect(page.getByText('Detalhes necessários')).toBeVisible();
		await page.getByRole('button', { name: 'Continuar' }).click();

		// Step 6: Review
		await expect(page.getByText('Revisão')).toBeVisible();
		await page.getByRole('button', { name: 'Gerar' }).click();

		// Step 7: Result
		await expect(page.getByText('Resultado')).toBeVisible();
		await expect(page.getByText('Prompt gerado')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Copiar' })).toBeVisible();
	});

	test('mobile viewport flow', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });

		await page
			.getByLabel('Descrição da tarefa')
			.fill('Quero analisar um texto');
		await page.getByRole('button', { name: 'Continuar' }).click();

		await page.getByRole('button', { name: 'Analisar' }).click();
		await page.getByRole('button', { name: 'Continuar' }).click();

		await expect(page.getByText('Ajustes')).toBeVisible();
	});

	test('debug panel toggle', async ({ page }) => {
		await expect(
			page.getByRole('button', { name: 'Mostrar debug' }),
		).toBeVisible();
		await page.getByRole('button', { name: 'Mostrar debug' }).click();
		await expect(
			page.getByRole('button', { name: 'Ocultar debug' }),
		).toBeVisible();
	});

	test('cannot advance without filling intent', async ({ page }) => {
		const continueButton = page.getByRole('button', { name: 'Continuar' });
		await expect(continueButton).toBeDisabled();
	});

	test('go back navigation works', async ({ page }) => {
		await page
			.getByLabel('Descrição da tarefa')
			.fill('Teste de navegação');
		await page.getByRole('button', { name: 'Continuar' }).click();

		await page.getByRole('button', { name: 'Voltar' }).click();
		await expect(
			page.getByText('O que você quer conseguir com a IA?'),
		).toBeVisible();
	});

	test('user copies prompt', async ({ page }) => {
		await page
			.getByLabel('Descrição da tarefa')
			.fill('Quero criar um resumo de reunião');
		await page.getByRole('button', { name: 'Continuar' }).click();
		await page.getByRole('button', { name: 'Documentar' }).click();
		await page.getByRole('button', { name: 'Continuar' }).click();
		await page.getByRole('button', { name: 'Continuar' }).click();
		await page.getByRole('button', { name: 'Continuar' }).click();
		await page.getByRole('button', { name: 'Continuar' }).click();
		await page.getByRole('button', { name: 'Gerar' }).click();

		await expect(page.getByRole('button', { name: 'Copiar' })).toBeVisible();
		await page.getByRole('button', { name: 'Copiar' }).click();
		await expect(page.getByText('Copiado!')).toBeVisible();
	});

	test('user registers feedback', async ({ page }) => {
		await page
			.getByLabel('Descrição da tarefa')
			.fill('Quero criar um resumo de reunião');
		await page.getByRole('button', { name: 'Continuar' }).click();
		await page.getByRole('button', { name: 'Documentar' }).click();
		await page.getByRole('button', { name: 'Continuar' }).click();
		await page.getByRole('button', { name: 'Continuar' }).click();
		await page.getByRole('button', { name: 'Continuar' }).click();
		await page.getByRole('button', { name: 'Continuar' }).click();
		await page.getByRole('button', { name: 'Gerar' }).click();

		await expect(page.getByText('Esse prompt foi útil?')).toBeVisible();
		await page.getByRole('button', { name: 'Sim, o prompt foi útil' }).click();
		await expect(page.getByText('Obrigado pelo feedback!')).toBeVisible();
	});

	test('export link appears in result', async ({ page }) => {
		await page
			.getByLabel('Descrição da tarefa')
			.fill('Quero criar um resumo de reunião');
		await page.getByRole('button', { name: 'Continuar' }).click();
		await page.getByRole('button', { name: 'Documentar' }).click();
		await page.getByRole('button', { name: 'Continuar' }).click();
		await page.getByRole('button', { name: 'Continuar' }).click();
		await page.getByRole('button', { name: 'Continuar' }).click();
		await page.getByRole('button', { name: 'Continuar' }).click();
		await page.getByRole('button', { name: 'Gerar' }).click();

		await expect(page.getByRole('link', { name: 'Exportar' })).toBeVisible();
	});

	test('debug is not open by default', async ({ page }) => {
		await expect(
			page.getByRole('button', { name: 'Mostrar debug' }),
		).toBeVisible();
		await expect(
			page.getByRole('button', { name: 'Ocultar debug' }),
		).not.toBeVisible();
	});
});
