import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, FolderOpen, Check, X, Tag } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card } from '../../../components/ui/card';
import { useAuthStore } from '../../../stores/auth-store';
import { useToast } from '../../../hooks/use-toast';
import { cn } from '../../../shared/utils';
import { APP_CONFIG } from '../../../shared/constants/config';

interface Category {
  id: string;
  name: string;
  description: string | null;
  branchId: string;
  createdAt: string;
}

export default function CategoryListPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Add form
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [adding, setAdding] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      // @ts-ignore
      const result = await window.api.categories.list(APP_CONFIG.branch.defaultId);
      setCategories(result || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load categories.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      setAdding(true);
      // @ts-ignore
      await window.api.categories.create(
        {
          name: newName.trim(),
          description: newDescription.trim() || null,
          branchId: APP_CONFIG.branch.defaultId,
        },
        user?.id,
      );
      toast({
        title: 'Category Created',
        description: `"${newName.trim()}" has been added.`,
        variant: 'success',
      });
      setNewName('');
      setNewDescription('');
      fetchCategories();
    } catch (error: any) {
      toast({
        title: 'Failed',
        description: error.message || 'Could not create category.',
        variant: 'destructive',
      });
    } finally {
      setAdding(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    try {
      // @ts-ignore
      await window.api.categories.update(
        id,
        { name: editName.trim(), description: editDescription.trim() || null },
        user?.id,
      );
      toast({
        title: 'Category Updated',
        description: `Category has been updated.`,
        variant: 'success',
      });
      setEditingId(null);
      fetchCategories();
    } catch (error: any) {
      toast({
        title: 'Failed',
        description: error.message || 'Could not update category.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Delete category "${name}"? Products will keep their existing assignment.`,
      )
    ) {
      return;
    }
    try {
      // @ts-ignore
      await window.api.categories.delete(id, user?.id);
      toast({
        title: 'Category Deleted',
        description: `"${name}" has been removed.`,
        variant: 'success',
      });
      fetchCategories();
    } catch (error: any) {
      toast({
        title: 'Failed',
        description: error.message || 'Could not delete category.',
        variant: 'destructive',
      });
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDescription(cat.description || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-navy tracking-tight">
            Categories
          </h1>
          <p className="text-text-secondary mt-1">
            Organize your products into categories
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold text-sm">
          <Tag size={16} />
          {categories.length} Categories
        </div>
      </div>

      {/* Add Category Card */}
      <Card className="p-6 border-none shadow-soft bg-surface border border-navy/5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Plus size={16} className="text-primary" />
          </div>
          <h2 className="text-sm font-black uppercase tracking-wider text-navy/70">
            Add New Category
          </h2>
        </div>
        <div className="flex gap-3">
          <Input
            placeholder="Category name (e.g. Electronics)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
          />
          <Input
            placeholder="Description (optional)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
          />
          <Button
            onClick={handleAdd}
            disabled={adding || !newName.trim()}
            className="gap-2 min-w-[140px]"
          >
            <Plus size={16} />
            Add Category
          </Button>
        </div>
      </Card>

      {/* Categories List */}
      <Card className="border-none shadow-soft bg-surface border border-navy/5 overflow-hidden">
        {loading && (
          <div className="p-8 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`skeleton-${String(i)}`}
                className="h-16 bg-background/50 rounded-xl animate-pulse"
              />
            ))}
          </div>
        )}
        {!loading && categories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
            <FolderOpen size={48} className="mb-4 opacity-20" />
            <p className="font-bold text-lg">No categories yet</p>
            <p className="text-sm mt-1">
              Create your first category above to organize products
            </p>
          </div>
        )}
        {!loading && categories.length > 0 && (
          <div className="divide-y divide-navy/5">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={cn(
                  'flex items-center gap-4 px-6 py-4 transition-colors',
                  editingId === cat.id
                    ? 'bg-primary/5'
                    : 'hover:bg-background/40',
                )}
              >
                {/* Icon */}
                <div className="w-10 h-10 bg-navy/5 rounded-xl flex items-center justify-center shrink-0">
                  <FolderOpen size={18} className="text-navy/40" />
                </div>

                {editingId === cat.id ? (
                  /* Edit Mode */
                  <div className="flex-1 flex items-center gap-3">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 max-w-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdate(cat.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                    />
                    <Input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description"
                      className="flex-1 max-w-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdate(cat.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-emerald-600 hover:bg-emerald-500/10"
                      onClick={() => handleUpdate(cat.id)}
                    >
                      <Check size={16} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-text-secondary hover:bg-navy/5"
                      onClick={cancelEdit}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ) : (
                  /* View Mode */
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-navy truncate">{cat.name}</p>
                      {cat.description && (
                        <p className="text-xs text-text-secondary truncate mt-0.5">
                          {cat.description}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary font-medium shrink-0">
                      {new Date(cat.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-text-secondary hover:text-primary hover:bg-primary/10"
                        onClick={() => startEdit(cat)}
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-text-secondary hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(cat.id, cat.name)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
