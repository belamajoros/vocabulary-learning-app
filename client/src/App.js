import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AfterLogin from './pages/AfterLogin';
import Library from './pages/Library';
import Read from './pages/Read';
import Upload from './pages/Upload';
import Upload2 from './pages/Upload2';
import WordList from './pages/WordList';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Login';
import RegisterPage from './pages/RegisterPage';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './component/PrivateRoute'
import React, { useState, useMemo } from 'react';
import { LanguageContext } from './context/LanguageContext'


function App() {

  const [language, setLanguage] = useState({
    first: 'SK',
    learn: 'GB'
  })

  const languageValue = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);

  return (
    <>
      <Router>
        <AuthProvider>
          <Switch>
            <Route exact path="/" component={LandingPage} />
            <Route exact path="/register" component={RegisterPage} />
            <Route exact path="/login" component={LoginPage} />
            <LanguageContext.Provider value={languageValue}>
              <PrivateRoute exact path="/home" component={AfterLogin} />
              <PrivateRoute exact path="/library" component={Library} />
              <PrivateRoute exact path="/read" component={Read} />
              <PrivateRoute exact path="/wordlist" component={WordList} />
              <PrivateRoute exact path="/upload" component={Upload} />
              <PrivateRoute exact path="/upload2" component={Upload2} />
            </LanguageContext.Provider>
          </Switch>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
