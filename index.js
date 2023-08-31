require("dotenv").config();
const express = require("express");
const path = require("path");
const gzipStatic = require("connect-gzip-static");
const routes = require("./src/routes");

const lti = require("ltijs").Provider;

// Setup
lti.setup(
  "LTI_KEY",
  {
    url: "mongodb+srv://josepaiva94:ml3fXoDC3FiOuebx@cluster0.ggmnlk3.mongodb.net/?retryWrites=true&w=majority",
    connection: {
      user: "josepaiva94",
      pass: "ml3fXoDC3FiOuebx",
    },
  },
  {
    staticPath: path.join(__dirname, "./public"), // Path to static files
    cookies: {
      secure: true, // Set secure to true if the testing platform is in a different domain and https is being used
      sameSite: "None", // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
    },
    devMode: true, // Set DevMode to true if the testing platform is in a different domain and https is not being used
  }
);

// When receiving successful LTI launch redirects to appss
lti.onConnect(async (token, req, res) => {
  return res.sendFile(path.join(__dirname, "./public/index.html"));
});

lti.app.use(gzipStatic(path.join(__dirname, "./public")));

// Setting up routes
lti.app.use(routes);

// Setup function
const setup = async () => {
  await lti.deploy({ port: process.env.PORT || 5001 });
  
  // Register platform
  const platform = await lti.registerPlatform({
    url: "https://moodle.cip.ipp.pt",
    name: "Demo Unity-LTI",
    clientId: process.env.LTI_KEY,
    authenticationEndpoint: "https://moodle.cip.ipp.pt/mod/lti/auth.php",
    accesstokenEndpoint: "https://moodle.cip.ipp.pt/mod/lti/token.php",
    authConfig: {
      method: "JWK_SET",
      key: "https://moodle.cip.ipp.pt/mod/lti/certs.php",
    },
  });

  const authConfig = await platform.platformAuthConfig();
  console.log(authConfig);
  console.log(await platform.platformPublicKey()); 
};

setup();
