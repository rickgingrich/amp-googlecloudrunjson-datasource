package cloudrun

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/amp/grafana-cloudrunjson-datasource/pkg/models"
	"github.com/grafana/grafana-google-sdk-go/pkg/tokenprovider"
	"github.com/grafana/grafana-plugin-sdk-go/backend/httpclient"
)

type serviceAccountKey struct {
	Type                    string `json:"type"`
	ProjectID               string `json:"project_id"`
	PrivateKeyID            string `json:"private_key_id"`
	PrivateKey              string `json:"private_key"`
	ClientEmail             string `json:"client_email"`
	ClientID                string `json:"client_id"`
	AuthURI                 string `json:"auth_uri"`
	TokenURI                string `json:"token_uri"`
	AuthProviderX509CertURL string `json:"auth_provider_x509_cert_url"`
	ClientX509CertURL       string `json:"client_x509_cert_url"`
}

func getMiddleware(settings models.PluginSettings) (httpclient.Middleware, error) {

	var key serviceAccountKey
	err := json.Unmarshal([]byte(settings.Secrets.ServiceAccountKey), &key)
	if err != nil {
		return nil, fmt.Errorf("failed to parse service account key: %w", err)
	}

	providerConfig := tokenprovider.Config{
		Scopes: settings.Scopes,
	}

	providerConfig.JwtTokenConfig = &tokenprovider.JwtTokenConfig{
		Email:          key.ClientEmail,
		URI:            key.TokenURI,
		PrivateKey:     []byte(key.PrivateKey),
		TargetAudience: settings.ServiceUrl,
	}

	provider := tokenprovider.NewJwtIdentityTokenProvider(providerConfig)

	return tokenprovider.AuthMiddleware(provider), nil
}

func newHTTPClient(settings models.PluginSettings, opts httpclient.Options) (*http.Client, error) {

	m, err := getMiddleware(settings)

	if err != nil {
		return nil, err
	}

	opts.Middlewares = append(opts.Middlewares, m)

	return httpclient.NewProvider().New(opts)
}
