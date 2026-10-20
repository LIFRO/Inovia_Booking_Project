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
    co2: number | null;
    updatedAt: string | null;
};

type MeasurementPoint = { t: string; v: number };

type LatestMeasurementResponse = {
    point: MeasurementPoint | null;
};

type HistoryResponse = {
    points?: MeasurementPoint[];
};

type HistoryRange = '24h' | '7d' | '30d';
type HistoryMetric = 'both' | 'temperature' | 'co2';
type Metric = Exclude<HistoryMetric, 'both'>;

const tenantSlug = import.meta.env.VITE_IOT_TENANT_SLUG || 'innovia';
const historyRanges: { value: HistoryRange; label: string; milliseconds: number }[] = [
    { value: '24h', label: 'Last 24 hours', milliseconds: 24 * 60 * 60 * 1000 },
    { value: '7d', label: 'Last 7 days', milliseconds: 7 * 24 * 60 * 60 * 1000 },
    { value: '30d', label: 'Last 30 days', milliseconds: 30 * 24 * 60 * 60 * 1000 },
];

function formatUpdatedAt(value: string | null) {
    if (!value) return 'No reading received yet';
    return `Updated ${new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}`;
}

function averageByWindow(points: MeasurementPoint[], hours: number): MeasurementPoint[] {
    const windowMs = hours * 60 * 60 * 1000;
    const buckets = new Map<number, number[]>();

    for (const point of points) {
        const bucketStart = Math.floor(new Date(point.t).getTime() / windowMs) * windowMs;
        const values = buckets.get(bucketStart) ?? [];
        values.push(point.v);
        buckets.set(bucketStart, values);
    }

    return [...buckets.entries()]
        .sort(([first], [second]) => first - second)
        .map(([bucketStart, values]) => ({
            t: new Date(bucketStart + windowMs / 2).toISOString(),
            v: values.reduce((sum, value) => sum + value, 0) / values.length,
        }));
}

function chartPath(points: MeasurementPoint[]) {
    if (points.length === 0) return '';
    const values = points.map(point => point.v);
    const min = Math.min(...values);
    const span = Math.max(...values) - min || 1;
    return points.map((point, index) => {
        const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
        const y = 38 - ((point.v - min) / span) * 34;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
}

export default function TemperaturePage() {
    const [devices, setDevices] = useState<TemperatureDevice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'live' | 'offline'>('connecting');
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [historyDevice, setHistoryDevice] = useState<TemperatureDevice | null>(null);
    const [historyRange, setHistoryRange] = useState<HistoryRange>('24h');
    const [historyMetric, setHistoryMetric] = useState<HistoryMetric>('both');
    const [historyData, setHistoryData] = useState<Record<Metric, MeasurementPoint[]>>({ temperature: [], co2: [] });
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);

    const loadDevices = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const tenantResponse = await fetch(`/registry/api/tenants/by-slug/${encodeURIComponent(tenantSlug)}`);
            if (!tenantResponse.ok) throw new Error(`Could not find the ${tenantSlug} IoT tenant.`);
            const tenant: { id: string } = await tenantResponse.json();
            setTenantId(tenant.id);

            const devicesResponse = await fetch(`/registry/api/tenants/${tenant.id}/devices`);
            if (!devicesResponse.ok) throw new Error('Could not load devices from the device registry.');
            const registryDevices: Device[] = await devicesResponse.json();

            const deviceMeasurements = await Promise.all(registryDevices.map(async device => {
                try {
                    const [temperatureResponse, co2Response] = await Promise.all([
                        fetch(`/portal-api/portal/${tenant.id}/devices/${device.id}/latest?type=temperature`),
                        fetch(`/portal-api/portal/${tenant.id}/devices/${device.id}/latest?type=co2`),
                    ]);
                    const temperature = temperatureResponse.ok ? await temperatureResponse.json() as LatestMeasurementResponse : { point: null };
                    const co2 = co2Response.ok ? await co2Response.json() as LatestMeasurementResponse : { point: null };
                    const timestamps = [temperature.point?.t, co2.point?.t].filter((time): time is string => Boolean(time));
                    return { ...device, temperature: temperature.point?.v ?? null, co2: co2.point?.v ?? null, updatedAt: timestamps.sort().at(-1) ?? null };
                } catch {
                    return { ...device, temperature: null, co2: null, updatedAt: null };
                }
            }));

            setDevices(deviceMeasurements);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Could not load temperature data.');
            setDevices([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void loadDevices(); }, [loadDevices]);

    useEffect(() => {
        if (!historyDevice || !tenantId) return;

        const selectedRange = historyRanges.find(range => range.value === historyRange)!;
        const aggregationHours = historyRange === '30d' ? 1 : 0.25;
        const from = new Date(Date.now() - selectedRange.milliseconds).toISOString();
        const to = new Date().toISOString();
        let active = true;

        void (async () => {
            setHistoryLoading(true);
            setHistoryError(null);
            try {
                const loadSeries = async (type: Metric) => {
                    const response = await fetch(`/portal-api/portal/${tenantId}/devices/${historyDevice.id}/series?type=${type}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
                    if (!response.ok) throw new Error('Could not load this device history.');
                    const data: HistoryResponse = await response.json();
                    const sortedPoints = [...(data.points ?? [])].sort((a, b) => new Date(a.t).getTime() - new Date(b.t).getTime());
                    return averageByWindow(sortedPoints, aggregationHours);
                };
                const [temperature, co2] = await Promise.all([loadSeries('temperature'), loadSeries('co2')]);
                if (active) setHistoryData({ temperature, co2 });
            } catch (cause) {
                if (active) {
                    setHistoryData({ temperature: [], co2: [] });
                    setHistoryError(cause instanceof Error ? cause.message : 'Could not load this device history.');
                }
            } finally {
                if (active) setHistoryLoading(false);
            }
        })();

        return () => { active = false; };
    }, [historyDevice, historyRange, tenantId]);

    useEffect(() => {
        const connection = new HubConnectionBuilder()
            .withUrl('/telemetry/hub/telemetry')
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Warning)
            .build();

        connection.on('measurementReceived', (measurement: { deviceId?: string; type?: string; value?: number; time?: string }) => {
            const type = measurement.type?.toLowerCase();
            if ((type !== 'temperature' && type !== 'co2') || !measurement.deviceId || typeof measurement.value !== 'number') return;
            setDevices(current => current.map(device => device.id.toLowerCase() === measurement.deviceId!.toLowerCase()
                ? { ...device, [type]: measurement.value!, updatedAt: measurement.time ?? new Date().toISOString() }
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
                    <h1>Current device readings</h1>
                    <p>Live temperature and CO₂ readings from registered Innovia devices.</p>
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
                        <div className="co2Reading"><span>CO₂</span><strong>{device.co2 === null ? '—' : Math.round(device.co2)} <small>ppm</small></strong></div>
                        <p className="temperatureUpdated">{formatUpdatedAt(device.updatedAt)}</p>
                        <button className="historyButton" type="button" onClick={() => setHistoryDevice(device)}>View history</button>
                    </article>)}
                </section>
                {devices.length === 0 && <div className="temperatureNotice">No devices are registered for this tenant.</div>}
            </>}

            {historyDevice && <section className="temperatureHistory" aria-labelledby="temperature-history-title">
                <header className="historyHeader">
                    <div>
                        <p className="temperatureEyebrow">DEVICE HISTORY</p>
                        <h2 id="temperature-history-title">{historyDevice.serial || historyDevice.model}</h2>
                    </div>
                    <button className="historyCloseButton" type="button" onClick={() => setHistoryDevice(null)}>Close</button>
                </header>
                <div className="historyFilters" aria-label="History period">
                    {historyRanges.map(range => <button key={range.value} type="button" className={historyRange === range.value ? 'selected' : ''} onClick={() => setHistoryRange(range.value)}>{range.label}</button>)}
                </div>
                <div className="historyFilters" aria-label="History metric">
                    {(['both', 'temperature', 'co2'] as HistoryMetric[]).map(metric => <button key={metric} type="button" className={historyMetric === metric ? 'selected' : ''} onClick={() => setHistoryMetric(metric)}>{metric === 'co2' ? 'CO₂' : metric}</button>)}
                </div>
                <p className="historyAggregation">Showing {historyRange === '30d' ? 'hourly' : '15-minute'} averages.</p>
                {historyLoading && <p className="temperatureNotice">Loading history…</p>}
                {historyError && <p className="temperatureNotice error" role="alert">{historyError}</p>}
                {!historyLoading && !historyError && historyData.temperature.length === 0 && historyData.co2.length === 0 && <p className="temperatureNotice">No readings were recorded for this period.</p>}
                {!historyLoading && !historyError && <div className="historyCharts">
                    {(['temperature', 'co2'] as Metric[]).filter(metric => historyMetric === 'both' || historyMetric === metric).map(metric => {
                        const points = historyData[metric];
                        const label = metric === 'co2' ? 'CO₂' : 'Temperature';
                        const unit = metric === 'co2' ? 'ppm' : '°C';
                        const latest = points.at(-1);
                        return <article className={`historyChart ${metric}`} key={metric}>
                            <div className="historyChartHeading"><span>{label}</span><strong>{latest ? `${metric === 'co2' ? Math.round(latest.v) : latest.v.toFixed(1)} ${unit}` : 'No data'}</strong></div>
                            {points.length > 0 ? <svg viewBox="0 0 100 42" preserveAspectRatio="none" role="img" aria-label={`${label} trend`}><path className="chartBaseline" d="M 0 38 H 100"/><path className="chartLine" d={chartPath(points)}/></svg> : <p className="chartEmpty">No {label.toLowerCase()} readings in this period.</p>}
                            {latest && <p>{new Date(latest.t).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>}
                        </article>;
                    })}
                </div>}
            </section>}
        </main>
    );
}
