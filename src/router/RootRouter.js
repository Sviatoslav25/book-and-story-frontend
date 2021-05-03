import React, { useEffect, useState, useCallback } from 'react';
import { Route, BrowserRouter as Router, Switch, Redirect } from 'react-router-dom';
import AppLayout from '../components/layouts/AppLayout';
import AuthLayout from '../components/layouts/AuthLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import SignUp from '../pages/SignUp';
import AuthManager from '../services/AuthManager';
import paths from './paths';

const authRouts = [
  {
    path: paths.login,
    exact: true,
    Component: Login,
  },
  {
    path: paths.signUp,
    exact: true,
    Component: SignUp,
  },
];

const appRouts = [
  {
    path: paths.home,
    exact: true,
    Component: Home,
  },
  {
    path: paths.myBooks,
    exact: true,
    Component: Home,
  },
];

const RootRouter = () => {
  const [loggedIn, setLoggedIn] = useState(AuthManager.isLoggedIn());

  const subscriber = useCallback((token) => {
    setLoggedIn(!!token);
  }, []);

  useEffect(() => {
    AuthManager.onLoginStatusChange(subscriber);
    return () => {
      AuthManager.offLoginStatusChange(subscriber);
    };
  }, [subscriber]);

  return (
    <Router>
      {loggedIn ? (
        <AppLayout>
          <Switch>
            {appRouts.map(({ path, exact, Component }) => {
              return (
                <Route key={paths} exact={exact} path={path}>
                  <Component />
                </Route>
              );
            })}
            <Redirect to={paths.home} />
          </Switch>
        </AppLayout>
      ) : (
        <AuthLayout>
          <Switch>
            {authRouts.map(({ path, exact, Component }) => {
              return (
                <Route key={paths} exact={exact} path={path}>
                  <Component />
                </Route>
              );
            })}
            <Redirect to={paths.login} />
          </Switch>
        </AuthLayout>
      )}
    </Router>
  );
};

export default RootRouter;