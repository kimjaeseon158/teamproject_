import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const FinanceChart = () => {
  const data = [
    { month: "1월", income: 400000, expense: 240000 },
    { month: "2월", income: 350000, expense: 280000 },
    { month: "3월", income: 500000, expense: 320000 },
    { month: "4월", income: 450000, expense: 290000 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid stroke="#f5f5f5" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="income" stroke="#82ca9d" strokeWidth={2} name="수입" />
        <Line type="monotone" dataKey="expense" stroke="#ff7f7f" strokeWidth={2} name="지출" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default FinanceChart;
