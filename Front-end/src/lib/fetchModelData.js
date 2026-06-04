/** 
 * fetchModel - Fetch a model from the web server.
 *
 * param {string} url      The URL to issue the GET request.
 *
 */
async function fetchModel(url, options = {}) {
  const defaultOptions = {
    credentials: "include",
  };
  const finalOptions = { ...defaultOptions, ...options };
  const response = await fetch(url, finalOptions);
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
