package cloudrun

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"

	"github.com/amp/googlecloudrunjson-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

// Make sure Datasource implements required interfaces. This is important to do
// since otherwise we will only get a not implemented error response from plugin in
// runtime. In this example datasource instance implements backend.QueryDataHandler,
// backend.CheckHealthHandler interfaces. Plugin should not implement all these
// interfaces - only those which are required for a particular task.
var (
	_ backend.QueryDataHandler      = (*Datasource)(nil)
	_ backend.CheckHealthHandler    = (*Datasource)(nil)
	_ instancemgmt.InstanceDisposer = (*Datasource)(nil)
)

// Datasource is an example datasource which can respond to data queries, reports
// its health and has streaming skills.
type Datasource struct {
	httpClient *http.Client
	settings   *models.PluginSettings
}

// NewDatasource creates a new datasource instance.
func NewDatasource(ctx context.Context, settings backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	pluginSettings, err := models.LoadPluginSettings(settings)
	if err != nil {
		return nil, err
	}

	opts, err := settings.HTTPClientOptions(ctx)
	if err != nil {
		return nil, err
	}

	client, err := newHTTPClient(*pluginSettings, opts)
	if err != nil {
		return nil, err
	}

	return &Datasource{
		httpClient: client,
		settings:   pluginSettings,
	}, nil
}

// Dispose here tells plugin SDK that plugin wants to clean up resources when a new instance
// created. As soon as datasource settings change detected by SDK old datasource instance will
// be disposed and a new one will be created using NewSampleDatasource factory function.
func (d *Datasource) Dispose() {
	// Clean up datasource instance resources.
}

// QueryData handles multiple queries and returns multiple responses.
// req contains the queries []DataQuery (where each query contains RefID as a unique identifier).
// The QueryDataResponse contains a map of RefID to the response for each query, and each response
// contains Frames ([]*Frame).
func (d *Datasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	response := backend.NewQueryDataResponse()

	for _, q := range req.Queries {
		res, err := d.query(ctx, q)
		if err != nil {
			return nil, err
		}
		response.Responses[q.RefID] = res
	}

	return response, nil
}

type queryModel struct {
	Method string            `json:"Method"`
	Path   string            `json:"Path"`
	Body   string            `json:"Body"`
	Params map[string]string `json:"Params"`
}

func (d *Datasource) query(ctx context.Context, query backend.DataQuery) (backend.DataResponse, error) {
	var response backend.DataResponse
	var qm queryModel

	// Unmarshal the query JSON into our queryModel
	err := json.Unmarshal(query.JSON, &qm)
	if err != nil {
		return response, fmt.Errorf("error unmarshaling query: %w", err)
	}

	_url := d.settings.ServiceUrl + qm.Path

	// Add query parameters
	if len(qm.Params) > 0 {
		params := url.Values{}
		for key, value := range qm.Params {
			params.Add(key, value)
		}
		_url += "?" + params.Encode()
	}

	// Create a new request
	var req *http.Request
	if qm.Body != "" {
		req, err = http.NewRequestWithContext(ctx, qm.Method, _url, strings.NewReader(qm.Body))
	} else {
		req, err = http.NewRequestWithContext(ctx, qm.Method, _url, nil)
	}
	if err != nil {
		return response, fmt.Errorf("error creating request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	// Authentication headers will be added by the auth middleware

	// Send the request
	resp, err := d.httpClient.Do(req)
	if err != nil {
		return response, fmt.Errorf("error sending request: %w", err)
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return response, fmt.Errorf("error reading response body: %w", err)
	}

	// Check for non-200 status codes
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return response, fmt.Errorf("API returned non-OK status: %s, body: %s", resp.Status, string(body))
	}

	// Parse the JSON response
	var result interface{}
	err = json.Unmarshal(body, &result)
	if err != nil {
		return response, fmt.Errorf("error parsing JSON response: %w", err)
	}

	// Create a data frame from the result
	frame := data.NewFrame("response")

	// Handle different response types
	switch v := result.(type) {
	case map[string]interface{}:
		for key, value := range v {
			frame.Fields = append(frame.Fields, data.NewField(key, nil, []interface{}{value}))
		}
	case []interface{}:
		// Handle array responses
		// This is a simplified example and may need to be adjusted based on your specific needs
		for i, item := range v {
			if m, ok := item.(map[string]interface{}); ok {
				for key, value := range m {
					frame.Fields = append(frame.Fields, data.NewField(fmt.Sprintf("%s_%d", key, i), nil, []interface{}{value}))
				}
			}
		}
	default:
		return response, fmt.Errorf("unexpected response type")
	}

	// Add the frame to the response
	response.Frames = append(response.Frames, frame)

	return response, nil
}

// CheckHealth handles health checks sent from Grafana to the plugin.
func (d *Datasource) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	healthCheckUrl := d.settings.HealthCheckUrl
	if healthCheckUrl == "" {
		healthCheckUrl = d.settings.ServiceUrl
	}

	httpReq, err := http.NewRequestWithContext(ctx, "GET", healthCheckUrl, nil)
	if err != nil {
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: fmt.Sprintf("Error creating request: %v", err),
		}, nil
	}

	resp, err := d.httpClient.Do(httpReq)
	if err != nil {
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: fmt.Sprintf("Error connecting to health check URL: %v", err),
		}, nil
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: fmt.Sprintf("Health check returned non-OK status: %s", resp.Status),
		}, nil
	}

	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: "Data source is working",
	}, nil
}
