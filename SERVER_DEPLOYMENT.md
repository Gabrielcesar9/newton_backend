# Statistics server deployment

Replace these files together, using the current copies from the project root:

```
server.js
drop_storage.js
drop_analytics.js
package.json
package-lock.json
```

Place all five in the same deployment directory. The root `server.js` imports
both helpers with relative paths. The separate `backend/server.js` in this
repository is an older server, and is not this entry point.

Render settings for the directory containing these files:

* Build command: `npm ci`
* Start command: `node server.js` (or `npm start`)
* Keep the existing `MONGO_URI` environment variable.
* Node.js must satisfy the installed MongoDB driver's requirement: >=20.19.0.

Deploy/restart after replacing all files. Adding files to the repository without
deploying the new commit does not change the running service.

## The statisticalDrops error

`TypeError: statisticalDrops is not a function` means the loaded helper does not
export the function the current server expects. The current `drop_storage.js`
exports `normalizeDrops`, `statisticalDrops` and `statsUpdate`. Replacing that file
with the matching version resolves the missing export. The server now validates
its required helper exports during startup and reports the mismatched file by name.

## Reverse proxy

The server defaults to `TRUST_PROXY_HOPS=1`: it trusts the reverse proxy immediately
in front of the app when processing forwarded headers. Set this environment
variable to the verified proxy depth if the deployment has additional proxy hops;
use `0` for a direct connection without a reverse proxy. It must be a non-negative
integer. The correct value depends on the actual network path, as explained in
the [Express proxy guide](https://expressjs.com/en/guide/behind-proxies/).

## Verification

From the deployment directory:

```
node --check server.js
node --check drop_storage.js
node --check drop_analytics.js
node -e "console.log(typeof require('./drop_storage').statisticalDrops)"
```

The last command should print `function`. Then select Catacomb Frost Premium
again in the client. No collection reset is required.
