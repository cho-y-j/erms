import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import * as db from "./db";

/**
 * 작업확인서 관리 API
 * Worker가 작성하고 BP가 승인하는 일일 작업 확인서
 */
export const workJournalRouter = router({
  /**
   * 작업확인서 생성 (Worker)
   */
  create: protectedProcedure
    .input(
      z.object({
        deploymentId: z.string(),
        workDate: z.string(), // ISO date string
        workLocation: z.string(),
        workContent: z.string(),
        startTime: z.string(), // HH:mm
        endTime: z.string(), // HH:mm
        regularHours: z.number(),
        otHours: z.number(),
        nightHours: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 1. Deployment 정보 조회 (자동 입력 데이터)
      const deployment = await db.getDeploymentById(input.deploymentId);
      if (!deployment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "투입 정보를 찾을 수 없습니다.",
        });
      }

      // 2. Equipment 정보 조회
      const equipment = await db.getEquipmentById(deployment.equipmentId);
      if (!equipment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "장비 정보를 찾을 수 없습니다.",
        });
      }

      // 3. 작업확인서 생성
      const id = nanoid();
      const totalHours = input.regularHours + input.otHours + input.nightHours;

      await db.createWorkJournal({
        id,
        deploymentId: input.deploymentId,
        equipmentId: deployment.equipmentId,
        workerId: deployment.workerId,
        bpCompanyId: deployment.bpCompanyId,

        // 현장 정보 (deployment에서 자동 복사)
        siteName: deployment.siteName || "",
        vehicleNumber: equipment.regNum,
        equipmentName: equipment.equipType?.name,
        specification: equipment.specification || equipment.equipType?.description,

        // 작업 정보 (Worker 입력)
        workDate: new Date(input.workDate),
        workLocation: input.workLocation,
        workContent: input.workContent,
        workDetails: input.workContent, // 호환성 유지

        // 시간 정보
        startTime: input.startTime,
        endTime: input.endTime,
        totalHours: Math.round(totalHours),
        regularHours: input.regularHours,
        otHours: input.otHours,
        nightHours: input.nightHours,

        // 제출 정보
        submittedBy: ctx.user.id,
        submittedAt: new Date(),
        status: "pending_bp", // 초기 상태: BP 승인 대기
      });

      return { id };
    }),

  /**
   * Worker 자신의 작업확인서 목록 조회
   */
  myList: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const journals = await db.getWorkJournals({
        workerId: ctx.user.id,
        status: input.status,
        startDate: input.startDate,
        endDate: input.endDate,
      });
      return journals;
    }),

  /**
   * BP 회사의 승인 대기 중인 작업확인서 목록
   */
  pendingForBp: protectedProcedure.query(async ({ ctx }) => {
    // BP 사용자의 회사 ID는 ctx.user.companyId에 있음
    if (!ctx.user.companyId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "소속 회사 정보를 찾을 수 없습니다.",
      });
    }

    console.log("[WorkJournal] BP pendingForBp query - User:", ctx.user.id, "Company:", ctx.user.companyId);

    const journals = await db.getWorkJournals({
      bpCompanyId: ctx.user.companyId,
      status: "pending_bp",
    });

    console.log("[WorkJournal] BP pendingForBp result - Count:", journals.length);
    return journals;
  }),

  /**
   * BP의 작업확인서 목록 (전체)
   */
  bpList: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        ownerId: z.string().optional(), // Owner 필터 추가
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user.companyId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "소속 회사 정보를 찾을 수 없습니다.",
        });
      }

      const journals = await db.getWorkJournals({
        bpCompanyId: ctx.user.companyId,
        status: input.status,
        startDate: input.startDate,
        endDate: input.endDate,
        ownerId: input.ownerId, // Owner 필터 전달
      });
      return journals;
    }),

  /**
   * 전체 작업확인서 목록 (관리자용 또는 대시보드용)
   */
  list: protectedProcedure.query(async () => {
    const journals = await db.getAllWorkJournals();
    return journals;
  }),

  /**
   * Owner의 작업확인서 목록 조회
   */
  ownerList: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      console.log("[WorkJournal] Owner list query - User:", ctx.user.id, "Filters:", input);

      const journals = await db.getWorkJournalsByOwnerId(ctx.user.id, {
        status: input.status,
        startDate: input.startDate,
        endDate: input.endDate,
      });

      console.log("[WorkJournal] Owner list result - Count:", journals.length);
      return journals;
    }),

  /**
   * 작업확인서 상세 조회
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const journal = await db.getWorkJournalById(input.id);
      if (!journal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "작업확인서를 찾을 수 없습니다.",
        });
      }
      return journal;
    }),

  /**
   * BP 승인 (전자 서명 포함)
   */
  approve: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        signatureData: z.string(), // Base64 이미지
        signerName: z.string(),
        comments: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const journal = await db.getWorkJournalById(input.id);
      if (!journal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "작업확인서를 찾을 수 없습니다.",
        });
      }

      if (journal.status !== "pending_bp") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "승인 대기 중인 작업확인서만 승인할 수 있습니다.",
        });
      }

      await db.updateWorkJournal(input.id, {
        status: "bp_approved",
        approvedByBp: ctx.user.id,
        approvedAtBp: new Date(),
        bpSignatureData: input.signatureData,
        bpSignerName: input.signerName,
        signedAt: new Date(),
        bpComments: input.comments,
      });

      return { success: true };
    }),

  /**
   * BP 반려
   */
  reject: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const journal = await db.getWorkJournalById(input.id);
      if (!journal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "작업확인서를 찾을 수 없습니다.",
        });
      }

      if (journal.status !== "pending_bp") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "승인 대기 중인 작업확인서만 반려할 수 있습니다.",
        });
      }

      await db.updateWorkJournal(input.id, {
        status: "rejected",
        approvedByBp: ctx.user.id,
        approvedAtBp: new Date(),
        bpComments: input.reason,
      });

      return { success: true };
    }),

  /**
   * EP의 작업확인서 목록 조회 (BP사별 선택 가능)
   */
  epList: protectedProcedure
    .input(
      z.object({
        bpCompanyId: z.string().optional(), // BP사 선택 (선택사항)
        status: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        ownerId: z.string().optional(), // Owner 필터 추가
      })
    )
    .query(async ({ input }) => {
      const journals = await db.getWorkJournals({
        bpCompanyId: input.bpCompanyId, // BP사 지정 또는 전체 조회
        status: input.status,
        startDate: input.startDate,
        endDate: input.endDate,
        ownerId: input.ownerId, // Owner 필터 전달
      });
      return journals;
    }),

  /**
   * 월별 작업 리포트 조회 (Owner용)
   */
  monthlyReportByOwner: protectedProcedure
    .input(
      z.object({
        yearMonth: z.string(), // 'YYYY-MM' format
        equipmentId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // TODO: 월별 리포트 집계 로직 구현
      // 현재는 해당 월의 모든 작업확인서를 조회하여 집계
      const startDate = `${input.yearMonth}-01`;
      const endDate = `${input.yearMonth}-31`;

      const journals = await db.getWorkJournalsByOwnerId(ctx.user.id, {
        status: "bp_approved", // 승인된 것만
        startDate,
        endDate,
      });

      // 집계 계산
      const totalDays = journals.length;
      const totalRegular = journals.reduce((sum, j) => sum + (Number(j.regularHours) || 0), 0);
      const totalOt = journals.reduce((sum, j) => sum + (Number(j.otHours) || 0), 0);
      const totalNight = journals.reduce((sum, j) => sum + (Number(j.nightHours) || 0), 0);

      return {
        yearMonth: input.yearMonth,
        totalDays,
        totalRegularHours: totalRegular,
        totalOtHours: totalOt,
        totalNightHours: totalNight,
        journals, // 상세 내역
      };
    }),

  /**
   * 월별 작업 리포트 조회 (EP용, BP사별)
   */
  monthlyReportByEp: protectedProcedure
    .input(
      z.object({
        yearMonth: z.string(), // 'YYYY-MM' format
        bpCompanyId: z.string().optional(), // BP사 선택 (선택사항)
      })
    )
    .query(async ({ input }) => {
      const startDate = `${input.yearMonth}-01`;
      const endDate = `${input.yearMonth}-31`;

      const journals = await db.getWorkJournals({
        bpCompanyId: input.bpCompanyId,
        status: "bp_approved",
        startDate,
        endDate,
      });

      // 집계 계산
      const totalDays = journals.length;
      const totalRegular = journals.reduce((sum, j) => sum + (Number(j.regularHours) || 0), 0);
      const totalOt = journals.reduce((sum, j) => sum + (Number(j.otHours) || 0), 0);
      const totalNight = journals.reduce((sum, j) => sum + (Number(j.nightHours) || 0), 0);

      // BP사별로 그룹화
      const byBpCompany = journals.reduce((acc: any, j) => {
        const bpId = j.bpCompanyId || 'unknown';
        if (!acc[bpId]) {
          acc[bpId] = {
            bpCompanyId: bpId,
            bpCompanyName: j.bpCompany?.name || '알 수 없음',
            count: 0,
            totalRegular: 0,
            totalOt: 0,
            totalNight: 0,
          };
        }
        acc[bpId].count++;
        acc[bpId].totalRegular += Number(j.regularHours) || 0;
        acc[bpId].totalOt += Number(j.otHours) || 0;
        acc[bpId].totalNight += Number(j.nightHours) || 0;
        return acc;
      }, {});

      return {
        yearMonth: input.yearMonth,
        totalDays,
        totalRegularHours: totalRegular,
        totalOtHours: totalOt,
        totalNightHours: totalNight,
        byBpCompany: Object.values(byBpCompany),
        journals,
      };
    }),
});
