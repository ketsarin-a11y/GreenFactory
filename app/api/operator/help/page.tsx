import {
  CircleHelp,
  Mail,
  MessageCircle,
  QrCode,
  FileText,
  UserRound,
} from "lucide-react";

const HELP_ITEMS = [
  {
    title: "การบันทึกข้อมูล",
    description: "วิธีเลือกเครื่องจักร กรอกข้อมูล และบันทึกการใช้ทรัพยากร",
    icon: FileText,
  },
  {
    title: "การสแกน QR Code",
    description: "วิธีสแกน QR เพื่อระบุเครื่องจักรหรือจุดตรวจ",
    icon: QrCode,
  },
  {
    title: "บัญชีและโปรไฟล์",
    description: "การแก้ไขข้อมูลส่วนตัวและรูปโปรไฟล์",
    icon: UserRound,
  },
];

export default function OperatorHelpPage() {
  return (
    <div className="space-y-6 pb-10">
      <section className="rounded-[22px] border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <h1 className="text-[26px] font-black tracking-[-0.025em] text-slate-950">
          ศูนย์ช่วยเหลือ
        </h1>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {HELP_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Icon className="h-5 w-5" />
              </span>

              <h2 className="mt-4 font-bold text-slate-900">
                {item.title}
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                {item.description}
              </p>
            </div>
          );
        })}
      </section>

      <section className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CircleHelp className="h-5 w-5" />
          </span>

          <div>
            <h2 className="font-bold text-slate-900">
              ยังต้องการความช่วยเหลือ?
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              ติดต่อผู้ดูแลระบบหากพบปัญหาการใช้งานหรือข้อมูลผิดปกติ
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white"
              >
                <MessageCircle className="h-4 w-4" />
                ติดต่อผู้ดูแล
              </button>

              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700"
              >
                <Mail className="h-4 w-4" />
                แจ้งปัญหา
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}