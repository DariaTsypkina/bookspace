import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  passwordInputType,
  passwordVisibilityAriaLabel,
} from './password-input';

const sourcePath = path.join(__dirname, 'password-input.tsx');
const source = () => readFileSync(sourcePath, 'utf8');

describe('password visibility helpers (bd-957.5)', () => {
  it('defaults to password type when hidden', () => {
    expect(passwordInputType(false)).toBe('password');
  });

  it('uses text type when visible', () => {
    expect(passwordInputType(true)).toBe('text');
  });

  it('exposes RU aria-label for show and hide', () => {
    expect(passwordVisibilityAriaLabel(false)).toBe('Показать пароль');
    expect(passwordVisibilityAriaLabel(true)).toBe('Скрыть пароль');
  });
});

describe('PasswordInput component contract (bd-957.5)', () => {
  it('exists as a client UI module', () => {
    expect(existsSync(sourcePath)).toBe(true);
  });

  it('toggles with Lucide Eye/EyeOff and type=button', () => {
    const src = source();
    expect(src).toMatch(/'use client'/);
    expect(src).toMatch(/from ['"]lucide-react['"]/);
    expect(src).toMatch(/\bEye\b/);
    expect(src).toMatch(/\bEyeOff\b/);
    expect(src).toMatch(/type=["']button["']/);
    expect(src).toMatch(/passwordInputType/);
    expect(src).toMatch(/passwordVisibilityAriaLabel/);
  });

  it('wraps Input with FormControl so label htmlFor hits the input', () => {
    const src = source();
    expect(src).toMatch(/from ['"]@\/components\/ui\/form['"]/);
    expect(src).toMatch(/\bFormControl\b/);
    expect(src).toMatch(/from ['"]@\/components\/ui\/input['"]/);
    expect(src).toMatch(/from ['"]@\/components\/ui\/button['"]/);
  });

  it('keeps mobile-friendly hit target and Baskerville font-sans', () => {
    const src = source();
    expect(src).toMatch(/size=["']icon["']/);
    expect(src).toMatch(/min-h-11|h-11|min-w-11|w-11|size=["']icon["']/);
    expect(src).toMatch(/\bfont-sans\b/);
  });

  it('does not add new npm dependencies', () => {
    const pkg = JSON.parse(
      readFileSync(path.join(__dirname, '../../package.json'), 'utf8'),
    ) as {
      dependencies?: Record<string, string>;
    };
    expect(pkg.dependencies?.['lucide-react']).toBeDefined();
    expect(pkg.dependencies?.['react-password-strength-bar']).toBeUndefined();
    expect(pkg.dependencies?.['react-icons']).toBeUndefined();
  });
});
