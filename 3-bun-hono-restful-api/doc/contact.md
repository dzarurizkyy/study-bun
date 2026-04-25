# Contact API Spec

## Create Contact

Endpoint: POST /api/contacts

Request Header:

- Authorization: token

Request Body:

```json
{
  "first_name": "dzaru",
  "last_name": "rizky",
  "email": "dzaru@example.com",
  "phone": "08123456789"
}
```

Response Body:

```json
{
  "data": {
    "id": 1,
    "first_name": "dzaru",
    "last_name": "rizky",
    "email": "dzaru@example.com",
    "phone": "08123456789"
  }
}
```

## Get Contact

Endpoint: GET /api/contacts/{idContact}

Request Header:

- Authorization: token

Response Body:

```json
{
  "data": {
    "id": 1,
    "first_name": "dzaru",
    "last_name": "rizky",
    "email": "dzaru@example.com",
    "phone": "08123456789"
  }
}
```

## Update Contact

Endpoint: PUT /api/contacts/{idContact}

Request Header:

- Authorization: token

Request Body:

```json
{
  "first_name": "dzaru",
  "last_name": "rizky",
  "email": "dzaru@example.com",
  "phone": "08123456789"
}
```

Response Body:

```json
{
  "data": {
    "id": 1,
    "first_name": "dzaru",
    "last_name": "rizky",
    "email": "dzaru@example.com",
    "phone": "08123456789"
  }
}
```

## Remove Contact

Endpoint: DELETE /api/contacts/{idContact}

Request Header:

- Authorization: token

Response Body:

```json
{
  "data": true
}
```

## Search Contact

Endpoint: GET /api/contacts

Query Parameter:
- name: string, search ke first_name atau last_name
- email: string, search ke email
- phone: string, search ke phone
- page: number, default 1
- size: number, default 10

Request Header:

- Authorization: token

Response Body:

```json
{
  "data": [
    {
      "id": 1,
      "first_name": "dzaru",
      "last_name": "rizky",
      "email": "dzaru@example.com",
      "phone": "08123456789"
    }
  ],
  "paging": {
    "page": 1,
    "size": 10,
    "total": 1
  }
}
```
