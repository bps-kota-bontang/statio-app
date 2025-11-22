import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";

import "@/style/index.css";

import StatioLayout from "@/component/layout/StatioLayout";
import Dashboard from "@/app/Dashboard";
import TablePage from "@/app/management/tables/TablePage";
import TableDetailPage from "@/app/tables/TableDetailPage";
import IndicatorPage from "@/app/management/indicators/IndicatorPage";
import DimensionPage from "@/app/management/dimensions/DimensionPage";
import TableOverviewPage from "@/app/tables/TableOverviewPage";
import OrganizationPage from "@/app/management/organizations/OrganizationPage";
import { AuthProvider } from "@/context/auth/AuthProvider";
import { ProtectedRoute } from "@/component/auth/ProtectedRoute";
import LoginPage from "@/app/auth/LoginPage";
import ManagementLayout from "@/component/layout/ManagementLayout";
import AnalysisLayout from "@/component/layout/AnalysisLayout";
import TableAnalysis from "@/app/analysis/TableAnalysisPage";
import TableDetailReviewPage from "@/app/analysis/TableDetailReviewPage";

const root = document.getElementById("root");

createRoot(root!).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <ProtectedRoute>
              <StatioLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="tables">
            <Route index element={<TableOverviewPage />} />
            <Route path=":id" element={<TableDetailPage />} />
          </Route>
          <Route path="analysis" element={<AnalysisLayout />}>
            <Route index element={<TableAnalysis />} />
            <Route path=":id" element={<TableDetailReviewPage />} />
          </Route>
          <Route path="management" element={<ManagementLayout />}>
            <Route path="organizations" element={<OrganizationPage />} />
            <Route path="indicators" element={<IndicatorPage />} />
            <Route path="dimensions" element={<DimensionPage />} />
            <Route path="tables" element={<TablePage />} />
          </Route>
        </Route>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
