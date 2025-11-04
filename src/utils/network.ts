/** * Fetcher function to get JSON data from a given URL.
 * @param url The URL to fetch data from.
 * @returns A promise that resolves to the fetched JSON data.
 */
export const fetcher = (url: string) => fetch(url).then((res) => res.json());
