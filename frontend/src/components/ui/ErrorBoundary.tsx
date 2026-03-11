import { Component, type ErrorInfo, type ReactNode } from 'react'
import Button from './Button.tsx'

interface Props { children: ReactNode }
interface State { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary:', error, info)
  }

  handleRetry = () => {
    this.setState({ hasError: false })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-grey-50">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-primary-700 mb-4">
              Une erreur est survenue
            </h1>
            <p className="text-grey-400 mb-6">
              La page n'a pas pu se charger correctement. Cela peut arriver après une mise à jour.
            </p>
            <Button onClick={this.handleRetry}>
              Recharger la page
            </Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
