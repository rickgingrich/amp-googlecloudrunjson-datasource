package models

type PluginSettings struct {
	ServiceUrl  string                `json:"serviceUrl"`
	Secrets     *SecretPluginSettings `json:"-"`
	Scopes      []string              `json:"-"`
	ClientEmail string                `json:"clientEmail"`
	TokenUri    string                `json:"tokenUri"`
	PrivateKey  string                `json:"-"` // Assuming this should be secret
}

type SecretPluginSettings struct {
	ServiceAccountKey string `json:"serviceAccountKey"`
	PrivateKey        string `json:"privateKey"`
}

// Update loadSecretPluginSettings to include PrivateKey
func loadSecretPluginSettings(source map[string]string) *SecretPluginSettings {
	return &SecretPluginSettings{
		ServiceAccountKey: source["serviceAccountKey"],
		PrivateKey:        source["privateKey"],
	}
}
