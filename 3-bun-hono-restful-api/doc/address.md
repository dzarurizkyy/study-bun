# Address API Spec

## Create Address

Endpoint: POST /api/contacts/{idContact}/addresses

Request Header:

- Authorization: token

Request Body:

```json
{
  "street": "Jl. Contoh",
  "city": "Jakarta",
  "province": "DKI Jakarta",
  "country": "Indonesia",
  "postal_code": "12345"
}
```

Response Body:

```json
{
  "data": {
    "id": 1,
    "street": "Jl. Contoh",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "country": "Indonesia",
    "postal_code": "12345"
  }
}
```

## Get Address

Endpoint: GET /api/contacts/{idContact}/addresses/{idAddress}

Request Header:

- Authorization: token

Response Body:

```json
{
  "data": {
    "id": 1,
    "street": "Jl. Contoh",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "country": "Indonesia",
    "postal_code": "12345"
  }
}
```

## Update Address

Endpoint: PUT /api/contacts/{idContact}/addresses/{idAddress}

Request Header:

- Authorization: token

Request Body:

```json
{
  "street": "Jl. Contoh",
  "city": "Jakarta",
  "province": "DKI Jakarta",
  "country": "Indonesia",
  "postal_code": "12345"
}
```

Response Body:

```json
{
  "data": {
    "id": 1,
    "street": "Jl. Contoh",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "country": "Indonesia",
    "postal_code": "12345"
  }
}
```

## Remove Address

Endpoint: DELETE /api/contacts/{idContact}/addresses/{idAddress}

Request Header:

- Authorization: token

Response Body:

```json
{
  "data": true
}
```

## List Address

Endpoint: GET /api/contacts/{idContact}/addresses

Request Header:

- Authorization: token

Response Body:

```json
{
  "data": [
    {
      "id": 1,
      "street": "Jl. Contoh",
      "city": "Jakarta",
      "province": "DKI Jakarta",
      "country": "Indonesia",
      "postal_code": "12345"
    },
    {
      "id": 2,
      "street": "Jl. Contoh 2",
      "city": "Jakarta",
      "province": "DKI Jakarta",
      "country": "Indonesia",
      "postal_code": "12345"
    }
  ]
}
```