package models

import (
	"encoding/json"
	"fmt"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

var defaultScopes = []string{
	"https://www.googleapis.com/auth/cloud-platform",
}

type PluginSettings struct {
	ServiceUrl     string                `json:"serviceUrl"`
	HealthCheckUrl string                `json:"healthCheckUrl"`
	Secrets        *SecretPluginSettings `json:"-"`
	Scopes         []string              `json:"-"`
}

type SecretPluginSettings struct {
	ServiceAccountKey string `json:"serviceAccountKey"`
}

func LoadPluginSettings(source backend.DataSourceInstanceSettings) (*PluginSettings, error) {
	settings := PluginSettings{}
	err := json.Unmarshal(source.JSONData, &settings)
	if err != nil {
		return nil, fmt.Errorf("could not unmarshal PluginSettings json: %w", err)
	}

	settings.Secrets = loadSecretPluginSettings(source.DecryptedSecureJSONData)

	// Set default scopes if none are provided
	if len(settings.Scopes) == 0 {
		settings.Scopes = defaultScopes
	}

	return &settings, nil
}

func loadSecretPluginSettings(source map[string]string) *SecretPluginSettings {
	return &SecretPluginSettings{
		ServiceAccountKey: source["serviceAccountKey"],
	}
}
