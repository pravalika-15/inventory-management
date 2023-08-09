import AnalyticsDashboard from "./Chart/AnalyticsDashboard";
import CustomerOrderAnalytics from "./Chart/CustomerOrderAnalytics";
import MonthlyOrderCountChart from "./Chart/MonthlyOrderCountChart";
import MonthlyRevenueChart from "./Chart/MonthlyRevenueChart";

function Chart() {
  return (
    <>
      <AnalyticsDashboard />
      <CustomerOrderAnalytics />
      <MonthlyRevenueChart />
      <MonthlyOrderCountChart />
    </>
  );
}

export default Chart;
