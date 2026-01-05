import type { StatioContextType } from "@/component/layout/StatioLayout";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Link, Outlet, useOutletContext } from "react-router";
import { Table, CheckCircle, Clock, Award, AlertTriangle } from "lucide-react";
import { CURRENT_YEAR, DATES } from "@/constant/dates";
import { useDashboardApi } from "@/service/dashboard";

// Format dates dengan locale Indonesia
const formatDate = (date: Date) => {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const Dashboard = () => {
  const { setBreadcrumbs } = useOutletContext<StatioContextType>();
  const { user } = useAuth();

  useEffect(() => {
    setBreadcrumbs([{ label: "Dashboard" }]);
  }, [setBreadcrumbs]);

  // Check if user has admin role
  const isAdmin = user?.roles?.includes("admin") || false;

  // Fetch dashboard data
  const {
    useDashboardSummary,
    useOrganizationCompletion,
    useTopPerformers,
    useOrganizationsNeedAttention,
  } = useDashboardApi();
  const { data: dashboardData } = useDashboardSummary();
  const { data: orgCompletionResponse } = useOrganizationCompletion();
  const { data: topPerformersResponse } = useTopPerformers();
  const { data: orgsNeedAttentionResponse } = useOrganizationsNeedAttention();

  // Extract data from API responses
  const orgCompletionData = orgCompletionResponse?.data ?? [];
  const topPerformers = topPerformersResponse?.data ?? [];
  const orgsNeedAttention = orgsNeedAttentionResponse?.data ?? [];

  // Statistics cards
  const statistics = [
    {
      title: "Total Tabel",
      count: dashboardData?.data.total_tables ?? 0,
      icon: <Table className="h-8 w-8 text-blue-600" />,
      href: "/tables",
      description: "Jumlah tabel yang ditugaskan",
    },
    {
      title: "Selesai (Finalized)",
      count: dashboardData?.data.total_table_finalized ?? 0,
      icon: <CheckCircle className="h-8 w-8 text-green-600" />,
      href: "/tables",
      description: "Tabel yang sudah final",
    },
    {
      title: "Submitted (Review)",
      count: dashboardData?.data.total_table_submitted ?? 0,
      icon: <CheckCircle className="h-8 w-8 text-blue-600" />,
      href: "/tables",
      description: "Menunggu review admin",
    },
    {
      title: "Draft (Dikerjakan)",
      count: dashboardData?.data.total_table_draft ?? 0,
      icon: <Clock className="h-8 w-8 text-orange-600" />,
      href: "/tables",
      description: "Masih dalam pengisian",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard Pengumpulan Data Statistik {CURRENT_YEAR}
        </h1>
        <p className="text-gray-600">
          Periode pengumpulan data:{" "}
          <span className="font-semibold text-blue-600">
            {formatDate(DATES.collectionStart)} -{" "}
            {formatDate(DATES.collectionEnd)}
          </span>
        </p>
        <div className="mt-3 inline-flex items-center px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg">
          <Clock className="h-4 w-4 text-orange-600 mr-2" />
          <span className="text-sm text-orange-700">
            <span className="font-semibold">Deadline Perubahan Dimensi:</span>{" "}
            {formatDate(DATES.dimensionChangeDeadline)} •{" "}
            <span className="font-semibold">FGD:</span> {formatDate(DATES.fgd)}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {statistics.map((statistic) => (
          <Link
            key={statistic.title}
            to={statistic.href}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">
                  {statistic.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {statistic.count}
                </p>
                {statistic.description && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    {statistic.description}
                  </p>
                )}
              </div>
              <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                {statistic.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Performance Overview - Side by Side */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers - Podium Style */}
          <div className="bg-linear-to-br from-slate-50 to-blue-50 p-8 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-center mb-8">
              <Award className="h-6 w-6 text-yellow-500 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">
                Instansi Tercepat
              </h2>
            </div>

            {/* Podium */}
            <div className="flex items-end justify-center gap-4 mb-6">
              {topPerformers.length >= 2 && (
                /* Second Place */
                <div className="flex flex-col items-center">
                  <div className="relative mb-3">
                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-lg border-4 border-white">
                      <span className="text-2xl font-bold text-white">2</span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-7 h-7 bg-gray-400 rounded-full flex items-center justify-center shadow-md">
                      <Award className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="bg-linear-to-b from-gray-400 to-gray-500 rounded-t-lg px-4 py-6 w-28 shadow-lg">
                    <p className="text-center font-bold text-white text-xs mb-1">
                      {topPerformers[1].name}
                    </p>
                    <p className="text-center text-white text-xs opacity-90">
                      {topPerformers[1].avg_time}
                    </p>
                    <p className="text-center text-xl font-bold text-white mt-2">
                      {topPerformers[1].completion.toFixed(0)}%
                    </p>
                  </div>
                </div>
              )}

              {topPerformers.length >= 1 && (
                /* First Place */
                <div className="flex flex-col items-center">
                  <div className="relative mb-3">
                    <div className="w-28 h-28 rounded-full bg-linear-to-br from-yellow-300 to-yellow-600 flex items-center justify-center shadow-2xl border-4 border-white animate-pulse">
                      <span className="text-3xl font-bold text-white">1</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                      <Award className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="bg-linear-to-b from-yellow-400 to-yellow-600 rounded-t-lg px-4 py-10 w-32 shadow-2xl">
                    <p className="text-center font-bold text-white text-sm mb-1">
                      {topPerformers[0].name}
                    </p>
                    <p className="text-center text-white text-xs opacity-90">
                      {topPerformers[0].avg_time}
                    </p>
                    <p className="text-center text-2xl font-bold text-white mt-2">
                      {topPerformers[0].completion.toFixed(0)}%
                    </p>
                  </div>
                </div>
              )}

              {topPerformers.length >= 3 && (
                /* Third Place */
                <div className="flex flex-col items-center">
                  <div className="relative mb-3">
                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-orange-300 to-orange-600 flex items-center justify-center shadow-lg border-4 border-white">
                      <span className="text-2xl font-bold text-white">3</span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                      <Award className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="bg-linear-to-b from-orange-400 to-orange-600 rounded-t-lg px-4 py-4 w-28 shadow-lg">
                    <p className="text-center font-bold text-white text-xs mb-1">
                      {topPerformers[2].name}
                    </p>
                    <p className="text-center text-white text-xs opacity-90">
                      {topPerformers[2].avg_time}
                    </p>
                    <p className="text-center text-xl font-bold text-white mt-2">
                      {topPerformers[2].completion.toFixed(0)}%
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center mt-6 pt-6 border-t border-gray-300">
              <p className="text-sm text-gray-600 italic">
                Skor dinormalisasi berdasarkan kecepatan pengisian dan
                kelengkapan data
              </p>
            </div>
          </div>

          {/* Organizations Need Attention */}
          <div className="bg-linear-to-br from-red-50 to-orange-50 p-6 rounded-lg shadow-md border-2 border-red-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2 flex-1">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Instansi Perlu Perhatian
                  </h2>
                  <p className="text-sm text-gray-600">
                    Completion &lt;50% atau tidak ada aktivitas
                  </p>
                </div>
              </div>
              <div className="px-3 py-1 bg-red-100 rounded-full">
                <span className="text-sm font-bold text-red-700">
                  {orgsNeedAttention.length} Instansi
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orgsNeedAttention.map((org) => (
                <div
                  key={org.name}
                  className={`p-4 rounded-lg border-2 ${
                    org.status === "Kritis"
                      ? "bg-red-100 border-red-300"
                      : "bg-orange-100 border-orange-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{org.name}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                          org.status === "Kritis"
                            ? "bg-red-500 text-white"
                            : "bg-orange-500 text-white"
                        }`}
                      >
                        {org.status}
                      </span>
                      <p className="text-sm text-gray-600">
                        {org.tables} tabel ditugaskan
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {org.completion.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        Idle: <span className="font-bold">{org.days_idle}</span>{" "}
                        hari
                      </span>
                    </div>
                    <button className="px-3 py-1 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-xs font-medium">
                      Follow Up
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-white rounded-lg border border-red-200">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-red-600">Action:</span>{" "}
                Prioritaskan sosialisasi dan pendampingan untuk instansi dengan
                status <span className="font-semibold">Kritis</span> sebelum
                deadline {formatDate(DATES.collectionEnd)}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Completion Rate by Organization */}
      {isAdmin && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Keterisian Data per Instansi
          </h2>
          <div className="space-y-4">
            {orgCompletionData.map((org) => {
              // Determine color based on completion percentage
              const getColor = (completion: number) => {
                if (completion >= 80) return "bg-blue-500";
                if (completion >= 60) return "bg-green-500";
                if (completion >= 40) return "bg-purple-500";
                if (completion >= 30) return "bg-orange-500";
                return "bg-red-500";
              };

              return (
                <div key={org.name} className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700 flex-1">
                      {org.name}
                    </span>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-gray-500">
                        {org.tables} tabel
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {org.completion.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full ${getColor(
                        org.completion
                      )} rounded-full transition-all`}
                      style={{
                        width: `${org.completion}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Outlet />
    </div>
  );
};

export default Dashboard;
