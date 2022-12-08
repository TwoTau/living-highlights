const BASE_URL = 'http://localhost:2976/search/';
const SEARCH = 'vishald.com/living-highlights';

async function getTweetsOnline() {
	const response = await fetch(`${BASE_URL}${SEARCH}`);
	const json = await response.json();
	return json.tweets;
}

async function getTweetsLocal() {
	return [
		{
			name: "Vishal Devireddy",
			author: "VishalDevireddy",
			link: "https://twitter.com/VishalDevireddy/status/1600712215908474880",
			time: "2022-12-08T04:41:46.000Z",
			text: "(another test tweet)\nsomething something generalization\n\n https://t.co/AmI4MoHBbK",
			fragment: "#:~:text=The%20main%20components%20of%20our%20implementation%20are%20the%20UI%2C%20Text%20Fragments%2C%20Twitter%20web%20intents%2C%20and%20our%20server%20that%20searches%20Twitter.",
		},
		{
			name: "Vishal Devireddy",
			author: "VishalDevireddy",
			link: "https://twitter.com/VishalDevireddy/status/1600711582967009280",
			time: "2022-12-08T04:39:15.000Z",
			text: "(This is a test tweet for a class project, pls ignore)\n\n https://t.co/ZXwZMtrJ7u.",
			fragment: "#:~:text=searching%20through%20the-,past%20week%20of%20tweets",
		},
	];
}

export async function getTweets() {
	return await getTweetsLocal();
}