import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { useCallback, useEffect, useMemo, useState } from 'react';
import './CSS/TemperaturePage.css';

type Device = {
    id: string;
    model: string;
    serial: string;
    status: string;
};

type TemperatureDevice = Device & {
    temperature: number | null;
    updatedAt: string | null;
};

type LatestMeasurementResponse = {
    point: { t: string; v: number } | null;
};

const tenantSlug = import.meta.env.VITE_IOT_TENANT_SLUG || 'innovia';

function formatUpdatedAt(value: string | null) {
    if (!value) return 'No reading received yet';
    return `Updated ${new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}`;
}

export default function TemperaturePage() {
    const [devices, setDevices] = useState<TemperatureDevice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'live' | 'offline'>('connecting');

    const loadDevices = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const tenantResponse = await fetch(`/registry/api/tenants/by-slug/${encodeURIComponent(tenantSlug)}`);
            if (!tenantResponse.ok) throw new Error(`Could not find the ${tenantSlug} IoT tenant.`);
            const tenant: { id: string } = await tenantResponse.json();

            const devicesResponse = await fetch(`/registry/api/tenants/${tenant.id}/devices`);
            if (!devicesResponse.ok) throw new Error('Could not load devices from the device registry.');
            const registryDevices: Device[] = await devicesResponse.json();

            const deviceTemperatures = await Promise.all(registryDevices.map(async device => {
                try {
                    const response = await fetch(`/portal-api/portal/${tenant.id}/devices/${device.id}/latest?type=temperature`);
                    if (!response.ok) return { ...device, temperature: null, updatedAt: null };
                    const data: LatestMeasurementResponse = await response.json();
                    return { ...device, temperature: data.point?.v ?? null, updatedAt: data.point?.t ?? null };
                } catch {
                    return { ...device, temperature: null, updatedAt: null };
                }
            }));

            setDevices(deviceTemperatures);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Could not load temperature data.');
            setDevices([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void loadDevices(); }, [loadDevices]);

    useEffect(() => {
        const connection = new HubConnectionBuilder()
            .withUrl('/telemetry/hub/telemetry')
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Warning)
            .build();

        connection.on('measurementReceived', (measurement: { deviceId?: string; type?: string; value?: number; time?: string }) => {
            if (measurement.type?.toLowerCase() !== 'temperature' || !measurement.deviceId || typeof measurement.value !== 'number') return;
            setDevices(current => current.map(device => device.id.toLowerCase() === measurement.deviceId!.toLowerCase()
                ? { ...device, temperature: measurement.value!, updatedAt: measurement.time ?? new Date().toISOString() }
                : device));
        });
        connection.onreconnecting(() => setConnectionStatus('connecting'));
        connection.onreconnected(() => setConnectionStatus('live'));
        connection.onclose(() => setConnectionStatus('offline'));

        void (async () => {
            try {
                await connection.start();
                await connection.invoke('JoinTenant', tenantSlug);
                setConnectionStatus('live');
            } catch {
                setConnectionStatus('offline');
            }
        })();

        return () => {
            if (connection.state !== HubConnectionState.Disconnected) void connection.stop();
        };
    }, []);

    const reportingDevices = useMemo(() => devices.filter(device => device.temperature !== null).length, [devices]);

    return (
        <main className="temperaturePage">
            <header className="temperatureHeader">
                <div>
                    <p className="temperatureEyebrow">IOT DEVICE REGISTRY</p>
                    <h1>Current temperatures</h1>
                    <p>Live temperature readings from registered Innovia devices.</p>
                </div>
                <div className="temperatureActions">
                    <span className={`telemetryStatus ${connectionStatus}`}><i />{connectionStatus === 'live' ? 'Live updates' : connectionStatus === 'connecting' ? 'Connecting…' : 'Updates offline'}</span>
                    <button type="button" onClick={() => void loadDevices()} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button>
                </div>
            </header>

            {error && <div className="temperatureNotice error" role="alert">{error}</div>}
            {!error && loading && <div className="temperatureNotice">Loading devices from the registry…</div>}
            {!loading && !error && <>
                <div className="temperatureSummary">
                    <strong>{reportingDevices}</strong> of {devices.length} devices reporting a temperature
                </div>
                <section className="temperatureGrid" aria-label="Current device temperatures">
                    {devices.map(device => <article className="temperatureCard" key={device.id}>
                        <div className="temperatureCardTop">
                            <div><p>{device.serial || 'Unlabelled device'}</p><h2>{device.model || 'Sensor'}</h2></div>
                            <span className={`deviceStatus ${device.status?.toLowerCase() || 'unknown'}`}>{device.status || 'Unknown'}</span>
                        </div>
                        <div className="temperatureReading">
                            {device.temperature === null ? '—' : device.temperature.toFixed(1)}<small>°C</small>
                        </div>
                        <p className="temperatureUpdated">{formatUpdatedAt(device.updatedAt)}</p>
                    </article>)}
                </section>
                {devices.length === 0 && <div className="temperatureNotice">No devices are registered for this tenant.</div>}
            </>}
        </main>
    );
}
