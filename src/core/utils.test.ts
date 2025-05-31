import { describe, it, expect, beforeEach } from 'vitest';
import { shouldIgnore, getDefaultTrigger, isForm, isFormElement } from './utils';

describe('Utils', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  describe('shouldIgnore', () => {
    it('should return true for elements with fx-ignore attribute', () => {
      const element = document.createElement('div');
      element.setAttribute('fx-ignore', '');
      
      expect(shouldIgnore(element)).toBe(true);
    });

    it('should return true for elements inside fx-ignore parent', () => {
      container.innerHTML = '<div fx-ignore><span id="child"></span></div>';
      const child = container.querySelector('#child') as Element;
      
      expect(shouldIgnore(child)).toBe(true);
    });

    it('should return false for elements without fx-ignore', () => {
      const element = document.createElement('div');
      
      expect(shouldIgnore(element)).toBe(false);
    });

    it('should return false for null elements', () => {
      expect(shouldIgnore(null as any)).toBe(false);
    });
  });

  describe('getDefaultTrigger', () => {
    it('should return "submit" for form elements', () => {
      const form = document.createElement('form');
      expect(getDefaultTrigger(form)).toBe('submit');
    });

    it('should return "change" for input elements (except buttons)', () => {
      const input = document.createElement('input');
      input.type = 'text';
      expect(getDefaultTrigger(input)).toBe('change');
      
      const textarea = document.createElement('textarea');
      expect(getDefaultTrigger(textarea)).toBe('change');
      
      const select = document.createElement('select');
      expect(getDefaultTrigger(select)).toBe('change');
    });

    it('should return "click" for button inputs', () => {
      const button = document.createElement('input');
      button.type = 'button';
      expect(getDefaultTrigger(button)).toBe('click');
      
      const submit = document.createElement('input');
      submit.type = 'submit';
      expect(getDefaultTrigger(submit)).toBe('click');
    });

    it('should return "click" for other elements', () => {
      const div = document.createElement('div');
      expect(getDefaultTrigger(div)).toBe('click');
      
      const button = document.createElement('button');
      expect(getDefaultTrigger(button)).toBe('click');
      
      const anchor = document.createElement('a');
      expect(getDefaultTrigger(anchor)).toBe('click');
    });
  });

  describe('isForm', () => {
    it('should return true for form elements', () => {
      const form = document.createElement('form');
      expect(isForm(form)).toBe(true);
    });

    it('should return false for non-form elements', () => {
      const div = document.createElement('div');
      expect(isForm(div)).toBe(false);
    });
  });

  describe('isFormElement', () => {
    it('should return true for form control elements', () => {
      const input = document.createElement('input');
      expect(isFormElement(input)).toBe(true);
      
      const textarea = document.createElement('textarea');
      expect(isFormElement(textarea)).toBe(true);
      
      const select = document.createElement('select');
      expect(isFormElement(select)).toBe(true);
    });

    it('should return false for button type inputs', () => {
      const button = document.createElement('input');
      button.type = 'button';
      expect(isFormElement(button)).toBe(false);
      
      const submit = document.createElement('input');
      submit.type = 'submit';
      expect(isFormElement(submit)).toBe(false);
    });

    it('should return false for non-form elements', () => {
      const div = document.createElement('div');
      expect(isFormElement(div)).toBe(false);
      
      const button = document.createElement('button');
      expect(isFormElement(button)).toBe(false);
    });
  });
});