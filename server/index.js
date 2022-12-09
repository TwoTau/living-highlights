import { TwitterApi } from 'twitter-api-v2';
import express from 'express';
import cors from 'cors';

const PORT = +(process.env.PORT || 3000);

const TOKEN = process.env.TWITTER_API_TOKEN;

if (!TOKEN) {
	console.error("Error: No TWITTER_API_TOKEN environment variable defined.");
	process.exit(1);
}

const app = express();
app.use(cors());
const client = new TwitterApi(TOKEN);
const readOnlyClient = client.readOnly; // for type hints

async function getAuthorInfo(authorId) {
	const { name, username } = (await client.v2.user(authorId)).data;
	return { name, username };
}

async function getTweets(query) {
	if (query.length < 10) {
		console.error(`Query '${query}' too short`);
		return [];
	}

	const tweets = [];

	const searchResults = await client.v2.search(query + ' -is:retweet', {
		'tweet.fields': ['created_at', 'author_id', 'entities'],
	});

	for await (const tweet of searchResults) {
		let { created_at, text, id, author_id } = tweet;

		let fragment = null;
		const urls = tweet.entities?.urls ?? [];
		for (const { expanded_url } of urls) {
			const split = expanded_url.split('#:~:text', 2);
			if (split.length == 2) {
				fragment = '#:~:text' + split[1];
				break;
			}
		}

		created_at = new Date(created_at);
		const author = await getAuthorInfo(author_id);
		const link = `https://twitter.com/${author.username}/status/${id}`;
		tweets.push({
			name: author.name,
			author: author.username,
			link,
			time: created_at,
			text,
			fragment,
		});
	}

	return tweets;
}

// For example, go to
// http://localhost:3000/search/vishald.com

app.get('/search/:query?', async (req, res) => {
	const query = req.params.query;
	if (!query) {
		return res.status(400).send('No search query provided');
	};
	try {
		res.json({
			tweets: await getTweets(query),
		});
	} catch (e) {
		res.status(500).send(e);
	}
});

app.listen(PORT, () => {
	console.log('Listening on port', PORT);
});
