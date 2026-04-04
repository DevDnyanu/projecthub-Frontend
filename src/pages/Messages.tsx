import { useEffect, useRef, useState, useCallback } from "react";
import {
  MessagesSquare, Search, Inbox, Send, Loader2, MessageCircle, Phone, Video, MoreHorizontal,
} from "lucide-react";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Conversation {
  user: { _id: string; name: string; avatar?: string };
  lastMessage: string;
  lastAt: string;
  unread: number;
  projectId?: string;
  projectTitle?: string;
}

interface ChatUser {
  _id: string;
  name: string;
  avatar?: string;
}

interface Message {
  _id: string;
  sender: ChatUser;
  receiver: ChatUser;
  content: string;
  read: boolean;
  createdAt: string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase();
}

function groupByDate(messages: Message[]) {
  const groups: { label: string; messages: Message[] }[] = [];
  let currentLabel = "";
  for (const msg of messages) {
    const label = formatDateLabel(msg.createdAt);
    if (label !== currentLabel) {
      currentLabel = label;
      groups.push({ label, messages: [msg] });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  }
  return groups;
}

/* ─── Inline Chat Panel ───────────────────────────────────────────── */
function ChatPanel({
  conv,
  onMessageSent,
}: {
  conv: Conversation;
  onMessageSent: () => void;
}) {
  const { user }                   = useAuth();
  const [messages, setMessages]    = useState<Message[]>([]);
  const [input, setInput]          = useState("");
  const [loading, setLoading]      = useState(true);
  const [sending, setSending]      = useState(false);
  const bottomRef                  = useRef<HTMLDivElement>(null);
  const inputRef                   = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    api.get<{ messages: Message[] }>(`/chat/${conv.user._id}`)
      .then(({ messages }) => {
        setMessages(messages);
        setTimeout(scrollToBottom, 50);
      })
      .finally(() => setLoading(false));
  }, [conv.user._id, scrollToBottom]);

  useEffect(() => {
    const socket = getSocket();
    const handler = (msg: Message) => {
      const isRelevant = msg.sender._id === conv.user._id || msg.receiver._id === conv.user._id;
      if (isRelevant) {
        setMessages((prev) => [...prev, msg]);
        setTimeout(scrollToBottom, 50);
      }
    };
    socket.on("new_message", handler);
    return () => { socket.off("new_message", handler); };
  }, [conv.user._id, scrollToBottom]);

  const sendMsg = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const msg = await api.post<Message>(`/chat/${conv.user._id}`, {
        content: input.trim(),
        projectId: conv.projectId,
      });
      setMessages((prev) => [...prev, msg]);
      setInput("");
      setTimeout(scrollToBottom, 50);
      onMessageSent();
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const userId = (user as any)?._id || (user as any)?.id;
  const groups = groupByDate(messages);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-card shrink-0">
        <Avatar className="h-10 w-10 rounded-full">
          <AvatarImage src={conv.user.avatar} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
            {conv.user.name[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground leading-tight">{conv.user.name}</p>
          {conv.projectTitle && (
            <p className="text-[11px] text-primary/70 truncate">{conv.projectTitle}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button className="h-8 w-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Phone className="h-4 w-4" />
          </button>
          <button className="h-8 w-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Video className="h-4 w-4" />
          </button>
          <button className="h-8 w-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 bg-background min-h-0">
        {loading ? (
          <div className="flex justify-center pt-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground/20 mb-3" />
            <p className="text-sm font-semibold text-foreground">No messages yet</p>
            <p className="text-xs text-muted-foreground mt-1">Say hello to start the conversation!</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase px-1">
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="space-y-2">
                {group.messages.map((msg) => {
                  const isMe = msg.sender._id === userId;
                  return (
                    <div key={msg._id} className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      {!isMe && (
                        <Avatar className="h-7 w-7 rounded-full shrink-0 mt-1">
                          <AvatarImage src={msg.sender.avatar} />
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                            {msg.sender.name[0]}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[68%] flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                        <div className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed break-words ${
                          isMe
                            ? "bg-primary text-white rounded-tr-sm"
                            : "bg-secondary text-foreground rounded-tl-sm"
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-muted-foreground/60 px-1">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-t border-border bg-card shrink-0">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
          placeholder="Type a message…"
          className="flex-1 bg-secondary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
          maxLength={2000}
        />
        <Button
          size="icon"
          className="h-10 w-10 rounded-xl shrink-0"
          onClick={sendMsg}
          disabled={!input.trim() || sending}
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

/* ─── Main Messages Page ──────────────────────────────────────────── */
export default function Messages() {
  const { user }                        = useAuth();
  const [convs, setConvs]               = useState<Conversation[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeConv, setActiveConv]     = useState<Conversation | null>(null);
  const [search, setSearch]             = useState("");

  const fetchConvs = useCallback(() => {
    api.get<Conversation[]>("/chat/conversations").then(setConvs);
  }, []);

  useEffect(() => {
    if (!user) return;
    api.get<Conversation[]>("/chat/conversations")
      .then((data) => {
        setConvs(data);
        if (data.length > 0 && !activeConv) setActiveConv(data[0]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = convs.filter((c) =>
    c.user.name.toLowerCase().includes(search.toLowerCase()) ||
    c.projectTitle?.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = convs.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">

      {/* ── Left Sidebar ── */}
      <div className="w-80 shrink-0 flex flex-col border-r border-border bg-card overflow-hidden">

        {/* Sidebar Header */}
        <div className="px-4 pt-4 pb-3 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessagesSquare className="h-4 w-4 text-primary" />
              </div>
              <h1 className="text-base font-bold text-foreground">Messages</h1>
            </div>
            {totalUnread > 0 && (
              <span className="h-5 px-2 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                {totalUnread}
              </span>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 bg-secondary border-0 rounded-lg text-sm placeholder:text-muted-foreground/60 focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Chats Label */}
        {convs.length > 0 && (
          <div className="px-4 pb-1.5 shrink-0">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              Chats
            </p>
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center pt-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center pt-16 px-4 text-center">
              <Inbox className="h-10 w-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm font-semibold text-foreground">
                {search ? "No results" : "No conversations"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {search ? "Try a different name." : "Start chatting from a project page."}
              </p>
            </div>
          ) : (
            filtered.map((c) => {
              const isActive = activeConv?.user._id === c.user._id;
              return (
                <button
                  key={c.user._id}
                  onClick={() => setActiveConv(c)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left group border-l-2 ${
                    isActive
                      ? "bg-primary/8 border-l-primary"
                      : "border-l-transparent hover:bg-secondary/60"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10 rounded-full">
                      <AvatarImage src={c.user.avatar} />
                      <AvatarFallback className={`font-bold text-sm ${isActive ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"}`}>
                        {c.user.name[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online dot (decorative, could wire to socket presence) */}
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-card" />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className={`text-sm truncate ${c.unread > 0 ? "font-bold text-foreground" : "font-semibold text-foreground/80"}`}>
                        {c.user.name}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(c.lastAt)}</span>
                    </div>
                    {c.projectTitle && (
                      <p className="text-[10px] text-primary/60 truncate leading-none mb-0.5">{c.projectTitle}</p>
                    )}
                    <p className={`text-[12px] truncate ${c.unread > 0 ? "text-foreground/80 font-medium" : "text-muted-foreground"}`}>
                      {c.lastMessage}
                    </p>
                  </div>

                  {/* Unread badge */}
                  {c.unread > 0 && (
                    <span className="h-4.5 min-w-[18px] px-1 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                      {c.unread > 9 ? "9+" : c.unread}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right Chat Panel ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {activeConv ? (
          <ChatPanel
            key={activeConv.user._id}
            conv={activeConv}
            onMessageSent={fetchConvs}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="h-20 w-20 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
              <MessagesSquare className="h-10 w-10 text-primary/40" />
            </div>
            <p className="text-base font-semibold text-foreground">Select a conversation</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Choose a chat from the left to start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
