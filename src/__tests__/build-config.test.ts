import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readFileSync, statSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';

const execAsync = promisify(exec);

describe('Build Configuration', () => {
  describe('Production Build', () => {
    beforeAll(async () => {
      // Clean dist directory
      await execAsync('rm -rf dist');
    }, 30000);

    it('should create smaller bundle without source maps', async () => {
      // Build with production config
      await execAsync('npm run build:prod');
      
      const distPath = join(process.cwd(), 'dist');
      const indexPath = join(distPath, 'index.js');
      
      // Verify output exists
      expect(existsSync(indexPath)).toBe(true);
      
      // Verify no source maps
      expect(existsSync(join(distPath, 'index.js.map'))).toBe(false);
      expect(existsSync(join(distPath, 'index.d.ts.map'))).toBe(false);
      
      // Verify no source map references in files
      const jsContent = readFileSync(indexPath, 'utf-8');
      expect(jsContent).not.toContain('//# sourceMappingURL=');
      
      // Verify declarations still exist
      expect(existsSync(join(distPath, 'index.d.ts'))).toBe(true);
    }, 30000);

    it('should use ES2022 target for smaller output', async () => {
      await execAsync('npm run build:prod');
      
      const indexPath = join(process.cwd(), 'dist', 'index.js');
      const jsContent = readFileSync(indexPath, 'utf-8');
      
      // ES2022 features should be preserved (not transpiled)
      // Check for native private fields if we use them
      // Check for native async/await (not regenerator)
      expect(jsContent).not.toContain('regeneratorRuntime');
      expect(jsContent).not.toContain('__awaiter');
    }, 30000);

    it('should produce smaller output than dev build', async () => {
      // Build dev version
      await execAsync('rm -rf dist && npm run build');
      const devSize = statSync(join(process.cwd(), 'dist', 'index.js')).size;
      
      // Build prod version
      await execAsync('rm -rf dist && npm run build:prod');
      const prodSize = statSync(join(process.cwd(), 'dist', 'index.js')).size;
      
      // Production should be smaller (no source maps inline)
      expect(prodSize).toBeLessThan(devSize);
    }, 60000);
  });
});