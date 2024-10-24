# Grafana Cloud Run JSON Datasource Plugin

This plugin allows you to interact with a Cloud Run JSON API as Grafana data source.

## Getting started

### Backend

1. Update [Grafana plugin SDK for Go](https://grafana.com/developers/plugin-tools/key-concepts/backend-plugins/grafana-plugin-sdk-for-go) dependency to the latest minor version:

   ```bash
   go get -u github.com/grafana/grafana-plugin-sdk-go
   go mod tidy
   ```

2. Build backend plugin binaries for Linux, Windows and Darwin:

   ```bash
   mage -v
   ```

3. List all available Mage targets for additional commands:

   ```bash
   mage -l
   ```

### Frontend

1. Install dependencies

   ```bash
   yarn install
   ```

2. Build plugin in development mode and run in watch mode

   ```bash
   yarn dev
   ```

3. Build plugin in production mode

   ```bash
   yarn build
   ```

4. Spin up a Grafana instance and run the plugin inside it (using Docker)

   ```bash
   yarn server
   ```

5. Run the linter

   ```bash
   yarn lint

   # or

   yarn lint:fix
   ```
### Spinning up Grafana with Docker

After building the plugin, you can spin up Grafana with Docker Compose:

```bash
docker compose up
```
This will start a local Grafana instance with the plugin installed. You can then access Grafana at http://localhost:3000.

# Signing the Plugin

In order to install the plugin, it needs to be signed or whitelisted in `grafana.ini`

To sign a plugin for private distribution, you need to first generate an access policy token.
See [Generate an access policy token](https://grafana.com/docs/grafana/latest/developers/plugins/sign-a-plugin/#generate-an-access-policy-token) for more information.

Once you have the token, you can sign the plugin by running the following command:

```bash
export GRAFANA_ACCESS_POLICY_TOKEN=[YOUR_ACCESS_POLICY_TOKEN]
npx @grafana/sign-plugin@latest --rootUrls https://grafana.amprobotics.com
```

