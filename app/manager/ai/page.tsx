"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import GFayMascot, { type GFayState } from "@/components/manager/GFayMascot";
import {
  Plus,
  History,
  Copy,
  Leaf,
  MessageSquareText,
  ArrowRight,
  FileSpreadsheet,
  BarChart3,
  ImagePlus,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
  TrendingUp,
  X,
  Zap,
  Check,
  Heart,
  Smile,
  type LucideIcon,
} from "lucide-react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  imageUrl?: string;
  timestamp: string;
  followUpQuestions?: string[];
  isError?: boolean;
  notice?: string;
};

type AssistantResponse = {
  answer?: string;
  message?: string;
  provider?: string;
  model?: string;
  followUpQuestions?: string[];
  error?: string;
  notice?: string;
};

type PageContextPayload = {
  prompt?: string;
  pageContext?: Record<string, unknown>;
};

type ModeType = "general" | "energy" | "machine" | "report";

const MODES: { id: ModeType; label: string; icon: LucideIcon }[] = [
  { id: "general", label: "สนทนาทั่วไป", icon: Sparkles },
  { id: "energy", label: "พลังงาน & คาร์บอน", icon: TrendingUp },
  { id: "machine", label: "สถานะเครื่องจักร", icon: Zap },
  { id: "report", label: "สรุปรายงาน", icon: FileSpreadsheet },
];

type InterestTopic = "energy" | "carbon" | "machine" | "alert" | "report" | "overview";

const INTEREST_LABELS: Record<InterestTopic, string> = {
  energy: "พลังงาน",
  carbon: "คาร์บอน",
  machine: "เครื่องจักร",
  alert: "ความผิดปกติ",
  report: "รายงาน",
  overview: "ภาพรวมโรงงาน",
};

const TOPIC_PATTERNS: Record<InterestTopic, RegExp> = {
  energy: /ไฟฟ้า|พลังงาน|ค่าไฟ|ใช้ไฟ|ประหยัดไฟ|electric|energy|kwh|power/gi,
  carbon: /คาร์บอน|ปล่อยก๊าซ|เรือนกระจก|carbon|co2|emission|footprint/gi,
  machine: /เครื่องจักร|เครื่องไหน|เครื่องใด|เครื่องนี้|เครื่องตัว|เตา|reflow|burn.?in|machine|equipment|ซ่อม|บำรุง/gi,
  alert: /ผิดปกติ|แจ้งเตือน|เร่งด่วน|วิกฤต|เสี่ยง|alert|anomal|spike|critical|เกินเกณฑ์/gi,
  report: /รายงาน|ผู้บริหาร|นำเสนอ|สรุปผล|report|export/gi,
  overview: /ภาพรวม|สถานการณ์|สุขภาพโรงงาน|ทรัพยากร|overview|resource|ทั้งหมด/gi,
};

const QUESTION_POOL: Record<InterestTopic, string[]> = {
  energy: [
    "วันนี้โรงงานใช้ไฟฟ้าเท่าไร?",
    "การใช้ไฟฟ้า 7 วันที่ผ่านมาเปลี่ยนไปอย่างไร?",
    "เครื่องจักรไหนใช้ไฟฟ้าสูงสุดในเดือนนี้?",
    "เปรียบเทียบการใช้ไฟฟ้าสัปดาห์นี้กับสัปดาห์ก่อน",
    "แนวโน้มการใช้พลังงาน 30 วันเป็นอย่างไร?",
    "ถ้าลดการใช้ไฟฟ้า 10% จะลดคาร์บอนได้เท่าไร?",
    "มีข้อมูลไหนบ่งชี้ว่าการใช้ไฟฟ้าเพิ่มผิดปกติบ้าง?",
  ],
  carbon: [
    "เดือนนี้โรงงานปล่อยคาร์บอนเท่าไร?",
    "ทรัพยากรประเภทไหนสร้างคาร์บอนมากที่สุด?",
    "คาร์บอน 7 วันที่ผ่านมาเพิ่มขึ้นหรือลดลง?",
    "เครื่องจักรไหนมีส่วนต่อคาร์บอนสูงที่สุด?",
    "เปรียบเทียบคาร์บอนเดือนนี้กับเดือนก่อน",
    "ควรเริ่มลดคาร์บอนจากส่วนไหนตามข้อมูลที่มี?",
    "ถ้าลดการใช้ไฟฟ้า 10% จะลดคาร์บอนได้เท่าไร?",
  ],
  machine: [
    "เครื่องจักรไหนใช้พลังงานสูงสุดใน 7 วันที่ผ่านมา?",
    "มีเครื่องจักรไหนพบ Alert ที่ยังไม่ปิดบ้าง?",
    "ช่วยเปรียบเทียบการใช้พลังงานของเครื่องจักรในเดือนนี้",
    "เครื่องจักรไหนมีแนวโน้มใช้ไฟฟ้าเพิ่มขึ้น?",
    "เครื่องจักรที่มีข้อมูลการใช้ทรัพยากรล่าสุดคือเครื่องไหน?",
    "เครื่องจักรไหนควรตรวจสอบก่อนจากข้อมูลที่มี?",
    "เครื่องจักรใช้ทรัพยากรประเภทใดมากที่สุด?",
  ],
  alert: [
    "มี Alert ที่ยังไม่ปิดอยู่กี่รายการ?",
    "แจ้งเตือนระดับ CRITICAL มีเรื่องอะไรบ้าง?",
    "เครื่องจักรไหนมีการใช้ทรัพยากรผิดปกติ?",
    "ช่วยจัดลำดับ Alert ที่ควรตรวจสอบก่อน",
    "ค่าที่พบผิดปกติต่างจากเกณฑ์เท่าไร?",
    "สรุปความผิดปกติใน 7 วันที่ผ่านมา",
    "จาก Alert ที่มี ควรตรวจสอบข้อมูลส่วนไหนต่อ?",
  ],
  report: [
    "สรุปพลังงานและคาร์บอนเดือนนี้ให้หน่อย",
    "ช่วยสรุปประเด็นสำคัญสำหรับผู้บริหาร",
    "สรุป Alert และสิ่งที่ควรตรวจสอบในสัปดาห์นี้",
    "เปรียบเทียบผลการใช้ทรัพยากรเดือนนี้กับเดือนก่อน",
    "ช่วยสรุปแนวโน้มพลังงาน 30 วันเป็นข้อความสั้น",
    "ข้อมูลส่วนไหนยังไม่ครบสำหรับสรุปรายงาน?",
  ],
  overview: [
    "สรุปสถานการณ์โรงงานจากข้อมูลล่าสุดให้หน่อย",
    "มีประเด็นไหนที่ควรตรวจสอบก่อนบ้าง?",
    "โรงงานใช้ทรัพยากรประเภทไหนมากที่สุด?",
    "มีเครื่องจักร ACTIVE ทั้งหมดกี่เครื่อง?",
    "ช่วยสรุปพลังงาน คาร์บอน และ Alert ช่วง 7 วันที่ผ่านมา",
    "ข้อมูลโรงงานล่าสุดครอบคลุมถึงวันไหน?",
  ],
};

function normalizeQuestion(value: string) {
  return value.toLowerCase().replace(/[\s?!？。ฯ]+/g, "").trim();
}

function detectInterests(userTexts: string[], mode: ModeType): InterestTopic[] {
  const topics = Object.keys(QUESTION_POOL) as InterestTopic[];
  const scores = Object.fromEntries(topics.map((topic) => [topic, 0])) as Record<InterestTopic, number>;
  const recent = userTexts.slice(-8);

  recent.forEach((value, index) => {
    const age = recent.length - 1 - index;
    topics.forEach((topic) => {
      const matches = value.match(TOPIC_PATTERNS[topic])?.length ?? 0;
      scores[topic] += Math.min(matches, 2) * (age === 0 ? 20 : 4 / (age + 1));
    });
  });

  if (!recent.length) {
    if (mode === "energy") return ["energy", "carbon"];
    if (mode === "machine") return ["machine", "alert"];
    if (mode === "report") return ["report", "overview"];
    return [];
  }

  const ranked = topics.filter((topic) => scores[topic] > 0).sort((a, b) => scores[b] - scores[a]);
  return ranked.length ? ranked.slice(0, 2) : ["overview"];
}

function shuffleQuestions(values: string[], random: () => number = Math.random) {
  const result = [...new Set(values)];
  for (let index = result.length - 1; index > 0; index--) {
    const selected = Math.floor(random() * (index + 1));
    [result[index], result[selected]] = [result[selected], result[index]];
  }
  return result;
}

function buildSuggestions(
  userTexts: string[],
  mode: ModeType,
  apiQuestions: string[],
  previous: string[],
  random: () => number = Math.random
) {
  const interests = detectInterests(userTexts, mode);
  const asked = new Set(userTexts.map(normalizeQuestion));
  const recentShown = new Set(previous.map(normalizeQuestion));
  const result: string[] = [];

  const append = (values: string[], maximum: number, avoidRecent = true) => {
    if (result.length >= maximum) return;
    for (const question of shuffleQuestions(values, random)) {
      const key = normalizeQuestion(question);
      if (!key || asked.has(key) || (avoidRecent && recentShown.has(key)) || result.some((item) => normalizeQuestion(item) === key)) continue;
      result.push(question);
      if (result.length >= maximum) break;
    }
  };

  const validAPI = apiQuestions.filter((question) => typeof question === "string" && question.trim().length > 0 && question.length <= 220);
  append(validAPI, 2);

  const primary = interests[0];
  const primaryPool = primary ? QUESTION_POOL[primary] : Object.values(QUESTION_POOL).flat();
  append(primaryPool, result.length === 2 ? 3 : 2);

  const secondaryPool = interests[1] ? QUESTION_POOL[interests[1]] : primaryPool;
  append(secondaryPool, 3);

  if (result.length < 3) append([...validAPI, ...primaryPool, ...secondaryPool], 3, false);
  return { questions: result.slice(0, 3), interests };
}

type ConversationSummary = { id: string; title: string; updatedAt: string; count: number };

export default function ManagerAIPage() {
  const [conversationId, setConversationId] = useState("");
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyBusy, setHistoryBusy] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [historyReady, setHistoryReady] = useState(false);
  const [historyNotice, setHistoryNotice] = useState("กำลังโหลดประวัติ...");

  const historyQueueRef = useRef<Promise<void>>(Promise.resolve());
  const historyLoadedRef = useRef(false);

  const [motionEnabled, setMotionEnabled] = useState(true);
  const [activeMode, setActiveMode] = useState<ModeType>("general");
  const [gFayState, setGFayState] = useState<GFayState>("friendly");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "สวัสดีค่ะคุณผู้จัดการ! ✨ ฉันคือ G-Fay (จีเฟย์) พร้อมดูแลและวิเคราะห์ข้อมูลโรงงานให้คุณแล้วค่ะ\nวันนี้มีเรื่องพลังงาน เครื่องจักร หรือรายงานอะไรให้ G-Fay ช่วยดูไหมคะ?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    QUESTION_POOL.overview[0],
    QUESTION_POOL.energy[0],
    QUESTION_POOL.machine[0],
  ]);
  const [interestTopics, setInterestTopics] = useState<InterestTopic[]>([]);
  const [suggestionRefresh, setSuggestionRefresh] = useState(0);
  const previousSuggestionsRef = useRef<string[]>([]);

  useEffect(() => {
    const users = messages.filter((item) => item.role === "user");
    const lastMessage = messages[messages.length - 1];
    const followUps = lastMessage?.role === "assistant" && !lastMessage.isError ? lastMessage.followUpQuestions ?? [] : [];
    const next = buildSuggestions(users.map((item) => item.text), activeMode, followUps, previousSuggestionsRef.current);
    previousSuggestionsRef.current = next.questions;
    setSuggestedQuestions(next.questions);
    setInterestTopics(next.interests);
  }, [messages, activeMode, suggestionRefresh]);

  const [input, setInput] = useState("");
  const [image, setImage] = useState<{
    data: string;
    mimeType: string;
    name: string;
    previewUrl: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pageContext, setPageContext] = useState<Record<string, unknown> | null>(null);

  const autoContextHandledRef = useRef(false);
  const sendingRef = useRef(false);
  const previewUrlsRef = useRef(new Set<string>());

  useEffect(() => () => {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current.clear();
  }, []);

  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const stickToBottomRef = useRef(true);
  const [panelHeight, setPanelHeight] = useState<number | null>(null);

  useEffect(() => {
    const resizePanel = () => {
      const element = mainRef.current;
      if (!element) return;
      const documentTop = element.getBoundingClientRect().top + window.scrollY;
      setPanelHeight(Math.max(280, Math.min(840, window.innerHeight - documentTop - 20)));
    };
    window.scrollTo({ top: 0, behavior: "instant" });
    resizePanel();
    const frame = requestAnimationFrame(resizePanel);
    window.addEventListener("resize", resizePanel);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resizePanel);
    };
  }, []);

  useEffect(() => {
    const element = chatScrollRef.current;
    if (element && stickToBottomRef.current) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (!historyReady) return;
    if (autoContextHandledRef.current) return;
    autoContextHandledRef.current = true;
    const raw = sessionStorage.getItem("greenfactory-ai-context");
    if (!raw) return;
    sessionStorage.removeItem("greenfactory-ai-context");
    try {
      const payload = JSON.parse(raw) as PageContextPayload;
      const context = payload.pageContext ?? null;
      setPageContext(context);
      const metric = String(context?.metric ?? "");
      if (metric === "electricity" || metric === "carbon") {
        setActiveMode("energy");
      } else if (metric === "machines" || metric === "anomaly") {
        setActiveMode("machine");
      }
      if (payload.prompt?.trim()) {
        window.setTimeout(() => {
          void sendMessage(payload.prompt!.trim(), null, context);
        }, 80);
      }
    } catch (error) {
      console.error("Invalid AI page context:", error);
    }
  }, [historyReady]);

  useEffect(() => {
    let cancelled = false;
    async function restore() {
      try {
        const response = await fetch("/api/manager/assistant/history", { credentials: "include", cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "โหลดประวัติไม่สำเร็จ");
        if (cancelled) return;
        setConversationId(data.conversationId || crypto.randomUUID());
        setConversations(data.conversations || []);
        if (Array.isArray(data.messages) && data.messages.length) {
          messagesRef.current = data.messages;
          setMessages(data.messages);
          setGFayState("idle");
        }
        if (MODES.some((item) => item.id === data.mode)) setActiveMode(data.mode);
        historyLoadedRef.current = true;
        setHistoryNotice("พร้อมใช้งาน · ระบบเชื่อมต่อเรียบร้อย");
      } catch (error) {
        if (!cancelled) setHistoryNotice(error instanceof Error ? error.message : "โหลดประวัติไม่สำเร็จ");
      } finally {
        if (!cancelled) setHistoryReady(true);
      }
    }
    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!historyReady || !historyLoadedRef.current || !conversationId) return;
    const snapshot = messages.filter((item) => !item.id.startsWith("welcome")).map(({ imageUrl, ...item }) => item);
    const payload = JSON.stringify({ messages: snapshot, mode: activeMode, conversationId });
    const timer = window.setTimeout(() => {
      setHistoryNotice("กำลังบันทึก...");
      historyQueueRef.current = historyQueueRef.current.then(async () => {
        try {
          const response = await fetch("/api/manager/assistant/history", {
            method: "PUT",
            credentials: "include",
            keepalive: payload.length < 50000,
            headers: { "Content-Type": "application/json" },
            body: payload,
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || "บันทึกประวัติไม่สำเร็จ");
          setConversations(data.conversations || []);
          setHistoryNotice("บันทึกแล้วเรียบร้อย 🌱");
        } catch (error) {
          setHistoryNotice(error instanceof Error ? error.message : "บันทึกประวัติไม่สำเร็จ");
        }
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [messages, activeMode, historyReady, conversationId]);

  const canSend = useMemo(
    () => historyReady && !historyBusy && !loading && (input.trim().length > 0 || image !== null),
    [input, image, loading, historyReady, historyBusy]
  );

  function scrollToBottom() {
    requestAnimationFrame(() => {
      const element = chatScrollRef.current;
      if (!element || !stickToBottomRef.current) return;
      element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
    });
  }

  async function fileToBase64(file: File) {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result ?? "");
        const commaIndex = result.indexOf(",");
        resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async function handleImageChange(file?: File) {
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("รองรับเฉพาะไฟล์รูปภาพ JPG, PNG และ WebP นะคะ");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert("รูปภาพต้องมีขนาดไม่เกิน 8 MB นะคะ");
      return;
    }
    const data = await fileToBase64(file);
    const previewUrl = URL.createObjectURL(file);
    previewUrlsRef.current.add(previewUrl);
    setImage((previous) => {
      if (previous?.previewUrl) {
        URL.revokeObjectURL(previous.previewUrl);
        previewUrlsRef.current.delete(previous.previewUrl);
      }
      return { data, mimeType: file.type, name: file.name, previewUrl };
    });
  }

  async function sendMessage(rawMessage?: string, selectedImage = image, explicitContext = pageContext) {
    const message = (rawMessage ?? input).trim();
    if (!message && !selectedImage) return;
    if (!historyReady || historyBusy || sendingRef.current) return;

    sendingRef.current = true;
    stickToBottomRef.current = true;
    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: message || "ช่วยวิเคราะห์รูปนี้ให้หน่อยค่ะ",
      imageUrl: selectedImage?.previewUrl,
      notice: selectedImage ? `รูปแนบ: ${selectedImage.name}` : undefined,
      timestamp: timeString,
    };

    const history = messagesRef.current
      .filter((item) => item.id !== "welcome" && !item.id.startsWith("welcome-") && !item.isError)
      .slice(-6)
      .map((item) => ({ role: item.role, content: item.text.slice(0, 700) }));

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setImage(null);
    setLoading(true);
    setGFayState("thinking");
    scrollToBottom();

    try {
      const response = await fetch("/api/manager/assistant", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: activeMode,
          history,
          message: message || "ช่วยวิเคราะห์รูปนี้ให้หน่อยค่ะ",
          image: selectedImage
            ? {
                data: selectedImage.data,
                mimeType: selectedImage.mimeType,
                name: selectedImage.name,
              }
            : undefined,
          pageContext: explicitContext ?? undefined,
        }),
      });

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        const raw = await response.text();
        throw new Error(raw?.slice(0, 180) || `Assistant API ตอบกลับผิดรูปแบบ (${response.status})`);
      }

      const data = (await response.json()) as AssistantResponse;
      setGFayState("analyzing");

      if (!response.ok) {
        throw new Error(data.error || data.message || "ไม่สามารถติดต่อผู้ช่วยได้ในขณะนี้");
      }

      const finalAnswer = data.answer || data.message || "ได้รับข้อมูลเรียบร้อยค่ะ ✨";
      const normalizedAnswer = finalAnswer.toLowerCase();

      if (/critical|high|alert|anomal|ผิดปกติ|แจ้งเตือน|วิกฤต|เร่งด่วน/.test(normalizedAnswer)) {
        setGFayState("alert");
      } else if (/แนะนำ|ควร|recommend|ปรับปรุง|ลดการใช้|แนวทาง/.test(normalizedAnswer)) {
        setGFayState("recommend");
      } else {
        setGFayState("success");
      }

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: finalAnswer,
          notice: data.notice,
          followUpQuestions: Array.isArray(data.followUpQuestions)
            ? data.followUpQuestions.filter((q): q is string => typeof q === "string" && q.trim().length > 0).slice(0, 3)
            : [],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการเชื่อมต่อ AI";
      setGFayState("alert");
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          text: `ขออภัยค่ะ G-Fay ไม่สามารถดึงข้อมูลได้ในขณะนี้ 🥺\n\n${errMessage}`,
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      sendingRef.current = false;
      setLoading(false);
      scrollToBottom();
    }
  }

  async function handleCopy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(null);
    }
  }

  async function saveBeforeSwitch() {
    if (!historyLoadedRef.current) throw new Error("กรุณารีเฟรชเพื่อโหลดประวัติก่อน");
    await historyQueueRef.current;
    const snapshot = messagesRef.current.filter((item) => !item.id.startsWith("welcome")).map(({ imageUrl, ...item }) => item);
    const response = await fetch("/api/manager/assistant/history", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: snapshot, mode: activeMode, conversationId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "บันทึกไม่สำเร็จ จึงยังไม่เปลี่ยนแชท");
    setConversations(data.conversations || []);
  }

  async function openConversation(id: string) {
    if (loading || historyBusy) return;
    setHistoryBusy(true);
    try {
      await saveBeforeSwitch();
      const response = await fetch(`/api/manager/assistant/history?id=${encodeURIComponent(id)}`, {
        credentials: "include",
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "เปิดประวัติไม่สำเร็จ");
      setConversationId(data.conversationId);
      messagesRef.current = data.messages;
      setMessages(data.messages);
      setActiveMode(data.mode);
      setConversations(data.conversations || []);
      setPageContext(null);
      setInput("");
      setImage(null);
      setGFayState("idle");
      stickToBottomRef.current = true;
      setHistoryOpen(false);
    } catch (error) {
      setHistoryNotice(error instanceof Error ? error.message : "เปิดประวัติไม่สำเร็จ");
    } finally {
      setHistoryBusy(false);
    }
  }

  async function handleResetChat() {
    if (!historyReady || historyBusy || sendingRef.current) return;
    setHistoryBusy(true);
    try {
      await saveBeforeSwitch();
    } catch (error) {
      setHistoryNotice(error instanceof Error ? error.message : "บันทึกไม่สำเร็จ จึงยังไม่เริ่มแชทใหม่");
      setHistoryBusy(false);
      return;
    }
    setConversationId(crypto.randomUUID());
    setHistoryOpen(false);
    messagesRef.current = [];
    setHistoryBusy(false);
    setPageContext(null);
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current.clear();
    if (fileInputRef.current) fileInputRef.current.value = "";
    setGFayState("friendly");
    setInput("");
    setImage(null);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        text: "เริ่มบทสนทนาใหม่แล้วค่ะ 🍃 มีเรื่องไหนที่อยากให้ G-Fay ช่วยวิเคราะห์ต่อไหมคะ?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void sendMessage();
  }

  const activeModeConfig = MODES.find((mode) => mode.id === activeMode) ?? MODES[0];
  const hasConversation = messages.some((item) => item.role === "user");
  const latestAssistantId = [...messages].reverse().find((item) => item.role === "assistant" && !item.isError)?.id;
  const visibleMessages = messages.filter((item) => item.id !== "welcome" && !item.id.startsWith("welcome-"));

  return (
    <main
      ref={mainRef}
      style={panelHeight === null ? undefined : { height: panelHeight }}
      className={`gf-page ${motionEnabled ? "" : "gf-still"}`}
    >
      {/* Background Sweet Glow Dots */}
      <div aria-hidden="true" className="gf-glow gf-glow-1" />
      <div aria-hidden="true" className="gf-glow gf-glow-2" />

      <div className="gf-layout">
        {/* Left Sidebar Cute Navigation */}
        <aside className="gf-brand">
          <div className="gf-mascot-card">
            <button
              type="button"
              className="gf-hero"
              aria-label="ทักทาย G-Fay"
              disabled={loading || historyBusy || !historyReady}
              onClick={() => setGFayState("friendly")}
            >
              <div className="gf-hero-aura" />
              <span className="gf-sparkle s-1">✨</span>
              <span className="gf-sparkle s-2">🌸</span>
              <div className="gf-hero-character">
                <GFayMascot state={gFayState} size="hero" />
              </div>
            </button>
            <div className="gf-brand-title">
              <h1>G-Fay</h1>
              <p className="gf-status-badge">
                <span className="gf-online-dot" />
                {loading ? "กำลังวิเคราะห์..." : "พร้อมช่วยเหลือค่ะ"}
              </p>
            </div>
          </div>

          <nav className="gf-navigation" aria-label="หัวข้อผู้ช่วย">
            {MODES.map((mode) => {
              const Icon = mode.id === "general" ? MessageSquareText : mode.icon;
              return (
                <button
                  type="button"
                  key={mode.id}
                  disabled={loading || historyBusy || !historyReady}
                  onClick={() => setActiveMode(mode.id)}
                  aria-pressed={mode.id === activeMode}
                  className={mode.id === activeMode ? "selected" : ""}
                >
                  <span className="gf-nav-icon">
                    <Icon size={16} />
                  </span>
                  <span className="gf-nav-text">{mode.id === "general" ? "แชททั่วไป" : mode.label}</span>
                </button>
              );
            })}
            <Link href="/manager/overview" className="gf-nav-link">
              <span className="gf-nav-icon">
                <BarChart3 size={16} />
              </span>
              <span className="gf-nav-text">แดชบอร์ดโรงงาน</span>
              <ArrowRight size={14} className="gf-arrow-icon" />
            </Link>
          </nav>
        </aside>

        {/* Main Cute Chat Panel */}
        <section className="gf-chat-panel" aria-label="แชทกับ G-Fay">
          {/* Top Cute Header */}
          <header className="gf-chat-header">
            <div className="gf-chat-identity">
              <div className="gf-header-avatar">
                <GFayMascot state={gFayState} size="sm" />
              </div>
              <div className="gf-header-text">
                <div className="gf-title-row">
                  <strong>G-Fay AI</strong>
                  <span className="gf-ai-tag">Assistant</span>
                </div>
                <p>ผู้ช่วยวิเคราะห์ข้อมูลพลังงานและโรงงานอัจฉริยะ</p>
              </div>
            </div>

            <div className="gf-header-actions">
              <button
                type="button"
                onClick={() => setMotionEnabled((value) => !value)}
                aria-pressed={motionEnabled}
                aria-label={motionEnabled ? "ปิดแอนิเมชัน" : "เปิดแอนิเมชัน"}
                title={motionEnabled ? "ปิดแอนิเมชัน" : "เปิดแอนิเมชัน"}
              >
                <Sparkles size={16} />
              </button>
              <button
                type="button"
                onClick={() => setHistoryOpen((value) => !value)}
                disabled={loading || historyBusy || !historyReady}
                aria-label="ดูประวัติแชท"
                title="ประวัติแชท"
              >
                <History size={16} />
              </button>
              <button
                type="button"
                className="gf-new-chat"
                onClick={() => void handleResetChat()}
                disabled={loading || historyBusy || !historyReady}
                aria-label="เริ่มแชทใหม่"
                title="เริ่มแชทใหม่"
              >
                <Plus size={16} />
                <span>แชทใหม่</span>
              </button>
            </div>
          </header>

          {/* History Drawer Modal */}
          {historyOpen && (
            <div className="gf-history-panel" aria-label="ประวัติแชท">
              <div className="gf-history-heading">
                <strong>ประวัติการสนทนา 💬</strong>
                <button type="button" onClick={() => setHistoryOpen(false)} aria-label="ปิดประวัติ">
                  <X size={18} />
                </button>
              </div>
              <input
                aria-label="ค้นหาประวัติจากชื่อ"
                placeholder="ค้นหาหัวข้อที่เคยคุย..."
                value={historySearch}
                onChange={(event) => setHistorySearch(event.target.value)}
              />
              <div className="gf-history-list">
                {conversations
                  .filter((item) => item.title.toLowerCase().includes(historySearch.toLowerCase()))
                  .map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      disabled={historyBusy || loading}
                      onClick={() => void openConversation(item.id)}
                      aria-current={item.id === conversationId ? "true" : undefined}
                    >
                      <strong>{item.title}</strong>
                      <span>
                        {new Date(item.updatedAt).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })} · {item.count} ข้อความ
                      </span>
                    </button>
                  ))}
                {!conversations.length && <p className="gf-empty-history">ยังไม่มีบทสนทนาที่บันทึกไว้ค่ะ</p>}
              </div>
            </div>
          )}

          {/* Mobile Selector */}
          <div className="gf-mobile-modes">
            <select
              aria-label="หัวข้อสนทนา"
              value={activeMode}
              disabled={loading || historyBusy || !historyReady}
              onChange={(event) => setActiveMode(event.target.value as ModeType)}
            >
              {MODES.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>

          {/* Chat Stream Viewport */}
          <div
            ref={chatScrollRef}
            onScroll={() => {
              const element = chatScrollRef.current;
              if (element) {
                stickToBottomRef.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
              }
            }}
            className="gf-transcript"
            role="log"
            aria-live="polite"
            aria-label="บทสนทนา"
          >
            {!hasConversation ? (
              <div className="gf-welcome">
                <div className="gf-welcome-icon">
                  <Smile size={32} />
                </div>
                <h2>
                  สวัสดีค่ะ! มีเรื่องไหนให้ <br />
                  <em>G-Fay ช่วยดูวันนี้คะ? ✨</em>
                </h2>
                <p>
                  ถามเกี่ยวกับพลังงาน คาร์บอน สถานะเครื่องจักร <br />
                  หรือกดเลือกคำถามแนะนำด้านล่างได้เลยค่ะ
                </p>
              </div>
            ) : (
              <div className="gf-messages">
                {visibleMessages.map((message) => (
                  <article key={message.id} className={`gf-message ${message.role === "user" ? "user" : "assistant"}`}>
                    {message.role === "assistant" && (
                      <div className="gf-message-avatar">
                        <GFayMascot state={message.id === latestAssistantId ? gFayState : "idle"} size="sm" />
                      </div>
                    )}
                    <div className="gf-message-content">
                      {message.role === "assistant" && (
                        <div className="gf-message-meta">
                          <strong>G-Fay</strong>
                          <span>{message.timestamp}</span>
                        </div>
                      )}
                      <div className={`gf-bubble ${message.isError ? "error" : ""}`}>
                        {message.imageUrl && <img src={message.imageUrl} alt="รูปประกอบคำถาม" className="gf-message-image" />}
                        <div className="gf-answer">{message.text}</div>
                        {message.notice && <p className="gf-notice">{message.notice}</p>}
                      </div>
                      {message.role === "user" ? (
                        <span className="gf-user-time">{message.timestamp}</span>
                      ) : (
                        <button className="gf-copy" type="button" onClick={() => void handleCopy(message.text, message.id)}>
                          {copiedId === message.id ? (
                            <>
                              <Check size={13} className="text-emerald-500" />
                              <span className="text-emerald-600 font-medium">คัดลอกเรียบร้อย!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              <span>คัดลอกข้อความ</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </article>
                ))}

                {loading && (
                  <div className="gf-thinking">
                    <div className="gf-thinking-avatar">
                      <GFayMascot state="thinking" size="sm" />
                    </div>
                    <div className="gf-thinking-bubble">
                      <span>
                        <Loader2 size={15} className="animate-spin text-emerald-500" /> G-Fay กำลังคิดแป๊บนึงนะคะ...
                      </span>
                      <div className="gf-thinking-dots">
                        <i />
                        <i />
                        <i />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Interactive Area */}
          <div className="gf-chat-bottom">
            {/* Prompt Strip Title */}
            <div className="gf-prompt-label">
              <Sparkles size={14} className="text-amber-500" />
              <span>{interestTopics.length ? `คำถามที่น่าสนใจเกี่ยวกับ${INTEREST_LABELS[interestTopics[0]]}` : "คำถามแนะนำ"}</span>
              <button
                type="button"
                className="gf-refresh-suggestions"
                disabled={loading || historyBusy || !historyReady}
                onClick={() => setSuggestionRefresh((value) => value + 1)}
                aria-label="สุ่มคำถามแนะนำใหม่"
                title="สุ่มคำถามใหม่"
              >
                <RefreshCw size={13} />
              </button>
            </div>

            {/* Prompt Horizontal Chips */}
            <div className="gf-prompt-strip" aria-label="คำถามแนะนำ">
              {suggestedQuestions.map((question, index) => (
                <button
                  type="button"
                  key={question}
                  disabled={loading || historyBusy || !historyReady}
                  onClick={() => void sendMessage(question, null)}
                >
                  <span className={`gf-chip-icon c-${index}`}>
                    <Sparkles size={13} />
                  </span>
                  <span className="gf-prompt-text">{question}</span>
                </button>
              ))}
            </div>

            {/* Pill-Shaped Composer Box */}
            <form onSubmit={handleSubmit} className="gf-composer">
              {image && (
                <div className="gf-image-preview">
                  <img src={image.previewUrl} alt={image.name} />
                  <span>{image.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(image.previewUrl);
                      previewUrlsRef.current.delete(image.previewUrl);
                      setImage(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    aria-label="นำรูปออก"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => void handleImageChange(event.target.files?.[0])}
              />

              <div className="gf-composer-row">
                <button
                  type="button"
                  disabled={loading || historyBusy || !historyReady}
                  className="gf-attach"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="แนบรูปภาพ"
                  title="แนบรูปภาพ"
                >
                  <ImagePlus size={19} />
                </button>
                <textarea
                  aria-label="คำถามถึง G-Fay"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  rows={1}
                  placeholder={image ? "ถามเกี่ยวกับรูปภาพนี้..." : "พิมพ์คำถามหา G-Fay ได้เลยค่ะ..."}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                      event.preventDefault();
                      if (canSend) void sendMessage();
                    }
                  }}
                />
                <button type="submit" className="gf-send" disabled={!canSend} aria-label="ส่งข้อความ" title="ส่งข้อความ">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </form>

            <footer className="gf-composer-footer">
              <span className="gf-topic">
                <Heart size={12} className="text-pink-400" /> Mode: {activeModeConfig.label}
              </span>
              <span role="status">{historyNotice}</span>
            </footer>
          </div>
        </section>
      </div>

      {/* Cute & Soft Style JSX */}
      <style jsx>{`
        .gf-page {
          position: relative;
          height: calc(100dvh - 120px);
          overflow: hidden;
          padding: 16px;
          background: linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 50%, #fef2f2 100%);
          color: #2d3748;
          font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
        }

        .gf-layout {
          box-sizing: border-box;
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 230px minmax(0, 1fr);
          gap: 18px;
          height: 100%;
          max-width: 1280px;
          margin: 0 auto;
          min-height: 0;
        }

        /* Sidebar Cute Branding */
        .gf-brand {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .gf-mascot-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border: 2px solid rgba(255, 255, 255, 0.9);
          border-radius: 28px;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 10px 25px rgba(167, 243, 208, 0.2);
        }

        .gf-hero {
          position: relative;
          width: 100%;
          height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0;
          background: none;
          cursor: pointer;
        }

        .gf-hero-aura {
          position: absolute;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: radial-gradient(circle, #bbf7d0 0%, #fef08a 60%, transparent 80%);
          filter: blur(10px);
          animation: float-aura 4s infinite ease-in-out;
        }

        .gf-hero-character {
          position: absolute;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 280px;
          height: 280px;
          left: 50%;
          top: 50%;
          margin-left: -140px;
          margin-top: -140px;
          transform: scale(0.6);
          pointer-events: none;
        }

        .gf-sparkle {
          position: absolute;
          font-size: 16px;
        }
        .s-1 {
          top: 10px;
          left: 15px;
          animation: bounce-soft 2s infinite ease-in-out;
        }
        .s-2 {
          bottom: 15px;
          right: 15px;
          animation: bounce-soft 2.5s infinite ease-in-out 0.5s;
        }

        .gf-brand-title {
          text-align: center;
          margin-top: 4px;
        }
        .gf-brand-title h1 {
          font-size: 24px;
          font-weight: 800;
          color: #15803d;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .gf-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #166534;
          background: #dcfce7;
          padding: 3px 10px;
          border-radius: 12px;
          margin: 4px 0 0;
          font-weight: 600;
        }
        .gf-online-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 2px #bbf7d0;
        }

        /* Navigation Menu */
        .gf-navigation {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          padding: 8px;
          border-radius: 24px;
          border: 1.5px solid rgba(255, 255, 255, 0.8);
        }

        .gf-navigation button,
        .gf-navigation :global(.gf-nav-link) {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 18px;
          color: #4b5563;
          font-size: 13.5px;
          font-weight: 600;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .gf-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 12px;
          background: #ffffff;
          color: #6b7280;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        }

        .gf-navigation .selected {
          background: #ffffff;
          color: #15803d;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);
        }
        .gf-navigation .selected .gf-nav-icon {
          background: #22c55e;
          color: white;
        }

        .gf-navigation button:hover:not(.selected),
        .gf-navigation :global(.gf-nav-link:hover) {
          background: rgba(255, 255, 255, 0.8);
          color: #111827;
        }
        .gf-arrow-icon {
          margin-left: auto;
          color: #9ca3af;
        }

        /* Main Chat Area */
        .gf-chat-panel {
          position: relative;
          display: flex;
          flex-direction: column;
          min-width: 0;
          min-height: 0;
          overflow: hidden;
          border: 2px solid rgba(255, 255, 255, 0.9);
          border-radius: 32px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(16px);
          box-shadow: 0 20px 40px rgba(31, 41, 55, 0.05);
        }

        /* Top Header Bar */
        .gf-chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 22px;
          background: rgba(255, 255, 255, 0.9);
          border-bottom: 1.5px solid #f3f4f6;
        }

        .gf-chat-identity {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .gf-header-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #f0fdf4;
          border: 2px solid #bbf7d0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .gf-header-avatar :global(> div) {
          transform: scale(0.5);
        }

        .gf-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .gf-title-row strong {
          font-size: 17px;
          color: #111827;
          font-weight: 700;
        }
        .gf-ai-tag {
          font-size: 10px;
          font-weight: 700;
          color: #22c55e;
          background: #dcfce7;
          padding: 2px 6px;
          border-radius: 8px;
          text-transform: uppercase;
        }
        .gf-header-text p {
          font-size: 12px;
          color: #6b7280;
          margin: 1px 0 0;
        }

        .gf-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .gf-header-actions button {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1.5px solid #e5e7eb;
          background: #ffffff;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .gf-header-actions button:hover {
          background: #f0fdf4;
          color: #16a34a;
          border-color: #bbf7d0;
        }

        .gf-header-actions .gf-new-chat {
          width: auto;
          padding: 0 14px;
          border-radius: 20px;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          background: #dcfce7;
          color: #15803d;
          border-color: #86efac;
        }
        .gf-header-actions .gf-new-chat:hover {
          background: #22c55e;
          color: white;
          border-color: #22c55e;
        }

        /* History Modal Drawer */
        .gf-history-panel {
          position: absolute;
          z-index: 50;
          top: 75px;
          right: 20px;
          width: min(360px, calc(100% - 40px));
          max-height: 70%;
          display: flex;
          flex-direction: column;
          padding: 18px;
          border: 2px solid #e5e7eb;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(16px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        .gf-history-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 15px;
          color: #111827;
        }
        .gf-history-heading button {
          border: none;
          background: none;
          cursor: pointer;
          color: #9ca3af;
          padding: 4px;
        }
        .gf-history-panel input {
          padding: 10px 14px;
          border: 1.5px solid #e5e7eb;
          border-radius: 14px;
          font-size: 13.5px;
          outline: none;
          background: #f9fafb;
        }
        .gf-history-panel input:focus {
          border-color: #22c55e;
          background: white;
        }
        .gf-history-list {
          overflow-y: auto;
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .gf-history-list button {
          display: flex;
          flex-direction: column;
          gap: 3px;
          width: 100%;
          text-align: left;
          padding: 10px 12px;
          border-radius: 14px;
          background: #f9fafb;
          border: 1px solid transparent;
          cursor: pointer;
        }
        .gf-history-list button:hover,
        .gf-history-list button[aria-current="true"] {
          background: #f0fdf4;
          border-color: #bbf7d0;
        }
        .gf-history-list strong {
          font-size: 13.5px;
          color: #1f2937;
        }
        .gf-history-list span {
          color: #6b7280;
          font-size: 11.5px;
        }
        .gf-empty-history {
          text-align: center;
          color: #9ca3af;
          font-size: 13px;
          padding: 16px 0;
        }

        /* Chat Stream Transcript */
        .gf-transcript {
          box-sizing: border-box;
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 24px;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }

        .gf-welcome {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .gf-welcome-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #dcfce7;
          color: #16a34a;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          box-shadow: 0 8px 20px rgba(34, 197, 94, 0.2);
        }
        .gf-welcome h2 {
          font-size: 26px;
          font-weight: 800;
          color: #1f2937;
          margin: 0 0 8px;
          line-height: 1.3;
        }
        .gf-welcome em {
          font-style: normal;
          color: #16a34a;
        }
        .gf-welcome p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
          line-height: 1.6;
        }

        .gf-messages {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .gf-message {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .gf-message.user {
          justify-content: flex-end;
        }

        .gf-message-content {
          min-width: 0;
          max-width: 80%;
        }
        .gf-message.user .gf-message-content {
          max-width: 75%;
        }

        .gf-message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #f0fdf4;
          border: 1.5px solid #bbf7d0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
        }
        .gf-message-avatar :global(> div) {
          transform: scale(0.45);
        }

        .gf-message-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0 0 4px 4px;
          font-size: 11.5px;
          color: #9ca3af;
        }
        .gf-message-meta strong {
          color: #374151;
        }

        /* Cute Chat Bubbles */
        .gf-bubble {
          padding: 14px 18px;
          background: #ffffff;
          border: 1.5px solid #f3f4f6;
          border-radius: 22px;
          border-top-left-radius: 4px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
          color: #1f2937;
        }
        .user .gf-bubble {
          background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
          border-color: transparent;
          border-radius: 22px;
          border-bottom-right-radius: 4px;
          color: white;
          box-shadow: 0 6px 18px rgba(34, 197, 94, 0.25);
        }
        .gf-bubble.error {
          border-color: #fecaca;
          background: #fff5f5;
          color: #b91c1c;
        }

        .gf-answer {
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          line-height: 1.7;
          font-size: 14.5px;
        }
        .gf-notice {
          margin: 10px 0 0;
          padding-top: 8px;
          border-top: 1px solid #f3f4f6;
          font-size: 11.5px;
          color: #6b7280;
        }

        .gf-user-time {
          display: block;
          text-align: right;
          font-size: 11px;
          color: #9ca3af;
          margin: 4px 4px 0;
        }
        .gf-copy {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 8px;
          margin-top: 4px;
          color: #6b7280;
          font-size: 11.5px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 8px;
        }
        .gf-copy:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .gf-message-image {
          max-height: 200px;
          max-width: 100%;
          border-radius: 14px;
          margin-bottom: 10px;
          object-fit: cover;
        }

        /* Thinking State */
        .gf-thinking {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .gf-thinking-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #f0fdf4;
          border: 1.5px solid #bbf7d0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .gf-thinking-avatar :global(> div) {
          transform: scale(0.45);
        }
        .gf-thinking-bubble {
          background: white;
          padding: 12px 16px;
          border-radius: 18px;
          border-top-left-radius: 4px;
          border: 1.5px solid #f3f4f6;
        }
        .gf-thinking-bubble span {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13.5px;
          color: #4b5563;
          font-weight: 500;
        }
        .gf-thinking-dots {
          display: flex;
          gap: 4px;
          padding-top: 6px;
        }
        .gf-thinking-dots i {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #22c55e;
          animation: dot-bounce 1.2s infinite ease-in-out;
        }
        .gf-thinking-dots i:nth-child(2) {
          animation-delay: 0.2s;
        }
        .gf-thinking-dots i:nth-child(3) {
          animation-delay: 0.4s;
        }

        /* Bottom Interactive Section */
        .gf-chat-bottom {
          padding: 14px 20px 12px;
          background: rgba(255, 255, 255, 0.95);
          border-top: 1.5px solid #f3f4f6;
        }

        .gf-prompt-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: #d97706;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .gf-refresh-suggestions {
          margin-left: auto;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          color: #d97706;
          background: #fef3c7;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gf-prompt-strip {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 10px;
          scrollbar-width: thin;
        }
        .gf-prompt-strip button {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          width: 220px;
          padding: 8px 12px;
          border-radius: 16px;
          background: #f9fafb;
          border: 1.5px solid #f3f4f6;
          font-size: 12.5px;
          text-align: left;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .gf-prompt-strip button:hover {
          transform: translateY(-2px);
          background: #ffffff;
          border-color: #fde047;
          box-shadow: 0 4px 12px rgba(234, 179, 8, 0.15);
        }

        .gf-chip-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .c-0 {
          background: #dcfce7;
          color: #16a34a;
        }
        .c-1 {
          background: #e0f2fe;
          color: #0284c7;
        }
        .c-2 {
          background: #fce7f3;
          color: #db2777;
        }

        .gf-prompt-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Pillow Form Composer */
        .gf-composer {
          border-radius: 24px;
          border: 2px solid #e5e7eb;
          background: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
          transition: all 0.2s ease;
        }
        .gf-composer:focus-within {
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
        }

        .gf-composer-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
        }

        .gf-attach {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .gf-attach:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .gf-composer textarea {
          font-family: inherit;
          flex: 1;
          min-width: 0;
          resize: none;
          max-height: 90px;
          background: transparent;
          outline: none;
          border: 0;
          padding: 6px 2px;
          font-size: 14px;
          line-height: 1.5;
          color: #1f2937;
        }
        .gf-composer textarea::placeholder {
          color: #9ca3af;
        }

        .gf-send {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(34, 197, 94, 0.3);
          transition: transform 0.15s ease;
        }
        .gf-send:active:not(:disabled) {
          transform: scale(0.92);
        }
        .gf-send:disabled {
          background: #e5e7eb;
          color: #9ca3af;
          box-shadow: none;
          cursor: not-allowed;
        }

        .gf-image-preview {
          display: flex;
          align-items: center;
          gap: 8px;
          border-radius: 12px;
          background: #f9fafb;
          margin: 6px 6px 0;
          padding: 6px 10px;
          border: 1px solid #e5e7eb;
        }
        .gf-image-preview img {
          width: 32px;
          height: 32px;
          object-fit: cover;
          border-radius: 6px;
        }
        .gf-image-preview span {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 12px;
          color: #4b5563;
        }
        .gf-image-preview button {
          border: none;
          background: transparent;
          color: #9ca3af;
          cursor: pointer;
        }

        .gf-composer-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11.5px;
          color: #9ca3af;
          margin-top: 6px;
        }
        .gf-topic {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #15803d;
          background: #f0fdf4;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 600;
        }

        /* Decorative Soft Glows */
        .gf-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(50px);
          pointer-events: none;
        }
        .gf-glow-1 {
          width: 300px;
          height: 300px;
          top: -50px;
          left: -50px;
          background: rgba(187, 247, 208, 0.5);
        }
        .gf-glow-2 {
          width: 300px;
          height: 300px;
          bottom: -50px;
          right: -50px;
          background: rgba(254, 240, 138, 0.4);
        }

        .gf-mobile-modes {
          display: none;
        }

        /* Animations */
        @keyframes float-aura {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes bounce-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dot-bounce {
          0%, 70%, 100% { transform: translateY(0); }
          35% { transform: translateY(-4px); }
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .gf-layout { grid-template-columns: 200px minmax(0, 1fr); }
        }
        @media (max-width: 768px) {
          .gf-layout { grid-template-columns: minmax(0, 1fr); }
          .gf-brand { display: none; }
          .gf-page { padding: 8px; }
          .gf-transcript { padding: 16px 12px; }
          .gf-chat-bottom { padding: 10px; }
          .gf-mobile-modes {
            display: block;
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.9);
            border-bottom: 1.5px solid #f3f4f6;
          }
          .gf-mobile-modes select {
            width: 100%;
            padding: 6px 10px;
            font-size: 13.5px;
            border-radius: 12px;
            border: 1.5px solid #e5e7eb;
            background: #ffffff;
            color: #374151;
          }
          .gf-message-content { max-width: 88%; }
          .gf-message.user .gf-message-content { max-width: 88%; }
        }

        .gf-still * {
          animation: none !important;
          transition: none !important;
        }
      `}</style>
    </main>
  );
}