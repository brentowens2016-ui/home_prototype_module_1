// TypeScript interface for dashboard contract (frontend)
export interface FeatureContract {
    name: string;
    tier: string;
    enabled: boolean;
    controls: Array<{ type: string; label: string; [key: string]: any }>;
}

export interface DashboardContract {
    user_tier: string;
    features: FeatureContract[];
}

// Example usage:
// const dashboard: DashboardContract = {
//   user_tier: "basic",
//   features: [{ name: "Home Map", tier: "basic", enabled: true, controls: [] }]
// };
