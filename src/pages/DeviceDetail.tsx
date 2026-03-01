import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    summaryApi,
    logsApi,
    auditApi,
    alertsApi,
    createLogStream,
} from "../api";
import { useLang, useNotifications } from "../stores";
import { PageHeader } from "../components/layout";
import {
    Card,
    CardHeader,
    CardTitle,
    CardBody,
    Button,
    Input,
    Select,
    Toggle,
    SeverityBadge,
    StatusBadge,
    LevelTag,
    EmptyState,
    Spinner,
    Modal,
    Table,
    Thead,
    Th,
    Tbody,
    Tr,
    Td,
} from "../components/ui";
import type {
    DeviceSummary,
    LogEntry,
    AuditRun,
    Alert,
    RunAuditDto,
} from "../types";
import { format } from "date-fns";

type Tab = "summary" | "audit" | "logs" | "alerts";

function SummaryTab({ summary }: { summary: DeviceSummary }) {
    const { t } = useLang();
    const f = summary.lastAudit?.summary?.findings;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    {
                        label: t("totalAlerts"),
                        value: summary.alerts.total,
                        color: "text-orange-400",
                    },
                    {
                        label: t("unackedAlerts"),
                        value: summary.alerts.unacked,
                        color: "text-red-400",
                    },
                    {
                        label: "Critical",
                        value: f?.critical ?? "—",
                        color: "text-red-400",
                    },
                    {
                        label: "High",
                        value: f?.high ?? "—",
                        color: "text-orange-400",
                    },
                ].map((s) => (
                    <Card key={s.label}>
                        <CardBody className="text-center py-4">
                            <p
                                className={`text-3xl font-display font-bold ${s.color}`}
                            >
                                {s.value}
                            </p>
                            <p className="text-xs t-text-muted font-body mt-1">
                                {s.label}
                            </p>
                        </CardBody>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t("deviceDetails")}</CardTitle>
                </CardHeader>
                <CardBody>
                    <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                        {[
                            [t("name"), summary.device.name],
                            [t("ip"), summary.device.ip ?? "—"],
                            [t("hostname"), summary.device.hostname ?? "—"],
                            [t("deviceType"), t(summary.device.type as any)],
                            [
                                t("status"),
                                summary.device.isActive
                                    ? t("active")
                                    : t("inactive"),
                            ],
                            [
                                t("lastSeen"),
                                summary.lastSeen
                                    ? format(
                                          new Date(summary.lastSeen),
                                          "dd.MM.yyyy HH:mm",
                                      )
                                    : "—",
                            ],
                            [
                                t("lastLog"),
                                summary.lastLog
                                    ? `${summary.lastLog.level} @ ${format(new Date(summary.lastLog.ts), "HH:mm")}`
                                    : "—",
                            ],
                            [
                                t("lastAudit"),
                                summary.lastAudit
                                    ? t(summary.lastAudit.status)
                                    : "—",
                            ],
                        ].map(([k, v]) => (
                            <div key={k}>
                                <dt className="t-text-muted text-xs font-body uppercase tracking-wider">
                                    {k}
                                </dt>
                                <dd className="t-text-primary font-mono text-sm mt-0.5">
                                    {v}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </CardBody>
            </Card>
        </div>
    );
}

// Замени функцию AuditTab в src/pages/DeviceDetail.tsx

function AuditTab({ deviceId }: { deviceId: string }) {
    const { t } = useLang();
    const { push } = useNotifications();
    const [audits, setAudits] = useState<AuditRun[]>([]);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);
    const [showRun, setShowRun] = useState(false);
    const [selected, setSelected] = useState<AuditRun | null>(null);
    const [dto, setDto] = useState<RunAuditDto>({ nmap: true, nuclei: false });
    const [nucleiSeverity, setNucleiSeverity] = useState(
        "critical,high,medium",
    );
    const [nucleiTags, setNucleiTags] = useState("");

    const load = async () => {
        setLoading(true);
        try {
            setAudits(await auditApi.list(deviceId));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [deviceId]);

    const handleRun = async () => {
        setRunning(true);
        push({ type: "info", message: t("auditRunning") });

        // Собираем nucleiArgs из severity и tags
        let nucleiArgs = "";
        if (nucleiSeverity) nucleiArgs += `-severity ${nucleiSeverity}`;
        if (nucleiTags) nucleiArgs += ` -tags ${nucleiTags}`;

        try {
            await auditApi.run(deviceId, {
                ...dto,
                nucleiArgs: nucleiArgs.trim() || undefined,
            });
            push({ type: "success", message: t("auditSuccess") });
            setShowRun(false);
            load();
        } catch {
            push({ type: "error", message: t("auditFailed") });
        } finally {
            setRunning(false);
        }
    };

    const handleViewDetails = async (run: AuditRun) => {
        const detail = await auditApi.get(run.id).catch(() => null);
        setSelected(detail ?? run);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={() => setShowRun(true)} icon={<span>▶</span>}>
                    {t("runAudit")}
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Spinner />
                </div>
            ) : (
                <Card>
                    {audits.length === 0 ? (
                        <EmptyState icon="🔍" message={t("noAudits")} />
                    ) : (
                        <Table>
                            <Thead>
                                <tr>
                                    <Th>{t("status")}</Th>
                                    <Th>{t("createdAt")}</Th>
                                    <Th>{t("findings")}</Th>
                                    <Th>Инструменты</Th>
                                    <Th>{t("details")}</Th>
                                </tr>
                            </Thead>
                            <Tbody>
                                {audits.map((a) => (
                                    <Tr key={a.id}>
                                        <Td>
                                            <StatusBadge
                                                status={a.status}
                                                label={t(a.status)}
                                            />
                                        </Td>
                                        <Td>
                                            <span className="font-mono text-xs">
                                                {format(
                                                    new Date(a.createdAt),
                                                    "dd.MM.yyyy HH:mm",
                                                )}
                                            </span>
                                        </Td>
                                        <Td>
                                            {a.summary?.findings ? (
                                                <div className="flex gap-2 flex-wrap">
                                                    {a.summary.findings
                                                        .critical > 0 && (
                                                        <span className="text-xs font-mono text-red-400 font-bold">
                                                            C:
                                                            {
                                                                a.summary
                                                                    .findings
                                                                    .critical
                                                            }
                                                        </span>
                                                    )}
                                                    {a.summary.findings.high >
                                                        0 && (
                                                        <span className="text-xs font-mono text-orange-400">
                                                            H:
                                                            {
                                                                a.summary
                                                                    .findings
                                                                    .high
                                                            }
                                                        </span>
                                                    )}
                                                    {a.summary.findings.medium >
                                                        0 && (
                                                        <span className="text-xs font-mono text-yellow-400">
                                                            M:
                                                            {
                                                                a.summary
                                                                    .findings
                                                                    .medium
                                                            }
                                                        </span>
                                                    )}
                                                    {a.summary.findings.low >
                                                        0 && (
                                                        <span className="text-xs font-mono text-green-400">
                                                            L:
                                                            {
                                                                a.summary
                                                                    .findings
                                                                    .low
                                                            }
                                                        </span>
                                                    )}
                                                    <span className="text-xs font-mono t-text-muted">
                                                        Σ:
                                                        {
                                                            a.summary.findings
                                                                .total
                                                        }
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs t-text-muted">
                                                    —
                                                </span>
                                            )}
                                        </Td>
                                        <Td>
                                            <div className="flex gap-1 flex-wrap">
                                                {(a.config as any)?.nmap && (
                                                    <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400">
                                                        nmap
                                                    </span>
                                                )}
                                                {(a.config as any)?.nuclei && (
                                                    <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">
                                                        nuclei
                                                    </span>
                                                )}
                                                {a.summary?.toolErrors &&
                                                    (
                                                        a.summary
                                                            .toolErrors as any[]
                                                    )?.length > 0 && (
                                                        <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                                                            {
                                                                (
                                                                    a.summary
                                                                        .toolErrors as any[]
                                                                )?.length
                                                            }{" "}
                                                            err
                                                        </span>
                                                    )}
                                            </div>
                                        </Td>
                                        <Td>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    handleViewDetails(a)
                                                }
                                            >
                                                {t("details")}
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    )}
                </Card>
            )}

            {/* Run audit modal */}
            <Modal
                open={showRun}
                onClose={() => setShowRun(false)}
                title={t("runAudit")}
            >
                <div className="space-y-5">
                    {/* Tools */}
                    <div className="space-y-3">
                        <p className="text-xs font-body font-semibold t-text-muted uppercase tracking-wider">
                            Инструменты
                        </p>
                        <Toggle
                            checked={dto.nmap ?? true}
                            onChange={(v) => setDto((d) => ({ ...d, nmap: v }))}
                            label="Nmap — сканирование портов и сервисов"
                        />
                        <Toggle
                            checked={dto.nuclei ?? false}
                            onChange={(v) =>
                                setDto((d) => ({ ...d, nuclei: v }))
                            }
                            label="Nuclei — поиск веб-уязвимостей (CVE, misconfig)"
                        />
                    </div>

                    {/* Nuclei options */}
                    {dto.nuclei && (
                        <div className="space-y-3 border t-border rounded-lg p-4 bg-purple-500/5">
                            <p className="text-xs font-body font-semibold text-purple-400 uppercase tracking-wider">
                                Настройки Nuclei
                            </p>

                            <Input
                                label="Target URL (если отличается от IP устройства)"
                                value={dto.nucleiTargetUrl ?? ""}
                                onChange={(e) =>
                                    setDto((d) => ({
                                        ...d,
                                        nucleiTargetUrl: e.target.value,
                                    }))
                                }
                                placeholder="http://testphp.vulnweb.com"
                            />

                            <div>
                                <label className="text-xs font-body font-semibold t-text-muted uppercase tracking-wider block mb-1.5">
                                    Severity фильтр
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {[
                                        {
                                            value: "critical",
                                            label: "Critical",
                                            color: "text-red-400 border-red-500/30 bg-red-500/10",
                                        },
                                        {
                                            value: "high",
                                            label: "High",
                                            color: "text-orange-400 border-orange-500/30 bg-orange-500/10",
                                        },
                                        {
                                            value: "medium",
                                            label: "Medium",
                                            color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
                                        },
                                        {
                                            value: "low",
                                            label: "Low",
                                            color: "text-green-400 border-green-500/30 bg-green-500/10",
                                        },
                                        {
                                            value: "info",
                                            label: "Info",
                                            color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
                                        },
                                    ].map((s) => {
                                        const active = nucleiSeverity.includes(
                                            s.value,
                                        );
                                        return (
                                            <button
                                                key={s.value}
                                                onClick={() => {
                                                    const parts = nucleiSeverity
                                                        ? nucleiSeverity
                                                              .split(",")
                                                              .filter(Boolean)
                                                        : [];
                                                    const next = active
                                                        ? parts.filter(
                                                              (p) =>
                                                                  p !== s.value,
                                                          )
                                                        : [...parts, s.value];
                                                    setNucleiSeverity(
                                                        next.join(","),
                                                    );
                                                }}
                                                className={`px-3 py-1 rounded-full text-xs font-mono border transition-all ${
                                                    active
                                                        ? s.color
                                                        : "t-text-muted border-transparent hover:border-slate-500/50"
                                                }`}
                                            >
                                                {s.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-body font-semibold t-text-muted uppercase tracking-wider block mb-1.5">
                                    Tags (через запятую)
                                </label>
                                <div className="flex gap-2 flex-wrap mb-2">
                                    {[
                                        "sqli",
                                        "xss",
                                        "cve",
                                        "default-login",
                                        "exposure",
                                        "misconfig",
                                        "rce",
                                        "lfi",
                                    ].map((tag) => (
                                        <button
                                            key={tag}
                                            onClick={() => {
                                                const parts = nucleiTags
                                                    ? nucleiTags
                                                          .split(",")
                                                          .filter(Boolean)
                                                    : [];
                                                const active =
                                                    parts.includes(tag);
                                                const next = active
                                                    ? parts.filter(
                                                          (p) => p !== tag,
                                                      )
                                                    : [...parts, tag];
                                                setNucleiTags(next.join(","));
                                            }}
                                            className={`px-2 py-0.5 rounded text-xs font-mono border transition-all ${
                                                nucleiTags.includes(tag)
                                                    ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                                                    : "t-text-muted border-transparent t-border hover:border-slate-500/50"
                                            }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    value={nucleiTags}
                                    onChange={(e) =>
                                        setNucleiTags(e.target.value)
                                    }
                                    placeholder="sqli,xss,cve или оставь пустым для всех"
                                    className="w-full px-3 py-2 rounded-lg border font-mono text-xs t-input"
                                />
                            </div>

                            {/* Warning about first run */}
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                                <span className="text-yellow-400 flex-shrink-0">
                                    ⚠
                                </span>
                                <div className="text-xs font-mono t-text-muted">
                                    <p className="text-yellow-400 font-semibold mb-1">
                                        Первый запуск
                                    </p>
                                    <p>
                                        Nuclei скачает шаблоны (~500MB). Это
                                        займёт 5-15 минут.
                                    </p>
                                    <p className="mt-1">
                                        Для ускорения сначала запусти в
                                        PowerShell:
                                    </p>
                                    <code className="block mt-1 text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">
                                        "C:\Program Files (x86)\Nmap\nuclei.exe"
                                        -update-templates
                                    </code>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setShowRun(false)}
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            onClick={handleRun}
                            loading={running}
                            icon={<span>▶</span>}
                        >
                            {t("run")}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Findings detail modal */}
            <Modal
                open={!!selected}
                onClose={() => setSelected(null)}
                title={t("findings")}
                wide
            >
                {selected?.findings && selected.findings.length > 0 ? (
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                        {selected.findings.map((f) => (
                            <div
                                key={f.id}
                                className="border t-border rounded-lg p-4 space-y-2"
                            >
                                <div className="flex items-center gap-3 flex-wrap">
                                    <SeverityBadge
                                        severity={f.severity}
                                        label={t(f.severity)}
                                    />
                                    <span className="t-text-primary font-body font-medium text-sm">
                                        {f.title}
                                    </span>
                                    {f.port && (
                                        <span className="ml-auto font-mono text-xs text-cyan-300">
                                            {f.port}/{f.protocol}
                                        </span>
                                    )}
                                    {f.kind === "nuclei" && (
                                        <span className="ml-auto font-mono text-xs px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">
                                            nuclei
                                        </span>
                                    )}
                                </div>
                                {f.description && (
                                    <p className="t-text-muted text-xs font-body">
                                        {f.description}
                                    </p>
                                )}
                                {(f.evidence as any)?.matched && (
                                    <p className="text-cyan-400 text-xs font-mono border-l-2 border-cyan-500/40 pl-2 break-all">
                                        {(f.evidence as any).matched}
                                    </p>
                                )}
                                {f.remediation && (
                                    <p className="text-green-400 text-xs font-mono border-l-2 border-green-500/40 pl-2">
                                        {f.remediation}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState icon="✓" message={t("noFindings")} />
                )}
            </Modal>
        </div>
    );
}

// ─── Preset test log messages ────────────────────────────────────────────────
const LOG_PRESETS = [
    {
        label: "SSH brute-force",
        level: "ERROR",
        message: "Failed password for root from 192.168.1.100 port 22 ssh2",
    },
    {
        label: "Invalid user",
        level: "WARN",
        message: "Invalid user admin from 10.0.0.5 port 4321",
    },
    {
        label: "Auth accepted",
        level: "INFO",
        message:
            "Accepted publickey for deploy from 192.168.1.50 port 51234 ssh2",
    },
    {
        label: "Service start",
        level: "INFO",
        message: "Started nginx.service - A high performance web server",
    },
    {
        label: "OOM killed",
        level: "FATAL",
        message:
            "Out of memory: Kill process 1234 (node) score 900 or sacrifice child",
    },
    {
        label: "Segfault",
        level: "ERROR",
        message:
            "segfault at 0 ip 00007f3c4d2b1a23 sp 00007ffe3d8b4210 error 4 in libc.so",
    },
    {
        label: "Port scan",
        level: "WARN",
        message:
            "Possible port scan detected from 172.16.0.1 - 15 connections in 2s",
    },
    {
        label: "Debug trace",
        level: "DEBUG",
        message: "Connection pool: 12/50 active, latency=3ms, queue=0",
    },
];

function LogsTab({ deviceId }: { deviceId: string }) {
    const { t } = useLang();
    const { push } = useNotifications();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [streamLogs, setStreamLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [streaming, setStreaming] = useState(false);
    const [levelFilter, setLevelFilter] = useState("");
    const [sending, setSending] = useState(false);
    const [showIngest, setShowIngest] = useState(false);
    const [customMsg, setCustomMsg] = useState("");
    const [customLevel, setCustomLevel] = useState("INFO");
    const stopRef = useRef<(() => void) | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const data = await logsApi.list(deviceId, {
                limit: 100,
                level: levelFilter || undefined,
            });
            setLogs(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, [deviceId, levelFilter]);

    const startStream = () => {
        setStreamLogs([]);
        setStreaming(true);
        stopRef.current = createLogStream(deviceId, (log) => {
            setStreamLogs((prev) => [...prev.slice(-199), log]);
            setTimeout(
                () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
                50,
            );
        });
    };

    const stopStream = () => {
        stopRef.current?.();
        stopRef.current = null;
        setStreaming(false);
    };

    useEffect(() => () => stopRef.current?.(), []);

    // Отправить один лог через HTTP ingest
    const sendLog = async (message: string, level: string, app?: string) => {
        setSending(true);
        try {
            await logsApi.ingest(deviceId, {
                message,
                level: level as any,
                app: app ?? "manual",
                source: "HTTP",
            });
            push({
                type: "success",
                message: `Лог отправлен: [${level}] ${message.slice(0, 40)}`,
            });
            // Обновить историю если не в режиме стрима
            if (!streaming) {
                setTimeout(() => loadHistory(), 300);
            }
        } catch (e: any) {
            push({
                type: "error",
                message:
                    "Ошибка отправки лога: " +
                    (e?.response?.data?.message ?? e?.message),
            });
        } finally {
            setSending(false);
        }
    };

    const displayLogs = streaming ? streamLogs : logs;
    const levelColors: Record<string, string> = {
        TRACE: "t-text-muted",
        DEBUG: "text-blue-400",
        INFO: "text-green-400",
        WARN: "text-yellow-400",
        ERROR: "text-red-400",
        FATAL: "text-red-500",
    };

    return (
        <div className="space-y-4">
            {/* Controls row */}
            <div className="flex items-center gap-3 flex-wrap">
                <Select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="w-36"
                >
                    <option value="">{t("all")}</option>
                    {["TRACE", "DEBUG", "INFO", "WARN", "ERROR", "FATAL"].map(
                        (l) => (
                            <option key={l} value={l}>
                                {t(l as any)}
                            </option>
                        ),
                    )}
                </Select>
                <Button
                    variant="outline"
                    onClick={loadHistory}
                    disabled={streaming}
                >
                    {t("refresh")}
                </Button>
                {!streaming ? (
                    <Button
                        onClick={startStream}
                        icon={
                            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                        }
                    >
                        {t("realtime")}
                    </Button>
                ) : (
                    <Button variant="danger" onClick={stopStream}>
                        ■ Stop
                    </Button>
                )}
                {streaming && (
                    <span className="flex items-center gap-1.5 text-xs font-mono text-green-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        {t("connected")}
                    </span>
                )}
                <Button
                    variant="ghost"
                    onClick={() =>
                        streaming ? setStreamLogs([]) : setLogs([])
                    }
                >
                    {t("clearLogs")}
                </Button>

                {/* Send log button */}
                <div className="ml-auto">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowIngest(true)}
                        icon={<span>↑</span>}
                    >
                        {t("ingestLog")}
                    </Button>
                </div>
            </div>

            {/* Log list */}
            <Card>
                {loading && !streaming ? (
                    <CardBody className="flex justify-center py-8">
                        <Spinner />
                    </CardBody>
                ) : displayLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 t-text-muted gap-3">
                        <span className="text-5xl opacity-60">📋</span>
                        <p className="font-body text-sm">
                            {streaming ? t("connecting") : t("noLogs")}
                        </p>
                        {!streaming && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowIngest(true)}
                                icon={<span>↑</span>}
                            >
                                Отправить тестовый лог
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="font-mono text-xs t-divide max-h-[480px] overflow-y-auto">
                        {displayLogs.map((log) => (
                            <div
                                key={log.id}
                                className="flex items-start gap-3 px-4 py-2 t-hover transition-colors"
                            >
                                <span className="text-slate-600 flex-shrink-0 w-36 truncate">
                                    {format(
                                        new Date(log.ts),
                                        "MM-dd HH:mm:ss.SSS",
                                    )}
                                </span>
                                <LevelTag level={log.level} />
                                <span className="t-text-muted flex-shrink-0 w-20 truncate">
                                    {log.app ?? log.source}
                                </span>
                                <span
                                    className={`flex-1 break-all ${levelColors[log.level] ?? "t-text-secondary"}`}
                                >
                                    {log.message}
                                </span>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>
                )}
            </Card>

            {/* Ingest modal */}
            <Modal
                open={showIngest}
                onClose={() => setShowIngest(false)}
                title="Отправить лог"
                wide
            >
                <div className="space-y-5">
                    {/* Presets */}
                    <div>
                        <p className="text-xs font-body font-semibold t-text-muted uppercase tracking-wider mb-2">
                            Быстрые шаблоны
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {LOG_PRESETS.map((p) => (
                                <button
                                    key={p.label}
                                    onClick={() =>
                                        sendLog(p.message, p.level, p.label)
                                    }
                                    disabled={sending}
                                    className={`
                    text-left px-3 py-2 rounded-lg border t-border text-xs font-mono
                    t-hover transition-all disabled:opacity-50
                    ${
                        p.level === "ERROR" || p.level === "FATAL"
                            ? "border-red-500/20 hover:border-red-500/50"
                            : p.level === "WARN"
                              ? "border-yellow-500/20 hover:border-yellow-500/50"
                              : "hover:border-cyan-500/40"
                    }
                  `}
                                >
                                    <span
                                        className={`block font-semibold mb-0.5 ${
                                            p.level === "ERROR" ||
                                            p.level === "FATAL"
                                                ? "text-red-400"
                                                : p.level === "WARN"
                                                  ? "text-yellow-400"
                                                  : p.level === "INFO"
                                                    ? "text-green-400"
                                                    : "text-blue-400"
                                        }`}
                                    >
                                        {p.level}
                                    </span>
                                    <span className="t-text-muted">
                                        {p.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t t-border" />

                    {/* Custom log */}
                    <div className="space-y-3">
                        <p className="text-xs font-body font-semibold t-text-muted uppercase tracking-wider">
                            Своё сообщение
                        </p>
                        <div className="flex gap-3">
                            <Select
                                value={customLevel}
                                onChange={(e) => setCustomLevel(e.target.value)}
                                className="w-32 flex-shrink-0"
                            >
                                {[
                                    "TRACE",
                                    "DEBUG",
                                    "INFO",
                                    "WARN",
                                    "ERROR",
                                    "FATAL",
                                ].map((l) => (
                                    <option key={l} value={l}>
                                        {l}
                                    </option>
                                ))}
                            </Select>
                            <Input
                                value={customMsg}
                                onChange={(e) => setCustomMsg(e.target.value)}
                                placeholder="Введите сообщение лога..."
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && customMsg.trim()) {
                                        sendLog(customMsg, customLevel);
                                        setCustomMsg("");
                                    }
                                }}
                                className="flex-1"
                            />
                            <Button
                                onClick={() => {
                                    if (customMsg.trim()) {
                                        sendLog(customMsg, customLevel);
                                        setCustomMsg("");
                                    }
                                }}
                                disabled={!customMsg.trim() || sending}
                                loading={sending}
                                icon={<span>↑</span>}
                            >
                                Отправить
                            </Button>
                        </div>
                        <p className="text-xs t-text-muted font-mono">
                            Enter или кнопка — отправляет лог через HTTP ingest
                            API
                        </p>
                    </div>

                    {/* Batch test */}
                    <div className="border-t t-border pt-4">
                        <p className="text-xs font-body font-semibold t-text-muted uppercase tracking-wider mb-2">
                            Тест корреляции (отправить 15 логов SSH brute-force)
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            loading={sending}
                            onClick={async () => {
                                setSending(true);
                                try {
                                    for (let i = 1; i <= 15; i++) {
                                        await logsApi.ingest(deviceId, {
                                            message: `Failed password for root from 192.168.1.${100 + i} port ${22000 + i} ssh2`,
                                            level: "ERROR",
                                            app: "sshd",
                                        });
                                        await new Promise((r) =>
                                            setTimeout(r, 100),
                                        );
                                    }
                                    push({
                                        type: "success",
                                        message:
                                            "15 логов отправлено. Проверь вкладку Оповещения.",
                                    });
                                    if (!streaming)
                                        setTimeout(() => loadHistory(), 500);
                                } catch (e: any) {
                                    push({
                                        type: "error",
                                        message: e?.message ?? "Ошибка",
                                    });
                                } finally {
                                    setSending(false);
                                }
                            }}
                        >
                            🔥 Отправить 15 SSH ошибок
                        </Button>
                        <p className="text-xs t-text-muted font-mono mt-1">
                            Если есть правило корреляции с regex "Failed
                            password" — создастся алерт
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            variant="ghost"
                            onClick={() => setShowIngest(false)}
                        >
                            {t("close")}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

function AlertsTab({ deviceId }: { deviceId: string }) {
    const { t } = useLang();
    const { push } = useNotifications();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [onlyUnacked, setOnlyUnacked] = useState(false);
    const [acking, setAcking] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            setAlerts(
                await alertsApi.list(deviceId, {
                    unacked: onlyUnacked || undefined,
                    limit: 100,
                }),
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [deviceId, onlyUnacked]);

    const ack = async (id: string) => {
        setAcking(id);
        try {
            await alertsApi.ack(id);
            push({ type: "success", message: t("ackSuccess") });
            load();
        } catch {
            push({ type: "error", message: t("error") });
        } finally {
            setAcking(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Toggle
                    checked={onlyUnacked}
                    onChange={setOnlyUnacked}
                    label={t("unacknowledged")}
                />
                <Button variant="outline" onClick={load} icon={<span>↺</span>}>
                    {t("refresh")}
                </Button>
            </div>
            <Card>
                {loading ? (
                    <CardBody className="flex justify-center py-8">
                        <Spinner />
                    </CardBody>
                ) : alerts.length === 0 ? (
                    <EmptyState icon="🔔" message={t("noAlerts")} />
                ) : (
                    <Table>
                        <Thead>
                            <tr>
                                <Th>{t("severity")}</Th>
                                <Th>{t("alertType")}</Th>
                                <Th>{t("message")}</Th>
                                <Th>{t("time")}</Th>
                                <Th>{t("status")}</Th>
                            </tr>
                        </Thead>
                        <Tbody>
                            {alerts.map((a) => (
                                <Tr key={a.id}>
                                    <Td>
                                        <SeverityBadge
                                            severity={a.severity}
                                            label={t(a.severity)}
                                        />
                                    </Td>
                                    <Td>
                                        <span className="text-xs font-mono t-text-muted">
                                            {t(a.type as any)}
                                        </span>
                                    </Td>
                                    <Td>
                                        <div>
                                            <p className="text-sm t-text-primary">
                                                {a.title}
                                            </p>
                                            <p className="text-xs t-text-muted truncate max-w-xs">
                                                {a.message}
                                            </p>
                                        </div>
                                    </Td>
                                    <Td>
                                        <span className="font-mono text-xs">
                                            {format(
                                                new Date(a.createdAt),
                                                "dd.MM HH:mm",
                                            )}
                                        </span>
                                    </Td>
                                    <Td>
                                        {a.acknowledgedAt ? (
                                            <span className="text-xs font-mono text-green-400">
                                                ✓ {t("acknowledged")}
                                            </span>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => ack(a.id)}
                                                loading={acking === a.id}
                                            >
                                                {t("acknowledge")}
                                            </Button>
                                        )}
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                )}
            </Card>
        </div>
    );
}

export default function DeviceDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { t } = useLang();
    const navigate = useNavigate();
    const [summary, setSummary] = useState<DeviceSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<Tab>("summary");

    useEffect(() => {
        if (!id) return;
        summaryApi
            .get(id)
            .then(setSummary)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading)
        return (
            <div className="flex justify-center py-32">
                <Spinner size="lg" />
            </div>
        );
    if (!summary)
        return (
            <div className="text-red-400 text-center py-16">{t("error")}</div>
        );

    const tabs: { key: Tab; label: string }[] = [
        { key: "summary", label: t("dashboard") },
        { key: "audit", label: t("audit") },
        { key: "logs", label: t("logs") },
        { key: "alerts", label: t("alerts") },
    ];

    return (
        <div className="animate-fade-in space-y-6">
            <PageHeader
                title={summary.device.name}
                sub={
                    summary.device.ip ?? summary.device.hostname ?? t("unknown")
                }
                actions={
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/devices")}
                    >
                        ← {t("devices")}
                    </Button>
                }
            />

            <div className="flex gap-1 border-b t-border pb-0">
                {tabs.map((tb) => (
                    <button
                        key={tb.key}
                        onClick={() => setTab(tb.key)}
                        className={`px-4 py-2.5 text-sm font-body font-medium transition-all border-b-2 -mb-px ${
                            tab === tb.key
                                ? "text-cyan-300 border-cyan-400"
                                : "t-text-muted border-transparent hover:text-slate-200"
                        }`}
                    >
                        {tb.label}
                    </button>
                ))}
            </div>

            <div>
                {tab === "summary" && <SummaryTab summary={summary} />}
                {tab === "audit" && id && <AuditTab deviceId={id} />}
                {tab === "logs" && id && <LogsTab deviceId={id} />}
                {tab === "alerts" && id && <AlertsTab deviceId={id} />}
            </div>
        </div>
    );
}
