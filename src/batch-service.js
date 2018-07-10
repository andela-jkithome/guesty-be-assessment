const axios = require('axios');

/**
 * Replace the params in a path with correct values.
 *
 * @param {string} url URL with path params to replace
 * @param {object} params Object containing params param: paramValue
 * @returns {string} newUrl with params replaced with correct values.
 */

const formUrl = (url, params ) => {
  let newUrl = url;
  let keys = Object.keys(params);
  keys.forEach(key => {
    //Find all instances of key as a param and replace it
    newUrl = newUrl.replace(/\{(.*?)\}/g, (match, substring) => {
      return params[substring];
    })
  });

  return newUrl;
}

/**
 * Construct an array of axios-ready configurations
 *
 * @param {object} request containing URL and verb.
 * @param {object[]} payload Array of payload objects. Each object contains params
 *                           and details/body for the request
 * @returns {object[]} Array of axios request objects
 */

const processRequests = ({ url, verb }, payload) => {
  //Create axios request object for each payload item
  return payload.map(({params, body}) => ({
    verb,
    url: formUrl(url, params),
    data: { ...body },
  }));
}

/**
 * Execute an array of batch requests.
 *
 * @param {object[]} requests axios request objects
 * @returns {Promise} resolves with successful and failed requests
 */

const performRequests = (requests) => {
  return new Promise(res => {
    let failed = [];
    let success = [];

    Promise.all(
      requests.map(request =>
        axios(request)
          .then(response => {
            success.push({
              status: response.status,
              response: response.data,
            });
          })
          .catch(error => {
            // console.log(error);
            failed.push({request, status: error.response.status });
          }),
      ),
    ).then(() => res({ success, failed }));
  });
}

/**
 * Make batch requests 

 * @returns {array} returns results or error message
 */

const batch = (req,res) => {
  const batchLimit = 5;
  const batchTime = 10000;
  const { request, payload } = req.body;
  const requests = processRequests(request, payload);
  let results = [];
  let toRetry = [];
  let start;

  (limit = () => {
    let queue = requests.splice(-batchLimit);
    if(queue.length) {
      console.log('First call!!')
      start = new Date().getTime();
      performRequests(queue)
        .then(({success, failed}) => {
          results.push(...success);
          if(failed.length) {
            let retrials = failed.map(fail => {
              return fail.request
            });
            toRetry.push(...retrials);
            //Check if there are requests to be processed
            if(requests.length || toRetry.length) {
              let time = batchTime - (new Date().getTime() - start);
              setTimeout(() => {
                limit();
              }, time);
            } else {
              limit();
            }
          } else {
            //Check if there are requests to be processed
            if(requests.length || toRetry.length) {
              let time = batchTime - (new Date().getTime() - start);
              setTimeout(() => {
                limit();
              }, time);
            } else {
              limit();
            }
          }
        })
        .catch(err => res.status(500).send(err.message));

    } else {
      if(toRetry.length) {
        console.log('Retry called!!')
        let retrials = toRetry.splice(-limit);
        console.log('RETRIALS', retrials);
        start = new Date().getTime();
        performRequests(retrials)
          .then(({ success: retrySuccess, failed:retryFailed }) => {
            // Since this is the retry no need to retry again
            let time = batchTime - (new Date().getTime() - start);
            results.push(...retrySuccess, ...retryFailed);
            if(toRetry.length) {
              setTimeout(() => {
                limit();
              }, time);
            } else {
              limit();
            }
          })
          .catch(error => res.status(500).send(error.message));
      } else {
        console.log('Send results!')
        res.status(200).send(results);
      }
    }
  })();

}


module.exports = batch;