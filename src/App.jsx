import FootballPitch from './components/pitch/FootballPitch'
import ErrorBoundary from './components/ui/ErrorBoundary';
import logo from './images/TikiData-logo.svg';
import { TooltipProvider } from './components/ui/tooltip';

function App() {
    return (
        <TooltipProvider>
            <div className="min-h-screen bg-transparent">
                <header className="shadow bg-opacity-60 backdrop-blur-sm bg-white">
                <div className="w-full mx-auto py-6 px-4 flex justify-center">
                        <img 
                            src={logo} 
                            alt="TikiData Logo" 
                            className="h-24 w-auto object-contain" 
                        />
                    </div>
                </header>
                <main className="py-3 bg-transparent">
                <div className="w-full mx-auto py-6 px-4 flex justify-center">
                        <ErrorBoundary>
                            <FootballPitch />
                        </ErrorBoundary>
                    </div>
                </main>
            </div>
        </TooltipProvider>
    );
}

export default App;