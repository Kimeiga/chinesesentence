function makeId(length: number) {
  return Array(length).fill(null).map(() => 
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(
      Math.floor(Math.random() * 62)
    )
  ).join('');
}

function getSentence(
	fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
	seed: string
) {
	return fetch(
		'https://tatoeba.org/en/api_v0/search?from=cmn&orphans=no&sort=random&to=eng&trans_filter=limit&trans_to=eng&unapproved=no&limit=1&rand_seed=' +
			seed
	).then((response) => response.json());
}

export const load = async ({ fetch }) => {

	return {
		data: await getSentence(fetch, makeId(4))
	};
}