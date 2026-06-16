import React from 'react';
import { StyleSheet, Svg, G, Path, Text, View } from '@react-pdf/renderer';

import type { ChartDistributionRow } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/compute-pie-distribution-rows.util';
import type { FormChartType } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/form-chart-type.types';

type FormChartDistributionPdfProps = {
  rows: ChartDistributionRow[];
  totalAnswers: number;
  chartType: FormChartType;
};

function degToRad(angleDeg: number): number {
  return ((angleDeg - 90) * Math.PI) / 180;
}

function pointOnCircle(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
) {
  const rad = degToRad(angleDeg);
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function describeDonutSlice(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
): string {
  if (endAngle - startAngle >= 359.99) {
    if (innerRadius <= 0) {
      return [
        `M ${cx - outerRadius} ${cy}`,
        `A ${outerRadius} ${outerRadius} 0 1 1 ${cx + outerRadius} ${cy}`,
        `A ${outerRadius} ${outerRadius} 0 1 1 ${cx - outerRadius} ${cy}`,
        'Z',
      ].join(' ');
    }

    return [
      `M ${cx - outerRadius} ${cy}`,
      `A ${outerRadius} ${outerRadius} 0 1 1 ${cx + outerRadius} ${cy}`,
      `A ${outerRadius} ${outerRadius} 0 1 1 ${cx - outerRadius} ${cy}`,
      `M ${cx - innerRadius} ${cy}`,
      `A ${innerRadius} ${innerRadius} 0 1 0 ${cx + innerRadius} ${cy}`,
      `A ${innerRadius} ${innerRadius} 0 1 0 ${cx - innerRadius} ${cy}`,
      'Z',
    ].join(' ');
  }

  const outerStart = pointOnCircle(cx, cy, outerRadius, startAngle);
  const outerEnd = pointOnCircle(cx, cy, outerRadius, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  if (innerRadius <= 0) {
    return [
      `M ${cx} ${cy}`,
      `L ${outerStart.x} ${outerStart.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
      'Z',
    ].join(' ');
  }

  const innerStart = pointOnCircle(cx, cy, innerRadius, endAngle);
  const innerEnd = pointOnCircle(cx, cy, innerRadius, startAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
    'Z',
  ].join(' ');
}

function DistributionBarTable({
  rows,
  totalAnswers,
}: {
  rows: ChartDistributionRow[];
  totalAnswers: number;
}) {
  return (
    <View>
      {rows.map((row, idx) => (
        <View key={`${row.id}-${idx}`} style={s.optionBlock}>
          <View style={s.optionLine}>
            <View style={s.labelWithSwatch}>
              <View style={[s.swatch, { backgroundColor: row.color }]} />
              <Text style={s.optionText}>{row.label}</Text>
            </View>
            <Text style={s.optionNum}>{row.count}</Text>
            <Text style={s.optionNum}>{row.percentage}%</Text>
          </View>
          <View style={s.barTrack}>
            <View
              style={[
                s.barFill,
                {
                  width: `${row.percentage}%`,
                  backgroundColor: row.color,
                },
              ]}
            />
          </View>
        </View>
      ))}
      <Text style={s.totalLine}>Total: {totalAnswers}</Text>
    </View>
  );
}

function DistributionPieChart({
  rows,
  totalAnswers,
  chartType,
}: {
  rows: ChartDistributionRow[];
  totalAnswers: number;
  chartType: Extract<FormChartType, 'pie' | 'donut'>;
}) {
  const size = 120;
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size / 2 - 4;
  const innerRadius = chartType === 'donut' ? outerRadius * 0.5 : 0;

  let currentAngle = 0;
  const slices = rows.map((row) => {
    const sliceAngle = (row.count / totalAnswers) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    return {
      ...row,
      path: describeDonutSlice(
        cx,
        cy,
        outerRadius,
        innerRadius,
        startAngle,
        endAngle,
      ),
    };
  });

  return (
    <View style={s.pieWrap}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G>
          {slices.map((slice, idx) => (
            <Path
              key={`${slice.id}-${idx}`}
              d={slice.path}
              fill={slice.color}
              stroke="#ffffff"
              strokeWidth={0.5}
            />
          ))}
        </G>
      </Svg>
      <View style={s.legendCol}>
        {rows.map((row, idx) => (
          <View key={`${row.id}-legend-${idx}`} style={s.legendRow}>
            <View style={[s.swatch, { backgroundColor: row.color }]} />
            <Text style={s.legendText}>
              {row.label} — {row.percentage}% ({row.count})
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function FormChartDistributionPdf({
  rows,
  totalAnswers,
  chartType,
}: FormChartDistributionPdfProps) {
  if (rows.length === 0) {
    return <Text style={s.muted}>Nenhuma resposta encontrada</Text>;
  }

  if (chartType === 'bar') {
    return <DistributionBarTable rows={rows} totalAnswers={totalAnswers} />;
  }

  return (
    <DistributionPieChart
      rows={rows}
      totalAnswers={totalAnswers}
      chartType={chartType}
    />
  );
}

const s = StyleSheet.create({
  muted: {
    fontSize: 9,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  optionBlock: {
    marginBottom: 3,
  },
  optionLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  labelWithSwatch: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 8,
  },
  swatch: {
    width: 6,
    height: 6,
    marginRight: 6,
    marginTop: 2,
  },
  optionText: {
    fontSize: 9,
    flex: 1,
  },
  optionNum: {
    fontSize: 9,
    width: 32,
    textAlign: 'right',
  },
  barTrack: {
    height: 4,
    marginTop: 2,
    marginLeft: 12,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
  totalLine: {
    fontSize: 9,
    fontWeight: 700,
    marginTop: 6,
  },
  pieWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  legendCol: {
    flex: 1,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  legendText: {
    fontSize: 8,
    color: '#333',
    flex: 1,
  },
});
