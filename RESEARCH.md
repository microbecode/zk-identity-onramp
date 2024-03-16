This document describes the research days spent on this project.

## 5th of March

Started researching the project. Started looking on creating a JWT token with just JS with Google. It seems it requires access to Google Cloud Console, which requires one to enter all sorts of details (such as credit card). Normally this wouldn't be an issue, but in this phase of the project it is assumed that the authentication tokens are leaked, so need to use empty accounts. Wouldn't want to associate real credit cards with accounts that get compromised.

It seems to be difficult to find a popular identity provider that allows to recreate the auth flow without selling one's soul (or giving credit card info).

## 7th of March

Just couldn't get Google to work, so I decided to try Auth0. It doesn't support all the same functionality, but it has the needed _nonce_ field for storing the Mina public key - ChatGPT also suggested to try using their special _state_ field for storage. Will try both.

Imported empty UI also.

## 8th of March

Navigating Auth0's and Google's OAuth settings, trying to make them talk to each other. There are loads of settings to toggle and figure out. Authentication redirect is in place but just doesn't work yet. Custom data is being embedded in the authentication flow.

Starting to use ngrok proxy to allow localhost development - authentication flow redirects now to localhost through ngrok.

Added a bit of JS to start the Auth0 authentication flow.

## 11th of March

The login flow finally works. The custom data to be used for Mina is carried in the login flow successfully.

The login flow issues were caused simply by misconfiguration in the cloud login settings. Also this project's frontend files were incorrect: the login was redirecting itself back to login, which caused an endless loop that gave the sensation that the login doesn't work.

## 13th of March

Trying to get the nonce to be used in our auth flow. For some reason our custom nonce is not taken into account even if we inject it in the auth flow.

This may be a misconfiguration issue. Or, alternatively, Auth0 just doesn't support custom nonces, for some reason. But it does expose modifying it, which hints at the former option. But no luck so far in fixing the auth flow configuration.

## 16th of March

Currently given up on using the "ready" auth flow, since I can't get it to recognize my custom input data (nonce).

Trying to create the auth flow by myself, but that appears to be not feasible. It requires all sorts of back-and-forth verification logic that is tricky to get right (for example "code verifier" and its challenge functionality).

Two options remain:

1. Keep trying
1. Get rid of Auth0 and try to get things working directly with identity providers (had challenges with that approach as well earlier)

I'll continue banging my head against the wall tomorrow and decide how to proceed.
