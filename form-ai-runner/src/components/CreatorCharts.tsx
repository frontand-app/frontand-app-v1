import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface RevenueData {
  date: string;
  revenue: number;
  executions: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface RevenueChartProps {
  data: RevenueData[];
  selectedPeriod: string;
}

interface CategoryBreakdownChartProps {
  data: CategoryData[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line 
        type="monotone" 
        dataKey="revenue" 
        stroke="#10a37f" 
        strokeWidth={2}
        dot={{ fill: '#10a37f' }}
      />
    </LineChart>
  </ResponsiveContainer>
);

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({ data }) => (
  <ResponsiveContainer width="100%" height={200}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={40}
        outerRadius={80}
        paddingAngle={5}
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
);

const CreatorCharts = {
  RevenueChart,
  CategoryBreakdownChart
};

export default CreatorCharts; 