## 100 Trees

A project to help save trees from a suffocating death.

### Setup

This section will keep changing as we continue adding components to the project.

- Clone this directory.
- Add a `.env` file in the root that looks like:

```
MAILGUN_USERNAME=''
MAILGUN_PASSWORD=''

SESSION_SECRET=''

DB_HOST='localhost'
DB_USER='<YOUR POSTGRES USERNAME>'
DB_PASSWORD='<POSTGRES PW>'
DB_NAME='trees'

FACEBOOK_ID=''
FACEBOOK_SECRET=''

GOOGLE_ID=''
GOOGLE_SECRET=''

API_KEY = ''

```

- Add your [Google Maps API Key](https://developers.google.com/maps/) as `API_KEY` in your `.env` file.
- Run `psql` and then `create database trees;`

At the equator, one mile of latitude is equal to 0.01449275362 (or 1/69) degrees. At the equator, one mile of longitude is equal to 0.01811594203 (or 1/55.2) degrees




