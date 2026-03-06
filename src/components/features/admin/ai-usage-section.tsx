"use client";

import { useMemo, useState } from "react";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NumberTicker } from "@/components/magicui/number-ticker";
import {
  IconCurrencyDollar,
  IconMessage,
  IconBolt,
  IconCalendar,
  IconChartBar,
  IconPhoto,
  IconDatabase,
  IconChartPie,
  IconReceipt,
} from "@tabler/icons-react";
import type { AiChatMessage } from "@/lib/types";
import type { UsageData } from "@/lib/intelligence/core/pricing";
import type { ImageGenStats } from "@/lib/actions/admin";

const MODEL_COLORS: Record<string, string> = {
  "gemini-2.5-pro": "#4285F4",
  "gemini-2.5-flash": "#34A853",
  "gemini-2.0-flash": "#FBBC04",
  "gemini-1.5-pro": "#EA4335",
  "gemini-2.5-flash-preview-image-generation": "#f59e0b",
  "gemini-2.0-flash-preview-image-generation": "#f97316",
};
const FALLBACK_COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"];

function getModelColor(model: string, index: number): string {
  return MODEL_COLORS[model] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
};

interface DailyData {
  date: string;
  cost: number;
  tokens: number;
  count: number;
}

interface ModelData {
  model: string;
  tokens: number;
  cost: number;
  count: number;
}

export function AiUsageSection({
  messages,
  imageGenStats,
}: {
  messages: AiChatMessage[];
  imageGenStats: ImageGenStats;
}) {
  const { totalCost, totalTokens, rows, dailyData, modelData } = useMemo(() => {
    let cost = 0;
    let tokens = 0;
    const dailyMap = new Map<string, DailyData>();
    const modelMap = new Map<string, ModelData>();
    const parsed: {
      id: string;
      date: string;
      model: string;
      input: number;
      output: number;
      reasoning: number;
      total: number;
      cost: number;
    }[] = [];

    for (const msg of messages) {
      const usage = msg.usage as UsageData | null;
      if (!usage) continue;

      cost += usage.cost.totalCost;
      tokens += usage.totalTokens;

      const day = (msg.created_at ?? "").slice(0, 10);
      if (day) {
        const existing = dailyMap.get(day) ?? { date: day, cost: 0, tokens: 0, count: 0 };
        existing.cost += usage.cost.totalCost;
        existing.tokens += usage.totalTokens;
        existing.count += 1;
        dailyMap.set(day, existing);
      }

      const mExisting = modelMap.get(usage.model) ?? { model: usage.model, tokens: 0, cost: 0, count: 0 };
      mExisting.tokens += usage.totalTokens;
      mExisting.cost += usage.cost.totalCost;
      mExisting.count += 1;
      modelMap.set(usage.model, mExisting);

      parsed.push({
        id: msg.id,
        date: msg.created_at ?? "",
        model: usage.model,
        input: usage.inputTokens,
        output: usage.outputTokens,
        reasoning: usage.reasoningTokens,
        total: usage.totalTokens,
        cost: usage.cost.totalCost,
      });
    }

    return {
      totalCost: cost,
      totalTokens: tokens,
      rows: parsed,
      dailyData: Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
      modelData: Array.from(modelMap.values()).sort((a, b) => b.tokens - a.tokens),
    };
  }, [messages]);

  // Aggregate image details by model and aspect ratio
  const { imageModelData, imageAspectData } = useMemo(() => {
    const modelMap = new Map<string, { model: string; count: number; cost: number; tokens: number }>();
    const aspectMap = new Map<string, number>();
    for (const d of imageGenStats.details) {
      const m = modelMap.get(d.model) ?? { model: d.model, count: 0, cost: 0, tokens: 0 };
      m.count += 1;
      m.cost += d.cost;
      m.tokens += d.totalTokens;
      modelMap.set(d.model, m);

      aspectMap.set(d.aspectRatio, (aspectMap.get(d.aspectRatio) ?? 0) + 1);
    }
    return {
      imageModelData: Array.from(modelMap.values()).sort((a, b) => b.count - a.count),
      imageAspectData: Array.from(aspectMap.entries())
        .map(([ratio, count]) => ({ ratio, count }))
        .sort((a, b) => b.count - a.count),
    };
  }, [imageGenStats.details]);

  const [showAllImages, setShowAllImages] = useState(false);
  const [showAllText, setShowAllText] = useState(false);

  const hasTextData = messages.length > 0;
  const hasImageData = imageGenStats.totalImages > 0;
  const hasAnyData = hasTextData || hasImageData;

  const grandTotalCost = totalCost + imageGenStats.totalImageCost;
  const avgCostPerImage = imageGenStats.totalImages > 0
    ? imageGenStats.totalImageCost / imageGenStats.totalImages
    : 0;

  // Merge daily text cost + image cost/count for combined timeline
  const combinedDaily = useMemo(() => {
    const allDays = new Map<string, { date: string; textCost: number; imageCost: number; textCount: number; imageCount: number }>();
    for (const d of dailyData) {
      allDays.set(d.date, { date: d.date, textCost: d.cost, imageCost: 0, textCount: d.count, imageCount: 0 });
    }
    for (const d of imageGenStats.byDay) {
      const existing = allDays.get(d.date) ?? { date: d.date, textCost: 0, imageCost: 0, textCount: 0, imageCount: 0 };
      existing.imageCount = d.count;
      existing.imageCost = d.cost;
      allDays.set(d.date, existing);
    }
    return Array.from(allDays.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [dailyData, imageGenStats.byDay]);

  // Cost breakdown pie
  const costBreakdown = [
    { type: "Text Generation", cost: totalCost },
    { type: "Image Generation", cost: imageGenStats.totalImageCost },
  ];
  const TYPE_COLORS = ["#6366f1", "#f59e0b"];
  const ASPECT_COLORS = ["#6366f1", "#34A853", "#f59e0b", "#EA4335", "#8b5cf6"];

  if (!hasAnyData) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-muted-foreground">
        No usage data yet
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Row 0: Summary cards (2x4 grid) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconReceipt className="h-4 w-4 text-emerald-500" />
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              $<NumberTicker value={grandTotalCost} decimalPlaces={4} />
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconCurrencyDollar className="h-4 w-4 text-indigo-500" />
              Text Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              $<NumberTicker value={totalCost} decimalPlaces={4} />
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconCurrencyDollar className="h-4 w-4 text-amber-500" />
              Image Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              $<NumberTicker value={imageGenStats.totalImageCost} decimalPlaces={4} />
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconPhoto className="h-4 w-4 text-orange-500" />
              Avg Cost / Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              ${avgCostPerImage > 0 ? <NumberTicker value={avgCostPerImage} decimalPlaces={4} /> : "—"}
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconMessage className="h-4 w-4 text-blue-500" />
              Text Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NumberTicker value={messages.length} className="text-2xl font-semibold" />
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconPhoto className="h-4 w-4 text-orange-500" />
              Images Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NumberTicker value={imageGenStats.totalImages} className="text-2xl font-semibold" />
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconBolt className="h-4 w-4 text-amber-500" />
              Total Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NumberTicker value={totalTokens} className="text-2xl font-semibold" />
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconDatabase className="h-4 w-4 text-cyan-500" />
              Image Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatBytes(imageGenStats.totalSizeBytes)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Row 1: High-level comparisons (2-col) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Cost Split: Text vs Image pie */}
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <IconChartPie className="h-4 w-4 text-indigo-500" />
              Cost Split: Text vs Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costBreakdown.filter((d) => d.cost > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="cost"
                    nameKey="type"
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell key={entry.type} fill={TYPE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [`$${Number(value).toFixed(4)}`, "Cost"]}
                  />
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

        {/* Daily Activity stacked bar */}
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <IconCalendar className="h-4 w-4 text-emerald-500" />
              Daily Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={combinedDaily}>
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
                    labelFormatter={(label) => formatShortDate(String(label))}
                  />
                  <Legend
                    verticalAlign="bottom"
                    formatter={(value) => (
                      <span className="text-xs text-muted-foreground">
                        {value === "textCount" ? "Text" : "Images"}
                      </span>
                    )}
                  />
                  <Bar dataKey="textCount" name="textCount" fill="#6366f1" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="imageCount" name="imageCount" fill="#f59e0b" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Combined daily cost (full-width stacked area) */}
      {combinedDaily.length > 0 && (
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <IconCurrencyDollar className="h-4 w-4 text-emerald-500" />
              Daily Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedDaily}>
                  <defs>
                    <linearGradient id="textCostGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="imageCostGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatShortDate}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <YAxis
                    tickFormatter={(v) => `$${v.toFixed(2)}`}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name) => [
                      `$${Number(value).toFixed(4)}`,
                      name === "textCost" ? "Text" : "Image",
                    ]}
                    labelFormatter={(label) => formatShortDate(String(label))}
                  />
                  <Legend
                    verticalAlign="bottom"
                    formatter={(value) => (
                      <span className="text-xs text-muted-foreground">
                        {value === "textCost" ? "Text Cost" : "Image Cost"}
                      </span>
                    )}
                  />
                  <Area
                    type="monotone"
                    dataKey="textCost"
                    stackId="1"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#textCostGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="imageCost"
                    stackId="1"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#imageCostGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Row 3: Text model charts (2-col) */}
      {hasTextData && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Cost by Text Model pie */}
          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <IconChartPie className="h-4 w-4 text-indigo-500" />
                Cost by Text Model
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={modelData.filter((d) => d.cost > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="cost"
                      nameKey="model"
                    >
                      {modelData.map((entry, index) => (
                        <Cell key={entry.model} fill={getModelColor(entry.model, index)} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [`$${Number(value).toFixed(4)}`, "Cost"]}
                    />
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

          {/* Tokens by Text Model bar */}
          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <IconChartBar className="h-4 w-4 text-violet-500" />
                Tokens by Text Model
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={modelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      type="number"
                      tickFormatter={formatTokens}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="model"
                      width={120}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [formatTokens(Number(value)), "Tokens"]}
                    />
                    <Bar dataKey="tokens" radius={[0, 4, 4, 0]}>
                      {modelData.map((entry, index) => (
                        <Cell
                          key={entry.model}
                          fill={getModelColor(entry.model, index)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Row 4: Image model charts (2-col) */}
      {hasImageData && imageModelData.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Cost by Image Model pie */}
          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <IconChartPie className="h-4 w-4 text-orange-500" />
                Cost by Image Model
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={imageModelData.filter((d) => d.cost > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="cost"
                      nameKey="model"
                    >
                      {imageModelData.map((entry, index) => (
                        <Cell key={entry.model} fill={getModelColor(entry.model, index)} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [`$${Number(value).toFixed(4)}`, "Cost"]}
                    />
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

          {/* Images by Model horizontal bar */}
          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <IconChartBar className="h-4 w-4 text-orange-500" />
                Images by Model
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={imageModelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="model"
                      width={140}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [value, "Images"]}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {imageModelData.map((entry, index) => (
                        <Cell
                          key={entry.model}
                          fill={getModelColor(entry.model, index)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Row 5: Image extras (2-col) */}
      {hasImageData && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Daily Image Generation area */}
          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <IconPhoto className="h-4 w-4 text-orange-500" />
                Daily Image Generation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={imageGenStats.byDay}>
                    <defs>
                      <linearGradient id="imageGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
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
                      formatter={(value) => [value, "Images"]}
                      labelFormatter={(label) => formatShortDate(String(label))}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fill="url(#imageGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Aspect Ratio pie */}
          {imageAspectData.length > 0 && (
            <Card size="sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <IconChartPie className="h-4 w-4 text-violet-500" />
                  Aspect Ratio Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={imageAspectData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="count"
                        nameKey="ratio"
                      >
                        {imageAspectData.map((entry, index) => (
                          <Cell key={entry.ratio} fill={ASPECT_COLORS[index % ASPECT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value) => [value, "Images"]}
                      />
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
          )}
        </div>
      )}

      {/* Row 6: Image Generation Details (table, expandable) */}
      {hasImageData && imageGenStats.details.length > 0 && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-medium">
            <IconPhoto className="h-5 w-5 text-orange-500" />
            Image Generation Details
          </h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Model</th>
                  <th className="px-4 py-2 font-medium">Prompt</th>
                  <th className="px-4 py-2 font-medium">Ratio</th>
                  <th className="px-4 py-2 font-medium text-right">Input</th>
                  <th className="px-4 py-2 font-medium text-right">Output</th>
                  <th className="px-4 py-2 font-medium text-right">Cost</th>
                </tr>
              </thead>
              <tbody>
                {(showAllImages ? imageGenStats.details : imageGenStats.details.slice(0, 5)).map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="px-4 py-2 text-muted-foreground">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant="outline">{row.model}</Badge>
                    </td>
                    <td className="max-w-xs truncate px-4 py-2" title={row.prompt}>
                      {row.prompt}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{row.aspectRatio}</td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {formatTokens(row.inputTokens)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {formatTokens(row.outputTokens)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      ${row.cost.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {imageGenStats.details.length > 5 && (
            <button
              onClick={() => setShowAllImages((v) => !v)}
              className="mt-2 text-sm text-muted-foreground hover:text-foreground"
            >
              {showAllImages ? "Show less" : `Show all ${imageGenStats.details.length} entries`}
            </button>
          )}
        </div>
      )}

      {/* Row 7: Text Generation Details (table, expandable) */}
      {hasTextData && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-medium">
            <IconMessage className="h-5 w-5 text-blue-500" />
            Text Generation Details
          </h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Model</th>
                  <th className="px-4 py-2 font-medium text-right">Input</th>
                  <th className="px-4 py-2 font-medium text-right">Output</th>
                  <th className="px-4 py-2 font-medium text-right">Reasoning</th>
                  <th className="px-4 py-2 font-medium text-right">Total</th>
                  <th className="px-4 py-2 font-medium text-right">Cost</th>
                </tr>
              </thead>
              <tbody>
                {(showAllText ? rows : rows.slice(0, 5)).map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="px-4 py-2 text-muted-foreground">
                      {formatDate(row.date)}
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant="outline">{row.model}</Badge>
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {formatTokens(row.input)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {formatTokens(row.output)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {formatTokens(row.reasoning)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {formatTokens(row.total)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      ${row.cost.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 5 && (
            <button
              onClick={() => setShowAllText((v) => !v)}
              className="mt-2 text-sm text-muted-foreground hover:text-foreground"
            >
              {showAllText ? "Show less" : `Show all ${rows.length} entries`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
