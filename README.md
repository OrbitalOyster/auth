Simple authentication server based on JWT with RS256 encryption. Supports basic user management.

# Requirements

1. Access to MongoDB with existing "users" collection
2. MongoDB user document must have following fields:
  * username: string
  * passwordHash: string
  * p: number
3. Generated RS256 key pair
4. Filled out .env file (see .env_sample)

# Installation

1. Run following commands:

```bash
mkdir auth
cd auth
git clone https://github.com/OrbitalOyster/auth .
npm install
```

2. Copy or generate new RS256 key pair.

# Key pair generation

```bash
openssl genrsa -out keys/jwtRS256.key 4096
openssl rsa -in keys/jwtRS256.key -pubout -out keys/jwtRS256.key.pub
```

# .env file

* PORT - http port.
* MONGO_URL - mongo connection URI.
* RTOKEN_COOKIE_NAME - cookie to store refresh token in. Optional, defaults to "rt".
* ATOKEN_COOKIE_NAME - cookie to store access token in. Optional, defaults to "at".
* RTOKEN_EXPIRE - refresh token expiration time in seconds.
* ATOKEN_EXPIRE - access token expiration time in seconds.
* COOKIE_SECRET - passphrase for additional cookie protection.
* OPEN_REGISTRATION - if anyone with access to API is allowed to register new user. Optional, defaults to "false".

# Privilege levels

Almost every API call requires certain privilege level (p). Every user may only operate (edit, remove, etc.) on users with lower privilege level. User can only perform operations that his privilege level is divisible by. For example, user with p === 10 can only list and edit other users, however user with p === 11 has no privileges whatsoever.

Operation privileges:
* List users: 2
* Add new users: 3
* Edit users: 5
* Remove users: 7

Thereby lowest level administrator is required to have privilege level 210 (2 * 3 * 5 * 7).

# Usage

## Logging in

1. Get refresh token
2. Get access token

## Authenticating requests

1. Get public key
2. Verify request with public key

# API

## List all users

```
GET http://localhost:8081/users
```

## Get user by name

```
GET http://localhost:8081/users/USERNAME
```

## Get public key

```
GET http://localhost:8081/pk
```

## Get refresh token (login)

```
POST http://localhost:8081/rt
Content-type: application/json

{
  "username": "USERNAME",
  "password": "PASSWORD"
}
```

## Get access token

```
GET http://localhost:8081/at
Cookie: rt=RTOKEN
```

## Log out

```
POST http://localhost:8081/lo
Cookie: rt=RTOKEN
```

## Register new user

```
POST http://localhost:8081/users
Cookie: at=ATOKEN
Content-type: application/json

{
  "username": "USERNAME",
  "password": "PASSWORD",
  "p": PRIVILEGE_LEVEL
}
```

## Edit user

```
PATCH http://localhost:8081/users/USER_ID
Cookie: at=ATOKEN
Content-type: application/json

{
  "password": "PASSWORD"
}
```

## Remove user

```
DELETE http://localhost:8081/users/USER_ID
Cookie: at=ATOKEN
```

# TODO

* Documentation

# License

[MIT](LICENSE)
