import React, { useState, useMemo } from 'react';
import {
  FileCode2,
  Search,
  Plus,
  Pin,
  Trash2,
  Edit3,
  Download,
  Tag,
  Check,
  Eye,
  FileEdit,
  Layers,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useStudyData } from '../context/StudyDataContext';
import { Note } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

interface NotesPageProps {
  initialSubjectId?: string;
  initialTopicId?: string;
}

export const NotesPage: React.FC<NotesPageProps> = ({ initialSubjectId, initialTopicId }) => {
  const { subjects, notes, addNote, updateNote, deleteNote, toggleNotePin } = useStudyData();

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId || 'all');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Active note selection for reading/editing
  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes[0]?.id || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editSubjectId, setEditSubjectId] = useState('');
  const [editTopicId, setEditTopicId] = useState('');
  const [editTagsInput, setEditTagsInput] = useState('');

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newSubjectId, setNewSubjectId] = useState(subjects[0]?.id || '');
  const [newTopicId, setNewTopicId] = useState('');
  const [newTagsInput, setNewTagsInput] = useState('networking, security');

  // Compute all unique tags across notes
  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach(n => n.tags.forEach(t => set.add(t)));
    return Array.from(set);
  }, [notes]);

  // Filtered notes list
  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const matchesSearch =
        searchQuery === '' ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.contentMarkdown.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSubject = selectedSubjectId === 'all' || n.subjectId === selectedSubjectId;
      const matchesTag = selectedTag === 'all' || n.tags.includes(selectedTag);

      return matchesSearch && matchesSubject && matchesTag;
    }).sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, searchQuery, selectedSubjectId, selectedTag]);

  // Active note object
  const activeNote = notes.find(n => n.id === activeNoteId) || filteredNotes[0] || null;

  const handleStartEdit = (note: Note) => {
    setEditTitle(note.title);
    setEditContent(note.contentMarkdown);
    setEditSubjectId(note.subjectId);
    setEditTopicId(note.topicId || '');
    setEditTagsInput(note.tags.join(', '));
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!activeNote || !editTitle.trim()) return;
    const tags = editTagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    await updateNote(activeNote.id, {
      title: editTitle.trim(),
      contentMarkdown: editContent,
      subjectId: editSubjectId,
      topicId: editTopicId || undefined,
      tags
    });
    setIsEditing(false);
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const tags = newTagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

    await addNote({
      title: newTitle.trim(),
      contentMarkdown: newContent || '# ' + newTitle + '\n\nAdd technical documentation...',
      subjectId: newSubjectId,
      topicId: newTopicId || undefined,
      tags,
      isPinned: false
    });

    setNewTitle('');
    setNewContent('');
    setCreateModalOpen(false);
  };

  const handleExportMarkdown = (note: Note) => {
    const blob = new Blob([note.contentMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Simple Markdown renderer for preview
  const renderMarkdownPreview = (content: string) => {
    // Quick, clean formatting for markdown
    const lines = content.split('\n');
    return (
      <div className="space-y-3 font-sans text-sm text-slate-300 leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return <h3 key={idx} className="font-mono text-base font-bold text-emerald-400 mt-4 mb-2">{line.replace('### ', '')}</h3>;
          }
          if (line.startsWith('#### ')) {
            return <h4 key={idx} className="font-mono text-sm font-semibold text-cyan-300 mt-3 mb-1">{line.replace('#### ', '')}</h4>;
          }
          if (line.startsWith('# ')) {
            return <h1 key={idx} className="font-mono text-xl font-bold text-slate-100 border-b border-cyber-border pb-2 mt-4 mb-3">{line.replace('# ', '')}</h1>;
          }
          if (line.startsWith('## ')) {
            return <h2 key={idx} className="font-mono text-lg font-semibold text-slate-200 mt-4 mb-2">{line.replace('## ', '')}</h2>;
          }
          if (line.startsWith('> ')) {
            return (
              <blockquote key={idx} className="border-l-2 border-emerald-500/60 bg-emerald-950/20 px-3 py-2 text-xs font-mono text-emerald-300 rounded-r">
                {line.replace('> ', '')}
              </blockquote>
            );
          }
          if (line.startsWith('- [x] ')) {
            return (
              <div key={idx} className="flex items-center gap-2 font-mono text-xs text-slate-400">
                <span className="w-3.5 h-3.5 rounded bg-emerald-950 border border-emerald-500/60 flex items-center justify-center text-emerald-400 text-[10px]">✓</span>
                <span className="line-through">{line.replace('- [x] ', '')}</span>
              </div>
            );
          }
          if (line.startsWith('- [ ] ')) {
            return (
              <div key={idx} className="flex items-center gap-2 font-mono text-xs text-slate-300">
                <span className="w-3.5 h-3.5 rounded border border-slate-600" />
                <span>{line.replace('- [ ] ', '')}</span>
              </div>
            );
          }
          if (line.startsWith('- ')) {
            return (
              <li key={idx} className="list-disc ml-4 text-xs font-mono text-slate-300">
                {line.replace('- ', '')}
              </li>
            );
          }
          if (line.startsWith('```')) {
            return null; // Handle code blocks below
          }
          if (!line.trim()) {
            return <div key={idx} className="h-2" />;
          }

          // Inline code styling
          return (
            <p key={idx} className="text-xs text-slate-300 font-sans">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 mb-1">
            <FileCode2 className="w-4 h-4" />
            <span>KNOWLEDGE_VAULT // TECHNICAL_DOCS</span>
          </div>
          <h1 className="font-mono text-xl sm:text-2xl font-bold text-slate-100">
            NOTES REPOSITORY
          </h1>
          <p className="text-xs text-slate-400">
            Markdown documentation, exploit analysis logs, and protocol cheat sheets.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setCreateModalOpen(true)}
        >
          NEW_NOTE
        </Button>
      </div>

      {/* Search & Tag Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-cyber-surface border border-cyber-border p-3 rounded-lg">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search notes by keyword, command, tag or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded px-3 pl-9 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-600 transition-colors"
          />
        </div>

        {/* Subject Filter */}
        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          className="bg-cyber-bg border border-cyber-border rounded px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">ALL_SUBJECTS ({notes.length})</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
          ))}
        </select>

        {/* Tag Filter */}
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="bg-cyber-bg border border-cyber-border rounded px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">ALL_TAGS</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>#{tag}</option>
          ))}
        </select>
      </div>

      {/* Main Split Layout: Notes Index on Left, Reader/Editor on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* Left Column: Note Index List (4 Cols) */}
        <div className="lg:col-span-4 bg-cyber-surface border border-cyber-border rounded-lg overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-cyber-bg border-b border-cyber-border flex items-center justify-between text-xs font-mono text-slate-400">
            <span>INDEX ({filteredNotes.length} ENTRIES)</span>
            <span className="text-[10px] text-emerald-400 font-semibold">MARKDOWN</span>
          </div>

          <div className="p-2 space-y-1.5 flex-1 overflow-y-auto max-h-[750px]">
            {filteredNotes.length === 0 ? (
              <div className="py-12 text-center text-xs font-mono text-slate-500">
                NO_MATCHING_NOTES // Adjust search or filter criteria.
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isSelected = activeNote?.id === note.id;
                const subject = subjects.find(s => s.id === note.subjectId);

                return (
                  <div
                    key={note.id}
                    onClick={() => {
                      setActiveNoteId(note.id);
                      setIsEditing(false);
                    }}
                    className={`p-3 rounded border text-left transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-cyber-card border-emerald-500/50 shadow-terminal'
                        : 'bg-cyber-bg/50 border-cyber-border/70 hover:border-slate-700 hover:bg-cyber-surface'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {note.isPinned && (
                          <Pin className="w-3 h-3 text-amber-400 shrink-0 fill-amber-400" />
                        )}
                        <h2 className={`font-mono text-xs font-semibold truncate ${
                          isSelected ? 'text-emerald-400' : 'text-slate-200 group-hover:text-emerald-300'
                        }`}>
                          {note.title}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-slate-500">
                      {subject && (
                        <span style={{ color: subject.color }}>{subject.code}</span>
                      )}
                      <span>•</span>
                      <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                    </div>

                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="text-[9px] font-mono px-1.5 py-0.2 bg-cyber-bg text-slate-400 rounded border border-cyber-border"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Note Reader / Split Editor (8 Cols) */}
        <div className="lg:col-span-8 bg-cyber-surface border border-cyber-border rounded-lg overflow-hidden flex flex-col">
          {activeNote ? (
            <>
              {/* Header Bar */}
              <div className="px-4 py-3 bg-cyber-bg border-b border-cyber-border flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400">NOTE_ID:</span>
                  <span className="font-mono text-xs text-emerald-400 font-semibold">{activeNote.id}</span>
                  {activeNote.isPinned && (
                    <Badge variant="amber" size="sm">PINNED</Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleNotePin(activeNote.id)}
                    className="p-1.5 text-slate-400 hover:text-amber-400 rounded hover:bg-cyber-card transition-colors"
                    title={activeNote.isPinned ? 'Unpin' : 'Pin note'}
                  >
                    <Pin className={`w-3.5 h-3.5 ${activeNote.isPinned ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>

                  <button
                    onClick={() => handleExportMarkdown(activeNote)}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 rounded hover:bg-cyber-card transition-colors"
                    title="Export as .md"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  {!isEditing ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Edit3 className="w-3 h-3" />}
                      onClick={() => handleStartEdit(activeNote)}
                    >
                      EDIT_NOTE
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Check className="w-3 h-3" />}
                        onClick={handleSaveEdit}
                      >
                        Save
                      </Button>
                    </div>
                  )}

                  <button
                    onClick={() => deleteNote(activeNote.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors"
                    title="Purge Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Note Content / Editor Area */}
              <div className="p-6 flex-1 overflow-y-auto">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                        Note Title
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded px-3 py-2 text-xs font-mono text-slate-100"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                          Subject Module
                        </label>
                        <select
                          value={editSubjectId}
                          onChange={(e) => setEditSubjectId(e.target.value)}
                          className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded px-3 py-1.5 text-xs font-mono text-slate-200"
                        >
                          {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                          Tags (comma separated)
                        </label>
                        <input
                          type="text"
                          value={editTagsInput}
                          onChange={(e) => setEditTagsInput(e.target.value)}
                          placeholder="tcp, packets, rfc793"
                          className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded px-3 py-1.5 text-xs font-mono text-slate-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                        Markdown Content & Code Snippets
                      </label>
                      <textarea
                        rows={16}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded p-3 text-xs font-mono text-slate-200 leading-relaxed font-mono-cyber resize-y"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-mono text-xl sm:text-2xl font-bold text-slate-100">
                        {activeNote.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>Updated {new Date(activeNote.updatedAt).toLocaleString()}</span>
                        </span>
                        <span>•</span>
                        <div className="flex flex-wrap gap-1.5">
                          {activeNote.tags.map(t => (
                            <Badge key={t} variant="slate" size="sm">
                              #{t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-cyber-border pt-4">
                      {/* Code and Markdown Preview */}
                      <pre className="p-4 bg-cyber-bg border border-cyber-border rounded-lg text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        {activeNote.contentMarkdown}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-16 text-center text-xs font-mono text-slate-500">
              NO_NOTE_SELECTED // Choose a note from the index or create one.
            </div>
          )}
        </div>
      </div>

      {/* New Note Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="DRAFT_TECHNICAL_NOTE"
        subtitle="Markdown documentation"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateNote} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              Note Title
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Return-to-libc Attack Walkthrough & Stack Alignment"
              className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded px-3 py-2 text-xs font-mono text-slate-100"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Target Subject
              </label>
              <select
                value={newSubjectId}
                onChange={(e) => setNewSubjectId(e.target.value)}
                className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded px-3 py-2 text-xs font-mono text-slate-200"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Tags (Comma-delimited)
              </label>
              <input
                type="text"
                value={newTagsInput}
                onChange={(e) => setNewTagsInput(e.target.value)}
                placeholder="binary, buffer-overflow, libc"
                className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded px-3 py-2 text-xs font-mono text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              Markdown Body & Code Snippets
            </label>
            <textarea
              rows={10}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write detailed explanations, terminal command invocations, architecture diagrams, and takeaways..."
              className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded p-3 text-xs font-mono text-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              COMMIT_NOTE
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
