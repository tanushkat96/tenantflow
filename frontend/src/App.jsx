import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster position="top-right" />
        
        <Routes>
          <Route path="/" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-primary mb-4">
                  TaskFlow SaaS
                </h1>
                <p className="text-gray-600">
                  Multi-tenant Task Management Platform
                </p>
                <div className="mt-8">
                  <a 
                    href="/login" 
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition"
                  >
                    Get Started
                  </a>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;