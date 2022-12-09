# Living Highlights
Social annotations for Living Papers

Deployed to https://vishald.com/living-highlights/

## Running locally

If running locally, you also have to run the Tweet API search server in `server/`:

```bash
$ cd server
$ npm install
$ PORT=3000 TWITTER_API_TOKEN='AAAA...' npm run start
```

with `TWITTER_API_TOKEN` being your bearer token to access the Twitter API.

If you don't have a Twitter API key, you can change the `getTweets()` function in `writeup/src/api.js` to use `getTweetsOnline()` instead of `getTweetsLocal()`. That'll return testing data instead of querying a server.