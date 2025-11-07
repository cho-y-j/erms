import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Clock, UserCheck, CheckCircle, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

/**
 * 투입 관리 페이지 (Owner)
 * 장비+운전자를 현장에 투입하고 관리하는 페이지
 */
export default function Deployments() {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const [isChangeWorkerOpen, setIsChangeWorkerOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [createFormData, setCreateFormData] = useState({
    entryRequestId: "",
    equipmentId: "",
    workerId: "",
    bpCompanyId: "",
    startDate: "",
    plannedEndDate: "",
    siteName: "",
    workType: "daily", // 'daily' | 'monthly'
    dailyRate: "",
    monthlyRate: "",
    otRate: "",
    nightRate: "",
  });

  const [extendFormData, setExtendFormData] = useState({
    newEndDate: "",
    reason: "",
  });

  const [changeWorkerFormData, setChangeWorkerFormData] = useState({
    newWorkerId: "",
    reason: "",
  });

  const utils = trpc.useUtils();

  // 데이터 조회
  const { data: deployments, isLoading } = trpc.deployments.list.useQuery(
    user?.role === "owner" ? { ownerId: user.id } : {}
  );

  const { data: entryRequests } = trpc.entryRequestsV2.list.useQuery();
  const { data: equipment } = trpc.equipment.list.useQuery();
  const { data: workers } = trpc.workers.list.useQuery();
  const { data: bpCompanies } = trpc.companies.list.useQuery({ companyType: 'bp' });
  
  // 선택된 반입 요청의 상세 정보 조회 (장비/인력 목록 포함)
  const { data: selectedEntryRequest } = trpc.entryRequestsV2.getById.useQuery(
    { id: createFormData.entryRequestId },
    { enabled: !!createFormData.entryRequestId }
  );

  // 반입 요청에 포함된 장비/인력 ID 목록 추출
  const approvedEquipmentIds = selectedEntryRequest?.items
    ?.filter((item: any) => item.itemType === 'equipment')
    ?.map((item: any) => item.itemId) || [];
  
  const approvedWorkerIds = selectedEntryRequest?.items
    ?.filter((item: any) => item.itemType === 'worker')
    ?.map((item: any) => item.itemId) || [];

  // 필터링된 장비/인력 목록
  // 1. 반입 요청이 선택된 경우: 해당 요청의 장비만
  // 2. 운전자가 선택된 경우: 해당 운전자에 배정된 장비만
  // 3. 둘 다 선택된 경우: 교집합 (반입 요청의 장비 중 운전자에 배정된 것)
  let filteredEquipment = equipment || [];
  
  if (createFormData.entryRequestId && approvedEquipmentIds.length > 0) {
    // 반입 요청의 장비만 필터링
    filteredEquipment = filteredEquipment.filter((e) => approvedEquipmentIds.includes(e.id));
  }
  
  if (createFormData.workerId) {
    // 선택한 운전자에 배정된 장비만 필터링
    // assignedWorkerId (camelCase) 또는 assigned_worker_id (snake_case) 모두 확인
    filteredEquipment = filteredEquipment.filter((e: any) => 
      (e.assignedWorkerId === createFormData.workerId) || 
      (e.assigned_worker_id === createFormData.workerId)
    );
  }
  
  const availableEquipment = filteredEquipment;
  
  // 인력 필터링 (반입 요청만 고려)
  const availableWorkers = createFormData.entryRequestId && approvedWorkerIds.length > 0
    ? workers?.filter((w) => approvedWorkerIds.includes(w.id)) || []
    : workers || [];

  // Mutations
  const createMutation = trpc.deployments.create.useMutation({
    onSuccess: () => {
      toast.success("투입이 등록되었습니다.");
      utils.deployments.list.invalidate();
      setIsCreateOpen(false);
      resetCreateForm();
    },
    onError: (error) => toast.error("투입 등록 실패: " + error.message),
  });

  const extendMutation = trpc.deployments.extend.useMutation({
    onSuccess: () => {
      toast.success("투입 기간이 연장되었습니다.");
      utils.deployments.list.invalidate();
      setIsExtendOpen(false);
      resetExtendForm();
    },
    onError: (error) => toast.error("기간 연장 실패: " + error.message),
  });

  const changeWorkerMutation = trpc.deployments.changeWorker.useMutation({
    onSuccess: () => {
      toast.success("운전자가 교체되었습니다.");
      utils.deployments.list.invalidate();
      setIsChangeWorkerOpen(false);
      resetChangeWorkerForm();
    },
    onError: (error) => toast.error("운전자 교체 실패: " + error.message),
  });

  const completeMutation = trpc.deployments.complete.useMutation({
    onSuccess: () => {
      toast.success("투입이 종료되었습니다.");
      utils.deployments.list.invalidate();
    },
    onError: (error) => toast.error("투입 종료 실패: " + error.message),
  });

  // 폼 리셋
  const resetCreateForm = () => {
    setCreateFormData({
      entryRequestId: "",
      equipmentId: "",
      workerId: "",
      bpCompanyId: "",
      startDate: "",
      plannedEndDate: "",
    });
  };

  const resetExtendForm = () => {
    setExtendFormData({
      newEndDate: "",
      reason: "",
    });
  };

  const resetChangeWorkerForm = () => {
    setChangeWorkerFormData({
      newWorkerId: "",
      reason: "",
    });
  };

  // 투입 생성
  const handleCreate = () => {
    createMutation.mutate({
      entryRequestId: createFormData.entryRequestId,
      equipmentId: createFormData.equipmentId,
      workerId: createFormData.workerId,
      bpCompanyId: createFormData.bpCompanyId,
      startDate: new Date(createFormData.startDate),
      plannedEndDate: new Date(createFormData.plannedEndDate),
      siteName: createFormData.siteName || undefined,
      workType: createFormData.workType || undefined,
      dailyRate: createFormData.dailyRate ? parseFloat(createFormData.dailyRate) : undefined,
      monthlyRate: createFormData.monthlyRate ? parseFloat(createFormData.monthlyRate) : undefined,
      otRate: createFormData.otRate ? parseFloat(createFormData.otRate) : undefined,
      nightRate: createFormData.nightRate ? parseFloat(createFormData.nightRate) : undefined,
    });
  };

  // 기간 연장
  const handleExtend = () => {
    if (!selectedDeployment) return;
    extendMutation.mutate({
      deploymentId: selectedDeployment.id,
      newEndDate: new Date(extendFormData.newEndDate),
      reason: extendFormData.reason,
    });
  };

  // 운전자 교체
  const handleChangeWorker = () => {
    if (!selectedDeployment) return;
    changeWorkerMutation.mutate({
      deploymentId: selectedDeployment.id,
      newWorkerId: changeWorkerFormData.newWorkerId,
      reason: changeWorkerFormData.reason,
    });
  };

  // 투입 종료
  const handleComplete = (deployment: any) => {
    if (!confirm("투입을 종료하시겠습니까?")) return;
    completeMutation.mutate({
      deploymentId: deployment.id,
      actualEndDate: new Date(),
    });
  };

  // 필터링된 투입 목록
  const filteredDeployments = deployments?.filter((d) => {
    if (statusFilter === "all") return true;
    return d.status === statusFilter;
  });

  // 상태 뱃지
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: any }> = {
      pending: { label: "대기", variant: "secondary" },
      active: { label: "투입중", variant: "default" },
      extended: { label: "연장", variant: "outline" },
      completed: { label: "종료", variant: "secondary" },
    };
    const config = statusMap[status] || { label: status, variant: "default" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Entry Request 승인 완료된 것만 필터링
  const approvedEntryRequests = entryRequests?.filter(
    (req) => req.status === "ep_approved"
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">투입 관리</h1>
          <p className="text-muted-foreground mt-1">
            장비와 운전자의 현장 투입을 관리합니다
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          투입 등록
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>투입 목록</CardTitle>
          <CardDescription>
            현재 투입 현황을 확인하고 관리할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="active">투입중</TabsTrigger>
              <TabsTrigger value="extended">연장</TabsTrigger>
              <TabsTrigger value="completed">종료</TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="mt-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>장비</TableHead>
                      <TableHead>운전자</TableHead>
                      <TableHead>BP 회사</TableHead>
                      <TableHead>투입일</TableHead>
                      <TableHead>종료 예정일</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeployments && filteredDeployments.length > 0 ? (
                      filteredDeployments.map((deployment) => {
                        const equip = equipment?.find((e) => e.id === deployment.equipmentId);
                        const worker = workers?.find((w) => w.id === deployment.workerId);
                        const bpCompany = bpCompanies?.find((c) => c.id === deployment.bpCompanyId);

                        return (
                          <TableRow key={deployment.id}>
                            <TableCell>
                              {equip?.regNum || "-"}
                              <br />
                              <span className="text-xs text-muted-foreground">
                                {equip?.equipType?.typeName}
                              </span>
                            </TableCell>
                            <TableCell>
                              {worker?.name || "-"}
                              <br />
                              <span className="text-xs text-muted-foreground">
                                {worker?.workerType?.typeName}
                              </span>
                            </TableCell>
                            <TableCell>{bpCompany?.name || "-"}</TableCell>
                            <TableCell>
                              {format(new Date(deployment.startDate), "yyyy-MM-dd", {
                                locale: ko,
                              })}
                            </TableCell>
                            <TableCell>
                              {format(new Date(deployment.plannedEndDate), "yyyy-MM-dd", {
                                locale: ko,
                              })}
                            </TableCell>
                            <TableCell>{getStatusBadge(deployment.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2 flex-wrap">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => {
                                    setSelectedDeployment(deployment);
                                    setIsDetailOpen(true);
                                  }}
                                >
                                  상세보기
                                </Button>
                                {(deployment.status === "active" ||
                                  deployment.status === "extended") && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedDeployment(deployment);
                                        setExtendFormData({
                                          newEndDate: format(
                                            new Date(deployment.plannedEndDate),
                                            "yyyy-MM-dd"
                                          ),
                                          reason: "",
                                        });
                                        setIsExtendOpen(true);
                                      }}
                                    >
                                      <Clock className="h-3 w-3 mr-1" />
                                      연장
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedDeployment(deployment);
                                        setChangeWorkerFormData({
                                          newWorkerId: "",
                                          reason: "",
                                        });
                                        setIsChangeWorkerOpen(true);
                                      }}
                                    >
                                      <UserCheck className="h-3 w-3 mr-1" />
                                      운전자 교체
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => handleComplete(deployment)}
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      종료
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          투입 내역이 없습니다
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 투입 등록 다이얼로그 */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>투입 등록</DialogTitle>
            <DialogDescription>
              승인 완료된 반입 요청을 기반으로 장비와 운전자를 투입합니다
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="entryRequestId">반입 요청 <span className="text-destructive">*</span></Label>
              <Select
                value={createFormData.entryRequestId}
                onValueChange={(value) => {
                  const request = approvedEntryRequests?.find((r) => r.id === value);
                  setCreateFormData({
                    ...createFormData,
                    entryRequestId: value,
                    bpCompanyId: request?.targetBpCompanyId || request?.target_bp_company_id || "",
                    // 장비와 인력은 자동으로 채우지 않음 (사용자가 직접 선택)
                  });
                }}
              >
                <SelectTrigger id="entryRequestId">
                  <SelectValue placeholder="반입 요청 선택" />
                </SelectTrigger>
                <SelectContent>
                  {approvedEntryRequests?.map((req) => (
                    <SelectItem key={req.id} value={req.id}>
                      {req.requestNumber} - {req.purpose || "목적 없음"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                반입 요청을 선택하면 해당 요청에 포함된 장비와 인력만 표시됩니다. 조합해서 선택하세요.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bpCompanyId">BP 현장 (협력업체)</Label>
              <Select
                value={createFormData.bpCompanyId}
                onValueChange={(value) =>
                  setCreateFormData({ ...createFormData, bpCompanyId: value })
                }
              >
                <SelectTrigger id="bpCompanyId">
                  <SelectValue placeholder="BP 현장 선택" />
                </SelectTrigger>
                <SelectContent>
                  {bpCompanies?.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                반입 승인을 받으면 어느 BP 현장이든 투입 가능합니다
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="equipmentId">장비</Label>
                <Select
                  value={createFormData.equipmentId}
                  onValueChange={(value) =>
                    setCreateFormData({ ...createFormData, equipmentId: value })
                  }
                >
                  <SelectTrigger id="equipmentId">
                    <SelectValue placeholder="장비 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEquipment.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        {createFormData.entryRequestId 
                          ? "반입 승인된 장비가 없습니다" 
                          : "반입 요청을 먼저 선택하세요"}
                      </div>
                    ) : (
                      availableEquipment.map((equip) => (
                        <SelectItem key={equip.id} value={equip.id}>
                          {equip.regNum} - {equip.equipType?.typeName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {createFormData.workerId 
                    ? `선택한 운전자에 배정된 장비 ${availableEquipment.length}개`
                    : createFormData.entryRequestId 
                      ? `반입 승인된 장비 ${availableEquipment.length}개`
                      : `전체 장비 ${availableEquipment.length}개`}
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="workerId">운전자</Label>
                <Select
                  value={createFormData.workerId}
                  onValueChange={(value) => {
                    setCreateFormData({ 
                      ...createFormData, 
                      workerId: value,
                      // 운전자 변경 시 장비 초기화 (새로운 운전자에 맞는 장비만 표시되도록)
                      equipmentId: ""
                    });
                  }}
                >
                  <SelectTrigger id="workerId">
                    <SelectValue placeholder="운전자 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableWorkers.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        {createFormData.entryRequestId 
                          ? "반입 승인된 인력이 없습니다" 
                          : "반입 요청을 먼저 선택하세요"}
                      </div>
                    ) : (
                      availableWorkers.map((worker) => (
                        <SelectItem key={worker.id} value={worker.id}>
                          {worker.name} - {worker.workerType?.typeName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {createFormData.entryRequestId && (
                  <p className="text-xs text-muted-foreground">
                    반입 승인된 인력 {availableWorkers.length}개
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">투입 시작일</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={createFormData.startDate}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, startDate: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="plannedEndDate">종료 예정일</Label>
                <Input
                  id="plannedEndDate"
                  type="date"
                  value={createFormData.plannedEndDate}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, plannedEndDate: e.target.value })
                  }
                />
              </div>
            </div>

            {/* 작업확인서용 추가 정보 */}
            <div className="border-t pt-4 mt-2">
              <h3 className="text-sm font-semibold mb-3">작업확인서 정보</h3>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="siteName">공사명/현장명</Label>
                  <Input
                    id="siteName"
                    placeholder="예: 용인 클러스터 공사"
                    value={createFormData.siteName}
                    onChange={(e) =>
                      setCreateFormData({ ...createFormData, siteName: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    작업확인서에 자동으로 표시됩니다
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="workType">계약 타입</Label>
                  <Select
                    value={createFormData.workType}
                    onValueChange={(value) =>
                      setCreateFormData({ ...createFormData, workType: value })
                    }
                  >
                    <SelectTrigger id="workType">
                      <SelectValue placeholder="계약 타입 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">일대</SelectItem>
                      <SelectItem value="monthly">월대</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="dailyRate">일대 단가 (원)</Label>
                    <Input
                      id="dailyRate"
                      type="number"
                      placeholder="300000"
                      value={createFormData.dailyRate}
                      onChange={(e) =>
                        setCreateFormData({ ...createFormData, dailyRate: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="monthlyRate">월대 단가 (원)</Label>
                    <Input
                      id="monthlyRate"
                      type="number"
                      placeholder="6000000"
                      value={createFormData.monthlyRate}
                      onChange={(e) =>
                        setCreateFormData({ ...createFormData, monthlyRate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="otRate">OT 단가 (시간당)</Label>
                    <Input
                      id="otRate"
                      type="number"
                      placeholder="50000"
                      value={createFormData.otRate}
                      onChange={(e) =>
                        setCreateFormData({ ...createFormData, otRate: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="nightRate">철야 단가 (시간당)</Label>
                    <Input
                      id="nightRate"
                      type="number"
                      placeholder="60000"
                      value={createFormData.nightRate}
                      onChange={(e) =>
                        setCreateFormData({ ...createFormData, nightRate: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                !createFormData.entryRequestId ||
                !createFormData.equipmentId ||
                !createFormData.workerId ||
                !createFormData.bpCompanyId ||
                !createFormData.startDate ||
                !createFormData.plannedEndDate ||
                createMutation.isPending
              }
            >
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              투입 등록
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 기간 연장 다이얼로그 */}
      <Dialog open={isExtendOpen} onOpenChange={setIsExtendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>투입 기간 연장</DialogTitle>
            <DialogDescription>
              투입 종료 예정일을 연장합니다
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newEndDate">새 종료 예정일</Label>
              <Input
                id="newEndDate"
                type="date"
                value={extendFormData.newEndDate}
                onChange={(e) =>
                  setExtendFormData({ ...extendFormData, newEndDate: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="extendReason">연장 사유</Label>
              <Textarea
                id="extendReason"
                placeholder="연장 사유를 입력하세요"
                value={extendFormData.reason}
                onChange={(e) =>
                  setExtendFormData({ ...extendFormData, reason: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExtendOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleExtend}
              disabled={
                !extendFormData.newEndDate ||
                !extendFormData.reason ||
                extendMutation.isPending
              }
            >
              {extendMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              연장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 운전자 교체 다이얼로그 */}
      <Dialog open={isChangeWorkerOpen} onOpenChange={setIsChangeWorkerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>운전자 교체</DialogTitle>
            <DialogDescription>
              투입된 운전자를 교체합니다
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newWorkerId">새 운전자</Label>
              <Select
                value={changeWorkerFormData.newWorkerId}
                onValueChange={(value) =>
                  setChangeWorkerFormData({ ...changeWorkerFormData, newWorkerId: value })
                }
              >
                <SelectTrigger id="newWorkerId">
                  <SelectValue placeholder="운전자 선택" />
                </SelectTrigger>
                <SelectContent>
                  {workers?.map((worker) => (
                    <SelectItem key={worker.id} value={worker.id}>
                      {worker.name} - {worker.workerType?.typeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="changeReason">교체 사유</Label>
              <Textarea
                id="changeReason"
                placeholder="교체 사유를 입력하세요"
                value={changeWorkerFormData.reason}
                onChange={(e) =>
                  setChangeWorkerFormData({ ...changeWorkerFormData, reason: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangeWorkerOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleChangeWorker}
              disabled={
                !changeWorkerFormData.newWorkerId ||
                !changeWorkerFormData.reason ||
                changeWorkerMutation.isPending
              }
            >
              {changeWorkerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              교체
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 투입 상세보기 다이얼로그 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>투입 상세 정보</DialogTitle>
            <DialogDescription>
              투입된 장비와 운전자의 모든 정보를 확인하고 관리합니다
            </DialogDescription>
          </DialogHeader>

          {selectedDeployment && (
            <div className="grid gap-6">
              {/* 기본 정보 */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">기본 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">투입 ID</Label>
                    <p className="font-mono text-sm">{selectedDeployment.id}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">상태</Label>
                    <div className="mt-1">{getStatusBadge(selectedDeployment.status)}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">반입 요청 번호</Label>
                    <p>{selectedDeployment.entryRequestId}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">BP 현장</Label>
                    <p>{bpCompanies?.find((c) => c.id === selectedDeployment.bpCompanyId)?.name || "-"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label className="text-muted-foreground">장비</Label>
                    <p className="font-medium">
                      {equipment?.find((e) => e.id === selectedDeployment.equipmentId)?.regNum || "-"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {equipment?.find((e) => e.id === selectedDeployment.equipmentId)?.equipType?.typeName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">운전자</Label>
                    <p className="font-medium">
                      {workers?.find((w) => w.id === selectedDeployment.workerId)?.name || "-"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {workers?.find((w) => w.id === selectedDeployment.workerId)?.workerType?.typeName}
                    </p>
                  </div>
                </div>
              </div>

              {/* 계약 정보 */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">계약 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">공사명/현장명</Label>
                    <p>{selectedDeployment.siteName || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">계약 타입</Label>
                    <p>
                      {selectedDeployment.workType === "daily"
                        ? "일대"
                        : selectedDeployment.workType === "monthly"
                        ? "월대"
                        : "-"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label className="text-muted-foreground">일대 단가</Label>
                    <p className="text-lg font-semibold">
                      {selectedDeployment.dailyRate
                        ? `${Number(selectedDeployment.dailyRate).toLocaleString()}원`
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">월대 단가</Label>
                    <p className="text-lg font-semibold">
                      {selectedDeployment.monthlyRate
                        ? `${Number(selectedDeployment.monthlyRate).toLocaleString()}원`
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">OT 단가 (시간당)</Label>
                    <p className="font-semibold">
                      {selectedDeployment.otRate
                        ? `${Number(selectedDeployment.otRate).toLocaleString()}원`
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">철야 단가 (시간당)</Label>
                    <p className="font-semibold">
                      {selectedDeployment.nightRate
                        ? `${Number(selectedDeployment.nightRate).toLocaleString()}원`
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 기간 정보 */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">기간 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">투입 시작일</Label>
                    <p className="font-medium">
                      {format(new Date(selectedDeployment.startDate), "yyyy년 MM월 dd일", {
                        locale: ko,
                      })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">종료 예정일</Label>
                    <p className="font-medium">
                      {format(new Date(selectedDeployment.plannedEndDate), "yyyy년 MM월 dd일", {
                        locale: ko,
                      })}
                    </p>
                  </div>
                  {selectedDeployment.actualEndDate && (
                    <div>
                      <Label className="text-muted-foreground">실제 종료일</Label>
                      <p className="font-medium">
                        {format(new Date(selectedDeployment.actualEndDate), "yyyy년 MM월 dd일", {
                          locale: ko,
                        })}
                      </p>
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground">등록일시</Label>
                    <p className="text-sm">
                      {format(new Date(selectedDeployment.createdAt), "yyyy-MM-dd HH:mm", {
                        locale: ko,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* 빠른 액션 */}
              {(selectedDeployment.status === "active" ||
                selectedDeployment.status === "extended") && (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h3 className="font-semibold text-lg mb-3">빠른 액션</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setExtendFormData({
                          newEndDate: format(
                            new Date(selectedDeployment.plannedEndDate),
                            "yyyy-MM-dd"
                          ),
                          reason: "",
                        });
                        setIsDetailOpen(false);
                        setIsExtendOpen(true);
                      }}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      기간 연장
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setChangeWorkerFormData({
                          newWorkerId: "",
                          reason: "",
                        });
                        setIsDetailOpen(false);
                        setIsChangeWorkerOpen(true);
                      }}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      운전자 교체
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => {
                        setIsDetailOpen(false);
                        handleComplete(selectedDeployment);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      투입 종료
                    </Button>
                  </div>
                </div>
              )}

              {/* 추후 확장 영역 */}
              <div className="border rounded-lg p-4 border-dashed">
                <h3 className="font-semibold text-lg mb-2">추가 정보 (추후 개발)</h3>
                <p className="text-sm text-muted-foreground">
                  • 작업확인서 목록<br />
                  • 안전점검 기록<br />
                  • 기간 연장 이력<br />
                  • 운전자 교체 이력
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
