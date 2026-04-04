import { useEffect, useRef, useState, useCallback } from "react";
import { X, Send, Loader2, MessageCircle } from "lucide-react";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

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

interface Props {
  otherUser: ChatUser;
  projectId?: string;
  projectTitle?: string;
  onClose: () => void;
}

export default function ChatModal({ otherUser, projectId, projectTitle, onClose }: Props) {
  const { user } = useAuth();
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load history
  useEffect(() => {
    setLoading(true);
    api.get<{ messages: Message[]; other: ChatUser }>(`/chat/${otherUser._id}`)
      .then(({ messages }) => {
        setMessages(messages);
        setTimeout(scrollToBottom, 50);
      })
      .finally(() => setLoading(false));
  }, [otherUser._id, scrollToBottom]);

  // Real-time
  useEffect(() => {
    const socket = getSocket();
    const handler = (msg: Message) => {
      const isRelevant =
        (msg.sender._id === otherUser._id || msg.receiver._id === otherUser._id);
      if (isRelevant) {
        setMessages((prev) => [...prev, msg]);
        setTimeout(scrollToBottom, 50);
      }
    };
    socket.on("new_message", handler);
    return () => { socket.off("new_message", handler); };
  }, [otherUser._id, scrollToBottom]);

  const sendMsg = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const msg = await api.post<Message>(`/chat/${otherUser._id}`, {
        content: input.trim(),
        projectId,
      });
      setMessages((prev) => [...prev, msg]);
      setInput("");
      setTimeout(scrollToBottom, 50);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col w-[360px] max-h-[520px] rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-primary text-white shrink-0">
        <Avatar className="h-8 w-8 rounded-full border border-white/30">
          <AvatarImage src={otherUser.avatar} />
          <AvatarFallback className="bg-white/20 text-white text-sm font-bold">
            {otherUser.name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight truncate">{otherUser.name}</p>
          {projectTitle && (
            <p className="text-[11px] text-white/70 truncate">{projectTitle}</p>
          )}
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background min-h-0">
        {loading ? (
          <div className="flex justify-center pt-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full pt-10 text-center">
            <MessageCircle className="h-10 w-10 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No messages yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender._id === (user as any)?._id || msg.sender._id === (user as any)?.id;
            return (
              <div key={msg._id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                {!isMe && (
                  <Avatar className="h-6 w-6 rounded-full shrink-0 mt-1">
                    <AvatarImage src={msg.sender.avatar} />
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                      {msg.sender.name[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                  <div className={`px-3 py-2 rounded-2xl text-[13px] leading-relaxed break-words ${
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
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-t border-border bg-card shrink-0">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
          placeholder="Type a message…"
          className="flex-1 bg-secondary rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
          maxLength={2000}
        />
        <Button
          size="icon"
          className="h-9 w-9 rounded-xl shrink-0"
          onClick={sendMsg}
          disabled={!input.trim() || sending}
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
