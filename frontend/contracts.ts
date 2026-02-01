export interface Control {
    type: string; // 'checkbox', 'slider', 'input', etc.
    label: string;
    value?: any;
    min?: number;
    max?: number;
}
export interface BluetoothDeviceMetadata {
    name: string;
    address: string;
    device_type: string;
    driver_installed: boolean;
    driver_version?: string;
    last_seen?: string;
}
// TypeScript interface for dashboard contract (frontend)
export interface FeatureContract {
    name: string;
    tier: string;
    enabled: boolean;
    controls: Control[];
    ai_roles?: string[]; // ["system_admin", "remote_agent", "user_admin"]
    bluetooth_devices?: BluetoothDeviceMetadata[];
}

export interface DashboardContract {
    user_tier: string;
    features: FeatureContract[];
    ai_role?: string; // "system_admin" | "remote_agent" | "user_admin"
}

// Example usage:
// const dashboard: DashboardContract = {
//   user_tier: "basic",
//   features: [{ name: "Home Map", tier: "basic", enabled: true, controls: [] }]
// };
