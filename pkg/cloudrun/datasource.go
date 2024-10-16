package cloudrun

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/amp/googlecloudrunjson-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
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
// QueryData handles multiple queries and returns multiple responses.
func (d *Datasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	log.DefaultLogger.Info("QueryData called", "request", req)

	response := backend.NewQueryDataResponse()

	for _, q := range req.Queries {
		res := d.query(ctx, req.PluginContext, q)
		response.Responses[q.RefID] = res
	}

	log.DefaultLogger.Info("QueryData response", "response", response)

	return response, nil
}

type queryModel struct {
	Method string            `json:"Method"`
	Path   string            `json:"Path"`
	Body   string            `json:"Body"`
	Params map[string]string `json:"Params"`
}

func (d *Datasource) query(ctx context.Context, pCtx backend.PluginContext, query backend.DataQuery) backend.DataResponse {
	var response backend.DataResponse

	// Unmarshal the JSON into our queryModel
	var qm queryModel
	err := json.Unmarshal(query.JSON, &qm)
	if err != nil {
		log.DefaultLogger.Error("Error unmarshaling query", "error", err)
		return backend.ErrDataResponse(backend.StatusBadRequest, fmt.Sprintf("json unmarshal: %v", err.Error()))
	}

	log.DefaultLogger.Info("Query model", "model", qm)

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
		return backend.ErrDataResponse(backend.StatusBadRequest, fmt.Sprintf("error creating request: %v", err.Error()))
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	// Authentication headers will be added by the auth middleware

	// Send the request
	resp, err := d.httpClient.Do(req)
	if err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, fmt.Sprintf("error sending request: %v", err.Error()))
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, fmt.Sprintf("error reading response body: %v", err.Error()))
	}

	// Check for non-200 status codes
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return backend.ErrDataResponse(backend.StatusBadRequest, fmt.Sprintf("API returned non-OK status: %s, body: %s", resp.Status, string(body)))
	}

	// Parse the JSON response
	var apiResponse struct {
		Results []map[string]interface{} `json:"results"`
	}
	err = json.Unmarshal(body, &apiResponse)
	if err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, fmt.Sprintf("error parsing JSON response: %v", err.Error()))
	}

	// Create a data frame from the result
	frame := data.NewFrame("response")

	// Process the results
	if len(apiResponse.Results) > 0 {
		// Create fields based on the first result
		for key := range apiResponse.Results[0] {
			field := data.NewField(key, nil, []string{})
			frame.Fields = append(frame.Fields, field)
		}

		// Add data to fields
		for _, result := range apiResponse.Results {
			for _, field := range frame.Fields {
				value := result[field.Name]
				var stringValue string
				switch v := value.(type) {
				case []interface{}:
					// Convert slice to JSON string
					jsonBytes, err := json.Marshal(v)
					if err != nil {
						return backend.ErrDataResponse(backend.StatusBadRequest, fmt.Sprintf("error converting array to JSON: %v", err.Error()))
					}
					stringValue = string(jsonBytes)
				case map[string]interface{}:
					// Convert map to JSON string
					jsonBytes, err := json.Marshal(v)
					if err != nil {
						return backend.ErrDataResponse(backend.StatusBadRequest, fmt.Sprintf("error converting map to JSON: %v", err.Error()))
					}
					stringValue = string(jsonBytes)
				default:
					// Convert any other type to string
					stringValue = fmt.Sprintf("%v", v)
				}
				field.Append(stringValue)
			}
		}
	}

	// Add the frame to the response
	response.Frames = append(response.Frames, frame)

	log.DefaultLogger.Info("Query response", "response", response)

	return response
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
