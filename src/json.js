{
    "annotations": {
      "list": [
        {
          "builtIn": 1,
          "datasource": {
            "type": "grafana",
            "uid": "-- Grafana --"
          },
          "enable": true,
          "hide": true,
          "iconColor": "rgba(0, 211, 255, 1)",
          "name": "Annotations & Alerts",
          "target": {
            "limit": 100,
            "matchAny": false,
            "tags": [],
            "type": "tags"
          },
          "type": "dashboard"
        },
        {
          "datasource": {
            "type": "grafana-bigquery-datasource",
            "uid": "be165xjbz2juof"
          },
          "enable": true,
          "iconColor": "red",
          "mappings": {
            "tags": {
              "source": "field",
              "value": "filter_type"
            },
            "text": {
              "source": "field",
              "value": "value"
            },
            "time": {
              "source": "field",
              "value": "time"
            },
            "timeEnd": {
              "source": "field",
              "value": "end_time"
            },
            "title": {
              "source": "field",
              "value": "name"
            }
          },
          "name": "Outliers",
          "target": {
            "editorMode": "code",
            "format": 1,
            "location": "us-east1",
            "project": "amp-data-analytics",
            "rawQuery": true,
            "rawSql": "WITH base as (\nSELECT\n    f.time,\n    d.name as col_name,\n    d.value as col_value,\n    f.filter_type,\n    f.value,\n    f.filterset\nFROM\n    `amp-data-analytics.analytics_services.data_filters` as f, UNNEST(dimensions) as d\n)\nSELECT * FROM base PIVOT (any_value(col_value) FOR col_name IN ('facility_id', 'test_uuid', 'sort_row_number', 'name'))\n\nwhere\ntrue\n and facility_id = '$facility'  \n and sort_row_number = '$row' \n and name in ($metrics) \n and test_uuid = '$test_id'\nand filterset in (${filterset:value})\n",
            "refId": "Anno",
            "sql": {
              "columns": [
                {
                  "parameters": [],
                  "type": "function"
                }
              ],
              "groupBy": [
                {
                  "property": {
                    "type": "string"
                  },
                  "type": "groupBy"
                }
              ],
              "limit": 50
            }
          }
        },
        {
          "datasource": {
            "type": "grafana-bigquery-datasource",
            "uid": "be165xjbz2juof"
          },
          "enable": true,
          "iconColor": "purple",
          "mappings": {
            "text": {
              "source": "field",
              "value": "config_name"
            },
            "time": {
              "source": "field",
              "value": "StageStart"
            },
            "timeEnd": {
              "source": "field",
              "value": "StageEnd"
            },
            "title": {
              "source": "field",
              "value": "stage_index"
            }
          },
          "name": "Stages",
          "target": {
            "editorMode": "code",
            "format": 1,
            "location": "us-east1",
            "project": "amp-data-analytics",
            "rawQuery": true,
            "rawSql": "SELECT\n  StageStart,\n  StageEnd,\n  cast(stage_index as string) stage_index,\n  config_name\nFROM\n  `amp-data-analytics.glia.test_stages_run`\nwhere $__timeFilter(StageStart)\n  and test_uuid = '$test_id'\nLIMIT\n  50",
            "refId": "Anno",
            "sql": {
              "columns": [
                {
                  "parameters": [],
                  "type": "function"
                }
              ],
              "groupBy": [
                {
                  "property": {
                    "type": "string"
                  },
                  "type": "groupBy"
                }
              ],
              "limit": 50
            }
          }
        }
      ]
    },
    "editable": true,
    "fiscalYearStartMonth": 0,
    "graphTooltip": 0,
    "id": 2,
    "links": [],
    "panels": [
      {
        "collapsed": false,
        "gridPos": {
          "h": 1,
          "w": 24,
          "x": 0,
          "y": 0
        },
        "id": 7,
        "panels": [],
        "title": "Row-Level Results",
        "type": "row"
      },
      {
        "datasource": {
          "default": false,
          "type": "grafana-bigquery-datasource",
          "uid": "be165xjbz2juof"
        },
        "gridPos": {
          "h": 11,
          "w": 24,
          "x": 0,
          "y": 1
        },
        "id": 14,
        "options": {
          "baidu": {
            "callback": "bmapReady",
            "key": ""
          },
          "editor": {
            "format": "auto"
          },
          "editorMode": "code",
          "gaode": {
            "key": "",
            "plugin": "AMap.Scale,AMap.ToolBar"
          },
          "getOption": "const colors = ['#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];\nconst TWO_MINUTES = 2 * 60 * 1000; // 2 minutes in milliseconds\n\n// console.log(context.panel.data.annotations)\n\n// Function to get a specific field's values from an annotation query\nfunction getFieldValues(annotationQuery, fieldName) {\n  const field = annotationQuery.fields.find(f => f.name === fieldName);\n  return field ? Array.from(field.values) : [];\n}\n\nconst outlierAnnotations = context.panel.data.annotations.flatMap(annotationQuery => {\n  const titles = getFieldValues(annotationQuery, 'title');\n  const times = getFieldValues(annotationQuery, 'time');\n  const texts = getFieldValues(annotationQuery, 'text');\n  const types = getFieldValues(annotationQuery, 'type');\n\n  return times.map((time, index) => {\n    if (types[index] === 'Outliers') {\n      return {\n        coord: [time, parseFloat(texts[index])],\n        symbol: 'rect',\n        itemStyle: {\n          color: 'rgba(200, 200, 200, 0.8)' // Light gray with some transparency\n        }\n      };\n    }\n    return null;\n  }).filter(Boolean);\n});\n\nconst stageAnnotations = context.panel.data.annotations.flatMap(annotationQuery => {\n  const times = getFieldValues(annotationQuery, 'time');\n  const texts = getFieldValues(annotationQuery, 'text');\n  const types = getFieldValues(annotationQuery, 'type');\n\n  return times.map((time, index) => {\n    if (types[index] === 'Stages') {\n      return {\n        xAxis: time,\n        label: {\n          formatter: texts[index],\n          position: 'top'\n        },\n        symbol: 'none'\n      };\n    }\n    return null;\n  }).filter(Boolean);\n});\n\nconst allSeries = context.panel.data.series.flatMap((s, seriesIndex) => {\n  const timeField = s.fields.find(f => f.type === 'time');\n  const timeValues = timeField.values.buffer || timeField.values;\n\n  return s.fields\n    .filter(f => f.type === 'number')\n    .map((numField, fieldIndex) => {\n      const fieldValues = numField.values.buffer || numField.values;\n      const fieldName = numField.name || `Series ${seriesIndex + 1} Field ${fieldIndex + 1}`;\n\n      const data = [];\n      for (let i = 0; i < fieldValues.length; i++) {\n        if (i > 0 && (timeValues[i] - timeValues[i - 1]) > TWO_MINUTES) {\n          // Insert a null value to create a gap\n          data.push([timeValues[i - 1] + 1, null]);\n        }\n        data.push([timeValues[i], fieldValues[i]]);\n      }\n\n      const series_annotations = outlierAnnotations.filter(a => a.series === fieldName).map((mark) => mark.annotation);\n\n      return {\n        name: fieldName,\n        type: 'line',\n        showSymbol: true,\n        lineStyle: {\n          width: 1,\n        },\n        connectNulls: false, // Ensure gaps are preserved\n        data: data,\n        markPoint: {\n          data: outlierAnnotations,\n          symbolSize: 10,\n          itemStyle: {\n            color: 'rgba(200, 200, 200, 0.8)' // Light gray with some transparency\n          }\n        },\n        markLine: {\n          silent: true,\n          data: stageAnnotations,\n          lineStyle: {\n            color: '#999',\n            type: 'dashed'\n          },\n          symbol: 'none'\n        }\n      };\n    });\n});\n\n\n/**\n * Enable Data Zoom by default\n */\nsetTimeout(() => context.panel.chart.dispatchAction({\n  type: 'takeGlobalCursor',\n  key: 'dataZoomSelect',\n  dataZoomSelectActive: true,\n}), 500);\n\n/**\n * Update Time Range on Zoom\n */\ncontext.panel.chart.on('datazoom', function (params) {\n  const startValue = params.batch[0]?.startValue;\n  const endValue = params.batch[0]?.endValue;\n  locationService.partial({ from: startValue, to: endValue });\n});\n\nreturn {\n  backgroundColor: 'transparent',\n  tooltip: {\n    trigger: 'axis',\n    axisPointer: {\n      type: 'cross'\n    }\n  },\n  legend: {\n    left: '0',\n    bottom: '0',\n    data: allSeries.map(s => s.name),\n    textStyle: {\n      color: 'rgba(128, 128, 128, .9)',\n    },\n  },\n  toolbox: {\n    feature: {\n      dataZoom: {\n        yAxisIndex: 'none',\n        icon: {\n          zoom: 'path://',\n          back: 'path://',\n        },\n      },\n      saveAsImage: {},\n    }\n  },\n  xAxis: {\n    type: 'time',\n  },\n  yAxis: {\n    type: 'value',\n    min: 0,\n    max: 'max',\n  },\n  grid: {\n    left: '2%',\n    right: '2%',\n    top: '2%',\n    bottom: 24,\n    containLabel: true,\n  },\n  series: allSeries,\n};",
          "google": {
            "callback": "gmapReady",
            "key": ""
          },
          "map": "none",
          "renderer": "canvas",
          "themeEditor": {
            "config": "{}",
            "name": "default"
          },
          "visualEditor": {
            "code": "return {\n  dataset: context.editor.dataset,\n  series: context.editor.series,\n  xAxis: {\n    type: 'time',\n  },\n  yAxis: {\n    type: 'value',\n    min: 'dataMin',\n  },\n}\n",
            "dataset": [
              {
                "name": "time",
                "source": "A"
              },
              {
                "name": "purity",
                "source": "A"
              },
              {
                "name": "recovery",
                "source": "A"
              },
              {
                "name": "attempt_rate",
                "source": "A"
              }
            ],
            "series": [
              {
                "encode": {
                  "x": [
                    "A:time"
                  ],
                  "y": [
                    "A:purity"
                  ]
                },
                "id": "met",
                "name": "purity",
                "type": "line",
                "uid": "e78ebd62-e69b-478e-8c34-d6d3fc795e91"
              },
              {
                "encode": {
                  "x": [
                    "A:time"
                  ],
                  "y": [
                    "A:attempt_rate"
                  ]
                },
                "id": "met2",
                "name": "ar",
                "type": "line",
                "uid": "f129c344-dac0-4c2f-85f5-9e99186dd541"
              },
              {
                "encode": {
                  "x": [
                    "A:time"
                  ],
                  "y": [
                    "A:recovery"
                  ]
                },
                "id": "met3",
                "name": "rec",
                "type": "line",
                "uid": "83c7f7e1-45af-4df1-bea5-94144ba3c810"
              }
            ]
          }
        },
        "pluginVersion": "6.4.1",
        "targets": [
          {
            "datasource": {
              "type": "grafana-bigquery-datasource",
              "uid": "be165xjbz2juof"
            },
            "editorMode": "code",
            "format": 1,
            "location": "us-east1",
            "project": "amp-data-analytics",
            "rawQuery": true,
            "rawSql": "SELECT m.time, m.facility_id, cast(m.sort_row_number as string) sort_row_number, ${metrics:csv}  \nFROM `amp-data-analytics.phx.test_runner_sort_row_number_metrics` m\nLEFT JOIN `amp-data-analytics.phx.test_runner_sort_row_number_vision_health` v \non m.time = v.time and m.facility_id = v.facility_id and m.test_uuid = v.test_uuid and m.test_name = v.test_name and m.stage = v.stage and m.sort_row_number = v.sort_row_number \nwhere m.facility_id = '$facility' and m.test_uuid = '$test_id' \nand m.config_name is not null\nand $__timeFilter(m.time) \nand $__timeFilter(v.time) \norder by time, sort_row_number",
            "refId": "A",
            "sql": {
              "columns": [
                {
                  "parameters": [],
                  "type": "function"
                }
              ],
              "groupBy": [
                {
                  "property": {
                    "type": "string"
                  },
                  "type": "groupBy"
                }
              ],
              "limit": 50
            }
          }
        ],
        "title": "$metrics at Row $row",
        "transformations": [
          {
            "id": "filterByValue",
            "options": {
              "filters": [
                {
                  "config": {
                    "id": "equal",
                    "options": {
                      "value": "$row"
                    }
                  },
                  "fieldName": "sort_row_number"
                }
              ],
              "match": "any",
              "type": "include"
            }
          },
          {
            "disabled": true,
            "id": "organize",
            "options": {
              "excludeByName": {
                "attempt_rate": false,
                "config_name": true,
                "events": true,
                "facility_id": true,
                "node": true,
                "purity": false,
                "recovery": false,
                "sort_bank": true,
                "sort_row_number": true,
                "srns": true,
                "stage": true,
                "test_name": true,
                "test_uuid": true
              },
              "includeByName": {},
              "indexByName": {},
              "renameByName": {
                "attempt_rate": "Attempt Rate",
                "purity": "Purity",
                "recovery": "Recovery"
              }
            }
          }
        ],
        "type": "volkovlabs-echarts-panel"
      },
      {
        "collapsed": false,
        "gridPos": {
          "h": 1,
          "w": 24,
          "x": 0,
          "y": 12
        },
        "id": 16,
        "panels": [],
        "title": "Data Controls",
        "type": "row"
      },
      {
        "datasource": {
          "type": "grafana-bigquery-datasource",
          "uid": "be165xjbz2juof"
        },
        "gridPos": {
          "h": 8,
          "w": 5,
          "x": 0,
          "y": 13
        },
        "id": 18,
        "options": {
          "buttonGroup": {
            "orientation": "left",
            "size": "md"
          },
          "confirmModal": {
            "body": "Please confirm to update changed values",
            "cancel": "Cancel",
            "columns": {
              "include": [
                "name",
                "oldValue",
                "newValue"
              ],
              "name": "Label",
              "newValue": "New Value",
              "oldValue": "Old Value"
            },
            "confirm": "Confirm",
            "elementDisplayMode": "modified",
            "title": "Confirm update request"
          },
          "elementValueChanged": "",
          "elements": [
            {
              "allowCustomValue": false,
              "getOptions": "const replaceVariables = context.grafana.replaceVariables;\n\n// Get metrics from the Grafana variable\nconst metricsString = replaceVariables('${metrics:json}');\nconst metrics = JSON.parse(metricsString);\n\n// Split the string into an array and create {label, value} objects\nreturn metrics.map(m => ({ label: m, value: m }));",
              "id": "names",
              "labelWidth": 10,
              "options": [],
              "optionsSource": "Code",
              "section": "",
              "title": "Metrics",
              "tooltip": "",
              "type": "multiselect",
              "uid": "c536bb65-30d1-48e9-b648-dd162f1ddb99",
              "unit": "",
              "value": ""
            },
            {
              "id": "time_start",
              "isUseLocalTime": false,
              "labelWidth": 10,
              "section": "",
              "title": "Start Time",
              "tooltip": "",
              "type": "datetime",
              "uid": "ef1e32c6-a9aa-4bf5-beb0-785320bb89d0",
              "unit": "",
              "value": ""
            },
            {
              "id": "time_end",
              "isUseLocalTime": false,
              "labelWidth": 10,
              "section": "",
              "title": "End Time",
              "tooltip": "",
              "type": "datetime",
              "uid": "8664685d-f216-4e54-babd-6f4d565b0124",
              "unit": "",
              "value": ""
            }
          ],
          "initial": {
            "code": "function truncateToMinute(dateTime) {\n  const date = new Date(dateTime);\n  date.setSeconds(0);\n  date.setMilliseconds(0);\n  return date.toISOString();\n}\n\nconsole.log(context)\n//const variables = context.grafana.templateService.getVariables();\nconst timeRange = context.grafana.templateService.timeRange;\nconst timeStart = truncateToMinute(timeRange.from);\nconst timeEnd = truncateToMinute(timeRange.to);\n\ncontext.panel.patchFormValue({\n  time_start: timeStart,\n  time_end: timeEnd\n});\n",
            "contentType": "application/json",
            "getPayload": "return {}",
            "highlight": false,
            "highlightColor": "red",
            "method": "-",
            "payload": {}
          },
          "layout": {
            "orientation": "horizontal",
            "padding": 10,
            "sectionVariant": "default",
            "variant": "single"
          },
          "reset": {
            "backgroundColor": "purple",
            "foregroundColor": "yellow",
            "icon": "process",
            "text": "Reset",
            "variant": "hidden"
          },
          "resetAction": {
            "code": "if (context.panel.response) {\n  context.grafana.notifySuccess(['Update', 'Values updated successfully.']);\n  context.grafana.locationService.reload();\n} else {\n  context.grafana.notifyError(['Update', 'An error occurred updating values.']);\n}",
            "confirm": false,
            "getPayload": "return {}",
            "mode": "initial",
            "payload": {}
          },
          "saveDefault": {
            "icon": "save",
            "text": "Save Default",
            "variant": "hidden"
          },
          "submit": {
            "backgroundColor": "purple",
            "foregroundColor": "yellow",
            "icon": "cloud-upload",
            "text": "Submit",
            "variant": "primary"
          },
          "sync": true,
          "update": {
            "code": "if (context.panel.response) {\n  context.grafana.notifySuccess(['Update', 'Values updated successfully.']);\n  context.grafana.locationService.reload();\n} else {\n  context.grafana.notifyError(['Update', 'An error occurred updating values.']);\n}",
            "confirm": false,
            "contentType": "application/json",
            "datasource": "googlecloudrunjson-datasource",
            "getPayload": "const payload = {};\n\ncontext.panel.elements.forEach((element) => {\n  if (!element.value) {\n    return;\n  }\n\n  payload[element.id] = element.value;\n})\n\nreturn payload;",
            "method": "datasource",
            "payload": {
              "0": "c",
              "1": "o",
              "2": "n",
              "3": "s",
              "4": "t",
              "5": " ",
              "6": "p",
              "7": "a",
              "8": "y",
              "9": "l",
              "10": "o",
              "11": "a",
              "12": "d",
              "13": " ",
              "14": "=",
              "15": " ",
              "16": "{",
              "17": "}",
              "18": ";",
              "19": "\n",
              "20": "\n",
              "21": "c",
              "22": "o",
              "23": "n",
              "24": "t",
              "25": "e",
              "26": "x",
              "27": "t",
              "28": ".",
              "29": "p",
              "30": "a",
              "31": "n",
              "32": "e",
              "33": "l",
              "34": ".",
              "35": "e",
              "36": "l",
              "37": "e",
              "38": "m",
              "39": "e",
              "40": "n",
              "41": "t",
              "42": "s",
              "43": ".",
              "44": "f",
              "45": "o",
              "46": "r",
              "47": "E",
              "48": "a",
              "49": "c",
              "50": "h",
              "51": "(",
              "52": "(",
              "53": "e",
              "54": "l",
              "55": "e",
              "56": "m",
              "57": "e",
              "58": "n",
              "59": "t",
              "60": ")",
              "61": " ",
              "62": "=",
              "63": ">",
              "64": " ",
              "65": "{",
              "66": "\n",
              "67": " ",
              "68": " ",
              "69": "i",
              "70": "f",
              "71": " ",
              "72": "(",
              "73": "!",
              "74": "e",
              "75": "l",
              "76": "e",
              "77": "m",
              "78": "e",
              "79": "n",
              "80": "t",
              "81": ".",
              "82": "v",
              "83": "a",
              "84": "l",
              "85": "u",
              "86": "e",
              "87": ")",
              "88": " ",
              "89": "{",
              "90": "\n",
              "91": " ",
              "92": " ",
              "93": " ",
              "94": " ",
              "95": "r",
              "96": "e",
              "97": "t",
              "98": "u",
              "99": "r",
              "100": "n",
              "101": ";",
              "102": "\n",
              "103": " ",
              "104": " ",
              "105": "}",
              "106": "\n",
              "107": "\n",
              "108": " ",
              "109": " ",
              "110": "p",
              "111": "a",
              "112": "y",
              "113": "l",
              "114": "o",
              "115": "a",
              "116": "d",
              "117": "[",
              "118": "e",
              "119": "l",
              "120": "e",
              "121": "m",
              "122": "e",
              "123": "n",
              "124": "t",
              "125": ".",
              "126": "i",
              "127": "d",
              "128": "]",
              "129": " ",
              "130": "=",
              "131": " ",
              "132": "e",
              "133": "l",
              "134": "e",
              "135": "m",
              "136": "e",
              "137": "n",
              "138": "t",
              "139": ".",
              "140": "v",
              "141": "a",
              "142": "l",
              "143": "u",
              "144": "e",
              "145": ";",
              "146": "\n",
              "147": "}",
              "148": ")",
              "149": "\n",
              "150": "\n",
              "151": "r",
              "152": "e",
              "153": "t",
              "154": "u",
              "155": "r",
              "156": "n",
              "157": " ",
              "158": "p",
              "159": "a",
              "160": "y",
              "161": "l",
              "162": "o",
              "163": "a",
              "164": "d",
              "165": ";",
              "Body": "{ \"params\": {\"filtersets\": [$filterset]},\n  \"filterset_spec\": {\n    \"names\": [${payload.names:singlequote}],\n    \"dimensions\": [\n      {\"name\": \"facility_id\", \"value\":\"${facility}\"},\n      {\"name\": \"test_uuid\", \"value\": \"${test_id}\"},\n      {\"name\": \"sort_row_number\", \"value\": \"${row}\"}\n    ],\n    \"filter_type\": \"OUTLIER_USER_DEFINED\",\n    \"time_start\": \"${payload.time_start}\",\n    \"time_end\": \"${payload.time_end}\"\n  }\n}",
              "Method": "POST",
              "Params": {},
              "Path": "/v1/$facility/$test_id/comparison/sort_row_number/filters"
            },
            "payloadMode": "all"
          },
          "updateEnabled": "auto"
        },
        "pluginVersion": "4.7.0",
        "title": "Exclude Data Points from Analysis",
        "type": "volkovlabs-form-panel"
      },
      {
        "datasource": {
          "type": "grafana-bigquery-datasource",
          "uid": "be165xjbz2juof"
        },
        "gridPos": {
          "h": 4,
          "w": 5,
          "x": 5,
          "y": 13
        },
        "id": 20,
        "options": {
          "buttonGroup": {
            "orientation": "left",
            "size": "md"
          },
          "confirmModal": {
            "body": "Please confirm to update changed values",
            "cancel": "Cancel",
            "columns": {
              "include": [
                "name",
                "oldValue",
                "newValue"
              ],
              "name": "Label",
              "newValue": "New Value",
              "oldValue": "Old Value"
            },
            "confirm": "Confirm",
            "elementDisplayMode": "modified",
            "title": "Confirm update request"
          },
          "elementValueChanged": "",
          "elements": [
            {
              "allowCustomValue": false,
              "getOptions": "const replaceVariables = context.grafana.replaceVariables;\n\n// Get metrics from the Grafana variable\nconst metricsString = replaceVariables('${metrics:json}');\nconst metrics = JSON.parse(metricsString);\n\n// Split the string into an array and create {label, value} objects\nreturn metrics.map(m => ({ label: m, value: m }));",
              "id": "names",
              "labelWidth": 20,
              "options": [],
              "optionsSource": "Code",
              "section": "",
              "title": "Filter Set",
              "tooltip": "",
              "type": "multiselect",
              "uid": "c536bb65-30d1-48e9-b648-dd162f1ddb99",
              "unit": "",
              "value": ""
            }
          ],
          "initial": {
            "code": "function truncateToMinute(dateTime) {\n  const date = new Date(dateTime);\n  date.setSeconds(0);\n  date.setMilliseconds(0);\n  return date.toISOString();\n}\n\nconsole.log(context)\n//const variables = context.grafana.templateService.getVariables();\nconst timeRange = context.grafana.templateService.timeRange;\nconst timeStart = truncateToMinute(timeRange.from);\nconst timeEnd = truncateToMinute(timeRange.to);\n\ncontext.panel.patchFormValue({\n  time_start: timeStart,\n  time_end: timeEnd\n});\n",
            "contentType": "application/json",
            "getPayload": "return {}",
            "highlight": false,
            "highlightColor": "red",
            "method": "-",
            "payload": {}
          },
          "layout": {
            "orientation": "horizontal",
            "padding": 10,
            "sectionVariant": "default",
            "variant": "single"
          },
          "reset": {
            "backgroundColor": "purple",
            "foregroundColor": "yellow",
            "icon": "process",
            "text": "Reset",
            "variant": "hidden"
          },
          "resetAction": {
            "code": "if (context.panel.response) {\n  context.grafana.notifySuccess(['Update', 'Values updated successfully.']);\n  context.grafana.locationService.reload();\n} else {\n  context.grafana.notifyError(['Update', 'An error occurred updating values.']);\n}",
            "confirm": false,
            "getPayload": "return {}",
            "mode": "initial",
            "payload": {}
          },
          "saveDefault": {
            "icon": "save",
            "text": "Save Default",
            "variant": "hidden"
          },
          "submit": {
            "backgroundColor": "purple",
            "foregroundColor": "yellow",
            "icon": "cloud-upload",
            "text": "Submit",
            "variant": "primary"
          },
          "sync": true,
          "update": {
            "code": "if (context.panel.response) {\n  context.grafana.notifySuccess(['Update', 'Values updated successfully.']);\n  context.grafana.locationService.reload();\n} else {\n  context.grafana.notifyError(['Update', 'An error occurred updating values.']);\n}",
            "confirm": false,
            "contentType": "application/json",
            "datasource": "googlecloudrunjson-datasource",
            "getPayload": "const payload = {};\n\ncontext.panel.elements.forEach((element) => {\n  if (!element.value) {\n    return;\n  }\n\n  payload[element.id] = element.value;\n})\n\nreturn payload;",
            "method": "datasource",
            "payload": {
              "0": "c",
              "1": "o",
              "2": "n",
              "3": "s",
              "4": "t",
              "5": " ",
              "6": "p",
              "7": "a",
              "8": "y",
              "9": "l",
              "10": "o",
              "11": "a",
              "12": "d",
              "13": " ",
              "14": "=",
              "15": " ",
              "16": "{",
              "17": "}",
              "18": ";",
              "19": "\n",
              "20": "\n",
              "21": "c",
              "22": "o",
              "23": "n",
              "24": "t",
              "25": "e",
              "26": "x",
              "27": "t",
              "28": ".",
              "29": "p",
              "30": "a",
              "31": "n",
              "32": "e",
              "33": "l",
              "34": ".",
              "35": "e",
              "36": "l",
              "37": "e",
              "38": "m",
              "39": "e",
              "40": "n",
              "41": "t",
              "42": "s",
              "43": ".",
              "44": "f",
              "45": "o",
              "46": "r",
              "47": "E",
              "48": "a",
              "49": "c",
              "50": "h",
              "51": "(",
              "52": "(",
              "53": "e",
              "54": "l",
              "55": "e",
              "56": "m",
              "57": "e",
              "58": "n",
              "59": "t",
              "60": ")",
              "61": " ",
              "62": "=",
              "63": ">",
              "64": " ",
              "65": "{",
              "66": "\n",
              "67": " ",
              "68": " ",
              "69": "i",
              "70": "f",
              "71": " ",
              "72": "(",
              "73": "!",
              "74": "e",
              "75": "l",
              "76": "e",
              "77": "m",
              "78": "e",
              "79": "n",
              "80": "t",
              "81": ".",
              "82": "v",
              "83": "a",
              "84": "l",
              "85": "u",
              "86": "e",
              "87": ")",
              "88": " ",
              "89": "{",
              "90": "\n",
              "91": " ",
              "92": " ",
              "93": " ",
              "94": " ",
              "95": "r",
              "96": "e",
              "97": "t",
              "98": "u",
              "99": "r",
              "100": "n",
              "101": ";",
              "102": "\n",
              "103": " ",
              "104": " ",
              "105": "}",
              "106": "\n",
              "107": "\n",
              "108": " ",
              "109": " ",
              "110": "p",
              "111": "a",
              "112": "y",
              "113": "l",
              "114": "o",
              "115": "a",
              "116": "d",
              "117": "[",
              "118": "e",
              "119": "l",
              "120": "e",
              "121": "m",
              "122": "e",
              "123": "n",
              "124": "t",
              "125": ".",
              "126": "i",
              "127": "d",
              "128": "]",
              "129": " ",
              "130": "=",
              "131": " ",
              "132": "e",
              "133": "l",
              "134": "e",
              "135": "m",
              "136": "e",
              "137": "n",
              "138": "t",
              "139": ".",
              "140": "v",
              "141": "a",
              "142": "l",
              "143": "u",
              "144": "e",
              "145": ";",
              "146": "\n",
              "147": "}",
              "148": ")",
              "149": "\n",
              "150": "\n",
              "151": "r",
              "152": "e",
              "153": "t",
              "154": "u",
              "155": "r",
              "156": "n",
              "157": " ",
              "158": "p",
              "159": "a",
              "160": "y",
              "161": "l",
              "162": "o",
              "163": "a",
              "164": "d",
              "165": ";",
              "Body": "{ \"params\": {\"filtersets\": [$filterset]},\n  \"additional_filterset\": {\n    \"names\": [${payload.names:singlequote}],\n    \"dimensions\": [\n      {\"name\": \"facility_id\", \"value\":\"${facility}\"},\n      {\"name\": \"test_uuid\", \"value\": \"${test_id}\"},\n      {\"name\": \"sort_row_number\", \"value\": \"${row}\"}\n    ],\n    \"filter_type\": \"OUTLIER_USER_DEFINED\",\n    \"time_start\": \"${payload.time_start}\",\n    \"time_end\": \"${payload.time_end}\"\n  }\n}",
              "Method": "POST",
              "Params": {},
              "Path": "/v1/$facility/$test_id/comparison/sort_row_number/filters"
            },
            "payloadMode": "all"
          },
          "updateEnabled": "auto"
        },
        "pluginVersion": "4.7.0",
        "title": "Deactivate Filter Set",
        "type": "volkovlabs-form-panel"
      },
      {
        "datasource": {
          "default": false,
          "type": "grafana-bigquery-datasource",
          "uid": "be165xjbz2juof"
        },
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "thresholds"
            },
            "custom": {
              "align": "auto",
              "cellOptions": {
                "type": "auto"
              },
              "inspect": false
            },
            "mappings": [],
            "thresholds": {
              "mode": "absolute",
              "steps": [
                {
                  "color": "green",
                  "value": null
                },
                {
                  "color": "red",
                  "value": 80
                }
              ]
            }
          },
          "overrides": [
            {
              "matcher": {
                "id": "byName",
                "options": "filterset_id"
              },
              "properties": [
                {
                  "id": "custom.width",
                  "value": 236
                }
              ]
            }
          ]
        },
        "gridPos": {
          "h": 8,
          "w": 14,
          "x": 10,
          "y": 13
        },
        "id": 19,
        "options": {
          "cellHeight": "sm",
          "footer": {
            "countRows": false,
            "fields": "",
            "reducer": [
              "sum"
            ],
            "show": false
          },
          "showHeader": true,
          "sortBy": []
        },
        "pluginVersion": "11.2.2",
        "targets": [
          {
            "datasource": {
              "type": "grafana-bigquery-datasource",
              "uid": "be165xjbz2juof"
            },
            "editorMode": "code",
            "format": 1,
            "location": "",
            "project": "amp-data-analytics",
            "rawQuery": true,
            "rawSql": "WITH base as (\nSELECT\n    f.time,\n    d.name as col_name,\n    d.value as col_value,\n    f.filter_type,\n    f.value,\n    f.filterset\nFROM\n    `amp-data-analytics.analytics_services.data_filters_v2` as f, UNNEST(dimensions) as d\n)\nSELECT filterset as filterset_id, min(time) as time_start, max(time) as time_end, array_agg(distinct name) as metrics, count(*) as total_num_filtered_data_points FROM base PIVOT (any_value(col_value) FOR col_name IN ('facility_id', 'test_uuid', 'sort_row_number', 'name'))\nwhere\ntrue\n and facility_id = '$facility'  \n and sort_row_number = '$row' \n and name in ($metrics) \n and test_uuid = '$test_id'\nand filterset in (${filterset:value})\ngroup by 1",
            "refId": "A",
            "sql": {
              "columns": [
                {
                  "parameters": [],
                  "type": "function"
                }
              ],
              "groupBy": [
                {
                  "property": {
                    "type": "string"
                  },
                  "type": "groupBy"
                }
              ],
              "limit": 50
            }
          }
        ],
        "title": "Active Filters",
        "type": "table"
      },
      {
        "datasource": {
          "type": "grafana-bigquery-datasource",
          "uid": "be165xjbz2juof"
        },
        "gridPos": {
          "h": 4,
          "w": 5,
          "x": 5,
          "y": 17
        },
        "id": 21,
        "options": {
          "buttonGroup": {
            "orientation": "left",
            "size": "md"
          },
          "confirmModal": {
            "body": "Please confirm to update changed values",
            "cancel": "Cancel",
            "columns": {
              "include": [
                "name",
                "oldValue",
                "newValue"
              ],
              "name": "Label",
              "newValue": "New Value",
              "oldValue": "Old Value"
            },
            "confirm": "Confirm",
            "elementDisplayMode": "modified",
            "title": "Confirm update request"
          },
          "elementValueChanged": "",
          "elements": [
            {
              "allowCustomValue": false,
              "getOptions": "const replaceVariables = context.grafana.replaceVariables;\n\n// Get metrics from the Grafana variable\nconst metricsString = replaceVariables('${metrics:json}');\nconst metrics = JSON.parse(metricsString);\n\n// Split the string into an array and create {label, value} objects\nreturn metrics.map(m => ({ label: m, value: m }));",
              "id": "names",
              "labelWidth": 20,
              "options": [],
              "optionsSource": "Code",
              "section": "",
              "title": "Control Group",
              "tooltip": "",
              "type": "multiselect",
              "uid": "c536bb65-30d1-48e9-b648-dd162f1ddb99",
              "unit": "",
              "value": ""
            }
          ],
          "initial": {
            "code": "function truncateToMinute(dateTime) {\n  const date = new Date(dateTime);\n  date.setSeconds(0);\n  date.setMilliseconds(0);\n  return date.toISOString();\n}\n\nconsole.log(context)\n//const variables = context.grafana.templateService.getVariables();\nconst timeRange = context.grafana.templateService.timeRange;\nconst timeStart = truncateToMinute(timeRange.from);\nconst timeEnd = truncateToMinute(timeRange.to);\n\ncontext.panel.patchFormValue({\n  time_start: timeStart,\n  time_end: timeEnd\n});\n",
            "contentType": "application/json",
            "getPayload": "return {}",
            "highlight": false,
            "highlightColor": "red",
            "method": "-",
            "payload": {}
          },
          "layout": {
            "orientation": "horizontal",
            "padding": 10,
            "sectionVariant": "default",
            "variant": "single"
          },
          "reset": {
            "backgroundColor": "purple",
            "foregroundColor": "yellow",
            "icon": "process",
            "text": "Reset",
            "variant": "hidden"
          },
          "resetAction": {
            "code": "if (context.panel.response) {\n  context.grafana.notifySuccess(['Update', 'Values updated successfully.']);\n  context.grafana.locationService.reload();\n} else {\n  context.grafana.notifyError(['Update', 'An error occurred updating values.']);\n}",
            "confirm": false,
            "getPayload": "return {}",
            "mode": "initial",
            "payload": {}
          },
          "saveDefault": {
            "icon": "save",
            "text": "Save Default",
            "variant": "hidden"
          },
          "submit": {
            "backgroundColor": "purple",
            "foregroundColor": "yellow",
            "icon": "cloud-upload",
            "text": "Submit",
            "variant": "primary"
          },
          "sync": true,
          "update": {
            "code": "if (context.panel.response) {\n  context.grafana.notifySuccess(['Update', 'Values updated successfully.']);\n  context.grafana.locationService.reload();\n} else {\n  context.grafana.notifyError(['Update', 'An error occurred updating values.']);\n}",
            "confirm": false,
            "contentType": "application/json",
            "datasource": "googlecloudrunjson-datasource",
            "getPayload": "const payload = {};\n\ncontext.panel.elements.forEach((element) => {\n  if (!element.value) {\n    return;\n  }\n\n  payload[element.id] = element.value;\n})\n\nreturn payload;",
            "method": "datasource",
            "payload": {
              "0": "c",
              "1": "o",
              "2": "n",
              "3": "s",
              "4": "t",
              "5": " ",
              "6": "p",
              "7": "a",
              "8": "y",
              "9": "l",
              "10": "o",
              "11": "a",
              "12": "d",
              "13": " ",
              "14": "=",
              "15": " ",
              "16": "{",
              "17": "}",
              "18": ";",
              "19": "\n",
              "20": "\n",
              "21": "c",
              "22": "o",
              "23": "n",
              "24": "t",
              "25": "e",
              "26": "x",
              "27": "t",
              "28": ".",
              "29": "p",
              "30": "a",
              "31": "n",
              "32": "e",
              "33": "l",
              "34": ".",
              "35": "e",
              "36": "l",
              "37": "e",
              "38": "m",
              "39": "e",
              "40": "n",
              "41": "t",
              "42": "s",
              "43": ".",
              "44": "f",
              "45": "o",
              "46": "r",
              "47": "E",
              "48": "a",
              "49": "c",
              "50": "h",
              "51": "(",
              "52": "(",
              "53": "e",
              "54": "l",
              "55": "e",
              "56": "m",
              "57": "e",
              "58": "n",
              "59": "t",
              "60": ")",
              "61": " ",
              "62": "=",
              "63": ">",
              "64": " ",
              "65": "{",
              "66": "\n",
              "67": " ",
              "68": " ",
              "69": "i",
              "70": "f",
              "71": " ",
              "72": "(",
              "73": "!",
              "74": "e",
              "75": "l",
              "76": "e",
              "77": "m",
              "78": "e",
              "79": "n",
              "80": "t",
              "81": ".",
              "82": "v",
              "83": "a",
              "84": "l",
              "85": "u",
              "86": "e",
              "87": ")",
              "88": " ",
              "89": "{",
              "90": "\n",
              "91": " ",
              "92": " ",
              "93": " ",
              "94": " ",
              "95": "r",
              "96": "e",
              "97": "t",
              "98": "u",
              "99": "r",
              "100": "n",
              "101": ";",
              "102": "\n",
              "103": " ",
              "104": " ",
              "105": "}",
              "106": "\n",
              "107": "\n",
              "108": " ",
              "109": " ",
              "110": "p",
              "111": "a",
              "112": "y",
              "113": "l",
              "114": "o",
              "115": "a",
              "116": "d",
              "117": "[",
              "118": "e",
              "119": "l",
              "120": "e",
              "121": "m",
              "122": "e",
              "123": "n",
              "124": "t",
              "125": ".",
              "126": "i",
              "127": "d",
              "128": "]",
              "129": " ",
              "130": "=",
              "131": " ",
              "132": "e",
              "133": "l",
              "134": "e",
              "135": "m",
              "136": "e",
              "137": "n",
              "138": "t",
              "139": ".",
              "140": "v",
              "141": "a",
              "142": "l",
              "143": "u",
              "144": "e",
              "145": ";",
              "146": "\n",
              "147": "}",
              "148": ")",
              "149": "\n",
              "150": "\n",
              "151": "r",
              "152": "e",
              "153": "t",
              "154": "u",
              "155": "r",
              "156": "n",
              "157": " ",
              "158": "p",
              "159": "a",
              "160": "y",
              "161": "l",
              "162": "o",
              "163": "a",
              "164": "d",
              "165": ";",
              "Body": "{ \"params\": {\"filtersets\": [$filterset]},\n  \"additional_filterset\": {\n    \"names\": [${payload.names:singlequote}],\n    \"dimensions\": [\n      {\"name\": \"facility_id\", \"value\":\"${facility}\"},\n      {\"name\": \"test_uuid\", \"value\": \"${test_id}\"},\n      {\"name\": \"sort_row_number\", \"value\": \"${row}\"}\n    ],\n    \"filter_type\": \"OUTLIER_USER_DEFINED\",\n    \"time_start\": \"${payload.time_start}\",\n    \"time_end\": \"${payload.time_end}\"\n  }\n}",
              "Method": "POST",
              "Params": {},
              "Path": "/v1/$facility/$test_id/comparison/sort_row_number/filters"
            },
            "payloadMode": "all"
          },
          "updateEnabled": "auto"
        },
        "pluginVersion": "4.7.0",
        "title": "Change Control Group",
        "type": "volkovlabs-form-panel"
      },
      {
        "collapsed": true,
        "gridPos": {
          "h": 1,
          "w": 24,
          "x": 0,
          "y": 21
        },
        "id": 17,
        "panels": [
          {
            "datasource": {
              "default": true,
              "type": "grafana-bigquery-datasource",
              "uid": "be165xjbz2juof"
            },
            "fieldConfig": {
              "defaults": {
                "color": {
                  "mode": "continuous-BlPu"
                },
                "custom": {
                  "align": "left",
                  "cellOptions": {
                    "type": "gauge",
                    "valueDisplayMode": "text"
                  },
                  "inspect": false
                },
                "fieldMinMax": true,
                "mappings": [
                  {
                    "options": {
                      "pattern": ".*Control.*",
                      "result": {
                        "color": "#555555",
                        "index": 0
                      }
                    },
                    "type": "regex"
                  }
                ],
                "max": 1,
                "min": 0,
                "thresholds": {
                  "mode": "absolute",
                  "steps": [
                    {
                      "color": "green"
                    },
                    {
                      "color": "red",
                      "value": 80
                    }
                  ]
                },
                "unit": "percentunit"
              },
              "overrides": [
                {
                  "matcher": {
                    "id": "byName",
                    "options": "modified_config_name\\metric_name"
                  },
                  "properties": [
                    {
                      "id": "custom.cellOptions",
                      "value": {
                        "type": "color-background"
                      }
                    },
                    {
                      "id": "color",
                      "value": {
                        "fixedColor": "transparent",
                        "mode": "fixed"
                      }
                    },
                    {
                      "id": "custom.width",
                      "value": 311
                    }
                  ]
                }
              ]
            },
            "gridPos": {
              "h": 8,
              "w": 24,
              "x": 0,
              "y": 22
            },
            "id": 2,
            "options": {
              "cellHeight": "sm",
              "footer": {
                "countRows": false,
                "fields": "",
                "reducer": [
                  "sum"
                ],
                "show": false
              },
              "showHeader": true,
              "sortBy": []
            },
            "pluginVersion": "11.2.2",
            "targets": [
              {
                "datasource": {
                  "type": "grafana-bigquery-datasource",
                  "uid": "be165xjbz2juof"
                },
                "editorMode": "code",
                "format": 1,
                "location": "us-east1",
                "project": "amp-data-analytics",
                "rawQuery": true,
                "rawSql": "\nselect *,\nCONCAT(ROUND(-estimate, 2), ' [', round(-low, 2),', ', round(-high, 2), ']', IF(0 BETWEEN -high and -low, '', '*')) as formatted,\nIF(config_name = control_group_name, TRUE, FALSE) is_control_group, -estimate e_flip, CONCAT(config_name, IF(config_name = control_group_name, ' (Control)', '')) modified_config_name\n from `amp-data-analytics.analytics_services.comparison_analysis_results` results\nwhere (sort_bank is null and host is null) and test_uuid = '$test_id'\norder by config_name, metric_name",
                "refId": "A",
                "sql": {
                  "columns": [
                    {
                      "parameters": [],
                      "type": "function"
                    }
                  ],
                  "groupBy": [
                    {
                      "property": {
                        "type": "string"
                      },
                      "type": "groupBy"
                    }
                  ],
                  "limit": 50
                }
              }
            ],
            "title": "Summary by Config (QC/Audit)",
            "transformations": [
              {
                "id": "filterByValue",
                "options": {
                  "filters": [
                    {
                      "config": {
                        "id": "equal",
                        "options": {
                          "value": "$row"
                        }
                      },
                      "fieldName": "sort_row_number"
                    },
                    {
                      "config": {
                        "id": "regex",
                        "options": {
                          "value": "^(${metrics:pipe})$"
                        }
                      },
                      "fieldName": "metric_name"
                    }
                  ],
                  "match": "all",
                  "type": "include"
                }
              },
              {
                "id": "organize",
                "options": {
                  "excludeByName": {
                    "alternative": true,
                    "confidence_level": true,
                    "control_count": true,
                    "control_group_name": true,
                    "control_mean": true,
                    "control_std": true,
                    "count": true,
                    "df": true,
                    "estimate": true,
                    "facility_id": true,
                    "formatted": true,
                    "high": true,
                    "is_control_group": true,
                    "low": true,
                    "node": true,
                    "relative_estimate": true,
                    "relative_high": true,
                    "relative_low": true,
                    "sort_row_number": true,
                    "standard_error": true,
                    "std": true,
                    "test_name": true,
                    "test_uuid": true
                  },
                  "includeByName": {},
                  "indexByName": {},
                  "renameByName": {}
                }
              },
              {
                "id": "groupingToMatrix",
                "options": {
                  "columnField": "metric_name",
                  "rowField": "modified_config_name",
                  "valueField": "mean"
                }
              }
            ],
            "type": "table"
          },
          {
            "datasource": {
              "default": false,
              "type": "datasource",
              "uid": "-- Dashboard --"
            },
            "description": "",
            "fieldConfig": {
              "defaults": {
                "color": {
                  "fixedColor": "transparent",
                  "mode": "fixed"
                },
                "custom": {
                  "align": "auto",
                  "cellOptions": {
                    "type": "auto"
                  },
                  "inspect": false
                },
                "fieldMinMax": true,
                "mappings": [
                  {
                    "options": {
                      "pattern": ".*Control.*",
                      "result": {
                        "color": "#808080",
                        "index": 1
                      }
                    },
                    "type": "regex"
                  }
                ],
                "thresholds": {
                  "mode": "absolute",
                  "steps": [
                    {
                      "color": "green"
                    },
                    {
                      "color": "red",
                      "value": 80
                    }
                  ]
                },
                "unit": "percentunit"
              },
              "overrides": [
                {
                  "matcher": {
                    "id": "byName",
                    "options": "metric_name"
                  },
                  "properties": [
                    {
                      "id": "custom.width",
                      "value": 239
                    }
                  ]
                },
                {
                  "matcher": {
                    "id": "byName",
                    "options": "Estimated Difference "
                  },
                  "properties": [
                    {
                      "id": "custom.width",
                      "value": 161
                    }
                  ]
                },
                {
                  "matcher": {
                    "id": "byName",
                    "options": "modified_config_name\\metric_name"
                  },
                  "properties": [
                    {
                      "id": "custom.width",
                      "value": 309
                    },
                    {
                      "id": "custom.cellOptions",
                      "value": {
                        "applyToRow": true,
                        "type": "color-background"
                      }
                    }
                  ]
                },
                {
                  "matcher": {
                    "id": "byName",
                    "options": "area_purity"
                  },
                  "properties": [
                    {
                      "id": "custom.width"
                    }
                  ]
                }
              ]
            },
            "gridPos": {
              "h": 9,
              "w": 24,
              "x": 0,
              "y": 30
            },
            "id": 1,
            "options": {
              "cellHeight": "sm",
              "footer": {
                "countRows": false,
                "fields": "",
                "reducer": [
                  "sum"
                ],
                "show": false
              },
              "showHeader": true,
              "sortBy": []
            },
            "pluginVersion": "11.2.2",
            "targets": [
              {
                "datasource": {
                  "type": "datasource",
                  "uid": "-- Dashboard --"
                },
                "panelId": 2,
                "refId": "A"
              }
            ],
            "title": "Results vs. Control for $metrics",
            "transformations": [
              {
                "id": "filterByValue",
                "options": {
                  "filters": [
                    {
                      "config": {
                        "id": "regex",
                        "options": {
                          "value": "^(${metrics:pipe})$"
                        }
                      },
                      "fieldName": "metric_name"
                    }
                  ],
                  "match": "all",
                  "type": "include"
                }
              },
              {
                "id": "groupingToMatrix",
                "options": {
                  "columnField": "metric_name",
                  "rowField": "modified_config_name",
                  "valueField": "formatted"
                }
              },
              {
                "disabled": true,
                "id": "organize",
                "options": {
                  "excludeByName": {
                    "alternative": true,
                    "control_count": true,
                    "control_group_name": true,
                    "control_mean": true,
                    "control_std": true,
                    "count": true,
                    "df": true,
                    "estimate": true,
                    "facility_id": true,
                    "high": true,
                    "is_control_group": true,
                    "low": true,
                    "mean": true,
                    "metric_name": true,
                    "modified_config_name": true,
                    "node": true,
                    "relative_estimate": false,
                    "relative_low": false,
                    "sort_bank": true,
                    "sort_row_number": true,
                    "standard_error": true,
                    "std": true,
                    "test_name": true,
                    "test_uuid": true
                  },
                  "includeByName": {},
                  "indexByName": {
                    "alternative": 26,
                    "confidence_level": 24,
                    "config_name": 6,
                    "control_count": 20,
                    "control_group_name": 25,
                    "control_mean": 18,
                    "control_std": 19,
                    "count": 17,
                    "df": 10,
                    "e_flip": 7,
                    "estimate": 12,
                    "facility_id": 0,
                    "formatted": 8,
                    "high": 14,
                    "is_control_group": 27,
                    "low": 13,
                    "mean": 15,
                    "metric_name": 9,
                    "modified_config_name": 28,
                    "node": 3,
                    "relative_estimate": 21,
                    "relative_high": 23,
                    "relative_low": 22,
                    "sort_bank": 2,
                    "sort_row_number": 1,
                    "standard_error": 11,
                    "std": 16,
                    "test_name": 4,
                    "test_uuid": 5
                  },
                  "renameByName": {
                    "e_flip": "Estimated Difference ",
                    "formatted": "Confidence Interval",
                    "metric_name": ""
                  }
                }
              },
              {
                "disabled": true,
                "id": "sortBy",
                "options": {
                  "fields": {},
                  "sort": [
                    {
                      "field": "config_name\\metric_name"
                    }
                  ]
                }
              }
            ],
            "type": "table"
          }
        ],
        "title": "Row title",
        "type": "row"
      }
    ],
    "schemaVersion": 39,
    "tags": [],
    "templating": {
      "list": [
        {
          "current": {
            "selected": false,
            "text": "proto3",
            "value": "proto3"
          },
          "datasource": {
            "type": "grafana-bigquery-datasource",
            "uid": "be165xjbz2juof"
          },
          "definition": "",
          "hide": 0,
          "includeAll": false,
          "label": "Facility",
          "multi": false,
          "name": "facility",
          "options": [],
          "query": {
            "editorMode": "code",
            "format": 1,
            "location": "us-east1",
            "project": "amp-data-analytics",
            "rawQuery": true,
            "rawSql": "SELECT DISTINCT dims.value from `amp-data-analytics.analytics_services.comparison_analysis_results`, UNNEST(dimensions) as dims where dims.name = 'facility_id'",
            "refId": "tempvar",
            "sql": {
              "columns": [
                {
                  "parameters": [],
                  "type": "function"
                }
              ],
              "groupBy": [
                {
                  "property": {
                    "type": "string"
                  },
                  "type": "groupBy"
                }
              ],
              "limit": 50
            }
          },
          "refresh": 1,
          "regex": "",
          "skipUrlSync": false,
          "sort": 0,
          "type": "query"
        },
        {
          "current": {
            "selected": false,
            "text": "Tuning_JT-81_bank_0-1727960899997",
            "value": "Tuning_JT-81_bank_0-1727960899997"
          },
          "datasource": {
            "type": "grafana-bigquery-datasource",
            "uid": "be165xjbz2juof"
          },
          "definition": "",
          "hide": 0,
          "includeAll": false,
          "label": "Test ID",
          "multi": false,
          "name": "test_id",
          "options": [],
          "query": {
            "editorMode": "code",
            "format": 1,
            "location": "us-east1",
            "project": "amp-data-analytics",
            "rawQuery": true,
            "rawSql": "select\n  distinct test_uuid\nfrom\n  `amp-data-analytics.glia.tests_run`\nWHERE\n  TestStart >= TIMESTAMP_MILLIS ($__from) AND \n  TestStart <= TIMESTAMP_MILLIS ($__to) AND \n  facility_id = '$facility'",
            "refId": "tempvar",
            "sql": {
              "columns": [
                {
                  "parameters": [],
                  "type": "function"
                }
              ],
              "groupBy": [
                {
                  "property": {
                    "type": "string"
                  },
                  "type": "groupBy"
                }
              ],
              "limit": 50
            }
          },
          "refresh": 1,
          "regex": "",
          "skipUrlSync": false,
          "sort": 0,
          "type": "query"
        },
        {
          "current": {
            "selected": false,
            "text": "5",
            "value": "5"
          },
          "datasource": {
            "type": "grafana-bigquery-datasource",
            "uid": "be165xjbz2juof"
          },
          "definition": "",
          "hide": 0,
          "includeAll": false,
          "label": "Row",
          "multi": false,
          "name": "row",
          "options": [],
          "query": {
            "editorMode": "code",
            "format": 1,
            "location": "us-east1",
            "project": "amp-data-analytics",
            "rawQuery": true,
            "rawSql": "SELECT DISTINCT cast(sort_row_number as string) from `amp-data-analytics.analytics_services.comparison_analysis_results` where facility_id = '$facility' ",
            "refId": "tempvar",
            "sql": {
              "columns": [
                {
                  "parameters": [],
                  "type": "function"
                }
              ],
              "groupBy": [
                {
                  "property": {
                    "type": "string"
                  },
                  "type": "groupBy"
                }
              ],
              "limit": 50
            }
          },
          "refresh": 1,
          "regex": "",
          "skipUrlSync": false,
          "sort": 0,
          "type": "query"
        },
        {
          "current": {
            "selected": true,
            "text": [
              "area_purity",
              "area_recovery"
            ],
            "value": [
              "area_purity",
              "area_recovery"
            ]
          },
          "datasource": {
            "type": "grafana-bigquery-datasource",
            "uid": "be165xjbz2juof"
          },
          "definition": "",
          "hide": 0,
          "includeAll": false,
          "label": "Metrics",
          "multi": true,
          "name": "metrics",
          "options": [],
          "query": {
            "editorMode": "code",
            "format": 1,
            "location": "us-east1",
            "project": "amp-data-analytics",
            "rawQuery": true,
            "rawSql": "SELECT DISTINCT metric_name from `amp-data-analytics.analytics_services.comparison_analysis_results` where facility_id = '$facility' and test_uuid = '$test_id' ",
            "refId": "tempvar",
            "sql": {
              "columns": [
                {
                  "parameters": [],
                  "type": "function"
                }
              ],
              "groupBy": [
                {
                  "property": {
                    "type": "string"
                  },
                  "type": "groupBy"
                }
              ],
              "limit": 50
            }
          },
          "refresh": 1,
          "regex": "",
          "skipUrlSync": false,
          "sort": 0,
          "type": "query"
        },
        {
          "current": {
            "selected": false,
            "text": "v3 (2024-10-18 22:30:00+00)",
            "value": "'FbBp1d7kWu7nz0RS','o7wXAZD_JZ6qUsm6'"
          },
          "datasource": {
            "type": "grafana-bigquery-datasource",
            "uid": "be165xjbz2juof"
          },
          "definition": "",
          "hide": 0,
          "includeAll": false,
          "label": "Version",
          "multi": false,
          "name": "filterset",
          "options": [],
          "query": {
            "editorMode": "code",
            "format": 1,
            "location": "",
            "project": "amp-data-analytics",
            "rawQuery": true,
            "rawSql": "SELECT\nCONCAT(\"v\", RANK() OVER (ORDER BY bq_insert_time),\" (\", TIMESTAMP_TRUNC(bq_insert_time, MINUTE), \")\",\"|\", fs) version\nFROM (\nSELECT\n  bq_insert_time,\n  MAX((\n    SELECT\n      STRING_AGG(CONCAT(\"'\", x, \"'\"))\n    FROM\n      UNNEST(filtersets) AS x)) fs\nFROM\n  `amp-data-analytics.analytics_services.comparison_analysis_results`\nWHERE\n  '$test_id' IN UNNEST(ARRAY(\n    SELECT\n      x.value\n    FROM\n      UNNEST(dimensions) AS x ))\n  AND 'sort_row_number' in unnest(tags)\nGROUP BY\n  1\n)\n\n;",
            "refId": "tempvar",
            "sql": {
              "columns": [
                {
                  "parameters": [],
                  "type": "function"
                }
              ],
              "groupBy": [
                {
                  "property": {
                    "type": "string"
                  },
                  "type": "groupBy"
                }
              ],
              "limit": 50
            }
          },
          "refresh": 1,
          "regex": "/^(?<text>[^|]+)\\|(?<value>.*)$/",
          "skipUrlSync": false,
          "sort": 2,
          "type": "query"
        }
      ]
    },
    "time": {
      "from": "2024-10-03T13:07:26.875Z",
      "to": "2024-10-03T14:30:03.865Z"
    },
    "timepicker": {},
    "timezone": "utc",
    "title": "Config Comparison [Dev]",
    "uid": "ddzofque0ui9sf",
    "version": 28,
    "weekStart": ""
  }