import { useState, useEffect } from 'react';
import { api, DashboardStats, LoginAttempt, FileAccess, RiskUser } from '@/lib/api';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { UserAvatar } from '@/components/UserAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import {
  Users,
  Shield,
  AlertTriangle,
  FileWarning,
  Activity,
  UserX,
  Clock,
  MapPin,
  Monitor,
  Ban,
  RefreshCw,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [fileAccesses, setFileAccesses] = useState<FileAccess[]>([]);
  const [riskUsers, setRiskUsers] = useState<RiskUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    
    const [statsRes, loginsRes, filesRes, risksRes] = await Promise.all([
      api.getAdminDashboard(),
      api.getLoginAttempts(),
      api.getFileAccess(),
      api.getRiskUsers(),
    ]);

    if (statsRes.data) setStats(statsRes.data.stats);
    if (loginsRes.data) setLoginAttempts(loginsRes.data.attempts);
    if (filesRes.data) setFileAccesses(filesRes.data.accesses);
    if (risksRes.data) setRiskUsers(risksRes.data.risk_users);
    
    setIsLoading(false);
  };

  const handleSuspendUser = async (userId: number, username: string) => {
    const { error } = await api.suspendUser(userId);
    if (!error) {
      toast({
        title: 'User suspended',
        description: `${username} has been suspended.`,
      });
      loadData();
    } else {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Security Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage security across your organization</p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.total_users || 0}
          icon={Users}
          variant="default"
        />
        <StatCard
          title="Online Now"
          value={stats?.online_users || 0}
          icon={Activity}
          variant="success"
        />
        <StatCard
          title="Failed Logins Today"
          value={stats?.failed_logins || 0}
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="High Risk Users"
          value={stats?.risk_users || 0}
          icon={Shield}
          variant="danger"
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="logins" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logins">Login Attempts</TabsTrigger>
          <TabsTrigger value="files">File Access</TabsTrigger>
          <TabsTrigger value="risks">Risk Users</TabsTrigger>
        </TabsList>

        {/* Login Attempts */}
        <TabsContent value="logins">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Login Attempts
              </CardTitle>
              <CardDescription>Recent authentication activity across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {loginAttempts.map(attempt => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            attempt.status === 'success'
                              ? 'bg-success/10 text-success'
                              : attempt.status === 'suspicious'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          {attempt.status === 'success' ? (
                            <Shield className="w-5 h-5" />
                          ) : (
                            <AlertTriangle className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{attempt.username}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {attempt.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Monitor className="w-3 h-3" />
                              {attempt.device_info?.substring(0, 30)}...
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <StatusBadge status={attempt.status}>
                          {attempt.status.charAt(0).toUpperCase() + attempt.status.slice(1)}
                        </StatusBadge>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(attempt.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {loginAttempts.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No login attempts recorded</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* File Access */}
        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileWarning className="w-5 h-5" />
                File Access Log
              </CardTitle>
              <CardDescription>Track file access attempts and security violations</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {fileAccesses.map(access => (
                    <div
                      key={access.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        access.is_authorized
                          ? 'bg-muted/50 border-border/50'
                          : 'bg-destructive/5 border-destructive/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            access.is_authorized
                              ? 'bg-success/10 text-success'
                              : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          {access.is_authorized ? (
                            <Shield className="w-5 h-5" />
                          ) : (
                            <Ban className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{access.username}</p>
                          <p className="text-sm text-muted-foreground font-mono">{access.file_path}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <StatusBadge status={access.risk_level as 'critical' | 'high' | 'medium' | 'low'}>
                          {access.risk_level.toUpperCase()}
                        </StatusBadge>
                        <StatusBadge status={access.is_authorized ? 'success' : 'failed'}>
                          {access.is_authorized ? 'Allowed' : 'Denied'}
                        </StatusBadge>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(access.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {fileAccesses.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No file access records</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Users */}
        <TabsContent value="risks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX className="w-5 h-5" />
                High Risk Users
              </CardTitle>
              <CardDescription>Users with elevated security risk scores</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {riskUsers.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50"
                    >
                      <div className="flex items-center gap-4">
                        <UserAvatar name={user.username} size="lg" />
                        <div>
                          <p className="font-medium text-foreground">{user.username}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">{user.reasons}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-foreground">{user.risk_score}</div>
                          <StatusBadge status={user.status}>
                            {user.status.toUpperCase()}
                          </StatusBadge>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleSuspendUser(user.id, user.username)}
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Suspend
                        </Button>
                      </div>
                    </div>
                  ))}
                  {riskUsers.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No high risk users detected</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
