# User API Spec

## Register User

Endpoint: POST /api/users

Request Body:
```json
{
  "username": "dzaru",
  "password": "secret",
}

```

Response Body (Success):
```json
{
  "data": {
    "username": "dzaru",
    "name": "Dzaru Rizky Fathan Fortuna"
  }
}
```

Response Body (Failed):
```json
{
  "errors": "Username must not blank, ..."
}
```

## Login User

Endpoint: POST /api/users/login

Request Body:
```json
{
  "username": "dzaru",
  "password": "secret",
}

```

Response Body (Success):
```json
{
  "data": {
    "username": "dzaru",
    "name": "Dzaru Rizky Fathan Fortuna",
    "token": "token"
  }
}
```

Response Body (Failed):
```json
{
  "errors": "Username must not blank, ..."
}
```

## Get User
Endpoint: GET /api/users/current

Request Header:
- Authorization: token


Response Body (Success):
```json
{
  "data": {
    "username": "dzaru",
    "name": "Dzaru Rizky Fathan Fortuna"
  }
}
```

## Update User
Endpoint: PATCH /api/users/current

Request Header:
- Authorization: token

Request Body:
```json
{
  "name": "kalau mau update nama",
  "password": "kalau mau update password"
}
```

Response Body (Success):
```json
{
  "data": {
    "username": "dzaru",
    "name": "Dzaru Rizky Fathan Fortuna"
  }
}
```


## Logout User
Endpoint: DELETE /api/users/current

Request Header:
- Authorization: token

Response Body (Success):

```json
{
  "data": true
}
```