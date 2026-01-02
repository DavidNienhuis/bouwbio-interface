import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getQueueStatistics,
  getErrorStatistics,
  getUserQueueItems,
  retryFailedValidation,
  type QueueStatistics,
  type ErrorStatistics,
  type ValidationQueueItem,
} from "@/lib/validation/queueService";
import { toast } from "sonner";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  XCircle,
  BarChart3,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Admin() {
  const { user } = useAuth();
  const [queueStats, setQueueStats] = useState<QueueStatistics | null>(null);
  const [errorStats, setErrorStats] = useState<ErrorStatistics | null>(null);
  const [recentQueue, setRecentQueue] = useState<ValidationQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [queue, errors, items] = await Promise.all([
        getQueueStatistics(),
        getErrorStatistics(7),
        getUserQueueItems(user.id),
      ]);

      setQueueStats(queue);
      setErrorStats(errors);
      setRecentQueue(items.slice(0, 20)); // Show last 20 items
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast.error("Fout bij laden van dashboard data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleRetry = async (queueId: string) => {
    setRetryingIds((prev) => new Set([...prev, queueId]));
    try {
      await retryFailedValidation(queueId);
      toast.success("Validatie opnieuw gestart");
      await loadData();
    } catch (error) {
      console.error("Retry error:", error);
      toast.error("Fout bij opnieuw proberen");
    } finally {
      setRetryingIds((prev) => {
        const next = new Set(prev);
        next.delete(queueId);
        return next;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Voltooid
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            <Activity className="w-3 h-3 mr-1" />
            Verwerken
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="w-3 h-3 mr-1" />
            Wachtend
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Mislukt
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <Card>
            <CardHeader>
              <CardTitle>Toegang geweigerd</CardTitle>
              <CardDescription>
                Log in om het admin dashboard te bekijken
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Activity className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Dashboard laden...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 py-8 px-6 bg-muted">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-heading font-medium text-foreground">
                Validatie Dashboard
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Monitor en beheer de validatie wachtrij
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Vernieuwen
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Pending Count */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Wachtend</CardTitle>
                <Clock className="w-4 h-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{queueStats?.pending_count || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  In wachtrij
                </p>
              </CardContent>
            </Card>

            {/* Processing Count */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Verwerken</CardTitle>
                <Activity className="w-4 h-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{queueStats?.processing_count || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Actief bezig
                </p>
              </CardContent>
            </Card>

            {/* Completed Count */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Voltooid</CardTitle>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{queueStats?.completed_count || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Laatste 7 dagen
                </p>
              </CardContent>
            </Card>

            {/* Failed Count */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Mislukt</CardTitle>
                <XCircle className="w-4 h-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{queueStats?.failed_count || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Laatste 7 dagen
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Error Statistics */}
          {errorStats && errorStats.total_errors > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Fout Statistieken
                </CardTitle>
                <CardDescription>
                  Laatste 7 dagen - {errorStats.total_errors} fouten ({errorStats.error_rate?.toFixed(1)}% fout ratio)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Errors by Step */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Fouten per Stap</h4>
                    <div className="space-y-2">
                      {Object.entries(errorStats.errors_by_step || {}).map(([step, count]) => (
                        <div key={step} className="flex items-center justify-between">
                          <span className="text-sm">{step.replace(/_/g, " ")}</span>
                          <Badge variant="outline">{count as number}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Most Common Errors */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Meest Voorkomende Fouten</h4>
                    <div className="space-y-2">
                      {errorStats.most_common_errors?.slice(0, 5).map((error: any, idx: number) => (
                        <div key={idx} className="text-sm">
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-xs text-muted-foreground">
                              {error.error_message.length > 40
                                ? error.error_message.substring(0, 40) + "..."
                                : error.error_message}
                            </span>
                            <Badge variant="outline" className="ml-2">{error.count}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Queue Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Recente Validaties
              </CardTitle>
              <CardDescription>
                Je laatste {recentQueue.length} validatie verzoeken
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentQueue.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Geen recente validaties
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Aangemaakt</TableHead>
                      <TableHead>Pogingen</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentQueue.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-sm">
                          {formatDate(item.created_at)}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {item.attempts}/{item.max_attempts}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.input_data?.productName || "Onbekend"}
                        </TableCell>
                        <TableCell>
                          {item.status === "failed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRetry(item.id)}
                              disabled={retryingIds.has(item.id)}
                              className="gap-1"
                            >
                              <RefreshCw
                                className={`w-3 h-3 ${
                                  retryingIds.has(item.id) ? "animate-spin" : ""
                                }`}
                              />
                              Opnieuw
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* System Health */}
          {queueStats && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Systeem Gezondheid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Gemiddeld Aantal Pogingen</span>
                      <span className="text-sm">{queueStats.avg_retry_count?.toFixed(2) || "0.00"}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${Math.min((queueStats.avg_retry_count || 0) * 33, 100)}%` }}
                      />
                    </div>
                  </div>

                  {queueStats.oldest_pending && (
                    <div>
                      <span className="text-sm font-medium">Oudste Wachtende Item</span>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(queueStats.oldest_pending)}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="text-sm font-medium">Success Rate</span>
                    <p className="text-sm text-muted-foreground">
                      {queueStats.completed_count && queueStats.failed_count
                        ? (
                            (queueStats.completed_count /
                              (queueStats.completed_count + queueStats.failed_count)) *
                            100
                          ).toFixed(1)
                        : "100.0"}
                      %
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
