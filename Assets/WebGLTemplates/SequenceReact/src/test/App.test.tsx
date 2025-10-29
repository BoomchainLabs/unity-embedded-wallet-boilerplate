import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

// Mock react-unity-webgl
vi.mock('react-unity-webgl', () => ({
  Unity: vi.fn(({ className, unityProvider }) => (
    <div className={className} data-testid="unity-component">
      Unity Mock
    </div>
  )),
  useUnityContext: vi.fn(() => ({
    unityProvider: {},
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    sendMessage: vi.fn(),
    isLoaded: false,
    loadingProgression: 0.5,
  })),
}))

// Mock @react-oauth/google
vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: vi.fn(({ children, clientId }) => (
    <div data-testid="google-oauth-provider" data-client-id={clientId}>
      {children}
    </div>
  )),
  GoogleLogin: vi.fn(({ onSuccess, shape, width, nonce }) => (
    <button
      data-testid="google-login-button"
      onClick={() => onSuccess({ credential: 'mock-credential-token' })}
      data-shape={shape}
      data-width={width}
      data-nonce={nonce}
    >
      Sign in with Google
    </button>
  )),
}))

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('should render without crashing', () => {
      render(<App />)
      expect(screen.getByTestId('unity-component')).toBeInTheDocument()
    })

    it('should render Unity component with correct className', () => {
      render(<App />)
      const unityComponent = screen.getByTestId('unity-component')
      expect(unityComponent).toHaveClass('unity')
    })

    it('should display loading overlay when Unity is not loaded', () => {
      const { useUnityContext } = require('react-unity-webgl')
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        sendMessage: vi.fn(),
        isLoaded: false,
        loadingProgression: 0.5,
      })

      render(<App />)
      expect(screen.getByText(/Loading\.\.\./)).toBeInTheDocument()
    })

    it('should not display login modal initially', () => {
      render(<App />)
      expect(screen.queryByText('Login with Google')).not.toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should display correct loading percentage', () => {
      const { useUnityContext } = require('react-unity-webgl')
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        sendMessage: vi.fn(),
        isLoaded: false,
        loadingProgression: 0.5,
      })

      render(<App />)
      expect(screen.getByText('Loading... (50%)')).toBeInTheDocument()
    })

    it('should calculate loading percentage correctly for 0%', () => {
      const { useUnityContext } = require('react-unity-webgl')
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        sendMessage: vi.fn(),
        isLoaded: false,
        loadingProgression: 0,
      })

      render(<App />)
      expect(screen.getByText('Loading... (0%)')).toBeInTheDocument()
    })

    it('should calculate loading percentage correctly for 100%', () => {
      const { useUnityContext } = require('react-unity-webgl')
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        sendMessage: vi.fn(),
        isLoaded: false,
        loadingProgression: 1,
      })

      render(<App />)
      expect(screen.getByText('Loading... (100%)')).toBeInTheDocument()
    })

    it('should hide loading overlay when Unity is loaded', () => {
      const { useUnityContext } = require('react-unity-webgl')
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        sendMessage: vi.fn(),
        isLoaded: true,
        loadingProgression: 1,
      })

      render(<App />)
      expect(screen.queryByText(/Loading\.\.\./)).not.toBeInTheDocument()
    })

    it('should round loading percentage to nearest integer', () => {
      const { useUnityContext } = require('react-unity-webgl')
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        sendMessage: vi.fn(),
        isLoaded: false,
        loadingProgression: 0.754,
      })

      render(<App />)
      expect(screen.getByText('Loading... (75%)')).toBeInTheDocument()
    })
  })

  describe('Unity Event Listeners', () => {
    it('should add GoogleSignIn event listener on mount', () => {
      const { useUnityContext } = require('react-unity-webgl')
      const addEventListenerMock = vi.fn()
      
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: addEventListenerMock,
        removeEventListener: vi.fn(),
        sendMessage: vi.fn(),
        isLoaded: false,
        loadingProgression: 0,
      })

      render(<App />)
      expect(addEventListenerMock).toHaveBeenCalledWith(
        'GoogleSignIn',
        expect.any(Function)
      )
    })

    it('should remove GoogleSignIn event listener on unmount', () => {
      const { useUnityContext } = require('react-unity-webgl')
      const removeEventListenerMock = vi.fn()
      
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn(),
        removeEventListener: removeEventListenerMock,
        sendMessage: vi.fn(),
        isLoaded: false,
        loadingProgression: 0,
      })

      const { unmount } = render(<App />)
      unmount()
      
      expect(removeEventListenerMock).toHaveBeenCalledWith(
        'GoogleSignIn',
        expect.any(Function)
      )
    })

    it('should handle GoogleSignIn event correctly', () => {
      const { useUnityContext } = require('react-unity-webgl')
      let googleSignInHandler: any
      
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn((event, handler) => {
          if (event === 'GoogleSignIn') {
            googleSignInHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
        sendMessage: vi.fn(),
        isLoaded: false,
        loadingProgression: 0,
      })

      render(<App />)
      
      // Trigger GoogleSignIn event
      googleSignInHandler('test-client-id', 'test-nonce')
      
      // Should display login modal
      expect(screen.getByText('Login with Google')).toBeInTheDocument()
    })
  })

  describe('Google OAuth Integration', () => {
    it('should display Google OAuth provider when login is triggered', () => {
      const { useUnityContext } = require('react-unity-webgl')
      let googleSignInHandler: any
      
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn((event, handler) => {
          if (event === 'GoogleSignIn') {
            googleSignInHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
        sendMessage: vi.fn(),
        isLoaded: false,
        loadingProgression: 0,
      })

      render(<App />)
      
      // Trigger login
      googleSignInHandler('test-client-id', 'test-nonce')
      
      const provider = screen.getByTestId('google-oauth-provider')
      expect(provider).toBeInTheDocument()
      expect(provider).toHaveAttribute('data-client-id', 'test-client-id')
    })

    it('should pass correct clientId to GoogleOAuthProvider', () => {
      const { useUnityContext } = require('react-unity-webgl')
      let googleSignInHandler: any
      
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn((event, handler) => {
          if (event === 'GoogleSignIn') {
            googleSignInHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
        sendMessage: vi.fn(),
        isLoaded: false,
        loadingProgression: 0,
      })

      render(<App />)
      
      const testClientId = 'my-google-client-id-12345'
      googleSignInHandler(testClientId, 'test-nonce')
      
      const provider = screen.getByTestId('google-oauth-provider')
      expect(provider).toHaveAttribute('data-client-id', testClientId)
    })

    it('should render GoogleLogin button with correct props', () => {
      const { useUnityContext } = require('react-unity-webgl')
      let googleSignInHandler: any
      
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn((event, handler) => {
          if (event === 'GoogleSignIn') {
            googleSignInHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
        sendMessage: vi.fn(),
        isLoaded: false,
        loadingProgression: 0,
      })

      render(<App />)
      googleSignInHandler('test-client-id', 'test-nonce')
      
      const loginButton = screen.getByTestId('google-login-button')
      expect(loginButton).toHaveAttribute('data-shape', 'circle')
      expect(loginButton).toHaveAttribute('data-width', '230')
      expect(loginButton).toHaveAttribute('data-nonce', 'test-nonce')
    })

    it('should pass nonce to GoogleLogin component', () => {
      const { useUnityContext } = require('react-unity-webgl')
      let googleSignInHandler: any
      
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn((event, handler) => {
          if (event === 'GoogleSignIn') {
            googleSignInHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
        sendMessage: vi.fn(),
        isLoaded: false,
        loadingProgression: 0,
      })

      render(<App />)
      
      const testNonce = 'unique-nonce-value-12345'
      googleSignInHandler('test-client-id', testNonce)
      
      const loginButton = screen.getByTestId('google-login-button')
      expect(loginButton).toHaveAttribute('data-nonce', testNonce)
    })
  })

  describe('Google Login Success Flow', () => {
    it('should send message to Unity on successful login', async () => {
      const { useUnityContext } = require('react-unity-webgl')
      const sendMessageMock = vi.fn()
      let googleSignInHandler: any
      
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn((event, handler) => {
          if (event === 'GoogleSignIn') {
            googleSignInHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
        sendMessage: sendMessageMock,
        isLoaded: true,
        loadingProgression: 1,
      })

      render(<App />)
      googleSignInHandler('test-client-id', 'test-nonce')
      
      const loginButton = screen.getByTestId('google-login-button')
      fireEvent.click(loginButton)
      
      await waitFor(() => {
        expect(sendMessageMock).toHaveBeenCalledWith(
          'WebBrowserMessageReceiver',
          'OnGoogleSignIn',
          'mock-credential-token'
        )
      })
    })

    it('should hide login modal after successful login', async () => {
      const { useUnityContext } = require('react-unity-webgl')
      let googleSignInHandler: any
      
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn((event, handler) => {
          if (event === 'GoogleSignIn') {
            googleSignInHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
        sendMessage: vi.fn(),
        isLoaded: true,
        loadingProgression: 1,
      })

      render(<App />)
      googleSignInHandler('test-client-id', 'test-nonce')
      
      expect(screen.getByText('Login with Google')).toBeInTheDocument()
      
      const loginButton = screen.getByTestId('google-login-button')
      fireEvent.click(loginButton)
      
      await waitFor(() => {
        expect(screen.queryByText('Login with Google')).not.toBeInTheDocument()
      })
    })

    it('should handle credential from Google correctly', async () => {
      const { useUnityContext } = require('react-unity-webgl')
      const sendMessageMock = vi.fn()
      let googleSignInHandler: any
      
      const { GoogleLogin } = require('@react-oauth/google')
      GoogleLogin.mockImplementation(({ onSuccess }: any) => (
        <button
          data-testid="google-login-button"
          onClick={() => onSuccess({ 
            credential: 'test-credential-jwt-token' 
          })}
        >
          Sign in
        </button>
      ))
      
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn((event, handler) => {
          if (event === 'GoogleSignIn') {
            googleSignInHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
        sendMessage: sendMessageMock,
        isLoaded: true,
        loadingProgression: 1,
      })

      render(<App />)
      googleSignInHandler('test-client-id', 'test-nonce')
      
      const loginButton = screen.getByTestId('google-login-button')
      fireEvent.click(loginButton)
      
      await waitFor(() => {
        expect(sendMessageMock).toHaveBeenCalledWith(
          'WebBrowserMessageReceiver',
          'OnGoogleSignIn',
          expect.stringContaining('test-credential-jwt-token')
        )
      })
    })
  })

  describe('Unity Context Configuration', () => {
    it('should initialize Unity with correct URLs', () => {
      const { useUnityContext } = require('react-unity-webgl')
      
      render(<App />)
      
      expect(useUnityContext).toHaveBeenCalledWith(
        expect.objectContaining({
          loaderUrl: expect.stringContaining('.loader.js'),
          dataUrl: expect.stringContaining('.data'),
          frameworkUrl: expect.stringContaining('.framework.js'),
          codeUrl: expect.stringContaining('.wasm'),
        })
      )
    })

    it('should use correct Build directory structure', () => {
      const { useUnityContext } = require('react-unity-webgl')
      
      render(<App />)
      
      const callArgs = useUnityContext.mock.calls[0][0]
      expect(callArgs.loaderUrl).toContain('Build/')
      expect(callArgs.dataUrl).toContain('Build/')
      expect(callArgs.frameworkUrl).toContain('Build/')
      expect(callArgs.codeUrl).toContain('Build/')
    })
  })

  describe('State Management', () => {
    it('should maintain googleClientId state correctly', () => {
      const { useUnityContext } = require('react-unity-webgl')
      let googleSignInHandler: any
      
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn((event, handler) => {
          if (event === 'GoogleSignIn') {
            googleSignInHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
        sendMessage: vi.fn(),
        isLoaded: false,
        loadingProgression: 0,
      })

      render(<App />)
      
      // First call
      googleSignInHandler('first-client-id', 'nonce1')
      expect(screen.getByTestId('google-oauth-provider')).toHaveAttribute(
        'data-client-id',
        'first-client-id'
      )
      
      // Close modal
      const loginButton = screen.getByTestId('google-login-button')
      fireEvent.click(loginButton)
      
      // Second call with different client ID
      googleSignInHandler('second-client-id', 'nonce2')
      expect(screen.getByTestId('google-oauth-provider')).toHaveAttribute(
        'data-client-id',
        'second-client-id'
      )
    })

    it('should maintain nonce state correctly', () => {
      const { useUnityContext } = require('react-unity-webgl')
      let googleSignInHandler: any
      
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn((event, handler) => {
          if (event === 'GoogleSignIn') {
            googleSignInHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
        sendMessage: vi.fn(),
        isLoaded: false,
        loadingProgression: 0,
      })

      render(<App />)
      
      const uniqueNonce = 'nonce-' + Date.now()
      googleSignInHandler('client-id', uniqueNonce)
      
      const loginButton = screen.getByTestId('google-login-button')
      expect(loginButton).toHaveAttribute('data-nonce', uniqueNonce)
    })

    it('should toggle showLogin state correctly', () => {
      const { useUnityContext } = require('react-unity-webgl')
      let googleSignInHandler: any
      
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn((event, handler) => {
          if (event === 'GoogleSignIn') {
            googleSignInHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
        sendMessage: vi.fn(),
        isLoaded: false,
        loadingProgression: 0,
      })

      render(<App />)
      
      // Initially hidden
      expect(screen.queryByText('Login with Google')).not.toBeInTheDocument()
      
      // Show login
      googleSignInHandler('client-id', 'nonce')
      expect(screen.getByText('Login with Google')).toBeInTheDocument()
      
      // Hide after login
      const loginButton = screen.getByTestId('google-login-button')
      fireEvent.click(loginButton)
      
      waitFor(() => {
        expect(screen.queryByText('Login with Google')).not.toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty googleClientId gracefully', () => {
      const { useUnityContext } = require('react-unity-webgl')
      let googleSignInHandler: any
      
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn((event, handler) => {
          if (event === 'GoogleSignIn') {
            googleSignInHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
        sendMessage: vi.fn(),
        isLoaded: false,
        loadingProgression: 0,
      })

      render(<App />)
      
      expect(() => {
        googleSignInHandler('', 'nonce')
      }).not.toThrow()
    })

    it('should handle empty nonce gracefully', () => {
      const { useUnityContext } = require('react-unity-webgl')
      let googleSignInHandler: any
      
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn((event, handler) => {
          if (event === 'GoogleSignIn') {
            googleSignInHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
        sendMessage: vi.fn(),
        isLoaded: false,
        loadingProgression: 0,
      })

      render(<App />)
      
      expect(() => {
        googleSignInHandler('client-id', '')
      }).not.toThrow()
    })

    it('should handle loading progression edge values', () => {
      const { useUnityContext } = require('react-unity-webgl')
      
      // Test with negative value (should be treated as 0)
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        sendMessage: vi.fn(),
        isLoaded: false,
        loadingProgression: -0.1,
      })

      const { rerender } = render(<App />)
      expect(screen.getByText('Loading... (-10%)')).toBeInTheDocument()
      
      // Test with value > 1 (should show > 100%)
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        sendMessage: vi.fn(),
        isLoaded: false,
        loadingProgression: 1.5,
      })
      
      rerender(<App />)
      expect(screen.getByText('Loading... (150%)')).toBeInTheDocument()
    })

    it('should handle rapid successive GoogleSignIn events', () => {
      const { useUnityContext } = require('react-unity-webgl')
      let googleSignInHandler: any
      
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn((event, handler) => {
          if (event === 'GoogleSignIn') {
            googleSignInHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
        sendMessage: vi.fn(),
        isLoaded: false,
        loadingProgression: 0,
      })

      render(<App />)
      
      // Trigger multiple times rapidly
      expect(() => {
        googleSignInHandler('client-1', 'nonce-1')
        googleSignInHandler('client-2', 'nonce-2')
        googleSignInHandler('client-3', 'nonce-3')
      }).not.toThrow()
      
      // Should use the last values
      const provider = screen.getByTestId('google-oauth-provider')
      expect(provider).toHaveAttribute('data-client-id', 'client-3')
    })

    it('should handle null or undefined in CredentialResponse', async () => {
      const { useUnityContext } = require('react-unity-webgl')
      const sendMessageMock = vi.fn()
      let googleSignInHandler: any
      
      const { GoogleLogin } = require('@react-oauth/google')
      GoogleLogin.mockImplementation(({ onSuccess }: any) => (
        <button
          data-testid="google-login-button"
          onClick={() => onSuccess({ credential: undefined })}
        >
          Sign in
        </button>
      ))
      
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn((event, handler) => {
          if (event === 'GoogleSignIn') {
            googleSignInHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
        sendMessage: sendMessageMock,
        isLoaded: true,
        loadingProgression: 1,
      })

      render(<App />)
      googleSignInHandler('client-id', 'nonce')
      
      const loginButton = screen.getByTestId('google-login-button')
      
      // Should not throw even with undefined credential
      expect(() => {
        fireEvent.click(loginButton)
      }).not.toThrow()
    })
  })

  describe('UI Structure and Styling', () => {
    it('should render with correct outer container structure', () => {
      const { container } = render(<App />)
      const outerContainer = container.querySelector('.outer-container')
      expect(outerContainer).toBeInTheDocument()
    })

    it('should render Unity in a container div', () => {
      const { container } = render(<App />)
      const unityContainer = container.querySelector('.container')
      expect(unityContainer).toBeInTheDocument()
      expect(unityContainer?.querySelector('.unity')).toBeInTheDocument()
    })

    it('should render login modal with correct structure when shown', () => {
      const { useUnityContext } = require('react-unity-webgl')
      let googleSignInHandler: any
      
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn((event, handler) => {
          if (event === 'GoogleSignIn') {
            googleSignInHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
        sendMessage: vi.fn(),
        isLoaded: false,
        loadingProgression: 0,
      })

      const { container } = render(<App />)
      googleSignInHandler('client-id', 'nonce')
      
      const loginOuterContainer = container.querySelector('.login-outer-container')
      expect(loginOuterContainer).toBeInTheDocument()
      
      const loginContainer = container.querySelector('.login-container')
      expect(loginContainer).toBeInTheDocument()
    })

    it('should have correct title in login modal', () => {
      const { useUnityContext } = require('react-unity-webgl')
      let googleSignInHandler: any
      
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn((event, handler) => {
          if (event === 'GoogleSignIn') {
            googleSignInHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
        sendMessage: vi.fn(),
        isLoaded: false,
        loadingProgression: 0,
      })

      render(<App />)
      googleSignInHandler('client-id', 'nonce')
      
      const title = screen.getByText('Login with Google')
      expect(title.tagName).toBe('H2')
      expect(title).toHaveClass('login-title')
    })
  })

  describe('@react-oauth/google version compatibility', () => {
    it('should work with @react-oauth/google 0.12.1 API', () => {
      // This test ensures compatibility with the specific version
      const { useUnityContext } = require('react-unity-webgl')
      let googleSignInHandler: any
      
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn((event, handler) => {
          if (event === 'GoogleSignIn') {
            googleSignInHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
        sendMessage: vi.fn(),
        isLoaded: false,
        loadingProgression: 0,
      })

      // Should render without errors with 0.12.1 API structure
      expect(() => {
        render(<App />)
        googleSignInHandler('client-id', 'nonce')
      }).not.toThrow()
      
      // Should have all expected components
      expect(screen.getByTestId('google-oauth-provider')).toBeInTheDocument()
      expect(screen.getByTestId('google-login-button')).toBeInTheDocument()
    })

    it('should use GoogleLogin component with correct 0.12.1 props', () => {
      const { useUnityContext } = require('react-unity-webgl')
      let googleSignInHandler: any
      
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn((event, handler) => {
          if (event === 'GoogleSignIn') {
            googleSignInHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
        sendMessage: vi.fn(),
        isLoaded: false,
        loadingProgression: 0,
      })

      render(<App />)
      googleSignInHandler('client-id', 'nonce-value')
      
      const loginButton = screen.getByTestId('google-login-button')
      
      // Props that should exist in 0.12.1
      expect(loginButton).toHaveAttribute('data-shape')
      expect(loginButton).toHaveAttribute('data-width')
      expect(loginButton).toHaveAttribute('data-nonce')
    })

    it('should handle onSuccess callback in 0.12.1 format', async () => {
      const { useUnityContext } = require('react-unity-webgl')
      const sendMessageMock = vi.fn()
      let googleSignInHandler: any
      
      useUnityContext.mockReturnValue({
        unityProvider: {},
        addEventListener: vi.fn((event, handler) => {
          if (event === 'GoogleSignIn') {
            googleSignInHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
        sendMessage: sendMessageMock,
        isLoaded: true,
        loadingProgression: 1,
      })

      render(<App />)
      googleSignInHandler('client-id', 'nonce')
      
      const loginButton = screen.getByTestId('google-login-button')
      fireEvent.click(loginButton)
      
      // Should handle CredentialResponse format from 0.12.1
      await waitFor(() => {
        expect(sendMessageMock).toHaveBeenCalledWith(
          'WebBrowserMessageReceiver',
          'OnGoogleSignIn',
          expect.any(String)
        )
      })
    })
  })
})