'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: Date;
  dueDate?: Date;
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

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: '1',
      title: '完成项目提案',
      description: '完成第四季度营销活动的项目提案',
      completed: false,
      priority: 'high',
      category: 'work',
      createdAt: new Date(2024, 0, 15),
      dueDate: new Date(2024, 0, 20),
    },
    {
      id: '2',
      title: '购买杂货',
      description: '牛奶、面包、鸡蛋和本周的蔬菜',
      completed: false,
      priority: 'medium',
      category: 'shopping',
      createdAt: new Date(2024, 0, 14),
    },
    {
      id: '3',
      title: '晨间锻炼',
      description: '30分钟有氧运动和力量训练',
      completed: true,
      priority: 'low',
      category: 'health',
      createdAt: new Date(2024, 0, 13),
    },
    {
      id: '4',
      title: '学习 React Hooks',
      description: '完成高级 Hooks 教程系列',
      completed: false,
      priority: 'medium',
      category: 'learning',
      createdAt: new Date(2024, 0, 12),
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium' as Todo['priority'],
    category: 'personal',
  });

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

  const addTodo = () => {
    if (!newTodo.title.trim()) return;
    
    const todo: Todo = {
      id: Date.now().toString(),
      title: newTodo.title,
      description: newTodo.description || undefined,
      completed: false,
      priority: newTodo.priority,
      category: newTodo.category,
      createdAt: new Date(),
    };
    
    setTodos(prev => [todo, ...prev]);
    setNewTodo({ title: '', description: '', priority: 'medium', category: 'personal' });
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const updateTodo = (updatedTodo: Todo) => {
    setTodos(prev => prev.map(todo => 
      todo.id === updatedTodo.id ? updatedTodo : todo
    ));
    setEditingTodo(null);
  };

  const getCategoryInfo = (categoryValue: string) => {
    return categories.find(cat => cat.value === categoryValue) || categories[1];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          ✨ 任务大师
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          通过这个设计精美的任务管理系统，改变您的生产力
        </p>
      </motion.div>

      {/* Quick Add Todo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="backdrop-blur-sm bg-white/95 dark:bg-slate-800/85 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Input
                placeholder="有什么需要做的？"
                value={newTodo.title}
                onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
                className="flex-1 bg-white/50 dark:bg-slate-700/50 border-0 h-12 text-lg"
                onKeyDown={(e) => e.key === 'Enter' && addTodo()}
              />
              <Button 
                size="lg" 
                onClick={addTodo}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-xl h-12"
              >
                <Plus className="h-5 w-5 mr-2" />
                添加任务
              </Button>
            </div>
            {/* Collapsible section for more options can be added here */}
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <Card className="backdrop-blur-sm bg-white/95 dark:bg-slate-800/85 border-0 shadow-xl">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">总任务数</div>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm bg-white/95 dark:bg-slate-800/85 border-0 shadow-xl">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-800 dark:text-white">{stats.completed}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">已完成</div>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm bg-white/95 dark:bg-slate-800/85 border-0 shadow-xl">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-800 dark:text-white">{stats.pending}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">待处理</div>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm bg-white/95 dark:bg-slate-800/85 border-0 shadow-xl">
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-800 dark:text-white">{stats.highPriority}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">高优先级</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <Card className="backdrop-blur-sm bg-white/95 dark:bg-slate-800/85 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                进度
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` 
                }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col md:flex-row gap-4 mb-8"
      >
        <Card className="flex-1 backdrop-blur-sm bg-white/95 dark:bg-slate-800/85 border-0 shadow-xl">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="搜索任务..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 dark:bg-slate-700/50 border-0"
                />
              </div>
              
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
          </CardContent>
        </Card>
      </motion.div>

      {/* Todo List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
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
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTodo(todo.id)}
                        className={cn(
                          "p-0 h-auto hover:bg-transparent transition-colors",
                          todo.completed ? "text-green-500" : "text-slate-400 hover:text-green-500"
                        )}
                      >
                        {todo.completed ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          <Circle className="h-6 w-6" />
                        )}
                      </Button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
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
                        
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {todo.createdAt.toLocaleDateString()}
                          </div>
                          {todo.dueDate && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              截止日期: {todo.dueDate.toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTodo(todo)}
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
        <Dialog open={!!editingTodo} onOpenChange={() => setEditingTodo(null)}>
          <DialogContent className="backdrop-blur-sm bg-white/90 dark:bg-slate-800/90">
            <DialogHeader>
              <DialogTitle>编辑任务</DialogTitle>
              <DialogDescription>
                修改您的任务项。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">标题</Label>
                <Input
                  id="edit-title"
                  value={editingTodo.title}
                  onChange={(e) => setEditingTodo(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">描述</Label>
                <Textarea
                  id="edit-description"
                  value={editingTodo.description || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingTodo(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-priority">优先级</Label>
                  <Select 
                    value={editingTodo.priority} 
                    onValueChange={(value: string) => setEditingTodo(prev => prev ? { ...prev, priority: value as Todo['priority'] } : null)}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="edit-category">分类</Label>
                  <Select 
                    value={editingTodo.category} 
                    onValueChange={(value: string) => setEditingTodo(prev => prev ? { ...prev, category: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => editingTodo && updateTodo(editingTodo)} className="w-full">
                <Edit3 className="h-4 w-4 mr-2" />
                更新任务
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}