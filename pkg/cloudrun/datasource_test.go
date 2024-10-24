package cloudrun

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/amp/grafana-cloudrunjson-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/require"
)

func TestDatasource_CheckHealth(t *testing.T) {
	tests := []struct {
		name           string
		serverResponse int
		expectedStatus backend.HealthStatus
	}{
		{
			name:           "Healthy service",
			serverResponse: http.StatusOK,
			expectedStatus: backend.HealthStatusOk,
		},
		{
			name:           "Unhealthy service",
			serverResponse: http.StatusInternalServerError,
			expectedStatus: backend.HealthStatusError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create a test server
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(tt.serverResponse)
			}))
			defer server.Close()

			// Create a datasource with the test server URL
			ds := &Datasource{
				httpClient: server.Client(),
				settings: &models.PluginSettings{
					HealthCheckUrl: server.URL,
				},
			}

			// Call CheckHealth
			result, err := ds.CheckHealth(context.Background(), &backend.CheckHealthRequest{})

			// Assert the results
			require.NoError(t, err)
			require.NotNil(t, result)
			require.Equal(t, tt.expectedStatus, result.Status)
		})
	}
}
