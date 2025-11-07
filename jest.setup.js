require("@testing-library/jest-dom");
const fetch = require("node-fetch");
global.navigator = {
  userAgent:
    "Mozilla/5.0 (Linux; Android 4.3; Nexus 7 Build/JWR66Y) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.92 Safari/537.36"
};
global.fetch = fetch;
global.Request = fetch.Request;