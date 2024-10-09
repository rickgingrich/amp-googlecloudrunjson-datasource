package cloudrun

import (
	"net/http"

	"github.com/amp/googlecloudrunjson-datasource/pkg/models"
	"github.com/grafana/grafana-google-sdk-go/pkg/tokenprovider"
	"github.com/grafana/grafana-plugin-sdk-go/backend/httpclient"
)

func getMiddleware(settings models.PluginSettings) (httpclient.Middleware, error) {

	providerConfig := tokenprovider.Config{
		Scopes: settings.Scopes,
	}

	providerConfig.JwtTokenConfig = &tokenprovider.JwtTokenConfig{
		Email:          settings.Secrets.ServiceAccountKey,
		URI:            settings.ServiceUrl,
		PrivateKey:     []byte(settings.Secrets.ServiceAccountKey),
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
	return httpclient.New(opts)
}
