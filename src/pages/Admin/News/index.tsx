import React, { useState, useEffect, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import {
  getNews,
  deleteNews,
  syncAllNews,
  translatePendingNews,
  updateNews,
} from '../../../api/admin';
import type { NewsItem } from '../../../types/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { Badge } from '../../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import styles from './News.module.less';

const NewsPage: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [editForm, setEditForm] = useState({
    title_zh: '',
    summary_zh: '',
  });
  const hasFetched = useRef(false);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const data = await getNews({ limit: 100 });
      setNews(data.items);
    } catch (error) {
      console.error('Error fetching news:', error);
      alert('获取新闻列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchNews();
  }, []);

  const handleSync = async () => {
    if (!confirm('确定要同步新闻吗？这可能需要几分钟时间。')) return;

    try {
      setSyncing(true);
      const result = await syncAllNews(3);
      alert(`同步成功！\n新增: ${result.newItems}\n重复: ${result.duplicates}`);
      await fetchNews();
    } catch (error) {
      console.error('Error syncing news:', error);
      alert('同步失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setSyncing(false);
    }
  };

  const handleTranslate = async () => {
    if (!confirm('确定要翻译待翻译的新闻吗？')) return;

    try {
      setTranslating(true);
      const result = await translatePendingNews(50);
      alert(`翻译成功！共翻译 ${result.translatedCount} 条新闻`);
      await fetchNews();
    } catch (error) {
      console.error('Error translating news:', error);
      alert('翻译失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setTranslating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条新闻吗？')) return;

    try {
      await deleteNews(id);
      alert('删除成功');
      await fetchNews();
    } catch (error) {
      console.error('Error deleting news:', error);
      alert('删除失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleEdit = (newsItem: NewsItem) => {
    setEditingNews(newsItem);
    setEditForm({
      title_zh: newsItem.title.zh,
      summary_zh: newsItem.summary.zh,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingNews) return;

    try {
      await updateNews(editingNews.id, {
        title: {
          ...editingNews.title,
          zh: editForm.title_zh,
        },
        summary: {
          ...editingNews.summary,
          zh: editForm.summary_zh,
        },
      } as Partial<NewsItem>);
      alert('更新成功');
      setEditingNews(null);
      await fetchNews();
    } catch (error) {
      console.error('Error updating news:', error);
      alert('更新失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const columns: ColumnDef<NewsItem>[] = [
    {
      accessorKey: 'emoji',
      header: '图标',
      cell: ({ row }) => <span className={styles.emoji}>{row.original.emoji}</span>,
      enableSorting: false,
    },
    {
      accessorKey: 'title.zh',
      header: '标题',
      cell: ({ row }) => (
        <div className={styles.titleCell}>
          <div className={styles.titleZh}>{row.original.title.zh}</div>
          <div className={styles.titleEn}>{row.original.title.en}</div>
        </div>
      ),
    },
    {
      accessorKey: 'category.zh',
      header: '分类',
      cell: ({ row }) => <Badge variant="outline">{row.original.category.zh}</Badge>,
    },
    {
      accessorKey: 'isPushed',
      header: '状态',
      cell: ({ row }) => (
        <div className={styles.statusCell}>
          {row.original.isPushed && <Badge>已推送</Badge>}
          {row.original.isRead && <Badge variant="secondary">已读</Badge>}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: '创建时间',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('zh-CN'),
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              ⋮
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              ✏️ 编辑
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(row.original.url, '_blank')}>
              🔗 查看原文
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(row.original.id)}
              className="text-red-600"
            >
              🗑️ 删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data: news,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  return (
    <div className={styles.newsPage}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>新闻管理</h1>
          <p className={styles.pageDescription}>管理 AI 新闻，共 {news.length} 条新闻</p>
        </div>
        <div className={styles.headerActions}>
          <Button onClick={handleTranslate} disabled={translating} variant="outline">
            {translating ? '翻译中...' : '🌐 批量翻译'}
          </Button>
          <Button onClick={handleSync} disabled={syncing}>
            {syncing ? '同步中...' : '🔄 同步新闻'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <Input
          placeholder="搜索标题..."
          value={(table.getColumn('title.zh')?.getFilterValue() as string) ?? ''}
          onChange={(e) => table.getColumn('title.zh')?.setFilterValue(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className={styles.loading}>加载中...</div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center">
                      暂无数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
              第 {table.getState().pagination.pageIndex + 1} 页，共 {table.getPageCount()} 页
            </div>
            <div className={styles.paginationButtons}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                下一页
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingNews} onOpenChange={() => setEditingNews(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑新闻</DialogTitle>
            <DialogDescription>修改新闻的中文标题和摘要</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>中文标题</Label>
              <Input
                value={editForm.title_zh}
                onChange={(e) => setEditForm({ ...editForm, title_zh: e.target.value })}
              />
            </div>
            <div>
              <Label>中文摘要</Label>
              <Textarea
                value={editForm.summary_zh}
                onChange={(e) => setEditForm({ ...editForm, summary_zh: e.target.value })}
                rows={5}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingNews(null)}>
                取消
              </Button>
              <Button onClick={handleSaveEdit}>保存</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsPage;
