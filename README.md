# Guesty Assessment -  Batch Editing Service
Microservice to perform batch operations to existing service.

## Installation
1. Clone this repo
```bash
$ git clone git@github.com:andela-jkithome/guesty-be-assessment.git
```

2. Install the dependencies
```bash
$ yarn
```

3. Start the service
- For dev
  ```bash
  $ yarn start:dev
  ```
- For production
  ```bash
  $ yarn start
  ```

## Usage
### Request
This service exposes a single endpoint (`POST` , `/batch`). It expects a JSON `body` payload with details pertinent to the request

The expected payload:
```json
{
  "request": {
    "url": "https://guesty-user-service.herokuapp.com/user/{userId}",
    "verb": "PUT"
  },
  "payload": [
    {
      "params": {
        "userId": 14
      },
      "body": {
        "age": 30
      }
    },
    {
      "params": {
        "userId": 29
      },
      "body": {
        "age": 30
      }
    },
    {
      "params": {
        "userId": 103
      },
      "body": {
        "age": 30
      }
    }
  ]
}
```

The request JSON should contain a request object containing the url to make requests and the HTTP verb to make those requests with.

### Response
The response structure is as follows:
```json
[ 
  { 
    "status": 200,
    "response": {
      "id": "ja2S-hs81-ksn3-iQI9",
      "name": "Jon Snow",
      "email": "jon@wall.com",
      "age": 21
    } 
  },
  { 
    "status": 200,
    "response": {
      "id": "ja2S-hs81-ksn3-iQI9",
      "name": "Jon Snow",
      "email": "jon@wall.com",
      "age": 21
    } 
  }, 
  { 
    "status": 503,
    "request": {
      "verb": "PUT",
      "url": "https://guesty-user-service.herokuapp.com/user/29",
      "data": "[Object]"
    },
  } 
]
```