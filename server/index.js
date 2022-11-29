import { TwitterApi } from 'twitter-api-v2';

const TOKEN = 'AAAAAAAAAAAAAAAAAAAAAE6OiwEAAAAAeYbl4zqLU6q91RVW8ZI%2FPNekttw%3DZ2w6UUuJ8VfAiUdsWDVRzVl9ngiAd6h1f2ePC9DYwMFP7n1WxA';

const client = new TwitterApi(TOKEN);
const readOnlyClient = client.readOnly; // for type hints

const QUERY = '2210.13952.pdf';

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
			author: author.username,
			link,
			time: created_at,
			text,
		});
	}

	return tweets;
}

console.log(await getTweets(QUERY));
