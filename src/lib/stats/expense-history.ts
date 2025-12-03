"use server";

import { db } from "@/db";
import { trip, tripItem } from "@/db/schema";
import { eq, and, sql, isNull, inArray, gte, lte } from "drizzle-orm";
import { getUserOrganizations } from "@/actions/organizations";
import { getActiveOrganizationId } from "@/lib/auth-server";
import { isNotNull } from "drizzle-orm";

/**
 * Obtiene el historial de gastos por mes para el dashboard
 */
export async function getMonthlyExpenseHistory(
  userId: string,
  months: number = 6
): Promise<Array<{
  month: string;
  total: number;
  tripCount: number;
}>> {
  try {
    const activeOrganizationId = await getActiveOrganizationId();
    let whereCondition;

    if (activeOrganizationId) {
      const userOrganizations = await getUserOrganizations(userId);
      const isMember = userOrganizations.some(
        (org) => org.id === activeOrganizationId
      );

      if (isMember) {
        whereCondition = eq(trip.organizationId, activeOrganizationId);
      } else {
        whereCondition = eq(trip.id, "never-match");
      }
    } else {
      whereCondition = and(
        eq(trip.userId, userId),
        isNull(trip.organizationId)
      );
    }

    // Obtener viajes accesibles
    const userTrips = await db
      .select({ id: trip.id })
      .from(trip)
      .where(whereCondition);

    const tripIds = userTrips.map((t) => t.id);

    if (tripIds.length === 0) {
      return [];
    }

    // Calcular fecha de inicio (hace N meses)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Obtener gastos agrupados por mes
    const expenses = await db
      .select({
        month: sql<string>`TO_CHAR(${tripItem.purchasedAt}, 'YYYY-MM')`,
        total: sql<number>`COALESCE(SUM(${tripItem.price} * ${tripItem.quantity}), 0)`,
        tripCount: sql<number>`COUNT(DISTINCT ${tripItem.tripId})::int`,
      })
      .from(tripItem)
      .where(
        and(
          inArray(tripItem.tripId, tripIds),
          eq(tripItem.purchased, true),
          isNotNull(tripItem.purchasedAt),
          gte(tripItem.purchasedAt, startDate),
          lte(tripItem.purchasedAt, endDate)
        )
      )
      .groupBy(sql`TO_CHAR(${tripItem.purchasedAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${tripItem.purchasedAt}, 'YYYY-MM')`);

    // Generar todos los meses del período
    const monthsList: Array<{ month: string; total: number; tripCount: number }> = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      
      const expense = expenses.find((e) => e.month === monthStr);
      monthsList.push({
        month: monthStr,
        total: expense ? Number(expense.total) : 0,
        tripCount: expense ? Number(expense.tripCount) : 0,
      });
    }

    return monthsList;
  } catch (error) {
    console.error("Error getting monthly expense history:", error);
    return [];
  }
}

/**
 * Obtiene estadísticas de gastos por viaje
 */
export async function getTripExpenseComparison(
  userId: string,
  limit: number = 10
): Promise<Array<{
  tripName: string;
  totalSpent: number;
  itemCount: number;
  purchasedCount: number;
}>> {
  try {
    const activeOrganizationId = await getActiveOrganizationId();
    let whereCondition;

    if (activeOrganizationId) {
      const userOrganizations = await getUserOrganizations(userId);
      const isMember = userOrganizations.some(
        (org) => org.id === activeOrganizationId
      );

      if (isMember) {
        whereCondition = eq(trip.organizationId, activeOrganizationId);
      } else {
        whereCondition = eq(trip.id, "never-match");
      }
    } else {
      whereCondition = and(
        eq(trip.userId, userId),
        isNull(trip.organizationId)
      );
    }

    // Obtener viajes con sus gastos
    const tripsWithExpenses = await db
      .select({
        tripId: trip.id,
        tripName: trip.name,
        totalSpent: sql<number>`COALESCE(SUM(${tripItem.price} * ${tripItem.quantity}) FILTER (WHERE ${tripItem.purchased} = true), 0)`,
        itemCount: sql<number>`COUNT(*)::int`,
        purchasedCount: sql<number>`COUNT(*) FILTER (WHERE ${tripItem.purchased} = true)::int`,
      })
      .from(trip)
      .leftJoin(tripItem, eq(tripItem.tripId, trip.id))
      .where(whereCondition)
      .groupBy(trip.id, trip.name)
      .orderBy(sql`COALESCE(SUM(${tripItem.price} * ${tripItem.quantity}) FILTER (WHERE ${tripItem.purchased} = true), 0) DESC`)
      .limit(limit);

    return tripsWithExpenses.map((t) => ({
      tripName: t.tripName,
      totalSpent: Number(t.totalSpent),
      itemCount: Number(t.itemCount),
      purchasedCount: Number(t.purchasedCount),
    }));
  } catch (error) {
    console.error("Error getting trip expense comparison:", error);
    return [];
  }
}

/**
 * Obtiene tendencias de gastos (últimos días)
 */
export async function getDailyExpenseTrend(
  userId: string,
  days: number = 30
): Promise<Array<{
  date: string;
  total: number;
  itemCount: number;
}>> {
  try {
    const activeOrganizationId = await getActiveOrganizationId();
    let whereCondition;

    if (activeOrganizationId) {
      const userOrganizations = await getUserOrganizations(userId);
      const isMember = userOrganizations.some(
        (org) => org.id === activeOrganizationId
      );

      if (isMember) {
        whereCondition = eq(trip.organizationId, activeOrganizationId);
      } else {
        whereCondition = eq(trip.id, "never-match");
      }
    } else {
      whereCondition = and(
        eq(trip.userId, userId),
        isNull(trip.organizationId)
      );
    }

    const userTrips = await db
      .select({ id: trip.id })
      .from(trip)
      .where(whereCondition);

    const tripIds = userTrips.map((t) => t.id);

    if (tripIds.length === 0) {
      return [];
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const expenses = await db
      .select({
        date: sql<string>`TO_CHAR(${tripItem.purchasedAt}, 'YYYY-MM-DD')`,
        total: sql<number>`COALESCE(SUM(${tripItem.price} * ${tripItem.quantity}), 0)`,
        itemCount: sql<number>`COUNT(*)::int`,
      })
      .from(tripItem)
      .where(
        and(
          inArray(tripItem.tripId, tripIds),
          eq(tripItem.purchased, true),
          isNotNull(tripItem.purchasedAt),
          gte(tripItem.purchasedAt, startDate),
          lte(tripItem.purchasedAt, endDate)
        )
      )
      .groupBy(sql`TO_CHAR(${tripItem.purchasedAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${tripItem.purchasedAt}, 'YYYY-MM-DD')`);

    // Generar todos los días del período
    const daysList: Array<{ date: string; total: number; itemCount: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      
      const expense = expenses.find((e) => e.date === dateStr);
      daysList.push({
        date: dateStr,
        total: expense ? Number(expense.total) : 0,
        itemCount: expense ? Number(expense.itemCount) : 0,
      });
    }

    return daysList;
  } catch (error) {
    console.error("Error getting daily expense trend:", error);
    return [];
  }
}

