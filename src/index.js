// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { UserProvider } from './UserContext'; // Import UserProvider
import App from './App';

ReactDOM.render(
  <GoogleOAuthProvider clientId="829294459286-s7kc17ia7gbdu22ut7pe3euo4ncb6ak3.apps.googleusercontent.com">
    <UserProvider>
      <React.StrictMode>
          <App />
      </React.StrictMode>
    </UserProvider>
  </GoogleOAuthProvider>,
  document.getElementById('root')
);
