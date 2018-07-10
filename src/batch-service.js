const axios = require('axios');

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

const processRequests = ({ url, verb }, payload) => {
  //Create axios request object for each payload item
  return payload.map(({params, body}) => ({
    verb,
    url: formUrl(url, params),
    data: { ...body },
  }));
}

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

const batch = (req,res) => {
  const batchLimit = 5
  const { request, payload } = req.body;
  const requests = processRequests(request, payload);
  let results = [];

  (limit = () => {
    let queue = requests.splice(-batchLimit);
    if(queue.length) {
      performRequests(queue)
        .then(({success, failed}) => {
          //console.log(success.length, failed.length);
          results.push(...success);
          if(failed.length) {
            //Retry the failed requests once for each batch
            let retrials = failed.map(fail => {
              return fail.request
            })
            performRequests(retrials)
              .then(({ success: retrySuccess, failed: retryFailed }) => {
                //console.log(retrySuccess.length, retryFailed.length);
                results.push(...retrySuccess, ...retryFailed);
                limit();
              })
          }
        })
        .catch(err => res.status(500).send(err.message));

    } else {
      res.status(200).send(results)
    }
  })();

}


module.exports = batch;