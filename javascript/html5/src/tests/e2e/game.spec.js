import { expect, test } from '@playwright/test';

const waitForClickableAction = (page) =>
  page.waitForFunction(() => {
    const overlays = document.querySelectorAll('#board svg circle');
    return [...overlays].some((el) => el.style.cursor === 'pointer');
  }, { timeout: 10_000 });

const getSelectableOverlays = (page) =>
  page.evaluate(() => {
    const circles = [...document.querySelectorAll('#board svg circle')];
    return circles
      .filter((c) => c.style.cursor === 'pointer')
      .map((c) => ({
        cx: c.getAttribute('cx'),
        cy: c.getAttribute('cy'),
      }));
  });

const getSelectedPieceCenter = (page) =>
  page.evaluate(() => {
    const pieceCircles = [...document.querySelectorAll('#board svg circle')]
      .filter((c) => {
        const fill = c.getAttribute('fill');
        return fill === '#dc2626' || fill === '#facc15';
      });
    const selected = pieceCircles.find((c) => c.getAttribute('stroke') === '#22c55e');
    return selected
      ? { cx: selected.getAttribute('cx'), cy: selected.getAttribute('cy') }
      : null;
  });

const clickOverlayAt = async (page, cell) => {
  await page.evaluate((target) => {
    const overlays = [...document.querySelectorAll('#board svg circle')]
      .filter((c) => c.style.cursor === 'pointer');
    const hit = overlays.find((c) =>
      c.getAttribute('cx') === target.cx && c.getAttribute('cy') === target.cy
    );
    if (!hit) throw new Error('Selectable cell no longer available');
    hit.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, cell);
};

const getPieceFills = (page) =>
  page.evaluate(() => {
    const circles = [...document.querySelectorAll('#board svg circle')];
    return circles
      .map((c) => c.getAttribute('fill'))
      .filter((fill) => fill === '#dc2626' || fill === '#facc15');
  });

const getVisibleCrownCount = (page) =>
  page.evaluate(() => {
    const crowns = [...document.querySelectorAll('#board svg [data-role="crown"]')];
    return crowns.filter((group) => group.getAttribute('display') !== 'none').length;
  });

const playFirstLegalMove = async (page) => {
  await waitForClickableAction(page);
  const sources = await getSelectableOverlays(page);
  if (sources.length === 0) throw new Error('No selectable source found');
  const source = sources[0];
  await clickOverlayAt(page, source);

  await page.waitForFunction(() => {
    const overlays = [...document.querySelectorAll('#board svg circle')];
    return overlays.some((el) => el.style.cursor === 'pointer');
  }, { timeout: 10_000 });

  const destinations = await getSelectableOverlays(page);
  if (destinations.length === 0) throw new Error('No selectable destination found');
  await clickOverlayAt(page, destinations[0]);
};

test.describe('Page load', () => {
  test('title is correct', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Uisge/i);
  });

  test('game view is visible on load', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#view-game')).toBeVisible();
    await expect(page.locator('#view-rules')).toBeHidden();
    await expect(page.locator('#view-options')).toBeHidden();
    await expect(page.locator('#view-about')).toBeHidden();
  });

  test('header title shows Uisge', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#app-header-title')).toHaveText('Uisge');
  });

  test('header badge shows default difficulty', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#app-header-badge')).toContainText('R human');
    await expect(page.locator('#app-header-badge')).toContainText('Y human');
    await expect(page.locator('#app-header-badge')).toContainText('Desktop');
  });

  test('board SVG is rendered', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#board svg')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('Rules link shows rules view', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-menu').click();
    await page.locator('#nav-rules').click();
    await expect(page.locator('#view-rules')).toBeVisible();
  });

  test('Options link shows options view', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-menu').click();
    await page.locator('#nav-options').click();
    await expect(page.locator('#view-options')).toBeVisible();
  });

  test('About link shows about view', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-menu').click();
    await page.locator('#nav-about').click();
    await expect(page.locator('#view-about')).toBeVisible();
  });

  test('Close from rules/about returns to game view', async ({ page }) => {
    await page.goto('/');

    await page.locator('#btn-menu').click();
    await page.locator('#nav-rules').click();
    await expect(page.locator('#view-rules')).toBeVisible();
    await page.locator('#btn-menu').click();
    await page.locator('#btn-panel-close').click();
    await expect(page.locator('#view-game')).toBeVisible();

    await page.locator('#btn-menu').click();
    await page.locator('#nav-about').click();
    await expect(page.locator('#view-about')).toBeVisible();
    await page.locator('#btn-menu').click();
    await page.locator('#btn-panel-close').click();
    await expect(page.locator('#view-game')).toBeVisible();
  });

  test('New Game from side panel returns to game view', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-menu').click();
    await page.locator('#nav-rules').click();
    await expect(page.locator('#view-rules')).toBeVisible();

    await page.locator('#btn-menu').click();
    await page.locator('#nav-new').click();

    await expect(page.locator('#view-game')).toBeVisible();
    await expect(page.locator('#view-rules')).toBeHidden();
  });

  test('New Game from options applies settings and updates badge', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-menu').click();
    await page.locator('#nav-options').click();
    await expect(page.locator('#view-options')).toBeVisible();

    await page.locator('input[name="firstplayer"][value="AI"]').check();
    await page.locator('input[name="secondplayer"][value="Human"]').check();
    await page.locator('input[name="difficultysouth"][value="Hard"]').check();

    await page.locator('#btn-menu').click();
    await page.locator('#nav-new').click();

    await expect(page.locator('#view-game')).toBeVisible();
    await expect(page.locator('#app-header-badge')).toContainText('R Hard');
    await expect(page.locator('#app-header-badge')).toContainText('Y human');
  });
});

test.describe('Options', () => {
  test('player options are present', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-menu').click();
    await page.locator('#nav-options').click();

    await expect(page.locator('input[name="firstplayer"][value="Human"]')).toBeChecked();
    await expect(page.locator('input[name="secondplayer"][value="Human"]')).toBeChecked();
    await expect(page.locator('input[name="difficultysouth"][value="Medium"]')).toBeChecked();
    await expect(page.locator('input[name="difficultynorth"][value="Medium"]')).toBeChecked();
    await expect(page.locator('input[name="deviceprofile"][value="Auto"]')).toBeChecked();
    await expect(page.locator('input[name="selectionmode"][value="MustMove"]')).toBeChecked();
    await expect(page.locator('#device-profile-hint')).toHaveText(/Auto currently resolves to (Desktop|Mobile)\./);
  });

  test('changing red and yellow difficulties updates header badge', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-menu').click();
    await page.locator('#nav-options').click();

    await page.locator('input[name="firstplayer"][value="AI"]').check();
    await page.locator('input[name="secondplayer"][value="AI"]').check();
    await page.locator('input[name="difficultysouth"][value="Easy"]').check();
    await page.locator('input[name="difficultynorth"][value="Hard"]').check();
    await page.locator('#btn-options-ok').click();

    await expect(page.locator('#view-game')).toBeVisible();
    await expect(page.locator('#app-header-badge')).toContainText('R Easy');
    await expect(page.locator('#app-header-badge')).toContainText('Y Hard');
  });

  test('badge shows human for human side and difficulty for AI side', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-menu').click();
    await page.locator('#nav-options').click();

    await page.locator('input[name="firstplayer"][value="Human"]').check();
    await page.locator('input[name="secondplayer"][value="AI"]').check();
    await page.locator('input[name="difficultynorth"][value="Hard"]').check();
    await page.locator('#btn-options-ok').click();

    await expect(page.locator('#view-game')).toBeVisible();
    await expect(page.locator('#app-header-badge')).toContainText('R human');
    await expect(page.locator('#app-header-badge')).toContainText('Y Hard');
  });

  test('manual profile override updates header badge', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-menu').click();
    await page.locator('#nav-options').click();

    await page.locator('input[name="deviceprofile"][value="Mobile"]').check();
    await page.locator('#btn-options-ok').click();

    await expect(page.locator('#view-game')).toBeVisible();
    await expect(page.locator('#app-header-badge')).toContainText('Mobile');
  });

  test('closing side panel from options applies settings and returns to game view', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-menu').click();
    await page.locator('#nav-options').click();
    await expect(page.locator('#view-options')).toBeVisible();

    await page.locator('input[name="firstplayer"][value="AI"]').check();
    await page.locator('input[name="secondplayer"][value="AI"]').check();
    await page.locator('input[name="difficultysouth"][value="Hard"]').check();
    await page.locator('input[name="difficultynorth"][value="Easy"]').check();

    await page.locator('#btn-menu').click();
    await page.locator('#panel-overlay').click();

    await expect(page.locator('#view-game')).toBeVisible();
    await expect(page.locator('#view-options')).toBeHidden();
    await expect(page.locator('#app-header-badge')).toContainText('R Hard');
    await expect(page.locator('#app-header-badge')).toContainText('Y Easy');
  });

  test('changing active side to AI triggers immediate AI thinking via sync', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#board svg text').first()).toHaveText('Red to move');

    await page.locator('#btn-menu').click();
    await page.locator('#nav-options').click();
    await page.locator('input[name="firstplayer"][value="AI"]').check();
    await page.locator('#btn-options-ok').click();

    await expect(page.locator('#app-header-title')).toHaveText('AI thinking...', { timeout: 3_000 });
    await expect(page.locator('#board svg text').first()).not.toHaveText('Red to move', { timeout: 10_000 });
  });

  test('switching AI back to human quickly keeps human turn', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#board svg text').first()).toHaveText('Red to move');

    await page.locator('#btn-menu').click();
    await page.locator('#nav-options').click();
    await page.locator('input[name="firstplayer"][value="AI"]').check();
    await page.locator('#btn-options-ok').click();

    await page.locator('#btn-menu').click();
    await page.locator('#nav-options').click();
    await page.locator('input[name="firstplayer"][value="Human"]').check();
    await page.locator('#btn-options-ok').click();

    await expect(page.locator('#board svg text').first()).toHaveText('Red to move', { timeout: 5_000 });
    await page.waitForTimeout(1_200);
    await expect(page.locator('#board svg text').first()).toHaveText('Red to move');
  });
});

test.describe('Board interaction', () => {
  test('human turn has selectable source cells', async ({ page }) => {
    await page.goto('/');
    await waitForClickableAction(page);

    const hasPointer = await page.evaluate(() => {
      const overlays = [...document.querySelectorAll('#board svg circle')];
      return overlays.some((r) => r.style.cursor === 'pointer');
    });
    expect(hasPointer).toBe(true);
  });

  test('selecting a source offers destinations', async ({ page }) => {
    await page.goto('/');
    await waitForClickableAction(page);

    const sources = await getSelectableOverlays(page);
    expect(sources.length).toBeGreaterThan(0);
    await clickOverlayAt(page, sources[0]);

    await page.waitForFunction(() => {
      const overlays = [...document.querySelectorAll('#board svg circle')];
      return overlays.some((el) => el.style.cursor === 'pointer');
    }, { timeout: 10_000 });

    const destinations = await getSelectableOverlays(page);
    expect(destinations.length).toBeGreaterThan(0);
  });

  test('default selection mode keeps selected source until moved', async ({ page }) => {
    await page.goto('/');
    await waitForClickableAction(page);

    const sources = await getSelectableOverlays(page);
    expect(sources.length).toBeGreaterThan(0);
    await clickOverlayAt(page, sources[0]);

    const selectedBefore = await getSelectedPieceCenter(page);
    expect(selectedBefore).not.toBeNull();

    const afterSelect = await getSelectableOverlays(page);
    expect(afterSelect.some((c) => c.cx === sources[0].cx && c.cy === sources[0].cy)).toBe(false);

    await clickOverlayAt(page, afterSelect[0]);
    const selectedAfter = await getSelectedPieceCenter(page);
    expect(selectedAfter).toBeNull();
  });

  test('flexible selection mode allows deselect and reselect', async ({ page }) => {
    await page.goto('/');

    await page.locator('#btn-menu').click();
    await page.locator('#nav-options').click();
    await page.locator('input[name="selectionmode"][value="Flexible"]').check();
    await page.locator('#btn-options-ok').click();

    await page.locator('#btn-menu').click();
    await page.locator('#nav-new').click();

    await waitForClickableAction(page);
    const sources = await getSelectableOverlays(page);
    expect(sources.length).toBeGreaterThan(1);

    await clickOverlayAt(page, sources[0]);
    const selectedA = await getSelectedPieceCenter(page);
    expect(selectedA).not.toBeNull();

    await clickOverlayAt(page, sources[0]);
    const deselected = await getSelectedPieceCenter(page);
    expect(deselected).toBeNull();

    await clickOverlayAt(page, sources[1]);
    const selectedB = await getSelectedPieceCenter(page);
    expect(selectedB).toEqual(sources[1]);
  });

  test('completing a legal move passes turn to yellow', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#board svg text').first()).toHaveText('Red to move');

    await playFirstLegalMove(page);

    await expect(page.locator('#board svg text').first()).toHaveText('Yellow to move', { timeout: 10_000 });
  });

  test('a jump promotion makes one crown visible', async ({ page }) => {
    await page.goto('/');

    expect(await getVisibleCrownCount(page)).toBe(0);

    await playFirstLegalMove(page);

    await expect.poll(async () => getVisibleCrownCount(page)).toBe(1);
  });

  test('new game restores initial status and pieces', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#board svg text').first()).toHaveText('Red to move');

    const before = await getPieceFills(page);
    expect(before.length).toBe(12);

    await playFirstLegalMove(page);

    await page.locator('#btn-menu').click();
    await page.locator('#nav-new').click();

    await expect(page.locator('#board svg text').first()).toHaveText('Red to move');
    const afterReset = await getPieceFills(page);
    expect(afterReset.length).toBe(12);
  });

  test('new game in human mode has immediate selectable sources', async ({ page }) => {
    await page.goto('/');

    await playFirstLegalMove(page);

    await page.locator('#btn-menu').click();
    await page.locator('#nav-new').click();

    await expect(page.locator('#board svg text').first()).toHaveText('Red to move');
    await page.waitForFunction(() => {
      const overlays = document.querySelectorAll('#board svg circle');
      return [...overlays].some((el) => el.style.cursor === 'pointer');
    }, { timeout: 800 });
  });
});

test.describe('Accessibility', () => {
  test('header button has accessible label', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#btn-menu')).toHaveAttribute('aria-label', /menu/i);
  });

  test('board SVG has an accessible label', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#board svg')).toHaveAttribute('aria-label', /Uisge game board/i);
  });

  test('panel separators use semantic separator role', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#side-panel .panel-divider[role="separator"]')).toHaveCount(2);
  });
});
