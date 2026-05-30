/** 
 * fetchModel - Fetch a model from the web server.
 *
 * param {string} url      The URL to issue the GET request.
 *
 */
async function fetchModel(url) {
  const response = await fetch(url);
  if(response.ok)
  {
    return await response.json();
  }
  else
  {
    throw new Error(`HTTP error: ${response.status}`);
  }

}

export default fetchModel;
