import { postgresService } from './postgresService';
import { encryptMessageE2EE, decryptMessageE2EE } from '../../utils/security';
import type {
  MemoryItem,
  PlannerEvent,
  JournalEntry,
  AppreciationItem,
  FamilyHabit,
  FinanceTransaction,
  SavingsTarget,
  ChatMessage
} from '../../types/family';

// ============================================================
// ASTA Family Supabase Service
// Menangani semua CRUD ke Supabase untuk fitur keluarga.
// Setiap data difilter berdasarkan family_id.
// ============================================================

class SupabaseFamilyService {

  private getClient() {
    return postgresService.getClient();
  }

  // ── MEMORIES ─────────────────────────────────────────────

  async loadMemories(familyId: string): Promise<MemoryItem[]> {
    const supabase = this.getClient();
    if (!supabase || !familyId) return [];
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map((r: any) => ({
        id: r.id,
        title: r.title,
        caption: r.caption || '',
        album: r.album || 'Family Moments',
        tags: r.tags || [],
        likes: r.likes || 1,
        date: r.memory_date || new Date().toISOString().split('T')[0]
      }));
    } catch { return []; }
  }

  async upsertMemory(familyId: string, item: MemoryItem): Promise<void> {
    const supabase = this.getClient();
    if (!supabase || !familyId) return;
    try {
      await supabase.from('memories').upsert({
        id: item.id,
        family_id: familyId,
        title: item.title,
        caption: item.caption || '',
        album: item.album || 'Family Moments',
        tags: item.tags || [],
        likes: item.likes || 1,
        memory_date: item.date || new Date().toISOString().split('T')[0]
      }, { onConflict: 'id' });
    } catch (e) { console.warn('upsertMemory error:', e); }
  }

  async deleteMemory(id: string): Promise<void> {
    const supabase = this.getClient();
    if (!supabase) return;
    try { await supabase.from('memories').delete().eq('id', id); }
    catch (e) { console.warn('deleteMemory error:', e); }
  }

  // ── PLANNER EVENTS ────────────────────────────────────────

  async loadPlannerEvents(familyId: string): Promise<PlannerEvent[]> {
    const supabase = this.getClient();
    if (!supabase || !familyId) return [];
    try {
      const { data, error } = await supabase
        .from('planner_events')
        .select('*')
        .eq('family_id', familyId)
        .order('event_date', { ascending: true });
      if (error || !data) return [];
      return data.map((r: any) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        date: r.event_date,
        time: r.event_time || '',
        emoji: '📅',
        completed: r.is_completed || false
      }));
    } catch { return []; }
  }

  async upsertPlannerEvent(familyId: string, item: PlannerEvent): Promise<void> {
    const supabase = this.getClient();
    if (!supabase || !familyId) return;
    try {
      await supabase.from('planner_events').upsert({
        id: item.id,
        family_id: familyId,
        title: item.title,
        category: item.category,
        event_date: item.date,
        event_time: item.time || null,
        is_completed: item.completed || false
      }, { onConflict: 'id' });
    } catch (e) { console.warn('upsertPlannerEvent error:', e); }
  }

  async deletePlannerEvent(id: string): Promise<void> {
    const supabase = this.getClient();
    if (!supabase) return;
    try { await supabase.from('planner_events').delete().eq('id', id); }
    catch (e) { console.warn('deletePlannerEvent error:', e); }
  }

  // ── JOURNAL ENTRIES ───────────────────────────────────────

  async loadJournalEntries(familyId: string): Promise<JournalEntry[]> {
    const supabase = this.getClient();
    if (!supabase || !familyId) return [];
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map((r: any) => ({
        id: r.id,
        playerId: r.author_id || '',
        playerName: r.player_name || '',
        playerAvatar: r.player_avatar || '😊',
        date: r.entry_date || new Date().toISOString().split('T')[0],
        mood: r.mood,
        reason: r.story,
        createdAt: r.created_at
          ? new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : ''
      }));
    } catch { return []; }
  }

  async insertJournalEntry(familyId: string, item: JournalEntry): Promise<void> {
    const supabase = this.getClient();
    if (!supabase || !familyId) return;
    try {
      await supabase.from('journal_entries').upsert({
        id: item.id,
        family_id: familyId,
        author_id: item.playerId || null,
        player_name: item.playerName || null,
        player_avatar: item.playerAvatar || null,
        mood: item.mood,
        story: item.reason,
        entry_date: item.date
      }, { onConflict: 'id' });
    } catch (e) { console.warn('insertJournalEntry error:', e); }
  }

  // ── APPRECIATIONS ─────────────────────────────────────────

  async loadAppreciations(familyId: string): Promise<AppreciationItem[]> {
    const supabase = this.getClient();
    if (!supabase || !familyId) return [];
    try {
      const { data, error } = await supabase
        .from('appreciations')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map((r: any) => ({
        id: r.id,
        fromPlayerId: r.from_user_id || '',
        fromPlayerName: r.from_player_name || '',
        fromPlayerAvatar: r.from_player_avatar || '😊',
        toPlayerId: r.to_user_id || '',
        toPlayerName: r.to_player_name || '',
        toPlayerAvatar: r.to_player_avatar || '😊',
        message: r.message,
        lovePoints: r.love_points || 10,
        date: r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : 'Hari ini',
        badge: r.category || 'Penuh Kasih ❤️'
      }));
    } catch { return []; }
  }

  async insertAppreciation(familyId: string, item: AppreciationItem): Promise<void> {
    const supabase = this.getClient();
    if (!supabase || !familyId) return;
    try {
      await supabase.from('appreciations').upsert({
        id: item.id,
        family_id: familyId,
        from_user_id: item.fromPlayerId || null,
        from_player_name: item.fromPlayerName || null,
        from_player_avatar: item.fromPlayerAvatar || null,
        to_user_id: item.toPlayerId || null,
        to_player_name: item.toPlayerName || null,
        to_player_avatar: item.toPlayerAvatar || null,
        message: item.message,
        category: item.badge || 'Penuh Kasih ❤️',
        love_points: item.lovePoints || 10
      }, { onConflict: 'id' });
    } catch (e) { console.warn('insertAppreciation error:', e); }
  }

  // ── HABITS ────────────────────────────────────────────────

  async loadHabits(familyId: string): Promise<FamilyHabit[]> {
    const supabase = this.getClient();
    if (!supabase || !familyId) return [];
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('family_id', familyId);
      if (error || !data) return [];
      return data.map((r: any) => ({
        id: r.id,
        title: r.title,
        emoji: r.emoji || '⭐',
        category: r.category,
        completedToday: false,
        streakDays: r.streak || 0
      }));
    } catch { return []; }
  }

  async upsertHabit(familyId: string, item: FamilyHabit): Promise<void> {
    const supabase = this.getClient();
    if (!supabase || !familyId) return;
    try {
      await supabase.from('habits').upsert({
        id: item.id,
        family_id: familyId,
        title: item.title,
        category: item.category,
        emoji: item.emoji || '⭐',
        target_frequency: 'daily',
        streak: item.streakDays || 0
      }, { onConflict: 'id' });
    } catch (e) { console.warn('upsertHabit error:', e); }
  }

  // ── FINANCE TRANSACTIONS ──────────────────────────────────

  async loadTransactions(familyId: string): Promise<FinanceTransaction[]> {
    const supabase = this.getClient();
    if (!supabase || !familyId) return [];
    try {
      const { data, error } = await supabase
        .from('finance_transactions')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map((r: any) => ({
        id: r.id,
        type: r.type as 'income' | 'expense',
        amount: r.amount,
        category: r.category,
        note: r.title,
        date: r.transaction_date || new Date().toISOString().split('T')[0]
      }));
    } catch { return []; }
  }

  async insertTransaction(familyId: string, item: FinanceTransaction): Promise<void> {
    const supabase = this.getClient();
    if (!supabase || !familyId) return;
    try {
      await supabase.from('finance_transactions').upsert({
        id: item.id,
        family_id: familyId,
        title: item.note || item.category,
        type: item.type,
        amount: item.amount,
        category: item.category,
        transaction_date: item.date
      }, { onConflict: 'id' });
    } catch (e) { console.warn('insertTransaction error:', e); }
  }

  // ── SAVINGS TARGETS ───────────────────────────────────────

  async loadSavingsTargets(familyId: string): Promise<SavingsTarget[]> {
    const supabase = this.getClient();
    if (!supabase || !familyId) return [];
    try {
      const { data, error } = await supabase
        .from('savings_targets')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: true });
      if (error || !data) return [];
      return data.map((r: any) => ({
        id: r.id,
        title: r.title,
        targetAmount: r.target_amount,
        currentAmount: r.current_amount || 0,
        emoji: r.emoji || '🎯',
        deadline: r.deadline || undefined
      }));
    } catch { return []; }
  }

  async upsertSavingsTarget(familyId: string, item: SavingsTarget): Promise<void> {
    const supabase = this.getClient();
    if (!supabase || !familyId) return;
    try {
      await supabase.from('savings_targets').upsert({
        id: item.id,
        family_id: familyId,
        title: item.title,
        target_amount: item.targetAmount,
        current_amount: item.currentAmount || 0,
        emoji: item.emoji || '🎯',
        deadline: item.deadline || null
      }, { onConflict: 'id' });
    } catch (e) { console.warn('upsertSavingsTarget error:', e); }
  }

  // ── CHAT MESSAGES ─────────────────────────────────────────

  async loadChatMessages(familyId: string): Promise<ChatMessage[]> {
    const supabase = this.getClient();
    if (!supabase || !familyId) return [];
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: true })
        .limit(200);
      if (error || !data) return [];
      return data.map((r: any) => ({
        id: r.id,
        senderId: r.sender_id || '',
        senderName: r.sender_name,
        senderAvatar: r.sender_avatar,
        senderColor: r.sender_color,
        text: decryptMessageE2EE(r.message_text, familyId),
        timestamp: r.created_at
          ? new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '',
        reactions: Array.isArray(r.reactions) ? r.reactions : [],
        mediaType: (r.media_type as ChatMessage['mediaType']) || 'text'
      }));
    } catch { return []; }
  }

  async insertChatMessage(familyId: string, msg: ChatMessage): Promise<void> {
    const supabase = this.getClient();
    if (!supabase || !familyId) return;
    try {
      await supabase.from('chat_messages').insert({
        id: msg.id,
        family_id: familyId,
        sender_id: msg.senderId || null,
        sender_name: msg.senderName,
        sender_avatar: msg.senderAvatar,
        sender_color: msg.senderColor,
        message_text: encryptMessageE2EE(msg.text, familyId),
        media_type: msg.mediaType || 'text',
        reactions: msg.reactions || []
      });
    } catch (e) { console.warn('insertChatMessage error:', e); }
  }

  async updateChatReactions(msgId: string, reactions: ChatMessage['reactions']): Promise<void> {
    const supabase = this.getClient();
    if (!supabase) return;
    try {
      await supabase.from('chat_messages').update({ reactions }).eq('id', msgId);
    } catch (e) { console.warn('updateChatReactions error:', e); }
  }

  async deleteChatMessage(id: string): Promise<void> {
    const supabase = this.getClient();
    if (!supabase) return;
    try { await supabase.from('chat_messages').delete().eq('id', id); }
    catch (e) { console.warn('deleteChatMessage error:', e); }
  }

  // ── FULL LOAD ─────────────────────────────────────────────

  async loadAllFamilyData(familyId: string): Promise<{
    memories: MemoryItem[];
    plannerEvents: PlannerEvent[];
    journalEntries: JournalEntry[];
    appreciations: AppreciationItem[];
    habits: FamilyHabit[];
    transactions: FinanceTransaction[];
    savingsTargets: SavingsTarget[];
    chatMessages: ChatMessage[];
  }> {
    if (!familyId) {
      return {
        memories: [], plannerEvents: [], journalEntries: [],
        appreciations: [], habits: [], transactions: [],
        savingsTargets: [], chatMessages: []
      };
    }
    const [
      memories, plannerEvents, journalEntries, appreciations,
      habits, transactions, savingsTargets, chatMessages
    ] = await Promise.all([
      this.loadMemories(familyId),
      this.loadPlannerEvents(familyId),
      this.loadJournalEntries(familyId),
      this.loadAppreciations(familyId),
      this.loadHabits(familyId),
      this.loadTransactions(familyId),
      this.loadSavingsTargets(familyId),
      this.loadChatMessages(familyId)
    ]);
    return { memories, plannerEvents, journalEntries, appreciations, habits, transactions, savingsTargets, chatMessages };
  }
}

export const supabaseFamilyService = new SupabaseFamilyService();
