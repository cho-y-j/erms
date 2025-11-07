import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';
import { toSnakeCase, toCamelCase, toCamelCaseArray } from './db-utils';
import {
  InsertUser,
  User,
  EquipType,
  InsertEquipType,
  WorkerType,
  InsertWorkerType,
  TypeDoc,
  InsertTypeDoc,
  WorkerDoc,
  InsertWorkerDoc,
  ChecklistForm,
  InsertChecklistForm,
  Equipment,
  InsertEquipment,
  Worker,
  InsertWorker,
  DocsCompliance,
  InsertDocsCompliance,
  CheckRecord,
  InsertCheckRecord,
  WorkJournal,
  InsertWorkJournal,
  EntryRequest,
  InsertEntryRequest,
  EntryRequestItem,
  InsertEntryRequestItem,
  Deployment,
  InsertDeployment,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabase() {
  if (!_supabase && supabaseUrl && supabaseAnonKey) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('[Database] Supabase client initialized');
  }
  return _supabase;
}

export function getSupabaseAdmin() {
  if (!_supabaseAdmin && supabaseUrl && supabaseServiceKey) {
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('[Database] Supabase Admin client initialized');
  }
  return _supabaseAdmin;
}

// getDb는 호환성을 위해 유지하지만 Supabase 클라이언트를 반환
export async function getDb() {
  return getSupabase();
}

// ============================================================
// 사용자 관리
// ============================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const supabase = getSupabase();
  if (!supabase) {
    console.warn("[Database] Cannot upsert user: Supabase not available");
    return;
  }

  try {
    // 비밀번호가 있으면 해싱
    const userData = { ...user };
    if (userData.password) {
      const { hashPassword } = await import("./_core/password");
      userData.password = hashPassword(userData.password);
    }

    const { error } = await supabase
      .from('users')
      .upsert(toSnakeCase(userData), { onConflict: 'id' });

    if (error) throw error;
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

// Alias for createUser (same as upsertUser)
export const createUser = upsertUser;

export async function getUser(id: string): Promise<User | undefined> {
  const supabase = getSupabase();
  if (!supabase) return undefined;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("[Database] Error getting user:", error);
    return undefined;
  }

  return toCamelCase(data) as User;
}

export async function getAllUsers(): Promise<User[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    console.error("[Database] Error getting users:", error);
    return [];
  }

  return toCamelCaseArray(data || []) as User[];
}

export async function updateUserRole(userId: string, role: string) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId);

  if (error) {
    console.error("[Database] Error updating user role:", error);
  }
}

// ============================================================
// 장비 종류 관리
// ============================================================

export async function createEquipType(data: InsertEquipType) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { error } = await supabase
    .from('equip_types')
    .insert(toSnakeCase(data));

  if (error) throw error;
}

export async function getAllEquipTypes(): Promise<EquipType[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('equip_types')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("[Database] Error getting equip types:", error);
    return [];
  }

  return toCamelCaseArray(data || []) as EquipType[];
}

export async function getEquipTypeById(id: string): Promise<EquipType | undefined> {
  const supabase = getSupabase();
  if (!supabase) return undefined;

  const { data, error } = await supabase
    .from('equip_types')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("[Database] Error getting equip type:", error);
    return undefined;
  }

  return data as EquipType;
}

export async function updateEquipType(id: string, data: Partial<InsertEquipType>) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from('equip_types')
    .update(toSnakeCase(data))
    .eq('id', id);

  if (error) {
    console.error("[Database] Error updating equip type:", error);
  }
}

export async function deleteEquipType(id: string) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from('equip_types')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("[Database] Error deleting equip type:", error);
  }
}

// ============================================================
// 장비별 필수 서류 관리
// ============================================================

export async function createTypeDoc(data: InsertTypeDoc) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { error } = await supabase
    .from('type_docs')
    .insert(toSnakeCase(data));

  if (error) throw error;
}

export async function getAllTypeDocs(): Promise<TypeDoc[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('type_docs')
    .select('*');

  if (error) {
    console.error("[Database] Error getting type docs:", error);
    return [];
  }

  return toCamelCaseArray(data || []) as TypeDoc[];
}

export async function getTypeDocsByEquipType(equipTypeId: string): Promise<TypeDoc[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('type_docs')
    .select('*')
    .eq('equip_type_id', equipTypeId);

  if (error) {
    console.error("[Database] Error getting type docs by equip type:", error);
    return [];
  }

  return toCamelCaseArray(data || []) as TypeDoc[];
}

export async function deleteTypeDoc(id: string) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from('type_docs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("[Database] Error deleting type doc:", error);
  }
}

// ============================================================
// 인력 유형 관리
// ============================================================

export async function createWorkerType(data: InsertWorkerType) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { error } = await supabase
    .from('worker_types')
    .insert(toSnakeCase(data));

  if (error) throw error;
}

export async function getAllWorkerTypes(): Promise<WorkerType[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('worker_types')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("[Database] Error getting worker types:", error);
    return [];
  }

  return toCamelCaseArray(data || []) as WorkerType[];
}

export async function getWorkerTypeById(id: string): Promise<WorkerType | undefined> {
  const supabase = getSupabase();
  if (!supabase) return undefined;

  const { data, error } = await supabase
    .from('worker_types')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("[Database] Error getting worker type:", error);
    return undefined;
  }

  return data as WorkerType;
}

export async function updateWorkerType(id: string, data: Partial<InsertWorkerType>) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from('worker_types')
    .update(toSnakeCase(data))
    .eq('id', id);

  if (error) {
    console.error("[Database] Error updating worker type:", error);
  }
}

export async function deleteWorkerType(id: string) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from('worker_types')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("[Database] Error deleting worker type:", error);
  }
}

// ============================================================
// 인력별 필수 서류 관리
// ============================================================

export async function createWorkerDoc(data: InsertWorkerDoc) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { error } = await supabase
    .from('worker_docs')
    .insert(toSnakeCase(data));

  if (error) throw error;
}

export async function getAllWorkerDocs(): Promise<WorkerDoc[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('worker_docs')
    .select('*');

  if (error) {
    console.error("[Database] Error getting worker docs:", error);
    return [];
  }

  return toCamelCaseArray(data || []) as WorkerDoc[];
}

export async function getWorkerDocsByWorkerType(workerTypeId: string): Promise<WorkerDoc[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('worker_docs')
    .select('*')
    .eq('worker_type_id', workerTypeId);

  if (error) {
    console.error("[Database] Error getting worker docs by worker type:", error);
    return [];
  }

  return toCamelCaseArray(data || []) as WorkerDoc[];
}

export async function deleteWorkerDoc(id: string) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from('worker_docs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("[Database] Error deleting worker doc:", error);
  }
}

// ============================================================
// 안전점검표 템플릿 관리
// ============================================================

export async function createChecklistForm(data: InsertChecklistForm) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { error } = await supabase
    .from('checklist_forms')
    .insert(toSnakeCase(data));

  if (error) throw error;
}

export async function getAllChecklistForms(): Promise<ChecklistForm[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('checklist_forms')
    .select('*');

  if (error) {
    console.error("[Database] Error getting checklist forms:", error);
    return [];
  }

  return toCamelCaseArray(data || []) as ChecklistForm[];
}

export async function getChecklistFormById(id: string): Promise<ChecklistForm | undefined> {
  const supabase = getSupabase();
  if (!supabase) return undefined;

  const { data, error } = await supabase
    .from('checklist_forms')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("[Database] Error getting checklist form:", error);
    return undefined;
  }

  return data as ChecklistForm;
}

export async function updateChecklistForm(id: string, data: Partial<InsertChecklistForm>) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from('checklist_forms')
    .update(toSnakeCase(data))
    .eq('id', id);

  if (error) {
    console.error("[Database] Error updating checklist form:", error);
  }
}

export async function deleteChecklistForm(id: string) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from('checklist_forms')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("[Database] Error deleting checklist form:", error);
  }
}

// ============================================================
// 장비 관리
// ============================================================

export async function createEquipment(data: InsertEquipment) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { error } = await supabase
    .from('equipment')
    .insert(toSnakeCase(data));

  if (error) throw error;
}

export async function getAllEquipment(): Promise<Equipment[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('equipment')
    .select('*');

  if (error) {
    console.error("[Database] Error getting equipment:", error);
    return [];
  }

  return toCamelCaseArray(data || []) as Equipment[];
}

export async function getEquipmentById(id: string): Promise<Equipment | undefined> {
  const supabase = getSupabase();
  if (!supabase) return undefined;

  const { data, error } = await supabase
    .from('equipment')
    .select(`
      *,
      equip_type:equip_types!equipment_equip_type_id_fkey(id, name, description)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error("[Database] Error getting equipment:", error);
    return undefined;
  }

  return toCamelCase(data) as Equipment;
}

export async function getEquipmentByOwner(ownerId: string): Promise<Equipment[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('owner_id', ownerId);

  if (error) {
    console.error("[Database] Error getting equipment by owner:", error);
    return [];
  }

  return toCamelCaseArray(data || []) as Equipment[];
}

export async function getEquipmentByAssignedWorker(workerId: string): Promise<Equipment | undefined> {
  const supabase = getSupabase();
  if (!supabase) return undefined;

  console.log("[Database] getEquipmentByAssignedWorker called with workerId:", workerId);

  const { data, error } = await supabase
    .from('equipment')
    .select(`
      *,
      equip_type:equip_types!equipment_equip_type_id_fkey(id, name, description)
    `)
    .eq('assigned_worker_id', workerId)
    .maybeSingle();

  if (error) {
    console.error("[Database] Error getting equipment by assigned worker:", workerId, error);
    return undefined;
  }

  if (!data) {
    console.log("[Database] No equipment assigned to worker:", workerId);
    return undefined;
  }

  console.log("[Database] Found equipment:", data.id, "for worker:", workerId);
  return toCamelCase(data) as Equipment;
}

export async function updateEquipment(id: string, data: Partial<InsertEquipment>) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from('equipment')
    .update(toSnakeCase(data))
    .eq('id', id);

  if (error) {
    console.error("[Database] Error updating equipment:", error);
  }
}

export async function deleteEquipment(id: string) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from('equipment')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("[Database] Error deleting equipment:", error);
  }
}

// ============================================================
// 인력 관리
// ============================================================

export async function createWorker(data: InsertWorker) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { error } = await supabase
    .from('workers')
    .insert(toSnakeCase(data));

  if (error) throw error;
}

export async function getAllWorkers(): Promise<Worker[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('workers')
    .select('*');

  if (error) {
    console.error("[Database] Error getting workers:", error);
    return [];
  }

  return toCamelCaseArray(data || []) as Worker[];
}

export async function getWorkerById(id: string): Promise<Worker | undefined> {
  const supabase = getSupabase();
  if (!supabase) return undefined;

  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("[Database] Error getting worker:", error);
    return undefined;
  }

  return data as Worker;
}

export async function getWorkerByPin(pinCode: string): Promise<User | undefined> {
  const supabase = getSupabase();
  if (!supabase) return undefined;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('pin', pinCode)
    .eq('role', 'worker')
    .single();

  if (error) {
    console.error("[Database] Error getting worker by PIN:", error);
    return undefined;
  }

  return data as User;
}

export async function getWorkersByOwner(ownerId: string): Promise<Worker[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .eq('owner_id', ownerId);

  if (error) {
    console.error("[Database] Error getting workers by owner:", error);
    return [];
  }

  return toCamelCaseArray(data || []) as Worker[];
}

export async function updateWorker(id: string, data: Partial<InsertWorker>) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from('workers')
    .update(toSnakeCase(data))
    .eq('id', id);

  if (error) {
    console.error("[Database] Error updating worker:", error);
  }
}

export async function getWorkerByPinCode(pinCode: string): Promise<Worker | undefined> {
  const supabase = getSupabase();
  if (!supabase) return undefined;

  console.log("[Database] getWorkerByPinCode called with PIN:", pinCode);

  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .eq('pin_code', pinCode)
    .maybeSingle();

  if (error) {
    console.error("[Database] Error getting worker by PIN:", pinCode, error);
    return undefined;
  }

  if (!data) {
    console.log("[Database] No worker found with PIN:", pinCode);
    // 디버깅: 모든 worker의 PIN 확인
    const { data: allWorkers } = await supabase
      .from('workers')
      .select('id, name, pin_code');
    console.log("[Database] All workers with PINs:", allWorkers?.map(w => ({ id: w.id, name: w.name, pin: w.pin_code })));
    return undefined;
  }

  console.log("[Database] Found worker:", data.id, data.name, "with PIN:", pinCode);
  return toCamelCase(data) as Worker;
}

export async function getWorkerByEmail(email: string): Promise<Worker | undefined> {
  const supabase = getSupabase();
  if (!supabase) return undefined;

  console.log("[Database] getWorkerByEmail called with email:", email);

  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error("[Database] Error getting worker by email:", email, error);
    return undefined;
  }

  if (!data) {
    console.log("[Database] No worker found with email:", email);
    return undefined;
  }

  console.log("[Database] Found worker:", data.id, data.name, "with email:", email);
  return toCamelCase(data) as Worker;
}

export async function deleteWorker(id: string) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from('workers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("[Database] Error deleting worker:", error);
  }
}

// ============================================================
// 서류 관리
// ============================================================

export async function createDocsCompliance(data: InsertDocsCompliance) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { error } = await supabase
    .from('docs_compliance')
    .insert(toSnakeCase(data));

  if (error) throw error;
}

export async function getAllDocsCompliance(): Promise<DocsCompliance[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('docs_compliance')
    .select('*');

  if (error) {
    console.error("[Database] Error getting docs compliance:", error);
    return [];
  }

  return toCamelCaseArray(data || []) as DocsCompliance[];
}

export async function getDocsComplianceById(id: string): Promise<DocsCompliance | undefined> {
  const supabase = getSupabase();
  if (!supabase) return undefined;

  const { data, error } = await supabase
    .from('docs_compliance')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("[Database] Error getting docs compliance:", error);
    return undefined;
  }

  return data as DocsCompliance;
}

export async function getDocsComplianceByTarget(targetType: "equipment" | "worker", targetId: string): Promise<DocsCompliance[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('docs_compliance')
    .select('*')
    .eq('target_type', targetType)
    .eq('target_id', targetId);

  if (error) {
    console.error("[Database] Error getting docs compliance by target:", error);
    return [];
  }

  return toCamelCaseArray(data || []) as DocsCompliance[];
}

export async function updateDocsCompliance(id: string, data: Partial<InsertDocsCompliance>) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from('docs_compliance')
    .update(toSnakeCase(data))
    .eq('id', id);

  if (error) {
    console.error("[Database] Error updating docs compliance:", error);
  }
}

export async function deleteDocsCompliance(id: string) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from('docs_compliance')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("[Database] Error deleting docs compliance:", error);
  }
}

// 만료 예정 서류 조회
export async function getExpiringDocs(daysAhead: number = 30): Promise<DocsCompliance[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const { data, error } = await supabase
    .from('docs_compliance')
    .select('*')
    .lte('expiry_date', futureDate.toISOString())
    .gte('expiry_date', new Date().toISOString());

  if (error) {
    console.error("[Database] Error getting expiring docs:", error);
    return [];
  }

  return toCamelCaseArray(data || []) as DocsCompliance[];
}

// ============================================================
// 안전점검 기록
// ============================================================

export async function createCheckRecord(data: InsertCheckRecord) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { error } = await supabase
    .from('check_records')
    .insert(toSnakeCase(data));

  if (error) throw error;
}

export async function getAllCheckRecords(): Promise<CheckRecord[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('check_records')
    .select('*')
    .order('inspection_date', { ascending: false });

  if (error) {
    console.error("[Database] Error getting check records:", error);
    return [];
  }

  return toCamelCaseArray(data || []) as CheckRecord[];
}

export async function getCheckRecordsByEquipment(equipmentId: string): Promise<CheckRecord[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('check_records')
    .select('*')
    .eq('equipment_id', equipmentId)
    .order('inspection_date', { ascending: false });

  if (error) {
    console.error("[Database] Error getting check records by equipment:", error);
    return [];
  }

  return toCamelCaseArray(data || []) as CheckRecord[];
}

// ============================================================
// 일일 작업 확인서
// ============================================================

export async function createWorkJournal(data: InsertWorkJournal) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { error } = await supabase
    .from('work_journal')
    .insert(toSnakeCase(data));

  if (error) throw error;
}

export async function getWorkJournals(filters?: {
  workerId?: string;
  bpCompanyId?: string;
  deploymentId?: string;
  ownerId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<WorkJournal[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  console.log("[Database] getWorkJournals called with filters:", filters);

  // Owner 필터가 있으면 deployment를 통해 필터링
  if (filters?.ownerId) {
    // Step 1: Owner의 deployment IDs 조회
    const { data: deployments } = await supabase
      .from('deployments')
      .select('id')
      .eq('owner_id', filters.ownerId);

    const deploymentIds = (deployments || []).map((d: any) => d.id);
    if (deploymentIds.length === 0) {
      console.log("[Database] No deployments found for owner:", filters.ownerId);
      return [];
    }

    // Step 2: 해당 deployment의 work_journal 조회 (worker 정보 포함)
    let query = supabase
      .from('work_journal')
      .select(`
        *,
        worker:workers!work_journal_worker_id_fkey(id, name, license_num)
      `)
      .in('deployment_id', deploymentIds)
      .order('work_date', { ascending: false });

    if (filters?.workerId) {
      query = query.eq('worker_id', filters.workerId);
    }
    if (filters?.bpCompanyId) {
      query = query.eq('bp_company_id', filters.bpCompanyId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.startDate) {
      query = query.gte('work_date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('work_date', filters.endDate);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[Database] Error getting work journals:", error);
      return [];
    }

    console.log("[Database] getWorkJournals returned:", data?.length || 0, "records (filtered by owner)");
    return toCamelCaseArray(data || []) as WorkJournal[];
  }

  // Owner 필터가 없으면 기존 방식 (worker 정보 포함)
  let query = supabase
    .from('work_journal')
    .select(`
      *,
      worker:workers!work_journal_worker_id_fkey(id, name, license_num)
    `)
    .order('work_date', { ascending: false});

  if (filters?.workerId) {
    query = query.eq('worker_id', filters.workerId);
  }
  if (filters?.bpCompanyId) {
    query = query.eq('bp_company_id', filters.bpCompanyId);
  }
  if (filters?.deploymentId) {
    query = query.eq('deployment_id', filters.deploymentId);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.startDate) {
    query = query.gte('work_date', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('work_date', filters.endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[Database] Error getting work journals:", error);
    return [];
  }

  console.log("[Database] getWorkJournals returned:", data?.length || 0, "records");
  if (data && data.length > 0) {
    console.log("[Database] First record BP Company ID:", data[0].bp_company_id);
  }

  return toCamelCaseArray(data || []) as WorkJournal[];
}

export async function getAllWorkJournals(): Promise<WorkJournal[]> {
  return getWorkJournals();
}

export async function getWorkJournalById(id: string): Promise<WorkJournal | undefined> {
  const supabase = getSupabase();
  if (!supabase) return undefined;

  const { data, error } = await supabase
    .from('work_journal')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("[Database] Error getting work journal:", error);
    return undefined;
  }

  return data as WorkJournal;
}

export async function updateWorkJournal(id: string, data: Partial<InsertWorkJournal>) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from('work_journal')
    .update(toSnakeCase(data))
    .eq('id', id);

  if (error) {
    console.error("[Database] Error updating work journal:", error);
  }
}

/**
 * Owner의 작업확인서 목록 조회
 * deployment를 통해 owner_id로 필터링
 */
export async function getWorkJournalsByOwnerId(ownerId: string, filters?: {
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<WorkJournal[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  // Step 1: Get deployment IDs for this owner
  console.log("[Database] getWorkJournalsByOwnerId - Searching deployments for owner_id:", ownerId);
  const { data: deployments, error: deploymentError } = await supabase
    .from('deployments')
    .select('id')
    .eq('owner_id', ownerId);

  if (deploymentError) {
    console.error("[Database] Error getting deployments for owner:", deploymentError);
    return [];
  }

  console.log("[Database] getWorkJournalsByOwnerId - Found deployments:", deployments?.length || 0);
  const deploymentIds = (deployments || []).map((d: any) => d.id);
  if (deploymentIds.length === 0) {
    console.log("[Database] getWorkJournalsByOwnerId - No deployments found for owner:", ownerId);
    // Check what owner_ids exist in deployments table
    const { data: allDeployments } = await supabase
      .from('deployments')
      .select('owner_id')
      .limit(10);
    console.log("[Database] Sample owner_ids in deployments table:", allDeployments?.map(d => d.owner_id));
    return []; // No deployments for this owner
  }

  console.log("[Database] getWorkJournalsByOwnerId - Deployment IDs:", deploymentIds);

  // Step 2: Get work journals for these deployments
  let query = supabase
    .from('work_journal')
    .select('*')
    .in('deployment_id', deploymentIds)
    .order('work_date', { ascending: false });

  // Check what deployment_ids exist in work_journal table
  const { data: allWorkJournals } = await supabase
    .from('work_journal')
    .select('deployment_id')
    .limit(10);
  console.log("[Database] Sample deployment_ids in work_journal table:", allWorkJournals?.map(wj => wj.deployment_id));

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.startDate) {
    query = query.gte('work_date', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('work_date', filters.endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[Database] Error getting work journals by owner:", error);
    return [];
  }

  return toCamelCaseArray(data || []) as WorkJournal[];
}

// ============================================================
// 반입 요청
// ============================================================

export async function createEntryRequest(data: InsertEntryRequest) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { error } = await supabase
    .from('entry_requests')
    .insert(toSnakeCase(data));

  if (error) throw error;
}

export async function getAllEntryRequests(): Promise<EntryRequest[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('entry_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("[Database] Error getting entry requests:", error);
    return [];
  }

  return toCamelCaseArray(data || []) as EntryRequest[];
}

export async function getEntryRequestById(id: string): Promise<EntryRequest | undefined> {
  const supabase = getSupabase();
  if (!supabase) return undefined;

  const { data, error } = await supabase
    .from('entry_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("[Database] Error getting entry request:", error);
    return undefined;
  }

  return data as EntryRequest;
}

export async function updateEntryRequest(id: string, data: Partial<InsertEntryRequest>) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from('entry_requests')
    .update(toSnakeCase(data))
    .eq('id', id);

  if (error) {
    console.error("[Database] Error updating entry request:", error);
  }
}



// ============================================================
// 반입 요청 아이템 (장비/인력 목록)
// ============================================================

export async function createEntryRequestItem(data: InsertEntryRequestItem) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { error } = await supabase
    .from('entry_request_items')
    .insert(toSnakeCase(data));

  if (error) throw error;
}

export async function createEntryRequestItems(items: InsertEntryRequestItem[]) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { error } = await supabase
    .from('entry_request_items')
    .insert(items.map(item => toSnakeCase(item)));

  if (error) throw error;
}

export async function getEntryRequestItems(entryRequestId: string): Promise<EntryRequestItem[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('entry_request_items')
    .select('*')
    .eq('entry_request_id', entryRequestId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("[Database] Error getting entry request items:", error);
    return [];
  }

  return toCamelCaseArray(data || []) as EntryRequestItem[];
}

export async function updateEntryRequestItem(id: string, data: Partial<InsertEntryRequestItem>) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from('entry_request_items')
    .update(toSnakeCase(data))
    .eq('id', id);

  if (error) {
    console.error("[Database] Error updating entry request item:", error);
  }
}

export async function deleteEntryRequestItems(entryRequestId: string) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from('entry_request_items')
    .delete()
    .eq('entry_request_id', entryRequestId);

  if (error) {
    console.error("[Database] Error deleting entry request items:", error);
  }
}



// ============================================================
// 모바일 앱 관련 함수
// ============================================================

// Work Sessions
export async function createWorkSession(data: {
  id: string;
  equipmentId: string;
  workerId: string;
  workDate: Date;
  startTime: Date;
  status: string;
}) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { error } = await supabase
    .from('work_sessions')
    .insert(toSnakeCase(data));

  if (error) {
    console.error("[Database] Error creating work session:", error);
    throw error;
  }
}

export async function updateWorkSession(id: string, data: any) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { error } = await supabase
    .from('work_sessions')
    .update({ ...toSnakeCase(data), updated_at: new Date() })
    .eq('id', id);

  if (error) {
    console.error("[Database] Error updating work session:", error);
    throw error;
  }
}

export async function getCurrentWorkSession(workerId: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('work_sessions')
    .select('*')
    .eq('worker_id', workerId)
    .is('end_time', null)  // status 컬럼 대신 end_time이 null인 것으로 진행 중 세션 판별
    .order('start_time', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("[Database] Error getting current work session:", error);
    throw error;
  }

  return data ? toCamelCaseArray([data])[0] : null;
}

export async function getAllActiveWorkSessions() {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('work_sessions')
    .select(`
      *,
      workers:worker_id (
        id,
        name,
        worker_type_id
      ),
      equipment:equipment_id (
        id,
        reg_num,
        equip_type_id
      )
    `)
    .in('status', ['working', 'break', 'overtime'])
    .order('start_time', { ascending: false });

  if (error) {
    console.error("[Database] Error getting all active work sessions:", error);
    throw error;
  }

  return toCamelCaseArray(data || []);
}

export async function getWorkSessionsByWorker(workerId: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('work_sessions')
    .select('*')
    .eq('worker_id', workerId)
    .order('work_date', { ascending: false });

  if (error) {
    console.error("[Database] Error getting work sessions:", error);
    throw error;
  }

  return toCamelCaseArray(data || []);
}

// Emergency Alerts - 새 버전은 아래에 있음

// Equipment - 배정된 장비 조회 (571번 라인에 정의되어 있음 - 중복 제거)

// Equipment - 차량번호 뒷 4자리로 검색
export async function searchEquipmentByLastFourDigits(lastFour: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .ilike('registration_number', `%${lastFour}`);

  if (error) {
    console.error("[Database] Error searching equipment:", error);
    throw error;
  }

  return toCamelCaseArray(data || []);
}



// ============================================================
// Companies 관리
// ============================================================

export async function createCompany(company: any): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Supabase not available");
  }

  const { error } = await supabase
    .from('companies')
    .insert(toSnakeCase(company));

  if (error) throw error;
}

export async function getCompanyById(id: string): Promise<any | undefined> {
  const supabase = getSupabase();
  if (!supabase) return undefined;

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return undefined;
  return data;
}

export async function getAllCompanies(): Promise<any[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('name');

  if (error) return [];
  return (data || []).map(toCamelCase);
}

export async function getCompaniesByType(companyType: string): Promise<any[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('company_type', companyType)
    .order('name');

  if (error) return [];
  return (data || []).map(toCamelCase);
}

export async function updateCompany(id: string, updates: any): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Supabase not available");
  }

  const { error } = await supabase
    .from('companies')
    .update({ ...toSnakeCase(updates), updated_at: new Date() })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteCompany(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Supabase not available");
  }

  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getUsersByCompany(companyId: string): Promise<User[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('company_id', companyId);

  if (error) return [];
  return (data || []) as User[];
}

/**
 * 이메일로 사용자 조회
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) return null;
  return toCamelCase(data) as User;
}

/**
 * 이메일 + PIN으로 사용자 조회 (Inspector/Worker 모바일 로그인용)
 */
export async function getUserByEmailAndPin(email: string, pin: string): Promise<User | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('pin', pin)
    .single();

  if (error) return null;
  return toCamelCase(data) as User;
}

/**
 * 사용자 PIN 업데이트
 */
export async function updateUserPin(userId: string, newPin: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Supabase not available");
  }

  const { error } = await supabase
    .from('users')
    .update({ pin: newPin })
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to update PIN: ${error.message}`);
  }
}

// ============================================================
// Location Logs (위치 추적)
// ============================================================

export async function createLocationLog(log: any): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Supabase not available");
  }

  const { error } = await supabase
    .from('location_logs')
    .insert({
      id: log.id,
      worker_id: log.workerId,
      equipment_id: log.equipmentId,
      latitude: log.latitude,
      longitude: log.longitude,
      accuracy: log.accuracy,
      logged_at: log.loggedAt || new Date(),
      created_at: new Date()
    });

  if (error) throw error;
}

export async function getLatestLocationByWorker(workerId: string): Promise<any | undefined> {
  const supabase = getSupabase();
  if (!supabase) return undefined;

  const { data, error } = await supabase
    .from('location_logs')
    .select('*, workers(*), equipment(*)')
    .eq('worker_id', workerId)
    .order('logged_at', { ascending: false })
    .limit(1)
    .single();

  if (error) return undefined;
  return toCamelCase(data);
}

export async function getLatestLocationByEquipment(equipmentId: string): Promise<any | undefined> {
  const supabase = getSupabase();
  if (!supabase) return undefined;

  const { data, error } = await supabase
    .from('location_logs')
    .select('*, workers(*), equipment(*)')
    .eq('equipment_id', equipmentId)
    .order('logged_at', { ascending: false })
    .limit(1)
    .single();

  if (error) return undefined;
  return toCamelCase(data);
}

export async function getLocationHistory(workerId: string, startDate: Date, endDate: Date): Promise<any[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('location_logs')
    .select('*, workers(*), equipment(*)')
    .eq('worker_id', workerId)
    .gte('logged_at', startDate.toISOString())
    .lte('logged_at', endDate.toISOString())
    .order('logged_at', { ascending: false });

  if (error) return [];
  return toCamelCaseArray(data || []);
}

// ============================================================
// Emergency Alerts (긴급 상황)
// ============================================================

export async function createEmergencyAlert(alert: any): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Supabase not available");
  }

  const { error } = await supabase
    .from('emergency_alerts')
    .insert({
      id: alert.id,
      worker_id: alert.workerId,
      equipment_id: alert.equipmentId,
      alert_type: alert.alertType,
      latitude: alert.latitude,
      longitude: alert.longitude,
      description: alert.description,
      status: alert.status || 'active',
      created_at: new Date()
    });

  if (error) throw error;
}

export async function getEmergencyAlerts(status?: string): Promise<any[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  let query = supabase
    .from('emergency_alerts')
    .select(`
      *,
      workers:worker_id (id, name, phone),
      equipment:equipment_id (id, reg_num)
    `)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) return [];
  return data || [];
}

export async function resolveEmergencyAlert(id: string, resolvedBy: string, resolutionNote?: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Supabase not available");
  }

  const { error } = await supabase
    .from('emergency_alerts')
    .update({
      status: 'resolved',
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString(),
      resolution_note: resolutionNote,
    })
    .eq('id', id);

  if (error) throw error;
}

// ============================================================
// 투입 관리 (Deployments)
// ============================================================

export async function createDeployment(data: InsertDeployment) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { error } = await supabase
    .from('deployments')
    .insert(toSnakeCase(data));

  if (error) throw error;
}

export async function getDeployments(filters?: {
  ownerId?: string;
  bpCompanyId?: string;
  epCompanyId?: string;
  workerId?: string;
  status?: string;
}): Promise<Deployment[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  let query = supabase
    .from('deployments')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.ownerId) query = query.eq('owner_id', filters.ownerId);
  if (filters?.bpCompanyId) query = query.eq('bp_company_id', filters.bpCompanyId);
  if (filters?.epCompanyId) query = query.eq('ep_company_id', filters.epCompanyId);
  if (filters?.workerId) query = query.eq('worker_id', filters.workerId);
  if (filters?.status) query = query.eq('status', filters.status);

  const { data, error } = await query;

  if (error) {
    console.error("[Database] Error getting deployments:", error);
    return [];
  }

  return toCamelCaseArray(data || []) as Deployment[];
}

export async function getDeploymentById(id: string): Promise<Deployment | undefined> {
  const supabase = getSupabase();
  if (!supabase) return undefined;

  const { data, error } = await supabase
    .from('deployments')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("[Database] Error getting deployment:", error);
    return undefined;
  }

  return toCamelCase(data) as Deployment;
}

export async function getDeploymentByWorkerId(workerId: string): Promise<Deployment | undefined> {
  const supabase = getSupabase();
  if (!supabase) return undefined;

  console.log("[Database] getDeploymentByWorkerId called with workerId:", workerId);

  const { data, error } = await supabase
    .from('deployments')
    .select(`
      *,
      bp_company:companies!deployments_bp_company_id_fkey(id, name, company_type),
      ep_company:companies!deployments_ep_company_id_fkey(id, name, company_type)
    `)
    .eq('worker_id', workerId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[Database] Error getting deployment for worker:", workerId, error);
    return undefined;
  }

  if (!data) {
    console.log("[Database] No active deployment found for worker:", workerId);
    // 디버깅: 모든 deployment 확인
    const { data: allDeployments } = await supabase
      .from('deployments')
      .select('id, worker_id, status')
      .eq('worker_id', workerId);
    console.log("[Database] All deployments for this worker:", allDeployments);
    return undefined;
  }

  console.log("[Database] Found deployment:", data.id, "for worker:", workerId);
  return toCamelCase(data) as Deployment;
}

/**
 * User ID로 투입 목록 조회 (Worker 로그인용)
 * users.id -> workers.user_id -> deployments.worker_id
 */
export async function getDeploymentsByUserId(userId: string, filters?: {
  status?: string;
}): Promise<Deployment[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  // 1. user_id로 worker 레코드 찾기
  console.log('[getDeploymentsByUserId] 🔍 Searching worker for user_id:', userId);

  const { data: workerData, error: workerError } = await supabase
    .from('workers')
    .select('id, name, user_id')
    .eq('user_id', userId)
    .single();

  if (workerError || !workerData) {
    console.log("[getDeploymentsByUserId] ❌ No worker found for user_id:", userId);
    console.log("[getDeploymentsByUserId] Error:", workerError);

    // 전체 workers 확인 (디버깅용)
    const { data: allWorkers } = await supabase
      .from('workers')
      .select('id, name, user_id')
      .limit(10);
    console.log("[getDeploymentsByUserId] 📋 Sample workers (first 10):", allWorkers);

    return [];
  }

  console.log('[getDeploymentsByUserId] ✅ Found worker:', workerData);

  // 2. worker_id로 deployments 조회 (join 포함)
  let query = supabase
    .from('deployments')
    .select(`
      *,
      equipment:equipment!deployments_equipment_id_fkey(
        id,
        reg_num,
        specification,
        equip_type:equip_types!equipment_equip_type_id_fkey(id, name, description)
      ),
      worker:workers!deployments_worker_id_fkey(id, name, license_num),
      bp_company:companies!deployments_bp_company_id_fkey(id, name, company_type),
      ep_company:companies!deployments_ep_company_id_fkey(id, name, company_type)
    `)
    .eq('worker_id', workerData.id)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[Database] Error getting deployments by user:", error);
    return [];
  }

  return toCamelCaseArray(data || []) as Deployment[];
}

export async function updateDeployment(id: string, data: Partial<InsertDeployment>) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { error } = await supabase
    .from('deployments')
    .update({
      ...toSnakeCase(data),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

export async function extendDeployment(
  deploymentId: string,
  newEndDate: Date,
  reason: string,
  extendedBy: string
) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const deployment = await getDeploymentById(deploymentId);
  if (!deployment) throw new Error("Deployment not found");

  await updateDeployment(deploymentId, {
    plannedEndDate: newEndDate,
    status: 'extended',
  });

  const { error } = await supabase
    .from('deployment_extensions')
    .insert({
      id: nanoid(),
      deployment_id: deploymentId,
      old_end_date: deployment.plannedEndDate,
      new_end_date: newEndDate,
      extension_reason: reason,
      extended_by: extendedBy,
    });

  if (error) throw error;
}

export async function changeDeploymentWorker(
  deploymentId: string,
  newWorkerId: string,
  reason: string,
  changedBy: string
) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const deployment = await getDeploymentById(deploymentId);
  if (!deployment) throw new Error("Deployment not found");

  await updateDeployment(deploymentId, {
    workerId: newWorkerId,
  });

  const { error } = await supabase
    .from('deployment_worker_changes')
    .insert({
      id: nanoid(),
      deployment_id: deploymentId,
      old_worker_id: deployment.workerId,
      new_worker_id: newWorkerId,
      change_reason: reason,
      changed_by: changedBy,
    });

  if (error) throw error;
}

export async function completeDeployment(deploymentId: string, actualEndDate?: Date) {
  await updateDeployment(deploymentId, {
    status: 'completed',
    actualEndDate: actualEndDate || new Date(),
  });
}

// ============================================================
// 운전자 점검표 시스템 (Driver Inspection System)
// ============================================================

/**
 * 운전자 점검표 템플릿 생성
 */
export async function createDriverInspectionTemplate(data: any) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { data: result, error } = await supabase
    .from('driver_inspection_templates')
    .insert(toSnakeCase(data))
    .select()
    .single();

  if (error) throw error;
  return toCamelCase(result);
}

/**
 * 운전자 점검표 템플릿 목록 조회
 */
export async function getDriverInspectionTemplates(filters?: {
  equipTypeId?: string;
  isActive?: boolean;
}) {
  const supabase = getSupabase();
  if (!supabase) return [];

  let query = supabase.from('driver_inspection_templates').select('*');

  if (filters?.equipTypeId) {
    query = query.eq('equip_type_id', filters.equipTypeId);
  }
  if (filters?.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error('[Database] Error getting driver inspection templates:', error);
    return [];
  }

  return toCamelCaseArray(data || []);
}

/**
 * 운전자 점검표 템플릿 상세 조회 (항목 포함)
 */
export async function getDriverInspectionTemplateById(templateId: string) {
  const supabase = getSupabase();
  if (!supabase) return null;

  // 템플릿 조회
  const { data: template, error: templateError } = await supabase
    .from('driver_inspection_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (templateError || !template) {
    console.error('[Database] Error getting driver inspection template:', templateError);
    return null;
  }

  // 템플릿 항목 조회
  const { data: items, error: itemsError } = await supabase
    .from('driver_inspection_template_items')
    .select('*')
    .eq('template_id', templateId)
    .order('display_order', { ascending: true });

  if (itemsError) {
    console.error('[Database] Error getting driver inspection template items:', itemsError);
  }

  return {
    ...toCamelCase(template),
    items: toCamelCaseArray(items || []),
  };
}

/**
 * 운전자 점검표 템플릿 수정
 */
export async function updateDriverInspectionTemplate(templateId: string, data: any) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { data: result, error } = await supabase
    .from('driver_inspection_templates')
    .update({
      ...toSnakeCase(data),
      updated_at: new Date().toISOString(),
    })
    .eq('id', templateId)
    .select()
    .single();

  if (error) throw error;
  return toCamelCase(result);
}

/**
 * 운전자 점검표 템플릿 삭제 (비활성화)
 */
export async function deleteDriverInspectionTemplate(templateId: string) {
  return await updateDriverInspectionTemplate(templateId, { isActive: false });
}

/**
 * 운전자 점검표 템플릿 항목 생성
 */
export async function createDriverInspectionTemplateItem(data: any) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { data: result, error } = await supabase
    .from('driver_inspection_template_items')
    .insert(toSnakeCase(data))
    .select()
    .single();

  if (error) throw error;
  return toCamelCase(result);
}

/**
 * 운전자 점검표 템플릿 항목 수정
 */
export async function updateDriverInspectionTemplateItem(itemId: string, data: any) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { data: result, error } = await supabase
    .from('driver_inspection_template_items')
    .update(toSnakeCase(data))
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return toCamelCase(result);
}

/**
 * 운전자 점검표 템플릿 항목 삭제
 */
export async function deleteDriverInspectionTemplateItem(itemId: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { error } = await supabase
    .from('driver_inspection_template_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
  return { success: true };
}

/**
 * 운전자 점검 기록 생성
 */
export async function createDriverInspectionRecord(data: any) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { data: result, error } = await supabase
    .from('driver_inspection_records')
    .insert(toSnakeCase(data))
    .select()
    .single();

  if (error) throw error;
  return toCamelCase(result);
}

/**
 * 운전자 점검 기록 항목 생성
 */
export async function createDriverInspectionRecordItem(data: any) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { data: result, error } = await supabase
    .from('driver_inspection_record_items')
    .insert(toSnakeCase(data))
    .select()
    .single();

  if (error) throw error;
  return toCamelCase(result);
}

/**
 * 운전자 점검 기록 목록 조회 (장비별)
 */
export async function getDriverInspectionRecordsByEquipment(equipmentId: string) {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('driver_inspection_records')
    .select('*')
    .eq('equipment_id', equipmentId)
    .order('inspection_date', { ascending: false });

  if (error) {
    console.error('[Database] Error getting driver inspection records:', error);
    return [];
  }

  return toCamelCaseArray(data || []);
}

/**
 * 운전자 점검 기록 상세 조회 (항목 포함)
 */
export async function getDriverInspectionRecordById(recordId: string) {
  const supabase = getSupabase();
  if (!supabase) return null;

  // 기록 조회
  const { data: record, error: recordError } = await supabase
    .from('driver_inspection_records')
    .select('*')
    .eq('id', recordId)
    .single();

  if (recordError || !record) {
    console.error('[Database] Error getting driver inspection record:', recordError);
    return null;
  }

  // 항목별 결과 조회
  const { data: items, error: itemsError } = await supabase
    .from('driver_inspection_record_items')
    .select('*')
    .eq('record_id', recordId)
    .order('created_at', { ascending: true });

  if (itemsError) {
    console.error('[Database] Error getting driver inspection record items:', itemsError);
  }

  return {
    ...toCamelCase(record),
    items: toCamelCaseArray(items || []),
  };
}

/**
 * 운전자 점검 기록 수정
 */
export async function updateDriverInspectionRecord(recordId: string, data: any) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { data: result, error } = await supabase
    .from('driver_inspection_records')
    .update({
      ...toSnakeCase(data),
      updated_at: new Date().toISOString(),
    })
    .eq('id', recordId)
    .select()
    .single();

  if (error) throw error;
  return toCamelCase(result);
}

/**
 * 운전자 점검 기록 삭제
 */
export async function deleteDriverInspectionRecord(recordId: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  // 관련 항목들도 함께 삭제 (CASCADE)
  const { error } = await supabase
    .from('driver_inspection_records')
    .delete()
    .eq('id', recordId);

  if (error) throw error;
  return { success: true };
}

// ============================================================
// 안전점검 시스템 (Safety Inspection System)
// ============================================================

/**
 * 안전점검 템플릿 생성
 */
export async function createSafetyInspectionTemplate(data: any) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { data: result, error } = await supabase
    .from('safety_inspection_templates')
    .insert(toSnakeCase(data))
    .select()
    .single();

  if (error) throw error;
  return toCamelCase(result);
}

/**
 * 안전점검 템플릿 목록 조회
 */
export async function getSafetyInspectionTemplates(filters?: {
  equipTypeId?: string;
  inspectorType?: string;
  isActive?: boolean;
}) {
  const supabase = getSupabase();
  if (!supabase) return [];

  let query = supabase.from('safety_inspection_templates').select('*');

  if (filters?.equipTypeId) {
    query = query.eq('equip_type_id', filters.equipTypeId);
  }
  if (filters?.inspectorType) {
    query = query.eq('inspector_type', filters.inspectorType);
  }
  if (filters?.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error('[Database] Error getting safety inspection templates:', error);
    return [];
  }

  return toCamelCaseArray(data || []);
}

/**
 * 안전점검 템플릿 상세 조회 (체크 항목 포함)
 */
export async function getSafetyInspectionTemplateById(templateId: string) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: template, error: templateError } = await supabase
    .from('safety_inspection_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (templateError || !template) return null;

  const { data: items, error: itemsError } = await supabase
    .from('safety_inspection_template_items')
    .select('*')
    .eq('template_id', templateId)
    .order('display_order', { ascending: true });

  if (itemsError) {
    console.error('[Database] Error getting template items:', itemsError);
  }

  return {
    ...toCamelCase(template),
    items: toCamelCaseArray(items || []),
  };
}

/**
 * 안전점검 템플릿 수정
 */
export async function updateSafetyInspectionTemplate(templateId: string, data: any) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { data: result, error } = await supabase
    .from('safety_inspection_templates')
    .update(toSnakeCase({ ...data, updatedAt: new Date() }))
    .eq('id', templateId)
    .select()
    .single();

  if (error) throw error;
  return toCamelCase(result);
}

/**
 * 장비에 적용 가능한 템플릿 찾기
 * 우선순위: 1. 장비 타입 전용 템플릿, 2. 범용 템플릿
 */
export async function getApplicableTemplatesForEquipment(
  equipmentId: string,
  inspectorType: 'inspector' | 'driver' = 'inspector'
) {
  const supabase = getSupabase();
  if (!supabase) return [];

  // 장비 정보 조회
  const { data: equipment, error: equipError } = await supabase
    .from('equipment')
    .select('equip_type_id')
    .eq('id', equipmentId)
    .single();

  if (equipError || !equipment) {
    console.error('[Database] Error getting equipment:', equipError);
    return [];
  }

  const equipTypeId = equipment.equip_type_id;

  // 적용 가능한 템플릿 조회
  // 1. 해당 장비 타입 전용 템플릿
  // 2. 범용 템플릿 (equip_type_id = null)
  const { data: templates, error } = await supabase
    .from('safety_inspection_templates')
    .select('*')
    .eq('inspector_type', inspectorType)
    .eq('is_active', true)
    .or(`equip_type_id.eq.${equipTypeId},equip_type_id.is.null`)
    .order('equip_type_id', { ascending: false }); // 전용 템플릿 우선

  if (error) {
    console.error('[Database] Error getting applicable templates:', error);
    return [];
  }

  // 장비 타입 정보 별도로 조회 (필요한 경우)
  if (templates && templates.length > 0) {
    const templateIds = templates.map(t => t.id);
    const equipTypeIds = templates.map(t => t.equip_type_id).filter(id => id);

    if (equipTypeIds.length > 0) {
      const { data: equipTypes } = await supabase
        .from('equip_types')
        .select('*')
        .in('id', equipTypeIds);

      // 템플릿에 장비 타입 정보 매핑
      const equipTypeMap = new Map(equipTypes?.map(et => [et.id, et]) || []);
      templates.forEach(template => {
        if (template.equip_type_id) {
          template.equip_type = equipTypeMap.get(template.equip_type_id);
        }
      });
    }
  }

  return toCamelCaseArray(templates || []);
}

/**
 * 안전점검 템플릿 삭제 (비활성화)
 */
export async function deleteSafetyInspectionTemplate(templateId: string) {
  return updateSafetyInspectionTemplate(templateId, { isActive: false });
}

/**
 * 안전점검 템플릿 항목 생성
 */
export async function createSafetyInspectionTemplateItem(data: any) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { data: result, error } = await supabase
    .from('safety_inspection_template_items')
    .insert(toSnakeCase(data))
    .select()
    .single();

  if (error) throw error;
  return toCamelCase(result);
}

/**
 * 안전점검 템플릿 항목 수정
 */
export async function updateSafetyInspectionTemplateItem(itemId: string, data: any) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { data: result, error } = await supabase
    .from('safety_inspection_template_items')
    .update(toSnakeCase(data))
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return toCamelCase(result);
}

/**
 * 안전점검 템플릿 항목 삭제
 */
export async function deleteSafetyInspectionTemplateItem(itemId: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { error } = await supabase
    .from('safety_inspection_template_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
}

/**
 * 안전점검 기록 생성
 */
export async function createSafetyInspection(data: any) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { data: result, error } = await supabase
    .from('safety_inspections')
    .insert(toSnakeCase(data))
    .select()
    .single();

  if (error) throw error;
  return toCamelCase(result);
}

/**
 * 안전점검 기록 목록 조회
 */
export async function getSafetyInspections(filters?: {
  equipmentId?: string;
  inspectorId?: string;
  inspectorType?: string;
  status?: string;
  checkFrequency?: string;
  startDate?: string;
  endDate?: string;
}) {
  const supabase = getSupabase();
  if (!supabase) return [];

  let query = supabase
    .from('safety_inspections')
    .select('*')
    .order('inspection_date', { ascending: false });

  if (filters?.equipmentId) {
    query = query.eq('equipment_id', filters.equipmentId);
  }
  if (filters?.inspectorId) {
    query = query.eq('inspector_id', filters.inspectorId);
  }
  if (filters?.inspectorType) {
    query = query.eq('inspector_type', filters.inspectorType);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.checkFrequency) {
    query = query.eq('check_frequency', filters.checkFrequency);
  }
  if (filters?.startDate) {
    query = query.gte('inspection_date', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('inspection_date', filters.endDate);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[Database] Error getting safety inspections:', error);
    return [];
  }

  return toCamelCaseArray(data || []);
}

/**
 * 안전점검 기록 상세 조회 (결과 포함)
 */
export async function getSafetyInspectionById(inspectionId: string) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: inspection, error: inspectionError } = await supabase
    .from('safety_inspections')
    .select('*')
    .eq('id', inspectionId)
    .single();

  if (inspectionError || !inspection) return null;

  const { data: results, error: resultsError } = await supabase
    .from('safety_inspection_results')
    .select('*')
    .eq('inspection_id', inspectionId)
    .order('created_at', { ascending: true });

  if (resultsError) {
    console.error('[Database] Error getting inspection results:', resultsError);
  }

  return {
    ...toCamelCase(inspection),
    results: toCamelCaseArray(results || []),
  };
}

/**
 * 안전점검 기록 수정
 */
export async function updateSafetyInspection(inspectionId: string, data: any) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { data: result, error } = await supabase
    .from('safety_inspections')
    .update(toSnakeCase({ ...data, updatedAt: new Date() }))
    .eq('id', inspectionId)
    .select()
    .single();

  if (error) throw error;
  return toCamelCase(result);
}

/**
 * 안전점검 제출 (전자서명 포함)
 */
export async function submitSafetyInspection(
  inspectionId: string,
  signatureData: string,
  inspectorName: string
) {
  return updateSafetyInspection(inspectionId, {
    status: 'submitted',
    inspectorSignature: signatureData,
    inspectorName,
    signedAt: new Date(),
    submittedAt: new Date(),
  });
}

/**
 * 안전점검 항목 결과 생성
 */
export async function createSafetyInspectionResult(data: any) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { data: result, error } = await supabase
    .from('safety_inspection_results')
    .insert(toSnakeCase(data))
    .select()
    .single();

  if (error) throw error;
  return toCamelCase(result);
}

/**
 * 안전점검 항목 결과 수정
 */
export async function updateSafetyInspectionResult(resultId: string, data: any) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not available");

  const { data: result, error } = await supabase
    .from('safety_inspection_results')
    .update(toSnakeCase(data))
    .eq('id', resultId)
    .select()
    .single();

  if (error) throw error;
  return toCamelCase(result);
}

/**
 * EP의 안전점검 확인
 */
export async function reviewSafetyInspection(
  inspectionId: string,
  reviewedBy: string,
  comments?: string
) {
  return updateSafetyInspection(inspectionId, {
    status: 'reviewed',
    reviewedBy,
    reviewedAt: new Date(),
    reviewComments: comments,
  });
}

/**
 * 차량번호로 장비 검색 (뒷번호 부분 매칭)
 */
export async function searchEquipmentByVehicleNumber(partialNumber: string) {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('equipment')
    .select('*, equip_type:equip_types(*)')
    .ilike('reg_num', `%${partialNumber}%`)
    .limit(10);

  if (error) {
    console.error('[Database] Error searching equipment:', error);
    return [];
  }

  return toCamelCaseArray(data || []);
}

/**
 * 모든 활성 위치 조회 (최근 10분 이내, 권한별 필터링 포함)
 */
export async function getAllActiveLocations(filters?: {
  ownerCompanyId?: string;
  bpCompanyId?: string;
  epCompanyId?: string;
  equipmentId?: string;
  vehicleNumber?: string;
  userRole?: string;
  userCompanyId?: string;
}) {
  const supabase = getSupabase();
  if (!supabase) return [];

  // 최근 10분 이내의 위치만 조회
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  // 각 worker별 최신 위치만 가져오기 위해 서브쿼리 사용
  let query = supabase
    .from('location_logs')
    .select(`
      *,
      workers (
        id,
        name,
        phone,
        owner_company_id
      ),
      equipment (
        id,
        reg_num,
        equip_type_id,
        owner_company_id,
        equip_types (
          id,
          name
        )
      )
    `)
    .gte('logged_at', tenMinutesAgo.toISOString())
    .order('logged_at', { ascending: false });

  // 권한별 기본 필터링
  if (filters?.userRole) {
    const role = filters.userRole.toLowerCase();
    
    if (role === 'owner') {
      // Owner: 자신의 회사 장비/인력만
      if (filters.userCompanyId) {
        query = query.or(`workers.owner_company_id.eq.${filters.userCompanyId},equipment.owner_company_id.eq.${filters.userCompanyId}`);
      }
    } else if (role === 'ep') {
      // EP: 본인 회사에 투입된 장비만 (deployment에서 확인)
      if (filters.userCompanyId) {
        // 먼저 활성 deployment 조회
        const { data: deployments } = await supabase
          .from('deployments')
          .select('equipment_id, worker_id')
          .eq('ep_company_id', filters.userCompanyId)
          .eq('status', 'active');
        
        if (deployments && deployments.length > 0) {
          const equipmentIds = deployments.map(d => d.equipment_id).filter(Boolean);
          const workerIds = deployments.map(d => d.worker_id).filter(Boolean);
          
          if (equipmentIds.length > 0 || workerIds.length > 0) {
            const conditions: string[] = [];
            if (equipmentIds.length > 0) {
              conditions.push(`equipment_id.in.(${equipmentIds.join(',')})`);
            }
            if (workerIds.length > 0) {
              conditions.push(`worker_id.in.(${workerIds.join(',')})`);
            }
            query = query.or(conditions.join(','));
          } else {
            // 투입된 장비가 없으면 빈 결과 반환
            return [];
          }
        } else {
          // 활성 deployment가 없으면 빈 결과 반환
          return [];
        }
      }
    }
    // BP와 Admin은 추가 필터 파라미터로 제어
  }

  // 추가 필터 적용
  if (filters?.ownerCompanyId) {
    query = query.or(`workers.owner_company_id.eq.${filters.ownerCompanyId},equipment.owner_company_id.eq.${filters.ownerCompanyId}`);
  }

  if (filters?.bpCompanyId) {
    // BP 회사에 투입된 장비만 조회 (deployment에서 확인)
    const { data: deployments } = await supabase
      .from('deployments')
      .select('equipment_id, worker_id')
      .eq('bp_company_id', filters.bpCompanyId)
      .eq('status', 'active');
    
    if (deployments && deployments.length > 0) {
      const equipmentIds = deployments.map(d => d.equipment_id).filter(Boolean);
      const workerIds = deployments.map(d => d.worker_id).filter(Boolean);
      
      if (equipmentIds.length > 0 || workerIds.length > 0) {
        const conditions: string[] = [];
        if (equipmentIds.length > 0) {
          conditions.push(`equipment_id.in.(${equipmentIds.join(',')})`);
        }
        if (workerIds.length > 0) {
          conditions.push(`worker_id.in.(${workerIds.join(',')})`);
        }
        query = query.or(conditions.join(','));
      } else {
        return [];
      }
    } else {
      return [];
    }
  }

  if (filters?.epCompanyId) {
    const { data: deployments } = await supabase
      .from('deployments')
      .select('equipment_id, worker_id')
      .eq('ep_company_id', filters.epCompanyId)
      .eq('status', 'active');
    
    if (deployments && deployments.length > 0) {
      const equipmentIds = deployments.map(d => d.equipment_id).filter(Boolean);
      const workerIds = deployments.map(d => d.worker_id).filter(Boolean);
      
      if (equipmentIds.length > 0 || workerIds.length > 0) {
        const conditions: string[] = [];
        if (equipmentIds.length > 0) {
          conditions.push(`equipment_id.in.(${equipmentIds.join(',')})`);
        }
        if (workerIds.length > 0) {
          conditions.push(`worker_id.in.(${workerIds.join(',')})`);
        }
        query = query.or(conditions.join(','));
      } else {
        return [];
      }
    } else {
      return [];
    }
  }

  if (filters?.equipmentId) {
    query = query.eq('equipment_id', filters.equipmentId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[Database] Error getting all active locations:', error);
    return [];
  }

  // 차량번호 필터링 (장비명 부분 매칭)
  let filteredData = data || [];
  if (filters?.vehicleNumber) {
    filteredData = filteredData.filter((loc: any) => {
      const regNum = loc.equipment?.reg_num || '';
      return regNum.toLowerCase().includes(filters.vehicleNumber!.toLowerCase());
    });
  }

  // 각 worker별 최신 위치만 반환 (중복 제거)
  const latestByWorker = new Map<string, any>();
  filteredData.forEach((loc: any) => {
    if (loc.worker_id) {
      const existing = latestByWorker.get(loc.worker_id);
      if (!existing || new Date(loc.logged_at) > new Date(existing.logged_at)) {
        latestByWorker.set(loc.worker_id, loc);
      }
    }
  });

  // deployment 정보 추가 조회 (배치로 처리)
  const result = Array.from(latestByWorker.values());
  const equipmentIds = result.map((loc: any) => loc.equipment_id).filter(Boolean);
  
  if (equipmentIds.length > 0) {
    // 모든 활성 deployment 조회
    const { data: deployments } = await supabase
      .from('deployments')
      .select('id, equipment_id, bp_company_id, ep_company_id')
      .in('equipment_id', equipmentIds)
      .eq('status', 'active');

    if (deployments && deployments.length > 0) {
      // BP, EP 회사 ID 수집
      const bpCompanyIds = new Set<string>();
      const epCompanyIds = new Set<string>();
      deployments.forEach((dep: any) => {
        if (dep.bp_company_id) bpCompanyIds.add(dep.bp_company_id);
        if (dep.ep_company_id) epCompanyIds.add(dep.ep_company_id);
      });

      // BP, EP 회사 정보 일괄 조회
      const bpCompaniesMap = new Map<string, any>();
      const epCompaniesMap = new Map<string, any>();

      if (bpCompanyIds.size > 0) {
        const { data: bpCompanies } = await supabase
          .from('companies')
          .select('id, name')
          .in('id', Array.from(bpCompanyIds));
        if (bpCompanies) {
          bpCompanies.forEach((company: any) => {
            bpCompaniesMap.set(company.id, company);
          });
        }
      }

      if (epCompanyIds.size > 0) {
        const { data: epCompanies } = await supabase
          .from('companies')
          .select('id, name')
          .in('id', Array.from(epCompanyIds));
        if (epCompanies) {
          epCompanies.forEach((company: any) => {
            epCompaniesMap.set(company.id, company);
          });
        }
      }

      // 장비별 deployment 매핑
      const deploymentMap = new Map<string, any>();
      deployments.forEach((dep: any) => {
        if (dep.equipment_id && !deploymentMap.has(dep.equipment_id)) {
          deploymentMap.set(dep.equipment_id, {
            ...dep,
            bpCompanies: dep.bp_company_id ? bpCompaniesMap.get(dep.bp_company_id) : null,
            epCompanies: dep.ep_company_id ? epCompaniesMap.get(dep.ep_company_id) : null,
          });
        }
      });

      // 오너사 정보 일괄 조회
      const ownerCompanyIds = new Set<string>();
      result.forEach((loc: any) => {
        if (loc.equipment?.owner_company_id) {
          ownerCompanyIds.add(loc.equipment.owner_company_id);
        }
      });

      const ownerCompaniesMap = new Map<string, any>();
      if (ownerCompanyIds.size > 0) {
        const { data: ownerCompanies } = await supabase
          .from('companies')
          .select('id, name')
          .in('id', Array.from(ownerCompanyIds));
        
        if (ownerCompanies) {
          ownerCompanies.forEach((company: any) => {
            ownerCompaniesMap.set(company.id, company);
          });
        }
      }

      // 각 location에 deployment 정보 추가
      result.forEach((loc: any) => {
        if (loc.equipment_id && deploymentMap.has(loc.equipment_id)) {
          const dep = deploymentMap.get(loc.equipment_id);
          
          // 오너사 정보 추가
          if (loc.equipment?.owner_company_id && ownerCompaniesMap.has(loc.equipment.owner_company_id)) {
            dep.equipment = {
              ...loc.equipment,
              ownerCompanies: ownerCompaniesMap.get(loc.equipment.owner_company_id),
            };
          }
          
          loc.deployment = toCamelCase(dep);
        }
      });
    }
  }

  return toCamelCaseArray(result);
}

