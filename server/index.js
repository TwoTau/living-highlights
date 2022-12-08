import { TwitterApi } from 'twitter-api-v2';
import express from 'express';

const PORT = +(process.env.port ?? 2976);

const TOKEN = 'AAAAAAAAAAAAAAAAAAAAAE6OiwEAAAAAeYbl4zqLU6q91RVW8ZI%2FPNekttw%3DZ2w6UUuJ8VfAiUdsWDVRzVl9ngiAd6h1f2ePC9DYwMFP7n1WxA';

const app = express();
const client = new TwitterApi(TOKEN);
const readOnlyClient = client.readOnly; // for type hints

async function getAuthorInfo(authorId) {
	const { name, username } = (await client.v2.user(authorId)).data;
	return { name, username };
}

async function getTweets(query) {
	const tweets = [];

	const searchResults = await client.v2.search(query + ' -is:retweet', {
		'tweet.fields': ['created_at', 'author_id'],
	});

	for await (const tweet of searchResults) {
		let { created_at, text, id, author_id } = tweet;
		created_at = new Date(created_at);
		const author = await getAuthorInfo(author_id);
		const link = `https://twitter.com/${author.username}/status/${id}`;
		tweets.push({
			name: author.name,
			author: author.username,
			link,
			time: created_at,
			text,
		});
	}

	return tweets;
}

// For example, go to
// http://localhost:2976/search/vishald.com

app.get('/search/:query?', async (req, res) => {
	const query = req.params.query;
	if (!query) {
		return res.status(400).send('No search query provided');
	};
	res.json({
		tweets: await getTweets(query),
	});
});

app.listen(PORT);
console.log('Listening on port', PORT);
