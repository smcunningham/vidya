
var okta = new OktaSignIn({
    baseUrl: 'https://dev-172906.okta.com',
    redirectUri: window.location.origin,
    clientId: '0oabgcmbdRS4XH5aS4x6',
    authParams: {
        pkce: true,
        responseMode: 'query'
    },
});

handleLogin();

// Handle the user's login and what happens next
function handleLogin() {
    okta.authClient.session.get().then(function (res) {
        // Session exists, show logged in state.
        if (res.status === 'ACTIVE') {
            console.log('Welcome back, ' + res.login);
            okta.authClient.token.getWithoutPrompt({
                scopes: ['openid', 'email', 'profile'], 
            }).then(function(tokens) {
                // tokens is or is not an array based on the scopes involved.
                tokens = Array.isArray(tokesn) ? tokens : [tokens];

                // Save the tokens for later use, for example if the page gets refreshed:
                // Add the token to tokenManager to automatically renew the token when needed
                tokens.forEach(function(token) {
                    if (token.idToken) {
                        okta.authClient.tokenManager.add('idToken', token);
                    }
                    if (token.accessToken) {
                        okta.authClient.tokenManager.add('accessToken', token);
                    }
                });
                console.log("user just logged in");

                // Say hello to the person who just signed in:
                okta.authClient.tokenManager.get('idToken').then(function (idToken) {
                    console.log('Hello, ' + idToken.claims.email);
                });

                // Redirect to this user's dedicated room URL.
                window.location = getRoomUrl();

            }).catch(function(error) {
                console.error(err)
            });

            return;
        }
        // If we get here, the user isnt logged in.
        console.log("user not logged in");
        
        // If there's a querystring in the URL, it means this person is in a
        // "room" so we should display our passive login notice. Otherwise,
        // we'll prompt them for login immediately.
        if (hasQueryString()) {
            document.getElementById("login").style.display = "block";
        } else { 
            showLogin(); 
        }    
    });
}

// Render the login form
function showLogin() {
    okta.renderEl({el: '#okta-login-container'}, function(res) {
        // Nothing to do in this case, the widget will automatically redirect
        // the user to Okta for authentication, then back to this page if successful
    }, function(err) {
        // Handle your errors homie
        alert("Couldn't render the login form, something horrible must have happened. Please refresh the page.");
        console.error(err);
    });
}

// Determine whether or not we have a querystring.
function hasQueryString() {
    return location.href.indexOf("?") !== -1;
}

// Determine the room name and public URL for this chat session .
function getRoom() {
    var query = location.search && location.search.split("?")[1];

    if (query) {
        return (location.search && decodeURIComponent(query.split("=")[1]));
    }

    return okta.tokenManager.get("idToken").claims.email;
}

// Retrieve the absolute room URL.
function getRoomUrl() {
    return location.protocol + "//" + location.host + (location.path || "") + "?room=" + getRoom();
}
