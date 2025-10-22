# CLI Extensibility Tutorial

This tutorial will guide you through creating your first CLI plugin using the Cortex CLI Extensibility System.

## Prerequisites

- Node.js 18+ installed
- Basic TypeScript knowledge
- Understanding of CLI concepts

## Tutorial Overview

We'll create a "weather" plugin that provides weather information and generates weather-related templates.

## Step 1: Project Setup

### 1.1 Create Plugin Directory

```bash
mkdir cortex-weather-plugin
cd cortex-weather-plugin
```

### 1.2 Initialize Package

```bash
npm init -y
```

### 1.3 Install Dependencies

```bash
npm install @cortex/cli
npm install -D typescript @types/node jest @types/jest
```

### 1.4 Create TypeScript Configuration

```json
// tsconfig.json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 1.5 Update Package.json

```json
{
  "name": "cortex-weather-plugin",
  "version": "1.0.0",
  "description": "Weather information plugin for Cortex CLI",
  "main": "dist/plugin.js",
  "types": "dist/plugin.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  },
  "cortex": {
    "plugin": true,
    "entry": "dist/plugin.js"
  }
}
```

## Step 2: Plugin Structure

Create the following directory structure:

```
src/
├── plugin.ts           # Main plugin file
├── commands/           # Command implementations
│   ├── weather.ts
│   └── forecast.ts
├── templates/          # Template definitions
│   ├── weather-widget.ts
│   └── weather-config.ts
└── hooks/             # Hook implementations
    ├── pre-weather.ts
    └── post-weather.ts
```

## Step 3: Implement Commands

### 3.1 Weather Command

```typescript
// src/commands/weather.ts
import type { CLICommand } from '@cortex/cli/extensibility';

export const weatherCommand: CLICommand = {
  name: 'weather',
  description: 'Get current weather information',
  options: [
    {
      name: 'city',
      alias: 'c',
      type: 'string',
      description: 'City name',
      required: true
    },
    {
      name: 'units',
      alias: 'u',
      type: 'string',
      description: 'Temperature units',
      choices: ['celsius', 'fahrenheit', 'kelvin'],
      default: 'celsius'
    },
    {
      name: 'format',
      alias: 'f',
      type: 'string',
      description: 'Output format',
      choices: ['json', 'table', 'simple'],
      default: 'table'
    }
  ],
  action: async (args: string[], options: Record<string, unknown>): Promise<void> => {
    const city = options['city'] as string;
    const units = options['units'] as string;
    const format = options['format'] as string;
    
    if (!city) {
      throw new Error('City is required');
    }
    
    console.log(`Getting weather for ${city}...`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const weather = {
      city,
      temperature: units === 'celsius' ? 22 : units === 'fahrenheit' ? 72 : 295,
      units,
      condition: 'Sunny',
      humidity: 65,
      windSpeed: 12
    };
    
    switch (format) {
      case 'json':
        console.log(JSON.stringify(weather, null, 2));
        break;
      case 'table':
        console.table(weather);
        break;
      case 'simple':
        console.log(`${city}: ${weather.temperature}°${units[0].toUpperCase()} - ${weather.condition}`);
        break;
    }
  }
};
```

### 3.2 Forecast Command

```typescript
// src/commands/forecast.ts
import type { CLICommand } from '@cortex/cli/extensibility';

export const forecastCommand: CLICommand = {
  name: 'forecast',
  description: 'Get weather forecast',
  options: [
    {
      name: 'city',
      alias: 'c',
      type: 'string',
      description: 'City name',
      required: true
    },
    {
      name: 'days',
      alias: 'd',
      type: 'number',
      description: 'Number of days',
      default: 5
    },
    {
      name: 'units',
      alias: 'u',
      type: 'string',
      description: 'Temperature units',
      choices: ['celsius', 'fahrenheit', 'kelvin'],
      default: 'celsius'
    }
  ],
  action: async (args: string[], options: Record<string, unknown>): Promise<void> => {
    const city = options['city'] as string;
    const days = options['days'] as number;
    const units = options['units'] as string;
    
    if (!city) {
      throw new Error('City is required');
    }
    
    console.log(`Getting ${days}-day forecast for ${city}...`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const forecast = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      temperature: {
        min: units === 'celsius' ? 15 + i : units === 'fahrenheit' ? 59 + i : 288 + i,
        max: units === 'celsius' ? 25 + i : units === 'fahrenheit' ? 77 + i : 298 + i
      },
      condition: ['Sunny', 'Cloudy', 'Rainy', 'Sunny', 'Cloudy'][i % 5],
      humidity: 60 + i * 2,
      windSpeed: 10 + i
    }));
    
    console.log(`\n${days}-Day Forecast for ${city}:`);
    console.log('='.repeat(50));
    
    forecast.forEach(day => {
      console.log(`${day.date}: ${day.temperature.min}°-${day.temperature.max}°${units[0].toUpperCase()} - ${day.condition}`);
    });
  }
};
```

## Step 4: Create Templates

### 4.1 Weather Widget Template

```typescript
// src/templates/weather-widget.ts
import type { Template } from '@cortex/cli/extensibility';

export const weatherWidgetTemplate: Template = {
  name: 'weather-widget',
  description: 'Generate a weather widget component',
  files: [
    {
      path: '{{outputPath}}/{{componentName}}.tsx',
      content: `import React, { useState, useEffect } from 'react';

interface {{componentName}}Props {
  city: string;
  units?: 'celsius' | 'fahrenheit' | 'kelvin';
  showForecast?: boolean;
  className?: string;
}

export const {{componentName}}: React.FC<{{componentName}}Props> = ({
  city,
  units = 'celsius',
  showForecast = false,
  className = ''
}) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const response = await fetch(\`/api/weather/\${city}?units=\${units}\`);
        const data = await response.json();
        setWeather(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city, units]);

  if (loading) return <div className={\`weather-widget \${className}\`}>Loading...</div>;
  if (error) return <div className={\`weather-widget \${className}\`}>Error: {error}</div>;
  if (!weather) return <div className={\`weather-widget \${className}\`}>No data</div>;

  return (
    <div className={\`weather-widget \${className}\`}>
      <h3>{city}</h3>
      <div className="current-weather">
        <span className="temperature">{weather.temperature}°{units[0].toUpperCase()}</span>
        <span className="condition">{weather.condition}</span>
      </div>
      <div className="details">
        <span>Humidity: {weather.humidity}%</span>
        <span>Wind: {weather.windSpeed} km/h</span>
      </div>
      {{#if showForecast}}
      <div className="forecast">
        <h4>Forecast</h4>
        {weather.forecast?.map((day, index) => (
          <div key={index} className="forecast-day">
            <span>{day.date}</span>
            <span>{day.temperature.min}°-{day.temperature.max}°{units[0].toUpperCase()}</span>
            <span>{day.condition}</span>
          </div>
        ))}
      </div>
      {{/if}}
    </div>
  );
};

export default {{componentName}};
`
    },
    {
      path: '{{outputPath}}/{{componentName}}.css',
      content: `.weather-widget {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: Arial, sans-serif;
  max-width: 300px;
}

.weather-widget h3 {
  margin: 0 0 10px 0;
  font-size: 1.5em;
}

.current-weather {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.temperature {
  font-size: 2em;
  font-weight: bold;
}

.condition {
  font-size: 1.1em;
}

.details {
  display: flex;
  gap: 15px;
  font-size: 0.9em;
  opacity: 0.8;
}

.forecast {
  margin-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  padding-top: 15px;
}

.forecast h4 {
  margin: 0 0 10px 0;
  font-size: 1.1em;
}

.forecast-day {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.forecast-day:last-child {
  border-bottom: none;
}
`
    }
  ],
  variables: [
    {
      name: 'componentName',
      type: 'string',
      required: true,
      description: 'Component name (e.g., WeatherWidget)'
    },
    {
      name: 'outputPath',
      type: 'string',
      required: false,
      default: 'src/components',
      description: 'Output directory path'
    }
  ]
};
```

### 4.2 Weather Config Template

```typescript
// src/templates/weather-config.ts
import type { Template } from '@cortex/cli/extensibility';

export const weatherConfigTemplate: Template = {
  name: 'weather-config',
  description: 'Generate weather configuration files',
  files: [
    {
      path: '{{outputPath}}/weather.config.{{extension}}',
      content: `{
  "api": {
    "baseUrl": "{{apiBaseUrl}}",
    "key": "{{apiKey}}",
    "timeout": {{timeout}}
  },
  "defaults": {
    "city": "{{defaultCity}}",
    "units": "{{defaultUnits}}",
    "language": "{{language}}"
  },
  "cache": {
    "enabled": {{cacheEnabled}},
    "ttl": {{cacheTtl}},
    "maxSize": {{cacheMaxSize}}
  },
  "ui": {
    "theme": "{{theme}}",
    "showForecast": {{showForecast}},
    "showDetails": {{showDetails}}
  }{{#if features}},
  "features": {
    {{#each features}}
    "{{@key}}": {{this}}{{#unless @last}},{{/unless}}
    {{/each}}
  }{{/if}}
}
`
    }
  ],
  variables: [
    {
      name: 'outputPath',
      type: 'string',
      required: false,
      default: '.',
      description: 'Output directory path'
    },
    {
      name: 'extension',
      type: 'string',
      required: false,
      default: 'json',
      description: 'Configuration file extension'
    },
    {
      name: 'apiBaseUrl',
      type: 'string',
      required: false,
      default: 'https://api.openweathermap.org/data/2.5',
      description: 'Weather API base URL'
    },
    {
      name: 'apiKey',
      type: 'string',
      required: true,
      description: 'Weather API key'
    },
    {
      name: 'timeout',
      type: 'number',
      required: false,
      default: 5000,
      description: 'API timeout in milliseconds'
    },
    {
      name: 'defaultCity',
      type: 'string',
      required: false,
      default: 'London',
      description: 'Default city'
    },
    {
      name: 'defaultUnits',
      type: 'string',
      required: false,
      default: 'celsius',
      description: 'Default temperature units'
    },
    {
      name: 'language',
      type: 'string',
      required: false,
      default: 'en',
      description: 'Language code'
    },
    {
      name: 'cacheEnabled',
      type: 'boolean',
      required: false,
      default: true,
      description: 'Enable caching'
    },
    {
      name: 'cacheTtl',
      type: 'number',
      required: false,
      default: 300,
      description: 'Cache TTL in seconds'
    },
    {
      name: 'cacheMaxSize',
      type: 'number',
      required: false,
      default: 100,
      description: 'Maximum cache size'
    },
    {
      name: 'theme',
      type: 'string',
      required: false,
      default: 'light',
      description: 'UI theme'
    },
    {
      name: 'showForecast',
      type: 'boolean',
      required: false,
      default: true,
      description: 'Show forecast by default'
    },
    {
      name: 'showDetails',
      type: 'boolean',
      required: false,
      default: true,
      description: 'Show detailed information'
    },
    {
      name: 'features',
      type: 'object',
      required: false,
      default: {},
      description: 'Additional features configuration'
    }
  ]
};
```

## Step 5: Implement Hooks

### 5.1 Pre-Weather Hook

```typescript
// src/hooks/pre-weather.ts
import type { Hook } from '@cortex/cli/extensibility';

export const preWeatherHook: Hook = {
  name: 'pre-weather',
  event: 'before:weather',
  handler: async (context) => {
    console.log(`[Hook] Preparing to get weather for: ${context.args?.[0] || 'unknown'}`);
    console.log(`[Hook] Options:`, context.options || {});
    
    // Add start time to context data
    context.data = context.data || {};
    context.data.startTime = Date.now();
  }
};
```

### 5.2 Post-Weather Hook

```typescript
// src/hooks/post-weather.ts
import type { Hook } from '@cortex/cli/extensibility';

export const postWeatherHook: Hook = {
  name: 'post-weather',
  event: 'after:weather',
  handler: async (context) => {
    const startTime = context.data?.startTime;
    if (startTime) {
      const duration = Date.now() - startTime;
      console.log(`[Hook] Weather command completed in ${duration}ms`);
    }
    
    console.log(`[Hook] Weather data retrieved successfully`);
  }
};
```

## Step 6: Main Plugin File

```typescript
// src/plugin.ts
import type { CortexPlugin } from '@cortex/cli/extensibility';
import { weatherCommand } from './commands/weather.js';
import { forecastCommand } from './commands/forecast.js';
import { weatherWidgetTemplate } from './templates/weather-widget.js';
import { weatherConfigTemplate } from './templates/weather-config.js';
import { preWeatherHook } from './hooks/pre-weather.js';
import { postWeatherHook } from './hooks/post-weather.js';

export const plugin: CortexPlugin = {
  name: 'weather-plugin',
  version: '1.0.0',
  description: 'Weather information plugin for Cortex CLI',
  commands: [weatherCommand, forecastCommand],
  templates: [weatherWidgetTemplate, weatherConfigTemplate],
  hooks: [preWeatherHook, postWeatherHook]
};

export default plugin;
```

## Step 7: Build and Test

### 7.1 Build the Plugin

```bash
npm run build
```

### 7.2 Test the Plugin

```bash
npm test
```

### 7.3 Load the Plugin

```bash
cortex plugin load ./dist/plugin.js
```

## Step 8: Usage Examples

### 8.1 Get Current Weather

```bash
cortex weather --city "London" --units celsius --format table
```

### 8.2 Get Forecast

```bash
cortex forecast --city "New York" --days 7 --units fahrenheit
```

### 8.3 Generate Weather Widget

```bash
cortex generate weather-widget --componentName "WeatherCard" --outputPath "src/components"
```

### 8.4 Generate Weather Config

```bash
cortex generate weather-config --apiKey "your-api-key" --defaultCity "Paris" --outputPath "config"
```

## Step 9: Advanced Features

### 9.1 Error Handling

```typescript
// Add error handling to commands
action: async (args: string[], options: Record<string, unknown>): Promise<void> => {
  try {
    const city = options['city'] as string;
    if (!city) {
      throw new Error('City is required');
    }
    
    // Weather logic here
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}
```

### 9.2 Input Validation

```typescript
// Add validation to templates
variables: [
  {
    name: 'apiKey',
    type: 'string',
    required: true,
    validation: {
      minLength: 10,
      pattern: /^[a-zA-Z0-9]+$/
    },
    description: 'Weather API key'
  }
]
```

### 9.3 Custom Hooks

```typescript
// Add custom hooks for specific events
export const weatherCacheHook: Hook = {
  name: 'weather-cache',
  event: 'after:weather',
  handler: async (context) => {
    // Cache weather data
    const cacheKey = `weather:${context.args?.[0]}`;
    // Store in cache
  }
};
```

## Step 10: Publishing

### 10.1 Prepare for Publishing

```bash
npm run build
npm test
npm run clean
```

### 10.2 Publish to NPM

```bash
npm publish
```

### 10.3 Install from NPM

```bash
npm install -g cortex-weather-plugin
cortex plugin load cortex-weather-plugin
```

## Conclusion

Congratulations! You've created a complete CLI plugin with:

- ✅ Commands for weather and forecast
- ✅ Templates for weather widget and config
- ✅ Hooks for pre/post processing
- ✅ TypeScript support
- ✅ Error handling
- ✅ Input validation
- ✅ Comprehensive documentation

## Next Steps

1. **Add Tests**: Write comprehensive tests for your plugin
2. **Add Documentation**: Create detailed documentation
3. **Add More Features**: Extend the plugin with additional functionality
4. **Publish**: Share your plugin with the community
5. **Contribute**: Contribute to the Cortex CLI project

## Resources

- [CLI Extensibility Guide](./CLI_EXTENSIBILITY_GUIDE.md)
- [API Reference](./API_REFERENCE.md)
- [Examples](../examples/cli-extensibility/)
- [GitHub Repository](https://github.com/cortex/cli)