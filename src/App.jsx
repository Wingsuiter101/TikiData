import FootballPitch from './components/pitch/FootballPitch'
import logo from './images/TikiData-logo.svg';

function App() {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 flex justify-center">
            <img 
              src={logo} 
              alt="TikiData Logo" 
              className="h-24 w-auto object-contain" 
            />
          </div>
        </header>
        <main className="py-10">
          <div className="max-w-7xl mx-auto px-4">
            <FootballPitch />
          </div>
        </main>
      </div>
    );
  }
  
  export default App;