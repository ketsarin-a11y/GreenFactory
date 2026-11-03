import { Info } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fmtDateTime } from "@/lib/time";
import { requireUser } from "@/server/auth/current-user";
import { getSystemSettings, settingsUpdatedBy } from "@/server/queries/platform/settings";
import { SettingsForm, type Settings } from "./_components/settings-form";

export default async function Page() {
  await requireUser("PLATFORM_ADMIN");
  const s = await getSystemSettings();
  const by = await settingsUpdatedBy(s.updatedBy);
  const values: Settings = {
    maintenanceMode: s.maintenanceMode,
    forceMfa: s.forceMfa,
    ipProtection: s.ipProtection,
    anomalyDetection: s.anomalyDetection,
    autoBlock: s.autoBlock,
    sessionTimeoutMinutes: s.sessionTimeoutMinutes,
    maxLoginAttempts: s.maxLoginAttempts,
    auditRetentionDays: s.auditRetentionDays,
    loginRetentionDays: s.loginRetentionDays,
    backupFrequency: s.backupFrequency,
    carbonAnalyticsEnabled: s.carbonAnalyticsEnabled,
    sensorMonitoringEnabled: s.sensorMonitoringEnabled,
    aiRecommendationsEnabled: s.aiRecommendationsEnabled,
    machineQrEnabled: s.machineQrEnabled,
    reportBuilderEnabled: s.reportBuilderEnabled,
  };

  return (
    <>
      <PageHeader title="ตั้งค่าระบบ" description={
          <>
            <span className="block">แก้ไขล่าสุด {fmtDateTime(s.updatedAt)}{by ? ` โดย ${by}` : ""}</span>
            <span className="block">ทุกการเปลี่ยนแปลงถูกบันทึกใน Audit Log</span>
          </>
        } />
      <Alert className="mb-6">
        <Info aria-hidden />
        <AlertTitle>ค่าเหล่านี้ถูกบันทึกแล้ว แต่บางส่วนยังไม่มีผลกับระบบ</AlertTitle>
        <AlertDescription>
          การเข้าสู่ระบบยังใช้ค่าคงที่ (ล็อก 15 นาทีหลังใส่รหัสผิด 5 ครั้ง) และยังไม่มีระบบ MFA หรือตัวตั้งเวลาสำรองข้อมูล ส่วนที่อ่านค่าเหล่านี้จะถูกเชื่อมในขั้นถัดไป
        </AlertDescription>
      </Alert>
      <SettingsForm initial={values} />
    </>
  );
}
