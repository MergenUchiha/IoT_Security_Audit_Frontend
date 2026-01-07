import { Activity, CheckCircle, Code, Radio, AlertTriangle } from 'lucide-react';
import { scanTimelineData, mockVulnerabilities } from '../data/mockData';

const Scans = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white font-mono flex items-center gap-3">
        <Activity className="w-8 h-8 text-cyan-400" />
        ACTIVE SCAN RESULTS
      </h1>

      {/* Scan Timeline */}
      <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 font-mono">SCAN TIMELINE</h3>
        <div className="space-y-4">
          {scanTimelineData.map((phase, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {phase.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : phase.status === 'running' ? (
                    <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-600"></div>
                  )}
                  <span className="text-white font-mono">{phase.phase}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 font-mono text-sm">{phase.details}</span>
                  <span className="text-gray-400 font-mono text-sm">{phase.time}</span>
                  <span className={`font-mono text-sm ${
                    phase.status === 'completed' ? 'text-green-400' :
                    phase.status === 'running' ? 'text-cyan-400' :
                    'text-gray-500'
                  }`}>
                    {phase.progress}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden ml-8">
                <div 
                  className={`h-full transition-all ${
                    phase.status === 'completed' ? 'bg-green-500' :
                    phase.status === 'running' ? 'bg-cyan-500' :
                    'bg-gray-700'
                  }`}
                  style={{ width: `${phase.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Firmware Analysis */}
        <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4 font-mono flex items-center gap-2">
            <Code className="w-5 h-5 text-cyan-400" />
            FIRMWARE ANALYSIS
          </h3>
          <div className="bg-black rounded border border-gray-700 p-4 font-mono text-sm overflow-auto max-h-64">
            <pre className="text-green-400 whitespace-pre-wrap">
{`> Extracting firmware v2.1.4...
> Analyzing binary structure...
> Found 24 executable sections
> Detecting hardcoded credentials...
  [!] WARNING: Default password found
      Location: /bin/auth_module
      Line: 0x00045A2C
> Checking for backdoors...
  [!] CRITICAL: Undocumented telnet service
      Port: 23 (enabled by default)
> Searching for crypto weaknesses...
  [!] HIGH: Weak encryption detected
      Algorithm: DES (deprecated)
> Vulnerability scan complete
  Total Issues: 12 (3 Critical, 5 High, 4 Medium)`}
            </pre>
          </div>
        </div>

        {/* Network Capture */}
        <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4 font-mono flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            NETWORK CAPTURE
          </h3>
          <div className="bg-black rounded border border-gray-700 p-4 font-mono text-xs overflow-auto max-h-64">
            <pre className="text-cyan-400 whitespace-pre-wrap">
{`192.168.1.45 > 8.8.8.8     DNS  Query (A) device.update.com
8.8.8.8 > 192.168.1.45     DNS  Response 203.0.113.45
192.168.1.45 > 203.0.113.45 HTTP GET /firmware/update
203.0.113.45 > 192.168.1.45 HTTP 200 OK [UNENCRYPTED]
[!] ALERT: Firmware downloaded over HTTP
192.168.1.45 > 192.168.1.1  TCP  Telnet session established
[!] ALERT: Unencrypted telnet connection
192.168.1.45 > 10.0.0.45    TCP  Unknown protocol on port 9999
[!] SUSPICIOUS: Non-standard port usage
192.168.1.45 > 192.168.1.67 MQTT Publish to /admin/debug
[!] ALERT: Admin channel accessed`}
            </pre>
          </div>
        </div>
      </div>

      {/* Discovered Vulnerabilities */}
      <div className="bg-gray-900 border border-red-500/50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-red-400 mb-4 font-mono flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          DISCOVERED VULNERABILITIES
        </h3>
        <div className="space-y-3">
          {mockVulnerabilities.slice(0, 4).map((vuln) => (
            <div key={vuln.id} className="bg-gray-800 border border-gray-700 rounded p-4 hover:border-cyan-500/50 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-cyan-400 font-mono text-sm font-bold">{vuln.id}</span>
                    <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                      vuln.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500' :
                      vuln.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500' :
                      'bg-yellow-500/20 text-yellow-400 border border-yellow-500'
                    }`}>
                      {vuln.severity.toUpperCase()}
                    </span>
                    <span className="text-white font-mono text-sm">CVSS {vuln.cvss}</span>
                  </div>
                  <p className="text-white font-medium">{vuln.title}</p>
                  <p className="text-gray-400 text-sm mt-1">{vuln.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Scans;