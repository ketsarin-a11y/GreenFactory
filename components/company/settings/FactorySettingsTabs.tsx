type TabItem = {
  id: string;
  label: string;
};

const tabs: TabItem[] = [
  { id: "general", label: "ข้อมูลโรงงาน" },
  { id: "resources", label: "การตั้งค่าระบบ" },
  { id: "reports", label: "หน่วยการวัด" },
  { id: "targets", label: "นโยบายและเป้าหมาย" },
  { id: "alerts", label: "การแจ้งเตือน" },
  { id: "security", label: "การเชื่อมต่อและสิทธิ์เพิ่มเติม" },
];

type Props = {
  activeTab: string;
  onChange: (tab: string) => void;
};

export default function FactorySettingsTabs({ activeTab, onChange }: Props) {
  return (
    <div className="overflow-x-auto border-b border-[#e4ece7] [scrollbar-width:none]">
      <div className="flex min-w-max gap-2">
        {tabs.map((tab) => {
          const active = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative min-h-[48px] px-4 text-[13px] font-bold transition ${
                active
                  ? "text-[#168253]"
                  : "text-[#6f7d74] hover:text-[#2d5d43]"
              }`}
            >
              {tab.label}
              {active && (
                <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-[#1d9b5f]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
