// react/index.tsx
import { useEffect as useEffect2, useId, useRef, useState as useState2 } from "react";

// react/Icon.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var paths = {
  search: "m20 20-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  plus: "M12 4v16M4 12h16",
  close: "m6 6 12 12M6 18 18 6",
  home: "m3 10 9-7 9 7v11h-6v-7H9v7H3Z",
  folder: "M3 6h7l2 3h9v11H3ZM3 6V4h7l2 3",
  people: "M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8M18 4a4 4 0 0 1 0 8M22 21v-3a4 4 0 0 0-3-3.87",
  trash: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7",
  person: "M20 21a8 8 0 0 0-16 0M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10",
  settings: "m9 3-1 3-3 1-2 3 2 2v3l2 3h3l2 3 3-1 1-3 3-1 2-3-2-2V8l-2-3h-3l-2-3ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  diamond: "m3 8 4-5h10l4 5-9 13ZM3 8h18M7 3l5 18 5-18",
  chevron: "m7 10 5 5 5-5",
  check: "m5 12 4 4L19 6",
  arrow: "M12 19V5m-5 5 5-5 5 5",
  menu: "M4 6h16M4 12h16M4 18h16",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  info: "M12 11v6m0-10h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  upload: "M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5",
  file: "M6 2h8l5 5v15H6ZM14 2v6h5M9 12h7M9 16h7",
  grid: "M4 4h5v5H4ZM15 4h5v5h-5ZM4 15h5v5H4ZM15 15h5v5h-5Z",
  sparkles: "m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3ZM20 2v4M18 4h4",
  download: "M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4"
};
function Icon({ name, ...props }) {
  return /* @__PURE__ */ jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false", ...props, children: /* @__PURE__ */ jsx("path", { d: paths[name] }) });
}
function CloudMark() {
  return /* @__PURE__ */ jsxs("svg", { width: "36", height: "30", viewBox: "0 0 40 32", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx("path", { fill: "#0f6cbd", d: "M10 27a9 9 0 0 1-2-18 11 11 0 0 1 20 0 9 9 0 0 1 2 18Z" }),
    /* @__PURE__ */ jsx("path", { fill: "#42b5f5", d: "M20 6a11 11 0 0 1 8 3 9 9 0 0 1 2 18H12Z" }),
    /* @__PURE__ */ jsx("path", { fill: "#2457ad", d: "M10 27a9 9 0 0 1-2-18l12 7Z" })
  ] });
}

// react/data.ts
var normalize = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
function getVisibleFiles(files, { query = "", kinds: kinds2 = [], sort, direction = "asc" } = {}) {
  const term = normalize(query);
  const visible = files.filter((file) => (!kinds2.length || kinds2.includes(file.type)) && (!term || normalize(`${file.name} ${file.owner} ${file.location}`).includes(term)));
  if (!sort) return visible;
  return visible.sort((a, b) => {
    const comparison = sort === "openedAt" ? (Date.parse(a.openedAt) || 0) - (Date.parse(b.openedAt) || 0) : a[sort].localeCompare(b[sort], "pt-BR", { sensitivity: "base", numeric: true });
    return direction === "desc" ? -comparison : comparison;
  });
}
function toggleVisibleSelection(selected, visibleIds) {
  const next = new Set(selected);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  visibleIds.forEach((id) => allVisibleSelected ? next.delete(id) : next.add(id));
  return next;
}

// react/Theme.tsx
import { createContext, useContext, useEffect, useLayoutEffect, useState, useSyncExternalStore } from "react";

// react/theme-store.ts
var THEME_STORAGE_KEY = "cloudscape.theme";
function createThemeStore({ system, storage, storageKey = THEME_STORAGE_KEY, apply } = {}) {
  let preference = "system";
  try {
    const saved = storage?.getItem(storageKey);
    if (saved === "light" || saved === "dark" || saved === "system") preference = saved;
  } catch {
  }
  const resolve = () => preference === "system" ? system?.matches ? "dark" : "light" : preference;
  let state = { preference, resolvedTheme: resolve() };
  const listeners = /* @__PURE__ */ new Set();
  const update = () => {
    const next = { preference, resolvedTheme: resolve() };
    if (next.preference === state.preference && next.resolvedTheme === state.resolvedTheme) return;
    state = next;
    apply?.(state.resolvedTheme, state.preference);
    listeners.forEach((listener) => listener());
  };
  return {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    setPreference(value) {
      preference = value;
      try {
        storage?.setItem(storageKey, value);
      } catch {
      }
      update();
    },
    start() {
      update();
      apply?.(state.resolvedTheme, state.preference);
      system?.addEventListener("change", update);
      return () => system?.removeEventListener("change", update);
    }
  };
}

// react/Theme.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var ThemeContext = createContext(null);
var serverState = { preference: "system", resolvedTheme: "light" };
var useBrowserEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
function browserEnvironment(storageKey) {
  if (typeof window === "undefined") return {};
  let storage;
  try {
    storage = window.localStorage;
  } catch {
  }
  return { storage, storageKey, system: window.matchMedia?.("(prefers-color-scheme: dark)"), apply(theme, preference) {
    document.documentElement.dataset.csTheme = theme;
    document.documentElement.dataset.csThemeMode = preference;
    document.documentElement.style.colorScheme = theme;
  } };
}
function ThemeProvider({ children, storageKey }) {
  const [store] = useState(() => createThemeStore(browserEnvironment(storageKey)));
  useBrowserEffect(() => store.start(), [store]);
  return /* @__PURE__ */ jsx2(ThemeContext.Provider, { value: store, children });
}
function useTheme() {
  const store = useContext(ThemeContext);
  if (!store) throw new Error("useTheme must be used inside ThemeProvider.");
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, () => serverState);
  return { ...state, setPreference: store.setPreference };
}
function ThemeSwitcher() {
  const { preference, setPreference } = useTheme();
  return /* @__PURE__ */ jsxs2("div", { className: "cs-theme-switcher", children: [
    /* @__PURE__ */ jsx2("span", { children: "Apar\xEAncia" }),
    /* @__PURE__ */ jsx2("div", { className: "cs-segmented", role: "group", "aria-label": "Tema da interface", children: [{ value: "light", label: "Claro" }, { value: "dark", label: "Escuro" }, { value: "system", label: "Sistema" }].map((option) => /* @__PURE__ */ jsx2("button", { type: "button", "aria-pressed": preference === option.value, onClick: () => setPreference(option.value), children: option.label }, option.value)) })
  ] });
}

// react/index.tsx
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function Button({ variant = "secondary", icon, children, className = "", ...props }) {
  return /* @__PURE__ */ jsxs3("button", { type: "button", className: `cs-button cs-button--${variant} ${className}`, ...props, children: [
    icon && /* @__PURE__ */ jsx3(Icon, { name: icon }),
    /* @__PURE__ */ jsx3("span", { children })
  ] });
}
function IconButton({ label, icon, ...props }) {
  return /* @__PURE__ */ jsx3("button", { type: "button", className: "cs-icon-button", "aria-label": label, title: label, ...props, children: /* @__PURE__ */ jsx3(Icon, { name: icon }) });
}
function Avatar({ initials, name, onClick }) {
  return onClick ? /* @__PURE__ */ jsx3("button", { type: "button", className: "cs-avatar", "aria-label": name, onClick, children: initials }) : /* @__PURE__ */ jsx3("span", { className: "cs-avatar", role: "img", "aria-label": name, children: initials });
}
function SearchField({ label, value, onChange, className = "" }) {
  return /* @__PURE__ */ jsxs3("label", { className: `cs-search ${className}`, children: [
    /* @__PURE__ */ jsx3(Icon, { name: "search" }),
    /* @__PURE__ */ jsx3("span", { className: "cs-sr-only", children: label }),
    /* @__PURE__ */ jsx3("input", { type: "search", placeholder: label, value, onChange: (event) => onChange(event.target.value) }),
    value && /* @__PURE__ */ jsx3("button", { type: "button", className: "cs-search-clear", "aria-label": `Limpar ${label}`, onClick: () => onChange(""), children: /* @__PURE__ */ jsx3(Icon, { name: "close", width: "16", height: "16" }) })
  ] });
}
function SegmentedControl({ label, options, value, onChange }) {
  return /* @__PURE__ */ jsx3("div", { className: "cs-segmented", role: "group", "aria-label": label, children: options.map((option) => /* @__PURE__ */ jsx3("button", { type: "button", "aria-label": option.accessibleLabel, "aria-pressed": value === option.value, onClick: () => onChange(option.value), children: option.label }, option.value)) });
}
function Notice({ children, actions, onDismiss, label = "Aviso de armazenamento" }) {
  return /* @__PURE__ */ jsxs3("section", { className: "cs-notice", "aria-label": label, children: [
    /* @__PURE__ */ jsx3(Icon, { name: "info", width: "16", height: "16" }),
    /* @__PURE__ */ jsx3("div", { className: "cs-notice-content", children }),
    actions && /* @__PURE__ */ jsx3("div", { className: "cs-notice-actions", children: actions }),
    onDismiss && /* @__PURE__ */ jsx3(IconButton, { label: "Fechar aviso", icon: "close", onClick: onDismiss })
  ] });
}
var FILE_LABELS = { doc: "Documento", sheet: "Planilha", slides: "Apresenta\xE7\xE3o", note: "Anota\xE7\xE3o" };
function FileBadge({ kind, small = false }) {
  return /* @__PURE__ */ jsxs3("span", { className: `cs-file-badge cs-file-badge--${kind} ${small ? "cs-file-badge--small" : ""}`, role: "img", "aria-label": FILE_LABELS[kind], children: [
    /* @__PURE__ */ jsx3("span", { className: "cs-file-page" }),
    /* @__PURE__ */ jsx3("span", { className: "cs-file-letter", "aria-hidden": "true", children: { doc: "D", sheet: "P", slides: "A", note: "N" }[kind] })
  ] });
}
function QuickCard({ kind, title, description, onClick }) {
  return /* @__PURE__ */ jsxs3("button", { type: "button", className: "cs-quick-card", onClick, children: [
    /* @__PURE__ */ jsx3(FileBadge, { kind }),
    /* @__PURE__ */ jsxs3("span", { children: [
      /* @__PURE__ */ jsx3("strong", { children: title }),
      /* @__PURE__ */ jsx3("small", { children: description })
    ] })
  ] });
}
var kinds = ["doc", "sheet", "slides", "note"];
var pluralLabels = { doc: "Documentos", sheet: "Planilhas", slides: "Apresenta\xE7\xF5es", note: "Anota\xE7\xF5es" };
function FilterChips({ value, onChange }) {
  return /* @__PURE__ */ jsx3("div", { className: "cs-filter-chips", role: "group", "aria-label": "Tipos de arquivo", children: kinds.map((kind) => /* @__PURE__ */ jsx3("button", { type: "button", title: pluralLabels[kind], "aria-label": pluralLabels[kind], "aria-pressed": value.includes(kind), onClick: () => onChange(value.includes(kind) ? value.filter((item) => item !== kind) : [...value, kind]), children: /* @__PURE__ */ jsx3(FileBadge, { kind, small: true }) }, kind)) });
}
function UsageMeter({ value, max, label, detail }) {
  const percent = max > 0 ? Math.max(0, Math.min(100, value / max * 100)) : 0;
  return /* @__PURE__ */ jsxs3("div", { className: "cs-usage", children: [
    /* @__PURE__ */ jsx3("strong", { children: label }),
    /* @__PURE__ */ jsx3("div", { role: "meter", "aria-label": label, "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": Math.round(percent), "aria-valuetext": detail, className: "cs-usage-track", children: /* @__PURE__ */ jsx3("span", { style: { width: `${percent}%` } }) }),
    detail && /* @__PURE__ */ jsx3("small", { children: detail })
  ] });
}
function SidebarLink({ children, icon, href = "#", active = false, onClick }) {
  return /* @__PURE__ */ jsxs3("a", { className: `cs-sidebar-link ${active ? "is-active" : ""}`, href, "aria-current": active ? "page" : void 0, onClick: onClick ? (event) => {
    event.preventDefault();
    onClick();
  } : void 0, children: [
    /* @__PURE__ */ jsx3(Icon, { name: icon }),
    /* @__PURE__ */ jsx3("span", { children })
  ] });
}
function ActionMenu({ label, items, icon = "plus", variant = "primary" }) {
  const [open, setOpen] = useState2(false);
  const root = useRef(null);
  const trigger = useRef(null);
  const menu = useRef(null);
  const id = useId();
  const restore = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  useEffect2(() => {
    if (!open) return;
    menu.current?.querySelector("button:not(:disabled)")?.focus();
    const outside = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  const handleKey = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      restore();
      return;
    }
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const buttons = [...menu.current?.querySelectorAll("button:not(:disabled)") ?? []];
    const index = buttons.indexOf(document.activeElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next]?.focus();
  };
  return /* @__PURE__ */ jsxs3("div", { ref: root, className: "cs-action-menu", children: [
    /* @__PURE__ */ jsxs3("button", { ref: trigger, type: "button", className: `cs-button cs-button--${variant}`, "aria-haspopup": "menu", "aria-expanded": open, "aria-controls": open ? id : void 0, onClick: () => setOpen(!open), onKeyDown: (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setOpen(true);
      }
    }, children: [
      /* @__PURE__ */ jsx3(Icon, { name: icon }),
      /* @__PURE__ */ jsx3("span", { children: label })
    ] }),
    open && /* @__PURE__ */ jsx3("div", { id, ref: menu, className: "cs-menu", role: "menu", "aria-label": label, onKeyDown: handleKey, children: items.map((item) => /* @__PURE__ */ jsxs3("button", { type: "button", role: "menuitem", disabled: item.disabled, onClick: () => {
      item.onSelect?.();
      restore();
    }, children: [
      item.icon && /* @__PURE__ */ jsx3(Icon, { name: item.icon }),
      /* @__PURE__ */ jsx3("span", { children: item.label })
    ] }, item.label)) })
  ] });
}
function BulkCheckbox({ checked, mixed, onChange }) {
  const ref = useRef(null);
  useEffect2(() => {
    if (ref.current) ref.current.indeterminate = mixed;
  }, [mixed]);
  return /* @__PURE__ */ jsx3("input", { ref, type: "checkbox", checked, "aria-label": "Selecionar arquivos vis\xEDveis", onChange });
}
var defaultDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? "Data indispon\xEDvel" : new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", timeZone: "UTC" }).format(date);
};
function FileTable({ files, selection = /* @__PURE__ */ new Set(), onSelectionChange, sort, direction = "asc", onSort, onOpen, formatDate = defaultDate }) {
  const all = files.length > 0 && files.every((file) => selection.has(file.id));
  const some = files.some((file) => selection.has(file.id));
  const headers = [{ key: "name", label: "Nome" }, { key: "openedAt", label: "Aberto" }, { key: "owner", label: "Propriet\xE1rio" }];
  return /* @__PURE__ */ jsx3("div", { className: "cs-table-wrap", tabIndex: 0, role: "region", "aria-label": "Arquivos recentes, tabela com rolagem horizontal", children: /* @__PURE__ */ jsxs3("table", { className: "cs-file-table", children: [
    /* @__PURE__ */ jsx3("thead", { children: /* @__PURE__ */ jsxs3("tr", { children: [
      onSelectionChange && /* @__PURE__ */ jsx3("th", { className: "cs-selection-cell", children: /* @__PURE__ */ jsx3(BulkCheckbox, { checked: all, mixed: some && !all, onChange: () => onSelectionChange(toggleVisibleSelection(selection, files.map((file) => file.id))) }) }),
      headers.map((header) => /* @__PURE__ */ jsx3("th", { scope: "col", "aria-sort": sort === header.key ? direction === "asc" ? "ascending" : "descending" : void 0, children: onSort ? /* @__PURE__ */ jsxs3("button", { type: "button", onClick: () => onSort(header.key), "aria-label": `${header.label} Ordenar`, children: [
        header.label,
        sort === header.key && /* @__PURE__ */ jsx3(Icon, { name: "arrow", className: direction === "desc" ? "cs-arrow-down" : "", width: "14", height: "14" })
      ] }) : header.label }, header.key))
    ] }) }),
    /* @__PURE__ */ jsx3("tbody", { children: files.map((file) => /* @__PURE__ */ jsxs3("tr", { className: selection.has(file.id) ? "is-selected" : "", children: [
      onSelectionChange && /* @__PURE__ */ jsx3("td", { className: "cs-selection-cell", children: /* @__PURE__ */ jsx3("input", { type: "checkbox", "aria-label": `Selecionar ${file.name}`, checked: selection.has(file.id), onChange: () => {
        const next = new Set(selection);
        next.has(file.id) ? next.delete(file.id) : next.add(file.id);
        onSelectionChange(next);
      } }) }),
      /* @__PURE__ */ jsx3("td", { className: "cs-name-cell", children: /* @__PURE__ */ jsxs3("div", { className: "cs-file-name", children: [
        /* @__PURE__ */ jsx3(FileBadge, { kind: file.type }),
        /* @__PURE__ */ jsxs3("span", { children: [
          onOpen ? /* @__PURE__ */ jsx3("button", { type: "button", className: "cs-file-open", onClick: () => onOpen(file), title: file.name, children: file.name }) : /* @__PURE__ */ jsx3("strong", { title: file.name, children: file.name }),
          /* @__PURE__ */ jsx3("small", { children: file.location })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx3("td", { children: /* @__PURE__ */ jsx3("time", { dateTime: file.openedAt, children: formatDate(file.openedAt) }) }),
      /* @__PURE__ */ jsx3("td", { children: /* @__PURE__ */ jsx3("span", { className: "cs-owner", title: file.owner, children: file.owner }) })
    ] }, file.id)) })
  ] }) });
}
function EmptyState({ title = "Nenhum arquivo encontrado", description = "Tente outro nome ou ajuste os filtros.", action }) {
  return /* @__PURE__ */ jsxs3("div", { className: "cs-empty", role: "status", children: [
    /* @__PURE__ */ jsx3("span", { className: "cs-empty-icon", children: /* @__PURE__ */ jsx3(Icon, { name: "search", width: "28", height: "28" }) }),
    /* @__PURE__ */ jsx3("h3", { children: title }),
    /* @__PURE__ */ jsx3("p", { children: description }),
    action
  ] });
}
function Skeleton({ rows = 3 }) {
  return /* @__PURE__ */ jsxs3("div", { className: "cs-skeleton", role: "status", children: [
    /* @__PURE__ */ jsx3("span", { className: "cs-sr-only", children: "Carregando arquivos" }),
    Array.from({ length: rows }, (_, i) => /* @__PURE__ */ jsxs3("div", { "aria-hidden": "true", children: [
      /* @__PURE__ */ jsx3("span", {}),
      /* @__PURE__ */ jsx3("span", {}),
      /* @__PURE__ */ jsx3("span", {})
    ] }, i))
  ] });
}
function AppShell({ header, sidebar, children, style }) {
  const [open, setOpen] = useState2(false);
  const trigger = useRef(null);
  const aside = useRef(null);
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  useEffect2(() => {
    if (open) aside.current?.querySelector("button")?.focus();
  }, [open]);
  useEffect2(() => {
    const desktop = window.matchMedia("(min-width: 761px)");
    const releaseDrawer = () => {
      if (!desktop.matches) return;
      setOpen(false);
      if (aside.current?.querySelector(".cs-mobile-close")?.contains(document.activeElement)) {
        aside.current.querySelector(".cs-sidebar-create button, nav a[href]")?.focus();
      }
    };
    desktop.addEventListener("change", releaseDrawer);
    return () => desktop.removeEventListener("change", releaseDrawer);
  }, []);
  const navKey = (event) => {
    if (!open) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
    if (event.key === "Tab") {
      const controls = [...aside.current?.querySelectorAll("a[href],button:not(:disabled),input") ?? []];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  };
  return /* @__PURE__ */ jsxs3("div", { className: "cs-ui cs-app", style, children: [
    /* @__PURE__ */ jsx3("a", { href: "#cs-main", className: "cs-skip-link", children: "Pular para o conte\xFAdo" }),
    /* @__PURE__ */ jsxs3("header", { className: "cs-topbar", children: [
      /* @__PURE__ */ jsx3("button", { type: "button", ref: trigger, className: "cs-icon-button cs-mobile-toggle", "aria-label": "Abrir navega\xE7\xE3o", "aria-expanded": open, onClick: () => setOpen(true), children: /* @__PURE__ */ jsx3(Icon, { name: "menu" }) }),
      header
    ] }),
    open && /* @__PURE__ */ jsx3("button", { type: "button", className: "cs-backdrop", "aria-label": "Fechar menu lateral", onClick: close }),
    /* @__PURE__ */ jsxs3("aside", { ref: aside, className: `cs-sidebar ${open ? "is-open" : ""}`, role: open ? "dialog" : void 0, "aria-modal": open || void 0, "aria-label": "Navega\xE7\xE3o principal", onKeyDown: navKey, children: [
      /* @__PURE__ */ jsx3("div", { className: "cs-mobile-close", children: /* @__PURE__ */ jsx3(IconButton, { label: "Fechar navega\xE7\xE3o", icon: "close", onClick: close }) }),
      sidebar
    ] }),
    /* @__PURE__ */ jsx3("main", { id: "cs-main", className: "cs-main", tabIndex: -1, children })
  ] });
}
export {
  ActionMenu,
  AppShell,
  Avatar,
  Button,
  CloudMark,
  EmptyState,
  FILE_LABELS,
  FileBadge,
  FileTable,
  FilterChips,
  Icon,
  IconButton,
  Notice,
  QuickCard,
  SearchField,
  SegmentedControl,
  SidebarLink,
  Skeleton,
  THEME_STORAGE_KEY,
  ThemeProvider,
  ThemeSwitcher,
  UsageMeter,
  createThemeStore,
  getVisibleFiles,
  toggleVisibleSelection,
  useTheme
};
