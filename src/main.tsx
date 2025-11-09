import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";

import "@/style/index.css";

import StatioLayout from "@/component/layout/statio/StatioLayout";
import Dashboard from "@/app/Dashboard";
import TableLayout from "@/component/layout/table/TableLayout";
import TablePage from "@/app/management/tables/TablePage";
import TableDetailPage from "@/app/tables/detail/TableDetailPage";
import TableEdit from "@/app/tables/TableEdit";
import IndicatorPage from "@/app/management/indicators/IndicatorPage";
import DimensionPage from "@/app/management/dimensions/DimensionPage";
import TableOverview from "@/app/tables/TableOverview";
import OrganizationPage from "@/app/management/organizations/OrganizationPage";

const root = document.getElementById("root");

createRoot(root!).render(
  <BrowserRouter>
    <Routes>
      <Route element={<StatioLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="tables">
          <Route index element={<TableOverview />} />
          <Route element={<TableLayout />}>
            <Route path=":id" element={<TableDetailPage />} />
            <Route path=":id/edit" element={<TableEdit />} />
          </Route>
        </Route>
        <Route path="management">
          <Route path="organizations" element={<OrganizationPage />} />
          <Route path="indicators" element={<IndicatorPage />} />
          <Route path="dimensions" element={<DimensionPage />} />
          <Route path="tables" element={<TablePage />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
);
