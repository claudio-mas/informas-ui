import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ActionMenu, AppShell, Avatar, Button, CloudMark, EmptyState, FileBadge, FileTable, FilterChips, Icon, IconButton, Notice, QuickCard, SearchField, SegmentedControl, SidebarLink, Skeleton, UsageMeter, ThemeSwitcher, useTheme, getVisibleFiles, type FileKind, type FileRecord, type FileSort } from '../react';
import tokens from '../tokens.json';
import darkTokens from '../tokens.dark.json';
const tokenCount=Object.values(tokens).reduce((sum,group)=>sum+Object.keys(group).length,0);

const initialFiles: FileRecord[] = [
  {id:'1',name:'Planejamento do trimestre',location:'Meus arquivos',owner:'Marina Costa',type:'doc',openedAt:'2026-10-23T12:00:00Z'},
  {id:'2',name:'Revisão de identidade',location:'Meus arquivos',owner:'Marina Costa',type:'doc',openedAt:'2026-10-22T19:14:00Z'},
  {id:'3',name:'Roteiro da apresentação',location:'Equipe de criação',owner:'Bruno Lima',type:'slides',openedAt:'2026-10-22T19:13:00Z'},
  {id:'4',name:'Anotações de pesquisa',location:'Meus arquivos',owner:'Marina Costa',type:'note',openedAt:'2026-10-22T19:11:00Z'},
  {id:'5',name:'Orçamento da equipe',location:'Equipe de criação',owner:'Bruno Lima',type:'sheet',openedAt:'2026-10-17T12:00:00Z'},
  {id:'6',name:'Guia de boas-vindas',location:'Meus arquivos',owner:'Marina Costa',type:'doc',openedAt:'2026-10-09T12:00:00Z'},
  {id:'7',name:'Calendário editorial — planejamento de conteúdo, canais e campanhas para o próximo trimestre',location:'Meus arquivos',owner:'Marina Costa',type:'sheet',openedAt:'2026-10-08T12:00:00Z'},
];
const apps: {kind: FileKind; title:string; description:string}[] = [
  {kind:'doc',title:'Documentos',description:'Dê forma às suas ideias'},
  {kind:'slides',title:'Apresentações',description:'Compartilhe sua próxima ideia'},
  {kind:'sheet',title:'Planilhas',description:'Faça mais com seus dados'},
  {kind:'note',title:'Anotações',description:'Guarde o que inspira você'},
];
const themeOptions = [{name:'Azul original',color:'#0f6cbd',indigo:'#4b3faa',darkForeground:'#75b6f5'},{name:'Verde floresta',color:'#107c41',indigo:'#25655d',darkForeground:'#77cf9b'},{name:'Violeta',color:'#7446b9',indigo:'#463c9d',darkForeground:'#c3a6f5'}];

function Modal({ title, children, onClose }: { title:string; children:React.ReactNode; onClose:()=>void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const previous = useRef<HTMLElement | null>(null);
  useEffect(() => { previous.current=document.activeElement as HTMLElement; ref.current?.showModal(); return () => { previous.current?.focus(); }; }, []);
  return <dialog ref={ref} className="demo-dialog cs-ui" aria-label={title} onCancel={event=>{event.preventDefault();onClose();}} onClick={event=>{if(event.target===event.currentTarget)onClose();}}><div className="demo-dialog-heading"><h2>{title}</h2><IconButton label="Fechar janela" icon="close" onClick={onClose}/></div>{children}<div className="demo-dialog-footer"><Button onClick={onClose}>Fechar</Button></div></dialog>;
}
export function App() {
  const {resolvedTheme}=useTheme();
  const [page,setPage]=useState('workspace');
  const [nav,setNav]=useState('home');
  const [files,setFiles]=useState(initialFiles);
  const [globalQuery,setGlobalQuery]=useState('');
  const [query,setQuery]=useState('');
  const [kinds,setKinds]=useState<FileKind[]>([]);
  const [selection,setSelection]=useState<Set<string>>(new Set());
  const [sort,setSort]=useState<FileSort>('openedAt');
  const [direction,setDirection]=useState<'asc'|'desc'>('desc');
  const [notice,setNotice]=useState(true);
  const [toast,setToast]=useState('');
  const [theme,setTheme]=useState(0);
  const [modal,setModal]=useState<{title:string;body:React.ReactNode}|null>(null);
  const upload=useRef<HTMLInputElement>(null);
  const catalog=page==='catalog';
  useEffect(()=>{ if(!toast)return; const timer=setTimeout(()=>setToast(''),4000);return()=>clearTimeout(timer); },[toast]);
  const changePage=(value:string)=>{setPage(value);window.scrollTo({top:0});};
  const customize=()=>setModal({title:'Aparência',body:<><ThemeSwitcher/><p style={{marginTop:20}}>Claro e Escuro mantêm sua escolha. Sistema acompanha a aparência do computador. Sua preferência será lembrada neste navegador.</p></>});
  const addFile=(kind:FileKind)=>{
    const names={doc:'Documento sem título',sheet:'Planilha sem título',slides:'Apresentação sem título',note:'Anotação sem título'};
    setFiles(current=>[{id:crypto.randomUUID(),name:names[kind],type:kind,location:'Meus arquivos',owner:'Marina Costa',openedAt:new Date().toISOString()},...current]);
    setNav('home');setQuery('');setGlobalQuery('');setKinds([]);setToast('Novo arquivo adicionado à demonstração.');
  };
  const navFiles=nav==='shared'?files.filter(f=>f.owner!=='Marina Costa'):nav==='mine'?files.filter(f=>f.owner==='Marina Costa'):nav==='trash'?[]:files;
  const visible=getVisibleFiles(getVisibleFiles(navFiles,{query:globalQuery}),{query,kinds,sort,direction});
  const onSort=(key:FileSort)=>{setSort(key);setDirection(sort===key&&direction==='asc'?'desc':'asc');};
  const chosenTheme=themeOptions[theme];
  const style={'--cs-color-brand':chosenTheme.color,'--cs-color-brand-indigo':chosenTheme.indigo,'--cs-color-brand-foreground':resolvedTheme==='dark'?chosenTheme.darkForeground:chosenTheme.color} as CSSProperties;
  const sidebar=catalog?<>
    <div className="demo-catalog-identity"><span className="demo-eyebrow">CLOUDSCAPE UI</span><strong>Design system</strong><small>Fundamentos para criar com clareza.</small></div>
    <nav aria-label="Seções do design system"><SidebarLink icon="home" href="#overview">Visão geral</SidebarLink><SidebarLink icon="grid" href="#cores">Cores e tokens</SidebarLink><SidebarLink icon="file" href="#tipografia">Tipografia e espaço</SidebarLink><SidebarLink icon="folder" href="#componentes">Componentes</SidebarLink><SidebarLink icon="settings" href="#personalizar">Personalização</SidebarLink></nav>
    <div className="cs-sidebar-bottom"><div className="demo-source-note"><Icon name="info"/><p>Inspirado na tela inicial do OneDrive.<br/>Construído para a sua próxima aplicação.</p><small>CSS · Tokens · React · TypeScript</small></div><Button icon="home" onClick={()=>changePage('workspace')}>Ver aplicação de exemplo</Button></div>
  </>:<>
    <div className="cs-sidebar-create"><ActionMenu label="Criar ou carregar" items={[{label:'Novo documento',icon:'file',onSelect:()=>addFile('doc')},{label:'Nova planilha',icon:'grid',onSelect:()=>addFile('sheet')},{label:'Nova apresentação',icon:'file',onSelect:()=>addFile('slides')},{label:'Carregar arquivos',icon:'upload',onSelect:()=>upload.current?.click()}]}/></div>
    <div className="cs-sidebar-account">Marina Costa</div>
    <nav aria-label="Arquivos"><SidebarLink icon="home" active={nav==='home'} onClick={()=>setNav('home')}>Página inicial</SidebarLink><SidebarLink icon="folder" active={nav==='mine'} onClick={()=>setNav('mine')}>Meus arquivos</SidebarLink><SidebarLink icon="people" active={nav==='shared'} onClick={()=>setNav('shared')}>Compartilhado</SidebarLink><SidebarLink icon="trash" active={nav==='trash'} onClick={()=>setNav('trash')}>Lixeira</SidebarLink></nav>
    <div className="cs-sidebar-group">Procurar arquivos por</div><nav aria-label="Explorar"><SidebarLink icon="person" active={nav==='people'} onClick={()=>{setNav('people');setSort('owner');setDirection('asc');}}>Pessoas</SidebarLink></nav>
    <div className="cs-sidebar-bottom"><div className="cs-sidebar-promo"><p>Seu próximo projeto,<br/>com mais consistência visual.</p><Button icon="diamond" onClick={()=>changePage('catalog')}>Explorar o sistema</Button></div><UsageMeter value={2.9} max={5} label="Armazenamento" detail="2,9 GB usado de 5 GB (58%)"/></div>
  </>;
  return <AppShell style={style} sidebar={sidebar} header={<>
    <div className="cs-header-left"><IconButton label="Sobre o Cloudscape" icon="grid" onClick={()=>setModal({title:'Cloudscape UI',body:<p>Uma biblioteca visual independente, inspirada na experiência da página inicial do OneDrive. Todos os dados desta demonstração são fictícios.</p>})}/><CloudMark/><SegmentedControl label="Visualização" options={[{value:'workspace',label:'Arquivos',accessibleLabel:'Aplicação de exemplo'},{value:'catalog',label:'Sistema',accessibleLabel:'Catálogo do sistema'}]} value={page} onChange={changePage}/></div>
    <SearchField label="Pesquisar" value={globalQuery} onChange={value=>{setGlobalQuery(value);setPage('workspace');}} className="cs-header-search"/>
    <div className="cs-header-actions"><Button variant="soft" icon="sparkles" onClick={customize}>Personalizar aparência</Button><IconButton label="Configurações de aparência" icon="settings" data-appearance-trigger onClick={customize}/><Avatar initials="MC" name="Marina Costa, conta de demonstração" onClick={()=>setModal({title:'Conta de demonstração',body:<p>Marina Costa é uma pessoa fictícia. Não há conexão entre esta demonstração e sua conta Microsoft.</p>})}/></div>
  </>}>
    <input className="cs-sr-only" tabIndex={-1} ref={upload} type="file" multiple aria-label="Escolher arquivos para demonstração" onChange={event=>{ const chosen=[...(event.target.files??[])];setFiles(current=>[...chosen.map(file=>({id:crypto.randomUUID(),name:file.name,location:'Arquivos locais',owner:'Marina Costa',type:(/\.(xlsx?|csv)$/i.test(file.name)?'sheet':/\.(pptx?)$/i.test(file.name)?'slides':'doc') as FileKind,openedAt:new Date().toISOString()})),...current]);if(chosen.length)setToast(`${chosen.length} arquivo(s) adicionado(s) apenas nesta demonstração. Nenhum envio foi feito.`);event.target.value=''; }}/>
    {catalog?<Catalog theme={theme} onTheme={setTheme} notify={setToast} onWorkspace={()=>changePage('workspace')}/>:<>
      {notice&&<Notice onDismiss={()=>setNotice(false)} actions={<><Button variant="ghost" onClick={()=>setModal({title:'Armazenamento de exemplo',body:<UsageMeter value={2.9} max={5} label="Uso do espaço" detail="2,9 GB de 5 GB · Dados demonstrativos"/>})}>Gerenciar armazenamento</Button><Button onClick={()=>changePage('catalog')}>Conhecer o sistema</Button></>}><strong>Espaço para o que vem a seguir.</strong> Você usou 2,9 GB. Organize suas ideias e mantenha seus projetos por perto.</Notice>}
      {nav==='home'&&<section className="demo-intro"><h1>Introdução</h1><div className="demo-quick-cards">{apps.map(app=><QuickCard key={app.kind} {...app} onClick={()=>addFile(app.kind)}/>)}</div></section>}
      <section className={`demo-recent ${nav!=='home'?'demo-recent--standalone':''}`} aria-label="Lista de arquivos"><h2>{{home:'Recente',mine:'Meus arquivos',shared:'Compartilhado',trash:'Lixeira',people:'Arquivos por pessoa'}[nav]}</h2><div className="demo-toolbar"><FilterChips value={kinds} onChange={setKinds}/>{selection.size>0&&<div className="demo-selection"><span>{selection.size} selecionados</span><Button variant="ghost" onClick={()=>setSelection(new Set())}>Limpar seleção</Button></div>}<SearchField label="Filtrar por nome ou pessoa" value={query} onChange={setQuery} className="demo-filter-search"/></div>
      {visible.length?<FileTable files={visible} selection={selection} onSelectionChange={setSelection} sort={sort} direction={direction} onSort={onSort} onOpen={file=>setModal({title:file.name,body:<div className="demo-file-details"><FileBadge kind={file.type}/><dl><dt>Local</dt><dd>{file.location}</dd><dt>Proprietário</dt><dd>{file.owner}</dd><dt>Sobre este exemplo</dt><dd>Este item demonstra a interface. Nenhum documento real foi aberto.</dd></dl></div>})}/>:<EmptyState title={nav==='trash'?'Sua lixeira está vazia':'Nenhum arquivo encontrado'} description={nav==='trash'?'Tudo em ordem por aqui.':'Tente outro nome ou ajuste os filtros.'} action={nav!=='trash'?<Button onClick={()=>{setQuery('');setGlobalQuery('');setKinds([]);}}>Limpar filtros</Button>:undefined}/>}</section>
    </>}
    {toast&&<div className="demo-toast" role="status"><Icon name="check"/>{toast}</div>}
    {modal&&<Modal title={modal.title} onClose={()=>setModal(null)}>{modal.body}</Modal>}
  </AppShell>;
}

function Catalog({theme,onTheme,notify,onWorkspace}:{theme:number;onTheme:(value:number)=>void;notify:(value:string)=>void;onWorkspace:()=>void}) {
  const {resolvedTheme}=useTheme();
  const paletteColors={...tokens.color,...(resolvedTheme==='dark'?darkTokens.color:{}),brand:themeOptions[theme].color,'brand-indigo':themeOptions[theme].indigo};
  const [search,setSearch]=useState('');
  const [segment,setSegment]=useState('recent');
  const [filter,setFilter]=useState<FileKind[]>(['doc']);
  const [catalogNotice,setCatalogNotice]=useState(true);
  const [loading,setLoading]=useState(false);
  const palette=[['canvas','Fundo da aplicação'],['surface','Superfície'],['text','Texto principal'],['text-secondary','Texto de apoio'],['brand','Marca'],['brand-indigo','Destaque'],['border','Borda'],['surface-selected','Seleção']] as const;
  const copy=async(value:string)=>{try{await navigator.clipboard.writeText(value);notify(`${value} copiado.`);}catch{notify('Não foi possível copiar. O valor permanece visível no cartão.');}};
  const download=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({light:tokens,dark:darkTokens},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='cloudscape.themes.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  return <div className="demo-catalog">
    <section className="demo-catalog-hero" id="overview"><div className="demo-hero-top"><span className="demo-eyebrow">CLOUDSCAPE / WEB UI KIT</span><span className="demo-version">1.1 · {resolvedTheme==='dark'?'Tema escuro':'Tema claro'}</span></div><h1>Um sistema.<br/>Muitas possibilidades.</h1><p>A familiaridade de uma boa interface de arquivos,<br className="demo-desktop-break"/> transformada em uma base para os seus projetos.</p><div className="demo-hero-actions"><Button variant="primary" icon="grid" onClick={onWorkspace}>Explorar a aplicação</Button><Button icon="download" onClick={download}>Baixar tokens</Button></div><div className="demo-system-facts"><span><strong>{tokenCount}</strong>tokens de design</span><span><strong>18</strong>componentes React</span><span><strong>4 px</strong>unidade de espaço</span><span><strong>100%</strong>personalizável</span></div></section>
    <section className="demo-catalog-section" id="cores"><SectionTitle index="01" title="Clareza começa na base." description="Neutros que deixam o conteúdo respirar. Azul que orienta a próxima ação."/><div className="demo-palette">{palette.map(([key,label])=><button key={key} className="demo-swatch" onClick={()=>copy(paletteColors[key])} aria-label={`Copiar ${label} ${paletteColors[key]}`}><span className="demo-swatch-color" style={{background:`var(--cs-color-${key})`}}/><span className="demo-swatch-label">{label}<code>{paletteColors[key]}</code></span></button>)}</div><p className="demo-caption">Clique em uma cor para copiar o valor do tema ativo. As variáveis semânticas mantêm o uso consistente.</p></section>
    <section className="demo-catalog-section" id="tipografia"><SectionTitle index="02" title="Hierarquia, sem esforço." description="Segoe UI e uma escala de espaçamento simples aproximam cada tela da referência."/><div className="demo-foundations"><div className="demo-type-scale"><div><span style={{fontSize:32,lineHeight:'40px',fontWeight:600}}>Ideias em movimento</span><code>32 / 40 · Semibold</code></div><div><span style={{fontSize:24,lineHeight:'32px',fontWeight:600}}>Tudo no seu lugar</span><code>24 / 32 · Semibold</code></div><div><span style={{fontSize:16,lineHeight:'22px',fontWeight:600}}>Pequenos detalhes importam</span><code>16 / 22 · Semibold</code></div><div><span>Uma interface que ajuda você a continuar.</span><code>14 / 20 · Regular</code></div><div><small>Informação de apoio, sempre legível.</small><code>12 / 16 · Regular</code></div></div><div className="demo-spacing"><h3>O ritmo dos espaços</h3>{[4,8,12,16,24,32,40,48].map(value=><div key={value}><code>{value}</code><span style={{width:value*3}}/><small>px</small></div>)}<p className="demo-caption">Uma escala de 4 px para composições que se alinham naturalmente.</p></div></div><div className="demo-radius-row">{[4,8,12,999].map((value,i)=><div key={value}><span style={{borderRadius:value}}/><p>{['Pequeno','Médio','Grande','Cápsula'][i]}<code>{value===999?'999px':`${value}px`}</code></p></div>)}</div></section>
    <section className="demo-catalog-section" id="componentes"><SectionTitle index="03" title="Peças que trabalham juntas." description="Componentes para navegar, organizar e agir. Experimente os estados abaixo."/><div className="demo-component-panel"><div className="demo-panel-title"><h3>Ações</h3><code>Button · ActionMenu · IconButton</code></div><div className="demo-component-sample"><Button variant="primary" icon="plus" onClick={()=>notify('Ação principal acionada.')}>Criar projeto</Button><Button onClick={()=>notify('Alterações salvas nesta demonstração.')}>Salvar alterações</Button><Button variant="ghost" onClick={()=>notify('Ação discreta acionada.')}>Saiba mais</Button><Button disabled>Indisponível</Button><ActionMenu label="Mais opções" icon="more" variant="secondary" items={[{label:'Renomear',icon:'file',onSelect:()=>notify('Renomear: conecte esta ação ao seu projeto.')},{label:'Compartilhar',icon:'people',onSelect:()=>notify('Compartilhar: exemplo de callback.')}]}/><IconButton label="Adicionar exemplo" icon="plus" onClick={()=>notify('Novo exemplo adicionado.')}/></div></div>
    <div className="demo-component-panel"><div className="demo-panel-title"><h3>Busca e filtros</h3><code>SearchField · SegmentedControl · FilterChips</code></div><div className="demo-component-sample"><SearchField label="Pesquisar no exemplo" value={search} onChange={setSearch}/><SegmentedControl label="Exemplo de período" options={[{value:'recent',label:'Recentes'},{value:'all',label:'Todos'}]} value={segment} onChange={setSegment}/><FilterChips value={filter} onChange={setFilter}/></div><p className="demo-caption">{search?`Busca controlada: “${search}”`:'Busca com ação de limpar e estados de foco.'} · {filter.length} tipo(s) selecionado(s).</p></div>
    <div className="demo-component-panel"><div className="demo-panel-title"><h3>Atalhos e identidade</h3><code>QuickCard · FileBadge · Avatar · UsageMeter</code></div><div className="demo-component-sample">{apps.slice(0,2).map(app=><QuickCard key={app.kind} {...app} onClick={()=>notify(`Atalho ${app.title} acionado.`)}/>)}<div className="demo-badge-sample">{apps.map(app=><FileBadge key={app.kind} kind={app.kind}/>)}<Avatar name="Pessoa de exemplo" initials="AL"/></div><div style={{width:240}}><UsageMeter label="Uso do plano" value={58} max={100} detail="58 de 100 unidades utilizadas"/></div></div></div>
    <div className="demo-component-panel"><div className="demo-panel-title"><h3>Mensagens e estados</h3><Button variant="ghost" onClick={()=>{setLoading(!loading);setCatalogNotice(true);}}>{loading?'Mostrar vazio':'Mostrar carregamento'}</Button></div>{catalogNotice&&<Notice label="Aviso de exemplo" onDismiss={()=>setCatalogNotice(false)}><strong>Seu trabalho está em boas mãos.</strong> Use mensagens curtas para orientar o próximo passo.</Notice>}<div style={{marginTop:16}}>{loading?<Skeleton/>:<EmptyState title="O próximo projeto começa aqui" description="Quando ainda não houver conteúdo, mostre um caminho claro." action={<Button variant="primary" icon="plus" onClick={()=>notify('Conecte esta ação ao fluxo de criação do seu projeto.')}>Criar primeiro projeto</Button>}/>}</div></div>
    <div className="demo-component-panel"><div className="demo-panel-title"><h3>Conteúdo organizado</h3><code>FileTable · AppShell · SidebarLink</code></div><FileTable files={initialFiles.slice(0,3)}/></div></section>
    <section className="demo-personalize" id="personalizar"><div><span className="demo-eyebrow">FEITO PARA SER SEU</span><h2>A mesma estrutura.<br/>A sua identidade.</h2><p>Escolha Claro, Escuro ou Sistema e ajuste a cor da marca.<br/>Tipografia, espaços e componentes continuam consistentes.</p></div><div className="demo-appearance"><ThemeSwitcher/><div className="demo-theme-choices" role="group" aria-label="Cor da marca">{themeOptions.map((option,index)=><button type="button" key={option.name} onClick={()=>onTheme(index)} aria-pressed={theme===index}><span style={{background:option.color}}>{theme===index&&<Icon name="check"/>}</span>{option.name}</button>)}</div></div></section>
    <footer className="demo-catalog-footer"><strong>Cloudscape UI</strong><span>Inspirado no OneDrive. Independente da Microsoft.</span><span>CSS + tokens + React / TypeScript</span></footer>
  </div>;
}
function SectionTitle({index,title,description}:{index:string;title:string;description:string}) { return <div className="demo-section-heading"><span>{index}</span><div><h2>{title}</h2><p>{description}</p></div></div>; }
