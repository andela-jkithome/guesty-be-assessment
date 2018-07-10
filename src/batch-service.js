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
  const { request, payload } = req.body;
  const requests = processRequests(request, payload);

  performRequests(requests)
    .then(({success, failed}) => {
      res.status(200).send([...success, ...failed]);
    })
    .catch(err => res.status(500).send(err.message));
}

module.exports = batch;