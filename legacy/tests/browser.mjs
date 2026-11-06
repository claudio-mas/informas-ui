// Run against the demo server. Uses Playwright supplied by the developer environment.
// Failures this suite catches: broken combined filters, selection leaks, focus traps,
// dismissal failures, and page overflow on mobile or with long document names.
export async function checkDemo(page, baseUrl) {
  const { strict: assert } = await import('node:assert');
  await page.goto(baseUrl);
  await page.getByRole('heading', { name: 'Introdução', exact: true }).waitFor();
  assert.equal(await page.locator('tbody tr').count(), 7);
  await page.getByRole('searchbox', { name: 'Filtrar por nome ou pessoa' }).fill('revisao');
  assert.equal(await page.locator('tbody tr').count(), 1);
  await page.getByRole('button', { name: 'Planilhas', exact: true }).click();
  await page.getByText('Nenhum arquivo encontrado', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Planilhas', exact: true }).click();
  await page.getByRole('button', { name: 'Limpar Filtrar por nome ou pessoa' }).click();
  await page.getByRole('checkbox', { name: 'Selecionar arquivos visíveis' }).check();
  await page.getByText('7 selecionados', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Limpar seleção' }).click();
  const create = page.getByRole('button', { name: 'Criar ou carregar', exact: true });
  await create.click();
  await page.getByRole('menu').waitFor();
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('menu').count(), 0);
  assert.equal(await create.evaluate(el => el === document.activeElement), true);
  await page.getByRole('button', { name: 'Fechar aviso' }).click();
  assert.equal(await page.getByRole('region', { name: 'Aviso de armazenamento' }).count(), 0);
  await page.getByRole('button', { name: 'Nome Ordenar', exact: true }).click();
  assert.match(await page.locator('tbody tr').first().innerText(), /Anotações/);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.getByRole('button', { name: 'Abrir navegação' }).click();
  await page.getByRole('button', { name: 'Fechar navegação' }).click();
  await page.getByRole('button', { name: 'Abrir navegação' }).click();
  await page.setViewportSize({ width: 1000, height: 900 });
  await page.getByRole('dialog', { name: 'Navegação principal' }).waitFor({ state: 'detached' });
  assert.equal(await page.locator('.cs-sidebar').getAttribute('aria-modal'), null);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Catálogo do sistema', exact: true }).click();
  await page.getByRole('heading', { name: 'Um sistema. Muitas possibilidades.' }).waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  return { passed: 13 };
}

// Optional regression runner for a full Playwright Page supplied by the caller.
export async function checkThemes(page, baseUrl) {
  const { strict: assert } = await import('node:assert');
  await page.emulateMedia({ colorScheme:'dark' });
  await page.goto(baseUrl);
  await page.getByRole('button',{name:'Configurações de aparência',exact:true}).click();
  await page.getByRole('button',{name:'Sistema',exact:true}).click();
  assert.equal(await page.locator('html').getAttribute('data-cs-theme'),'dark');
  await page.getByRole('button',{name:'Claro',exact:true}).click();
  assert.equal(await page.locator('html').getAttribute('data-cs-theme'),'light');
  await page.getByRole('button',{name:'Escuro',exact:true}).click();
  await page.getByRole('button',{name:'Fechar janela'}).click();
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-cs-theme-mode'),'dark');
  await page.getByRole('button',{name:'Catálogo do sistema',exact:true}).click();
  await page.getByRole('button',{name:'Violeta',exact:true}).click();
  await page.getByRole('searchbox',{name:'Pesquisar no exemplo'}).click();
  const contrast=await page.locator('.demo-component-sample .cs-search').evaluate(el=>{
    const style=getComputedStyle(el);
    const luminance=value=>{
      const rgb=value.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
      return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
    };
    const [low,high]=[luminance(style.outlineColor),luminance(style.backgroundColor)].sort((a,b)=>a-b);
    return (high+.05)/(low+.05);
  });
  assert.ok(contrast>=3,`Focus contrast ${contrast} must be at least 3:1`);
  return { passed:4 };
}
