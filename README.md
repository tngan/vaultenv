# vaultenv
Loads environment variables from Hashicorp's vault for Node.js application

## Reasons

- **Single source of truth**: .env consists of sensitive information, we share that file among others under development phase, we have to notice everyone even we change one of the variables.

- **Reduce duplication**: Different microservices could share same environment variables, those can be refactored into same secret engine without multiple declarations, otherwise you have to update every repositories once it gets changed.

## Install

Under development

## Usage

```js
require('vaultenv').config({
  apiUrl: 'http://localhost:8080/api/v1', // vault http api endpoint
  token: 'xxx', // vault token
  engines: ['/secret/app'] // single or multiple secret engines
});
```

Then you can access the declared environment variables via

```js
process.env.ENV_VARS_NAME
```

### License

[MIT](LICENSE)

### Copyright

Copyright (C) 2018 Tony Ngan, released under the MIT License.
