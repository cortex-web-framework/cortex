import { Config } from 'cortex';

interface AppConfig {
  port: number;
  externalLinks: {
    github: string;
    twitter: string;
    linkedin: string;
  };
  // Add other configuration properties as needed
}

const config = Config.getInstance();

export default config;