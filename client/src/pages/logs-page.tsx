
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Log {
  timestamp: string;
  level: string;
  message: string;
  details?: any;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/logs');
        const data = await response.json();
        setLogs(data);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">System Logs</h1>
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[70vh]">
            <div className="p-4 space-y-2">
              {logs.map((log, index) => (
                <div key={index} className="border-b last:border-0 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{log.timestamp}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      log.level === 'error' ? 'bg-red-100 text-red-800' :
                      log.level === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {log.level}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{log.message}</p>
                  {log.details && (
                    <pre className="text-xs bg-gray-50 p-2 mt-1 rounded">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
