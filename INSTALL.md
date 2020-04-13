# TwoFlags API 

TwoFlags API documentation can be found at: https://twoflags-io.github.io/twoflags/

**This is an Installation guide to host your own TwoFlags service.**

## Requirements

TwoFlags API was developed for deploying on Cloudflare Workers and using
Workers KV storage.

- You need a Cloudflare Account with a domain configured with the following 
subdomains:

    - api.<yourdomain> -> 192.2.0.1 (Proxied)    
    - resolver.<yourdomain> -> 192.2.0.1 (Proxied)

- You will also need your Cloudflare Account ID and Zone ID (both a 32 char hex number you can find 
on the Domain's DNS Page)

- Cloudflare API Token (with CF Workers and Workers KV access)

- Install CF Worker CLI tool, wrangler (https://www.npmjs.com/package/@cloudflare/wrangler)
    
    ```npm i @cloudflare/wrangler -g``` 


### Step 1: Authenticate using CF wrangler API Key

Once you have your CF API Token, config your wrangler CLI tool.

```
$ wrangler config
Enter API Token:
💁  Validating credentials...
✨  Successfully configured. You can find your configuration file at: /Users/user/.wrangler/config/default.toml 
```

### Step 2: Clone this repo and update the wrangler.toml file

#### First clone this repo:

```
$ git clone git@github.com:twoflags-io/twoflags-api.git
$ cd twoflags-api
$ yarn
```

#### Modify the `wrangler.toml` file:

There is a `wrangler.toml.txt` file which you needed to copy to `wrangler.toml` and 
fill the missing info. 
 
This file has 2 sections or environments matching 2 workers we will deploy using it:
- `api`:  API Worker, Used to manage the Feature Flags
- `resolver`: Resolver Worker, Used by SDK to retrieve Feature Flags

Change the following inside the file:
- `<account-id>`: Your CF Account ID
- `<zone-id>`: Your Domain's ID on CF
- `<yourdomain>`: Your Domain base. Ex: If your domain is `theservice.com` you 
will have a `api.theservice.com` and `resolver.theservice.com`

#### Create KV Namespaces

TwoFlags API and Resolver use 10 KV Namespaces, all with uppercase names.

- `ENVIRONMENTS`: All Environments per account
- `APIKEYS`: API Keys per account
- `APIKEY`: API Key lookup
- `FLAGS`: Feature flags per account
- `NAMESPACES`: All Namespaces per account
- `SELECTORS`: String type Flags Selectors
- `ACCOUNTS`: All Accounts
- `VALUES`: Feature Flags Values
- `RESOLVER`: Feature Flags Values, Resolver copy
- `SEGMENTS`: Segment type Flags values (0 - 100)
 
Create them and configure them on the `wrangler.toml` file.
(The `resolver` environment only needs access to `RESOLVER` and `SEGMENTS`)

```
$ wrangler kv:namespace create "ENVIRONMENTS"
🌀  Creating namespace with title "twoflags-service-ENVIRONMENTS"
✨  Success: WorkersKvNamespace {
    id: "fcc...",
    title: "twoflags-service-ENVIRONMENTS",
}
✨  Add the following to your wrangler.toml:
kv-namespaces = [ 
	 { binding = "ENVIRONMENTS", id = "fcc..." } 
]
``` 

You need to copy the binding object in the `wrangler.toml` file on both the 
`api` and the `resolver` environment sections

### Step 3: Build and publish Workers

We have 2 workers on this Service, API and Resolver. 

#### API

```
$ yarn build:api
yarn run v1.21.1
$ rollup -c

src/index.ts → build/index.js...
created build/index.js in 2.5s
✨  Done in 3.07s.

$ yarn publish:api
yarn run v1.21.1
$ wrangler publish --env api
💁  JavaScript project found. Skipping unnecessary build!
✨  Deployed to the following routes:
api.<yourdomain>/* => created
✨  Done in 6.67s.
```

### Resolver

```
$ yarn build:resolver
yarn run v1.21.1
$ rollup -c --config rollup-resolver.config.js

src/resolver/index.ts → build/index.js...
created build/index.js in 1.2s
✨  Done in 1.74s.

$ yarn publish:resolver
yarn run v1.21.1
$ wrangler publish --env resolver
💁  JavaScript project found. Skipping unnecessary build!
✨  Deployed to the following routes:
resolver.<yourdomain>/* => created
✨  Done in 2.81s.
```

### Step 4: Create an Account and API Key

TwoFlags API supports multi-tenancy. All controlled by an Account.
 
An Account is identified by an ID, technically can be any string. You can
use a 32 char hexadecimal string like a UUID4.  

To create an Account use this wrangler command (This commands write directly on the
Worker KV Store from the CLI)

```
$ wrangler kv:key put --env api --binding=ACCOUNTS "a15a1..." '{"email":"you@yourdomain.com"}'
✨  Success
``` 

To activate Datadog (https://www.datadoghq.com/) logging you can add the detail of the integration on the acccount object

```
$ wrangler kv:key put --env api --binding=ACCOUNTS "a15a1..." '{"email":"you@yourdomain.com", logging: {"type": "datadog", "apiKey": "120af0..."}}'
✨  Success
``` 

Next lets create an API Key be able to use all API Endpoints. We can use a 
UUID v4 as API Key.


```
$ wrangler kv:key put --env api --binding=APIKEYS "a15a1..." '[{"id":"cli", "key":"9d443813-5d6e-43f5-9a38-77f81752be13"}]'
✨  Success

$ wrangler kv:key put --env api --binding=APIKEY "9d443813-5d6e-43f5-9a38-77f81752be13" '{"sub":"a15a1...", "last_used": null}'
✨  Success
```

Now your TwoFlags service is ready to use its API and integrate the resolver on your Frontend/Backend Applications.








