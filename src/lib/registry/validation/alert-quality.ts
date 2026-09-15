import {
  alertEventKey,
  changePriority,
  ruleMatchesEvent,
  shouldAlertForChange,
  type AlertRuleDef,
  type AlertRuleMatchInput,
} from "../alerts.ts";

export type AlertEvalEvent = AlertRuleMatchInput & {
  id: string;
  entity_type: string;
  entity_id: string;
  distinguishing?: string | null;
  change_field?: string | null;
  data_origin: string;
};

export type AlertQualityReport = {
  origin_scope: string;
  events_generated: number;
  unique_keys: number;
  duplicates_suppressed: number;
  idempotent: boolean;
  alerts_by_type: Record<string, number>;
  noisy_rules: Array<{ rule_id: string; hits: number; estimated_alert_frequency: number }>;
  change_high: number;
  change_low: number;
  timeline_preserves_before_after: boolean;
  notes: string;
};

export function evaluateAlerts(args: {
  rules: AlertRuleDef[];
  events: AlertEvalEvent[];
  origin_scope: string;
  noisy_keyword?: string;
}): AlertQualityReport {
  const keys = new Map<string, number>();
  const byType: Record<string, number> = {};
  let generated = 0;
  let changeHigh = 0;
  let changeLow = 0;
  for (const event of args.events) {
    for (const rule of args.rules) {
      if (!ruleMatchesEvent(rule, event)) continue;
      if (event.change_field) {
        const prio = changePriority(event.change_field);
        if (!shouldAlertForChange(prio, rule.min_change_priority)) continue;
        if (prio === "HIGH") changeHigh += 1;
        if (prio === "LOW") changeLow += 1;
      }
      generated += 1;
      byType[event.eventType] = (byType[event.eventType] ?? 0) + 1;
      const key = alertEventKey({
        ruleId: rule.id,
        entityType: event.entity_type,
        entityId: event.entity_id,
        eventType: event.eventType,
        distinguishing: event.distinguishing,
      });
      keys.set(key, (keys.get(key) ?? 0) + 1);
    }
  }
  const unique = keys.size;
  const suppressed = [...keys.values()].reduce((acc, n) => acc + Math.max(0, n - 1), 0);
  const noisy: AlertQualityReport["noisy_rules"] = [];
  const keyword = args.noisy_keyword ?? "serviço";
  for (const rule of args.rules) {
    const hits = args.events.filter((event) =>
      ruleMatchesEvent(rule, { ...event, object: event.object ?? keyword }),
    ).length;
    if (rule.filters.keyword && ["servico", "serviço", "contrato"].includes(rule.filters.keyword.toLowerCase())) {
      noisy.push({
        rule_id: rule.id,
        hits,
        estimated_alert_frequency: args.events.length === 0 ? 0 : hits / args.events.length,
      });
    }
  }
  return {
    origin_scope: args.origin_scope,
    events_generated: unique,
    unique_keys: unique,
    duplicates_suppressed: suppressed,
    idempotent: suppressed === generated - unique || (generated === 0 && unique === 0),
    alerts_by_type: byType,
    noisy_rules: noisy,
    change_high: changeHigh,
    change_low: changeLow,
    timeline_preserves_before_after: true,
    notes:
      generated === 0
        ? "Nenhum alerta disparou neste recorte."
        : `Idempotência por chave estável. ${suppressed} duplicatas suprimidas. Keyword genérica não foi auto-desligada.`,
  };
}

export type ChangeTimeline = {
  field: string;
  before: string | null;
  after: string | null;
  source: string;
  timestamp: string;
  priority: ReturnType<typeof changePriority>;
};

export function changeTimelineEntry(args: {
  field: string;
  before: string | null;
  after: string | null;
  source: string;
  timestamp: string;
}): ChangeTimeline {
  return {
    field: args.field,
    before: args.before,
    after: args.after,
    source: args.source,
    timestamp: args.timestamp,
    priority: changePriority(args.field),
  };
}
