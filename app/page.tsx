'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Star,
  Clock,
  AlertTriangle,
  Trash2,
  Edit3,
  Tag,
  Calendar,
  TrendingUp,
  Target,
  Zap,
  Paperclip,
  X,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { User, RealtimeChannel } from '@supabase/supabase-js';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Todo {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  attachments?: string[];
  createdAt: Date;
  dueDate?: Date;
}

interface Attachment {
  id: string;
  file: File;
}

interface DialogAttachment {
  id: string;
  file?: File;
  url?: string;
}

const priorityColors = {
  low: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  medium: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-600 border-red-500/30',
};

const priorityIcons = {
  low: Clock,
  medium: AlertTriangle,
  high: Zap,
};

const priorityTranslations: { [key in Todo['priority']]: string } = {
  low: '低',
  medium: '中',
  high: '高',
};

const categories = [
  { value: 'work', label: '工作', color: 'bg-purple-500' },
  { value: 'personal', label: '个人', color: 'bg-green-500' },
  { value: 'shopping', label: '购物', color: 'bg-blue-500' },
  { value: 'health', label: '健康', color: 'bg-pink-500' },
  { value: 'learning', label: '学习', color: 'bg-orange-500' },
];

function FloatingStats({ stats }: { stats: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-24 left-4 z-10 hidden md:block"
    >
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-0 shadow-2xl w-56">
        <CardContent className="p-4 space-y-4">
          <div>
            <div className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <TrendingUp className="h-4 w-4 mr-2" />
              <span>进度</span>
              <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` 
                }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center text-slate-800 dark:text-white">
                <Target className="h-4 w-4 mr-1" />
                <span className="text-2xl font-bold">{stats.total}</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">总任务</div>
            </div>
            <div>
              <div className="flex items-center justify-center text-green-500">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                <span className="text-2xl font-bold">{stats.completed}</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">已完成</div>
            </div>
            <div>
              <div className="flex items-center justify-center text-yellow-500">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-2xl font-bold">{stats.pending}</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">待处理</div>
            </div>
            <div>
              <div className="flex items-center justify-center text-red-500">
                <Zap className="h-4 w-4 mr-1" />
                <span className="text-2xl font-bold">{stats.highPriority}</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">高优</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

const SortableAttachment = ({
  item,
  onRemove,
  className = "w-24 h-24",
}: {
  item: DialogAttachment;
  onRemove: (id: string) => void;
  className?: string;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const imageUrl = item.file ? URL.createObjectURL(item.file) : item.url;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group touch-none"
    >
      <img
        src={imageUrl}
        alt="Preview"
        className={cn("object-cover rounded-md", className)}
      />
      <button
        onPointerDown={(e) => {
          e.stopPropagation();
          onRemove(item.id);
        }}
        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};

export default function TodosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [dialogAttachments, setDialogAttachments] = useState<DialogAttachment[]>([]);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium' as Todo['priority'],
    category: 'personal',
  });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogFileInputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const supabase = createClient();

    const fetchUserAndTodos = async () => {
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();

      if (!supabaseUser) {
        router.push("/auth/login");
        return;
      }
      setUser(supabaseUser);
      await fetchTodos(supabaseUser.id);
      setLoading(false);
      inputRef.current?.focus();
    };

    fetchUserAndTodos();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    // 监听整个 todos 表，回调里判断 user_id
    const channel = supabase
      .channel('todos-realtime')
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "todos",
        },
        (payload) => {
          const userId = user?.id;
          if (!userId) return;
          const row = (payload.new || payload.old) as any;
          if (!row) return;

          if (payload.eventType === "DELETE") {
            const oldId = (payload.old as { id: string }).id;
            setTodos((currentTodos) =>
              currentTodos.filter((t) => t.id !== oldId)
            );
            return;
          }

          if (row.user_id !== userId) return;

          if (payload.eventType === "INSERT") {
            const newTodo = {
              ...payload.new,
              createdAt: payload.new.created_at
                ? new Date(payload.new.created_at)
                : new Date(),
              dueDate: payload.new.due_date
                ? new Date(payload.new.due_date)
                : undefined,
            } as Todo;
            setTodos((currentTodos) => {
              if (currentTodos.some((t) => t.id === newTodo.id)) {
                return currentTodos;
              }
              return [newTodo, ...currentTodos];
            });
          }

          if (payload.eventType === "UPDATE") {
            const updatedTodo = {
              ...payload.new,
              createdAt: payload.new.created_at
                ? new Date(payload.new.created_at)
                : new Date(),
              dueDate: payload.new.due_date
                ? new Date(payload.new.due_date)
                : undefined,
            } as Todo;
            setTodos((currentTodos) =>
              currentTodos.map((t) =>
                t.id === updatedTodo.id ? updatedTodo : t
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, user]);

  const fetchTodos = async (userId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (!error && data) {
      setTodos(
        data.map((todo: any) => ({
          ...todo,
          createdAt: todo.created_at ? new Date(todo.created_at) : undefined,
          dueDate: todo.due_date ? new Date(todo.due_date) : undefined,
        }))
      );
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map((file) => ({
        id: `${file.name}-${Date.now()}`,
        file,
      }));
      if (attachments.length + newFiles.length > 9) {
        alert("最多只能上传 9 张图片。");
        return;
      }
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDialogFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map((file) => ({
        id: `${file.name}-${Date.now()}`,
        file,
      }));
      if (dialogAttachments.length + newFiles.length > 9) {
        alert("最多只能上传 9 张图片。");
        return;
      }
      setDialogAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  const removeDialogAttachment = (id: string) => {
    setDialogAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setAttachments((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDialogDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setDialogAttachments((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const uploadAttachments = async (files: File[]): Promise<string[]> => {
    if (!user || files.length === 0) return [];
    const supabase = createClient();
    const urls: string[] = [];

    for (const file of files) {
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("task-master")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError.message);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("task-master")
        .getPublicUrl(filePath);
      
      urls.push(publicUrl);
    }
    return urls;
  };

  const deleteAttachments = async (urls: string[]) => {
    if (urls.length === 0) return;
    const supabase = createClient();

    const filePaths = urls
      .map((url) => {
        try {
          const path = new URL(url).pathname.split("/task-master/")[1];
          return path ? decodeURIComponent(path) : null;
        } catch (e) {
          console.error(`Invalid URL for attachment deletion: ${url}`, e);
          return null;
        }
      })
      .filter((path): path is string => path !== null);

    if (filePaths.length === 0) {
      return;
    }

    const { error } = await supabase.storage
      .from("task-master")
      .remove(filePaths);

    if (error) {
      console.error("Error deleting attachments:", error.message);
    }
  };

  const addTodo = async () => {
    if (!newTodo.title.trim() || !user) return;
    setIsUploading(true);

    let attachmentUrls: string[] = [];
    if (attachments.length > 0) {
      attachmentUrls = await uploadAttachments(attachments.map((a) => a.file));
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("todos")
      .insert([{ ...newTodo, user_id: user.id, attachments: attachmentUrls }])
      .select();

    if (!error && data) {
      setTodos(prev => [
        {
          ...data[0],
          createdAt: data[0].created_at ? new Date(data[0].created_at) : undefined,
          dueDate: data[0].due_date ? new Date(data[0].due_date) : undefined,
        },
        ...prev,
      ]);
      setNewTodo({ title: '', description: '', priority: 'medium', category: 'personal' });
      setAttachments([]);
    }
    setIsUploading(false);
  };

  const deleteTodo = async (id: string) => {
    const todoToDelete = todos.find((t) => t.id === id);
    if (!todoToDelete) return;

    if (todoToDelete.attachments && todoToDelete.attachments.length > 0) {
      await deleteAttachments(todoToDelete.attachments);
    }

    const supabase = createClient();
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  const updateTodo = async (
    updatedTodo: Omit<Todo, "id"> & { id: string }
  ) => {
    const supabase = createClient();
    const { id, user_id, createdAt, ...updateData } = updatedTodo;

    const payload = {
      title: updateData.title,
      description: updateData.description,
      completed: updateData.completed,
      priority: updateData.priority,
      category: updateData.category,
      attachments: updateData.attachments,
      due_date: updateData.dueDate ? updateData.dueDate.toISOString() : null,
    };

    const { data, error } = await supabase
      .from("todos")
      .update(payload)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating todo:", error);
      return null;
    }

    if (data) {
      const newTodo = {
        ...data[0],
        createdAt: data[0].created_at
          ? new Date(data[0].created_at)
          : undefined,
        dueDate: data[0].due_date ? new Date(data[0].due_date) : undefined,
      };
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? newTodo : todo))
      );
      return newTodo;
    }
    return null;
  };

  const saveEditedTodo = async () => {
    if (!editingTodo) return;
    
    setIsUploading(true);
    
    const originalUrls = editingTodo.attachments || [];
    const remainingUrls = dialogAttachments
      .filter((a) => a.url)
      .map((a) => a.url as string);
    const urlsToDelete = originalUrls.filter(
      (url) => !remainingUrls.includes(url)
    );

    if (urlsToDelete.length > 0) {
      await deleteAttachments(urlsToDelete);
    }

    const newFilesToUpload = dialogAttachments
      .filter((a) => a.file)
      .map((a) => a.file as File);
    const newUrls = await uploadAttachments(newFilesToUpload);

    let newUrlIndex = 0;
    const finalAttachmentUrls = dialogAttachments.map((a) => {
      if (a.url) {
        return a.url;
      }
      return newUrls[newUrlIndex++];
    });

    const updatedTodoData = {
      ...editingTodo,
      attachments: finalAttachmentUrls,
    };
    
    await updateTodo(updatedTodoData);
    
    setEditingTodo(null);
    setDialogAttachments([]);
    setIsUploading(false);
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    await updateTodo({ ...todo, completed: !todo.completed });
  };

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'all' || todo.priority === filterPriority;
      const matchesCategory = filterCategory === 'all' || todo.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'completed' && todo.completed) ||
        (filterStatus === 'pending' && !todo.completed);
      
      return matchesSearch && matchesPriority && matchesCategory && matchesStatus;
    });
  }, [todos, searchTerm, filterPriority, filterCategory, filterStatus]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;
    const highPriority = todos.filter(todo => todo.priority === 'high' && !todo.completed).length;
    
    return { total, completed, pending, highPriority };
  }, [todos]);

  const getCategoryInfo = (categoryValue: string) => {
    return categories.find(cat => cat.value === categoryValue) || categories[1];
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 relative">
      <FloatingStats stats={stats} />
      
      {/* Quick Add Todo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Card className="backdrop-blur-sm bg-white/95 dark:bg-slate-800/85 border-0 shadow-xl">
          <CardContent className="p-6">
            {/* 附件缩略图显示在输入框上方 */}
            {attachments.length > 0 && (
              <div className="flex items-center gap-2 mb-2">
                {attachments.slice(0, 3).map((attachment) => (
                  <div key={attachment.id} className="relative group">
                    <img
                      src={URL.createObjectURL(attachment.file)}
                      alt="预览"
                      className="h-12 w-12 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow"
                    />
                    <button
                      type="button"
                      onClick={() => removeAttachment(attachment.id)}
                      className="absolute -top-2 -right-2 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      aria-label="移除图片"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-0 bg-white/50 dark:bg-slate-700/50 rounded-2xl border border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-400 shadow px-2 h-14 transition-all">
              {/* 上传图片按钮 */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center h-10 w-10 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors mr-2"
                type="button"
                aria-label="添加图片附件"
              >
                <ImageIcon className="h-6 w-6 text-indigo-400" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {/* 文本输入 */}
              <Textarea
                ref={inputRef}
                placeholder="有什么需要做的？"
                value={newTodo.title}
                onChange={(e) =>
                  setNewTodo((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="flex-1 border-0 bg-transparent h-10 text-base px-2 py-3 resize-none shadow-none focus:ring-0 focus:outline-none placeholder:text-slate-400/80 rounded-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    addTodo();
                  }
                }}
                maxLength={100}
                style={{ minHeight: '2.5rem', boxShadow: 'none' }}
              />
              {/* 右侧提交按钮 */}
              <Button
                onClick={addTodo}
                disabled={isUploading || !newTodo.title.trim()}
                size="icon"
                className={
                  "h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center p-0 ml-2 transition-transform active:scale-95 focus:ring-2 focus:ring-indigo-400 " +
                  (isUploading || !newTodo.title.trim() ? " opacity-60 cursor-not-allowed" : " hover:bg-indigo-100 dark:hover:bg-indigo-900")
                }
                aria-label="添加任务"
              >
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-indigo-500"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4Z"/></svg>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <Card className="flex-1 backdrop-blur-sm bg-white/95 dark:bg-slate-800/85 border-0 shadow-xl">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 flex gap-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-32 bg-white/50 dark:bg-slate-700/50 border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="pending">待处理</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-full md:w-32 bg-white/50 dark:bg-slate-700/50 border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有优先级</SelectItem>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full md:w-36 bg-white/50 dark:bg-slate-700/50 border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有分类</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative w-full md:w-auto md:min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="搜索任务..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 dark:bg-slate-700/50 border-0 placeholder:text-slate-400/70"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Todo List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredTodos.map((todo, index) => {
            const PriorityIcon = priorityIcons[todo.priority];
            const categoryInfo = getCategoryInfo(todo.category);
            
            return (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <Card className={cn(
                  "backdrop-blur-sm border-0 shadow-xl transition-all duration-300",
                  "hover:shadow-2xl hover:shadow-indigo-500/10",
                  todo.completed 
                    ? "bg-slate-100/80 dark:bg-slate-800/70" 
                    : "bg-white/95 dark:bg-slate-800/85"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTodo(todo.id)}
                        className={cn(
                          "p-0 h-auto hover:bg-transparent transition-colors mt-1",
                          todo.completed ? "text-green-500" : "text-slate-400 hover:text-green-500"
                        )}
                      >
                        {todo.completed ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          <Circle className="h-6 w-6" />
                        )}
                      </Button>
                      
                      <div className="flex-1 grid grid-cols-3 gap-x-4 min-w-0">
                        <div className="col-span-3 lg:col-span-2">
                          <div className="flex items-center flex-wrap gap-2 mb-2">
                            <h3 className={cn(
                              "text-lg font-semibold transition-all",
                              todo.completed 
                                ? "line-through text-slate-500 dark:text-slate-400" 
                                : "text-slate-800 dark:text-white"
                            )}>
                              {todo.title}
                            </h3>
                            
                            <Badge variant="outline" className={priorityColors[todo.priority]}>
                              <PriorityIcon className="h-3 w-3 mr-1" />
                              {priorityTranslations[todo.priority]}
                            </Badge>
                            
                            <Badge variant="outline" className="bg-slate-100 dark:bg-slate-700">
                              <div className={cn("w-2 h-2 rounded-full mr-1", categoryInfo.color)} />
                              {categoryInfo.label}
                            </Badge>
                          </div>
                          
                          {todo.description && (
                            <p className={cn(
                              "text-sm mb-2 transition-all",
                              todo.completed 
                                ? "text-slate-400 dark:text-slate-500" 
                                : "text-slate-600 dark:text-slate-300"
                            )}>
                              {todo.description}
                            </p>
                          )}
                           <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {todo.createdAt?.toLocaleDateString?.()}
                            </div>
                            {todo.dueDate && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                截止日期: {todo.dueDate.toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {todo.attachments && todo.attachments.length > 0 && (
                          <div className="col-span-3 lg:col-span-1 mt-2 lg:mt-0 grid grid-cols-3 gap-2">
                            {todo.attachments.map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={url}
                                  alt={`Attachment ${i + 1}`}
                                  className="w-full h-16 object-cover rounded-md hover:opacity-80 transition-opacity"
                                />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingTodo(todo);
                            setDialogAttachments(
                              todo.attachments?.map((url) => ({ id: url, url })) || []
                            );
                          }}
                          className="text-slate-400 hover:text-indigo-500 p-1 h-auto"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTodo(todo.id)}
                          className="text-slate-400 hover:text-red-500 p-1 h-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {filteredTodos.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Card className="backdrop-blur-sm bg-white/95 dark:bg-slate-800/85 border-0 shadow-xl max-w-md mx-auto">
              <CardContent className="p-8">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                  未找到任务
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {searchTerm || filterPriority !== 'all' || filterCategory !== 'all' || filterStatus !== 'all'
                    ? "尝试调整筛选器以查看更多任务。"
                    : "创建您的第一个任务开始吧！"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Edit Dialog */}
      {editingTodo && (
        <Dialog
          open={!!editingTodo}
          onOpenChange={() => {
            setEditingTodo(null);
            setDialogAttachments([]);
          }}
        >
          <DialogContent className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-2xl border-0">
            <DialogHeader className="text-center">
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent pb-2">
                更新任务
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                在这里完善您的任务细节。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div>
                <Label htmlFor="edit-title" className="text-slate-600 dark:text-slate-300">标题</Label>
                <Input
                  id="edit-title"
                  value={editingTodo.title}
                  onChange={(e) =>
                    setEditingTodo((prev) =>
                      prev ? { ...prev, title: e.target.value } : null
                    )
                  }
                  className="mt-2 bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <Label htmlFor="edit-description" className="text-slate-600 dark:text-slate-300">描述</Label>
                <Textarea
                  id="edit-description"
                  value={editingTodo.description || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setEditingTodo((prev) =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
                  }
                  className="mt-2 bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-priority" className="text-slate-600 dark:text-slate-300">优先级</Label>
                  <Select
                    value={editingTodo.priority}
                    onValueChange={(value: string) =>
                      setEditingTodo((prev) =>
                        prev
                          ? { ...prev, priority: value as Todo["priority"] }
                          : null
                      )
                    }
                  >
                    <SelectTrigger className="mt-2 bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">低</SelectItem>
                      <SelectItem value="medium">中</SelectItem>
                      <SelectItem value="high">高</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-category" className="text-slate-600 dark:text-slate-300">分类</Label>
                  <Select
                    value={editingTodo.category}
                    onValueChange={(value: string) =>
                      setEditingTodo((prev) =>
                        prev ? { ...prev, category: value } : null
                      )
                    }
                  >
                    <SelectTrigger className="mt-2 bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-slate-600 dark:text-slate-300">附件</Label>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDialogDragEnd}
                >
                  <SortableContext
                    items={dialogAttachments}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mt-2">
                      {dialogAttachments.map((attachment) => (
                        <SortableAttachment
                          key={attachment.id}
                          item={attachment}
                          onRemove={removeDialogAttachment}
                          className="w-full h-20"
                        />
                      ))}
                      {dialogAttachments.length < 9 && (
                        <button
                          onClick={() => dialogFileInputRef.current?.click()}
                          className="w-full h-20 bg-slate-100 dark:bg-slate-800/50 rounded-md flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-500 transition-colors"
                        >
                          <Plus className="h-8 w-8 text-slate-400" />
                        </button>
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
                <input
                  type="file"
                  ref={dialogFileInputRef}
                  multiple
                  accept="image/*"
                  onChange={handleDialogFileChange}
                  className="hidden"
                />
              </div>

              <Button
                onClick={saveEditedTodo}
                className="w-full h-12 text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg"
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    完成
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}