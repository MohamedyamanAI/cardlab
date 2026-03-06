"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  IconUsers,
  IconFolders,
  IconCards,
  IconFileText,
  IconMessage,
  IconDatabase,
  IconStack2,
  IconLayout,
  IconPhoto,
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { BorderBeam } from "@/components/magicui/border-beam";
import type { SystemOverview } from "@/lib/repository/analytics";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "\u2014";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const statConfig = [
  { key: "totalUsers" as const, label: "Users", icon: IconUsers, color: "text-blue-500" },
  { key: "totalProjects" as const, label: "Projects", icon: IconFolders, color: "text-violet-500" },
  { key: "totalCards" as const, label: "Cards", icon: IconCards, color: "text-amber-500" },
  { key: "totalDocuments" as const, label: "Documents", icon: IconFileText, color: "text-emerald-500" },
  { key: "totalDecks" as const, label: "Decks", icon: IconStack2, color: "text-orange-500" },
  { key: "totalLayouts" as const, label: "Layouts", icon: IconLayout, color: "text-pink-500" },
  { key: "totalChats" as const, label: "AI Chats", icon: IconMessage, color: "text-rose-500" },
  { key: "totalMedia" as const, label: "Media Files", icon: IconPhoto, color: "text-teal-500" },
];

const CONTENT_COLORS = ["#f59e0b", "#10b981", "#f97316", "#ec4899"];
const STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  active: "#22c55e",
  archived: "#6366f1",
};

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
};

export function OverviewSection({ data }: { data: SystemOverview }) {
  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statConfig.map(({ key, label, icon: Icon, color }) => (
          <Card key={key} size="sm" className="relative overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className={`h-4 w-4 ${color}`} />
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NumberTicker
                value={data[key]}
                className="text-2xl font-semibold"
              />
            </CardContent>
          </Card>
        ))}

        <Card size="sm" className="relative overflow-hidden col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconDatabase className="h-4 w-4 text-cyan-500" />
              Storage Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatBytes(data.storageUsedBytes)}
            </p>
          </CardContent>
          <BorderBeam size={80} duration={8} />
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* User signups over time */}
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <IconUsers className="h-4 w-4 text-blue-500" />
              User Signups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {data.userSignups.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.userSignups}>
                    <defs>
                      <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatShortDate}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [value, "Signups"]}
                      labelFormatter={(label) => formatShortDate(String(label))}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#signupGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No signup data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content breakdown */}
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <IconCards className="h-4 w-4 text-amber-500" />
              Content Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.contentBreakdown.filter((d) => d.count > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="type"
                  >
                    {data.contentBreakdown.map((entry, index) => (
                      <Cell
                        key={entry.type}
                        fill={CONTENT_COLORS[index % CONTENT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    verticalAlign="bottom"
                    formatter={(value) => (
                      <span className="text-xs text-muted-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Project status breakdown */}
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <IconFolders className="h-4 w-4 text-violet-500" />
              Project Statuses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {data.projectStatuses.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.projectStatuses}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="status"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [value, "Projects"]}
                      labelFormatter={(label) =>
                        String(label).charAt(0).toUpperCase() + String(label).slice(1)
                      }
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {data.projectStatuses.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={STATUS_COLORS[entry.status] ?? "#94a3b8"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No projects yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent users */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-medium">
          <IconUsers className="h-5 w-5 text-blue-500" />
          Recent Users
        </h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-4 py-2 font-medium">User</th>
                <th className="px-4 py-2 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {data.recentUsers.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary uppercase">
                        {user.email[0]}
                      </div>
                      <div>
                        <p className="font-medium">{user.name ?? user.email.split("@")[0]}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {formatDate(user.created_at)}
                  </td>
                </tr>
              ))}
              {data.recentUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No users yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
