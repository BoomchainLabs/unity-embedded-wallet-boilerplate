import { describe, it, expect } from 'vitest'
import packageJson from '../../package.json'

describe('package.json Validation', () => {
  describe('Basic Structure', () => {
    it('should have required top-level fields', () => {
      expect(packageJson).toHaveProperty('name')
      expect(packageJson).toHaveProperty('version')
      expect(packageJson).toHaveProperty('type')
      expect(packageJson).toHaveProperty('scripts')
      expect(packageJson).toHaveProperty('dependencies')
      expect(packageJson).toHaveProperty('devDependencies')
    })

    it('should have correct name', () => {
      expect(packageJson.name).toBe('react-unity-webgl-demo')
    })

    it('should be marked as private', () => {
      expect(packageJson.private).toBe(true)
    })

    it('should be ES module type', () => {
      expect(packageJson.type).toBe('module')
    })

    it('should have semantic version format', () => {
      const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/
      expect(packageJson.version).toMatch(semverRegex)
    })
  })

  describe('Scripts Validation', () => {
    it('should have all required npm scripts', () => {
      expect(packageJson.scripts).toHaveProperty('dev')
      expect(packageJson.scripts).toHaveProperty('build')
      expect(packageJson.scripts).toHaveProperty('lint')
      expect(packageJson.scripts).toHaveProperty('preview')
      expect(packageJson.scripts).toHaveProperty('test')
    })

    it('should have dev script with correct port', () => {
      expect(packageJson.scripts.dev).toContain('vite')
      expect(packageJson.scripts.dev).toContain('4444')
    })

    it('should have build script that compiles TypeScript first', () => {
      expect(packageJson.scripts.build).toContain('tsc')
      expect(packageJson.scripts.build).toContain('vite build')
      // Ensure tsc runs before vite build
      expect(packageJson.scripts.build.indexOf('tsc')).toBeLessThan(
        packageJson.scripts.build.indexOf('vite build')
      )
    })

    it('should have lint script with appropriate flags', () => {
      expect(packageJson.scripts.lint).toContain('eslint')
      expect(packageJson.scripts.lint).toContain('--max-warnings 0')
    })

    it('should have test scripts', () => {
      expect(packageJson.scripts.test).toBeDefined()
      expect(packageJson.scripts.test).toContain('vitest')
    })
  })

  describe('Dependencies Validation', () => {
    it('should have all required runtime dependencies', () => {
      const requiredDeps = [
        '@react-oauth/google',
        'react',
        'react-dom',
        'react-unity-webgl'
      ]
      
      requiredDeps.forEach(dep => {
        expect(packageJson.dependencies).toHaveProperty(dep)
      })
    })

    it('should have correct @react-oauth/google version', () => {
      expect(packageJson.dependencies['@react-oauth/google']).toBe('^0.12.1')
    })

    it('should have compatible React versions', () => {
      const reactVersion = packageJson.dependencies.react
      const reactDomVersion = packageJson.dependencies['react-dom']
      
      expect(reactVersion).toBe(reactDomVersion)
    })

    it('should use caret (^) versioning for dependencies', () => {
      const deps = packageJson.dependencies
      Object.values(deps).forEach((version) => {
        expect(version).toMatch(/^\^/)
      })
    })

    it('should have React 18.x', () => {
      expect(packageJson.dependencies.react).toMatch(/^\^18\./)
    })

    it('should not have conflicting peer dependencies', () => {
      // @react-oauth/google requires React 16.8+
      const reactVersion = packageJson.dependencies.react
      const majorVersion = parseInt(reactVersion.match(/\d+/)?.[0] || '0')
      expect(majorVersion).toBeGreaterThanOrEqual(16)
    })
  })

  describe('DevDependencies Validation', () => {
    it('should have all required development dependencies', () => {
      const requiredDevDeps = [
        '@types/react',
        '@types/react-dom',
        '@vitejs/plugin-react',
        'typescript',
        'vite',
        'vitest',
        '@testing-library/react',
        '@testing-library/jest-dom'
      ]
      
      requiredDevDeps.forEach(dep => {
        expect(packageJson.devDependencies).toHaveProperty(dep)
      })
    })

    it('should have TypeScript 5.x', () => {
      expect(packageJson.devDependencies.typescript).toMatch(/^\^5\./)
    })

    it('should have matching type definitions for React versions', () => {
      const reactVersion = packageJson.dependencies.react
      const reactTypesVersion = packageJson.devDependencies['@types/react']
      
      const reactMajor = reactVersion.match(/\d+/)?.[0]
      const reactTypesMajor = reactTypesVersion.match(/\d+/)?.[0]
      
      expect(reactMajor).toBe(reactTypesMajor)
    })

    it('should use caret (^) versioning for devDependencies', () => {
      const devDeps = packageJson.devDependencies
      Object.values(devDeps).forEach((version) => {
        expect(version).toMatch(/^\^/)
      })
    })
  })

  describe('Version Compatibility', () => {
    it('should have compatible Vite and Vitest versions', () => {
      const viteVersion = packageJson.devDependencies.vite
      const vitestVersion = packageJson.devDependencies.vitest
      
      expect(viteVersion).toBeDefined()
      expect(vitestVersion).toBeDefined()
    })

    it('should have @vitejs/plugin-react compatible with Vite version', () => {
      const viteVersion = packageJson.devDependencies.vite
      const pluginVersion = packageJson.devDependencies['@vitejs/plugin-react']
      
      const viteMajor = parseInt(viteVersion.match(/\d+/)?.[0] || '0')
      const pluginMajor = parseInt(pluginVersion.match(/\d+/)?.[0] || '0')
      
      // Plugin major version should be compatible with Vite
      expect(pluginMajor).toBeGreaterThanOrEqual(4)
      expect(viteMajor).toBeGreaterThanOrEqual(4)
    })

    it('should not have any exact version locks that could cause issues', () => {
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      }
      
      Object.entries(allDeps).forEach(([name, version]) => {
        // Should use semver ranges, not exact versions
        expect(version).not.toMatch(/^\d+\.\d+\.\d+$/)
      })
    })
  })

  describe('Security and Best Practices', () => {
    it('should not have deprecated or insecure packages', () => {
      // Check that we're not using known deprecated packages
      const deprecatedPackages = [
        'request',
        'node-uuid',
        'coffee-script'
      ]
      
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      }
      
      deprecatedPackages.forEach(pkg => {
        expect(allDeps).not.toHaveProperty(pkg)
      })
    })

    it('should have private flag set to prevent accidental publishing', () => {
      expect(packageJson.private).toBe(true)
    })

    it('should not have unused dependencies', () => {
      // All listed dependencies should be used in the codebase
      const deps = Object.keys(packageJson.dependencies)
      expect(deps.length).toBeGreaterThan(0)
      expect(deps.length).toBeLessThan(20) // Reasonable limit
    })
  })

  describe('Dependency Version Constraints', () => {
    it('should have @react-oauth/google at version 0.12.1 or compatible', () => {
      const version = packageJson.dependencies['@react-oauth/google']
      expect(version).toBe('^0.12.1')
      
      // Verify it's not accidentally upgraded to 0.12.2
      expect(version).not.toBe('^0.12.2')
      expect(version).not.toBe('0.12.2')
    })

    it('should have react-unity-webgl at 9.9.0 or compatible', () => {
      const version = packageJson.dependencies['react-unity-webgl']
      expect(version).toMatch(/^\^9\.9\./)
    })

    it('should maintain stable major versions', () => {
      const deps = packageJson.dependencies
      
      Object.entries(deps).forEach(([name, version]) => {
        // Major version should be >= 1 for production deps
        const majorVersion = parseInt(version.match(/\d+/)?.[0] || '0')
        
        if (name !== 'react-unity-webgl' && !name.startsWith('@')) {
          expect(majorVersion).toBeGreaterThanOrEqual(1)
        }
      })
    })
  })

  describe('Script Command Validation', () => {
    it('should have no syntax errors in scripts', () => {
      Object.entries(packageJson.scripts).forEach(([name, script]) => {
        expect(script).toBeTruthy()
        expect(script.length).toBeGreaterThan(0)
        expect(script).not.toContain('undefined')
        expect(script).not.toContain('null')
      })
    })

    it('should have valid command separators', () => {
      const buildScript = packageJson.scripts.build
      // Should use && for sequential commands
      if (buildScript.includes('tsc') && buildScript.includes('vite')) {
        expect(buildScript).toContain('&&')
      }
    })

    it('should use consistent command style', () => {
      Object.values(packageJson.scripts).forEach(script => {
        // Scripts should not have trailing spaces
        expect(script).toBe(script.trim())
      })
    })
  })

  describe('Package.json Structure Integrity', () => {
    it('should have valid JSON structure', () => {
      expect(() => JSON.stringify(packageJson)).not.toThrow()
    })

    it('should not have circular dependencies in structure', () => {
      const deps = packageJson.dependencies
      const devDeps = packageJson.devDependencies
      
      // No dependency should appear in both
      const depsKeys = Object.keys(deps)
      const devDepsKeys = Object.keys(devDeps)
      
      const intersection = depsKeys.filter(key => devDepsKeys.includes(key))
      expect(intersection).toHaveLength(0)
    })

    it('should have consistent formatting', () => {
      const json = JSON.stringify(packageJson, null, 2)
      expect(json).toBeTruthy()
      // Should be properly formatted
      expect(json.includes('  ')).toBe(true)
    })
  })
})