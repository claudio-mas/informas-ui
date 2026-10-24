import test from 'node:test';
import assert from 'node:assert/strict';
import { getVisibleFiles, toggleVisibleSelection, type FileRecord } from '../react/data.ts';

const files: FileRecord[] = [
  { id: 'a', name: 'Revisão de marca', location: 'Projetos', owner: 'Ana', type: 'doc', openedAt: '2026-10-20T12:00:00Z' },
  { id: 'b', name: 'Plano financeiro', location: 'Finanças', owner: 'João', type: 'sheet', openedAt: '2026-10-22T12:00:00Z' },
  { id: 'c', name: 'Plano editorial', location: 'Projetos', owner: 'Ana', type: 'doc', openedAt: '2026-10-22T12:00:00Z' },
];
test('search ignores case, accents and outer whitespace', () => {
  assert.deepEqual(getVisibleFiles(files, { query: ' REVISAO ' }).map(f => f.id), ['a']);
  assert.deepEqual(getVisibleFiles(files, { query: 'joao' }).map(f => f.id), ['b']);
});
test('query and file type filters compose without losing either constraint', () => {
  assert.deepEqual(getVisibleFiles(files, { query: 'plano', kinds: ['doc'] }).map(f => f.id), ['c']);
});
test('date sorting is stable and leaves the input untouched', () => {
  assert.deepEqual(getVisibleFiles(files, { sort: 'openedAt', direction: 'desc' }).map(f => f.id), ['b', 'c', 'a']);
  assert.deepEqual(files.map(f => f.id), ['a', 'b', 'c']);
});
test('bulk selection toggles visible items while retaining hidden selection', () => {
  assert.deepEqual([...toggleVisibleSelection(new Set(['hidden']), ['a', 'b'])], ['hidden', 'a', 'b']);
  assert.deepEqual([...toggleVisibleSelection(new Set(['hidden', 'a', 'b']), ['a', 'b'])], ['hidden']);
  assert.deepEqual([...toggleVisibleSelection(new Set(['hidden']), [])], ['hidden']);
});
test('empty data and unknown search return empty results', () => {
  assert.deepEqual(getVisibleFiles([], { query: 'x' }), []);
  assert.deepEqual(getVisibleFiles(files, { query: 'missing' }), []);
});
