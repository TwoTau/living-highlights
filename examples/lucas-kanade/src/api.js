const BASE_URL = 'https://living-highlights-server.herokuapp.com/search/';
const SEARCH = 'vishald.com%2Fliving-highlights';

async function getTweetsOnline() {
	const response = await fetch(`${BASE_URL}${SEARCH}`);
	const json = await response.json();
	return json.tweets;
}

async function getTweetsLocal() {
	return { "tweets": [{ "name": "Vishal Devireddy", "author": "VishalDevireddy", "link": "https://twitter.com/VishalDevireddy/status/1600856730925420544", "time": "2022-12-08T14:16:01.000Z", "text": "Here's an example of Living Highlights!\n\nhttps://t.co/ACGxBWrLGl", "fragment": "#:~:text=reader%20highlights%20and-,social%20annotations%20to%20living%20papers%20documents,-.%20Users%20can%20highlight" }, { "name": "Vishal Devireddy", "author": "VishalDevireddy", "link": "https://twitter.com/VishalDevireddy/status/1600856292381184001", "time": "2022-12-08T14:14:17.000Z", "text": "More information about Text Fragments and browser support on caniuse: https://t.co/nGqLF6YyCe\n\nhttps://t.co/jMaeIXaQER", "fragment": "#:~:text=all%20major%20browsers%20except%20firefox" }, { "name": "Vishal Devireddy", "author": "VishalDevireddy", "link": "https://twitter.com/VishalDevireddy/status/1600855852063551488", "time": "2022-12-08T14:12:32.000Z", "text": "Great quote about why early adoption of a social media platform is a big problem.\n\nhttps://t.co/0ZyC255nKZ", "fragment": "#:~:text=systemic%20reform%20always%20faces%20a%20bootstrap%20problem%3A%20early%20adopters%20gain%20little%20benefit" }, { "name": "Vishal Devireddy", "author": "VishalDevireddy", "link": "https://twitter.com/VishalDevireddy/status/1600711582967009280", "time": "2022-12-08T04:39:15.000Z", "text": "(This is a test tweet for a class project, pls ignore)\n\n https://t.co/ZXwZMtrJ7u.", "fragment": "#:~:text=image%20registration%20finds%20a%20variety%20of%20applications%20in%20computer%20vision%2C%20such%20as%20image%20matching%20for%20stereo%20vision%2C%20pattern%20recognition%2C%20and%20motion%20analysis" }] }.tweets;
}

export async function getTweets() {
	return (await getTweetsOnline()).reverse();
}