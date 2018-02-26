const fetch = require('node-fetch');

const request = (url, token, method) =>
  fetch(url, { method, headers: { 'X-Vault-Token': token } })
    .then(res => res.json())
    .then(res => {
      if (res.errors && res.errors.length) {
        throw new Error('Vault error: ' + res.errors.join('; '));
      }
      return res;
    });

const read = (apiUrl, token, engine, key) =>
  request(apiUrl + '/' + engine + '/' + key, token)
    .then(res => res.data.value);

const list = (apiUrl, token, engine) =>
  request(apiUrl + '/' + engine, token, 'LIST')
    .then(res => res.data.keys);

/**
 * Loads environment variables from Hashicorp's vault for Node.js application
 *
 * @param {Object}   config         vault config
 * @param {string}   config.apiUrl  vault http api endpoint
 * @param {string}   config.token   vault token
 * @param {string[]} config.engines single or multiple secret engines
 * @returns {Promise<Object>}
 */
exports.config = ({ apiUrl, token, engines }) => {
  console.log(apiUrl, token, engines);
  apiUrl = apiUrl.replace(/\/$/, ''); // cleanup slash(/)

  // list all keys for each engine
  let pKeys = engines.map(engine => {
    engine = engine.replace(/^\//, '').replace(/\/$/, '');  // cleanup slash(/)
    return list(apiUrl, token, engine).then(keys => keys.map(key => ({ engine, key })));
  });
  pKeys = Promise.all(pKeys)
    .then(keys => keys.reduce((p, c) => p.concat(c), []));

  // read all values for each key
  const pValues = pKeys
    .then(keys => keys.map(
      key => read(apiUrl, token, key.engine, key.key)
        .then(value => Object.assign({}, key, { value }))
    ))
    .then(pv => Promise.all(pv));

  // process result and apply to process.env
  return pValues.then(values => {
    const config = values.reduce((p, v) => {
      if (!process.env.hasOwnProperty(v.key)) {
        p[v.key] = v.value;
      }
      return p;
    }, {});
    Object.keys(config).forEach(key => {
      process.env[key] = config[key];
    });
    return config;
  });
}
