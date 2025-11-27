export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  group?: string;
  metadata?: Record<string, any>;
}