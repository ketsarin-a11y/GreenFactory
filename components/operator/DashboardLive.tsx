"use client";

import { useEffect, useRef, useState } from "react";

import type {
  RecentRecord,
  TodayTaskSummary,
} from "@/constants/dashboard";

import RecentRecords from "./RecentRecords";
import TodayTasks from "./TodayTasks";

interface DashboardLiveProps {
  initialSummary: TodayTaskSummary;
  initialRecords: RecentRecord[];
}

const REFRESH_INTERVAL_MS = 5000;

export default function DashboardLive({
  initialSummary,
  initialRecords,
}: DashboardLiveProps) {
  const [summary, setSummary] =
    useState(initialSummary);

  const [records, setRecords] =
    useState(initialRecords);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const requestInProgress =
    useRef(false);

  useEffect(() => {
    let active = true;

    async function refreshDashboard() {
      if (
        requestInProgress.current ||
        document.hidden
      ) {
        return;
      }

      requestInProgress.current = true;
      setIsRefreshing(true);

      try {
        const response = await fetch(
          "/api/operator/dashboard",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          return;
        }

        const payload =
          (await response.json()) as {
            success?: boolean;
            data?: {
              summary: TodayTaskSummary;
              records: RecentRecord[];
            };
          };

        if (
          active &&
          payload.success &&
          payload.data
        ) {
          setSummary(
            payload.data.summary,
          );

          setRecords(
            payload.data.records,
          );
        }
      } catch (error) {
        console.error(
          "Refresh operator dashboard error:",
          error,
        );
      } finally {
        requestInProgress.current =
          false;

        if (active) {
          setIsRefreshing(false);
        }
      }
    }

    const timer = window.setInterval(
      refreshDashboard,
      REFRESH_INTERVAL_MS,
    );

    function handleVisibilityChange() {
      if (!document.hidden) {
        void refreshDashboard();
      }
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      active = false;
      window.clearInterval(timer);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, []);

  return (
    <div className="relative">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)]">
        <TodayTasks
          summary={summary}
          isRefreshing={isRefreshing}
        />

        <RecentRecords
          records={records}
          isRefreshing={isRefreshing}
        />
      </div>
    </div>
  );
}