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
import { getVideos, deleteVideo, syncVideos } from '../../../api/admin';
import type { Video } from '../../../types/api';
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
import styles from './Videos.module.less';

const VideosPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const hasFetched = useRef(false);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const data = await getVideos({ limit: 100 });
      setVideos(data);
    } catch (error) {
      console.error('Error fetching videos:', error);
      alert('获取视频列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchVideos();
  }, []);

  const handleSync = async () => {
    if (!confirm('确定要同步视频吗？这可能需要几分钟时间。')) return;

    try {
      setSyncing(true);
      const result = await syncVideos({ hoursAgo: 72, maxVideosPerChannel: 10 });
      alert(`同步成功！\n新增视频: ${result.newVideos}\n总视频: ${result.totalVideos}`);
      await fetchVideos();
    } catch (error) {
      console.error('Error syncing videos:', error);
      alert('同步失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个视频吗？')) return;

    try {
      await deleteVideo(id);
      alert('删除成功');
      await fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('删除失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const columns: ColumnDef<Video>[] = [
    {
      accessorKey: 'thumbnailUrl',
      header: '缩略图',
      cell: ({ row }) => (
        <img
          src={row.original.thumbnailUrl}
          alt={row.original.title}
          className={styles.thumbnail}
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'title',
      header: '标题',
      cell: ({ row }) => (
        <div className={styles.titleCell}>
          <a
            href={`https://youtube.com/watch?v=${row.original.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.titleLink}
          >
            {row.original.title}
          </a>
          <div className={styles.author}>{row.original.author}</div>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: '分类',
      cell: ({ row }) => <Badge variant="outline">{row.original.category}</Badge>,
    },
    {
      accessorKey: 'durationFormatted',
      header: '时长',
    },
    {
      accessorKey: 'viewCount',
      header: '观看量',
      cell: ({ row }) => Number(row.original.viewCount).toLocaleString(),
    },
    {
      accessorKey: 'publishedAt',
      header: '发布时间',
      cell: ({ row }) => new Date(row.original.publishedAt).toLocaleDateString('zh-CN'),
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
            <DropdownMenuItem
              onClick={() =>
                window.open(`https://youtube.com/watch?v=${row.original.videoId}`, '_blank')
              }
            >
              📺 在YouTube观看
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
    data: videos,
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
    <div className={styles.videosPage}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>视频管理</h1>
          <p className={styles.pageDescription}>
            管理 YouTube 视频，共 {videos.length} 个视频
          </p>
        </div>
        <Button onClick={handleSync} disabled={syncing}>
          {syncing ? '同步中...' : '🔄 同步视频'}
        </Button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <Input
          placeholder="搜索标题..."
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={(e) => table.getColumn('title')?.setFilterValue(e.target.value)}
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
              第 {table.getState().pagination.pageIndex + 1} 页，共{' '}
              {table.getPageCount()} 页
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
    </div>
  );
};

export default VideosPage;
