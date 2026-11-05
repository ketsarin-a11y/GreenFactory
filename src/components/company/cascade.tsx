"use client";

import { useState } from "react";
import { Field } from "@/components/account/field";
import { SelectField } from "./select-field";

/** One level of a hierarchy picker. `value` is unique within its siblings. */
export type HNode = { value: string; label: string; inactive?: boolean; children?: HNode[] };
export type Level = { name: string; label: string; required?: boolean; optional?: string };

const NONE = "__none";

/**
 * Factory → building → … cascading selects. Each level submits under its `name`;
 * changing a level clears the levels below it. Inactive nodes are hidden unless already chosen.
 */
export function Cascade({ tree, levels, defaultPath = [], errors = {}, onChange, idPrefix = "c" }: {
  tree: HNode[];
  levels: Level[];
  defaultPath?: string[];
  errors?: Record<string, string>;
  onChange?: (path: string[]) => void;
  idPrefix?: string;
}) {
  const [path, setPath] = useState<string[]>(defaultPath);
  // Options per level: children of the node chosen one level up.
  const lists: HNode[][] = [];
  let options: HNode[] | undefined = tree;
  for (let i = 0; i < levels.length; i++) {
    const list: HNode[] = (options ?? []).filter((o) => !o.inactive || o.value === defaultPath[i]);
    lists.push(list);
    options = list.find((o) => o.value === path[i])?.children;
  }
  return (
    <>
      {levels.map((lvl, i) => {
        const current = path[i];
        const list = lists[i];
        const chosen = list.find((o) => o.value === current);
        const opts = list.map((o) => ({ value: o.value, label: o.inactive ? `${o.label} (ปิดใช้งาน)` : o.label }));
        if (lvl.optional) opts.unshift({ value: NONE, label: lvl.optional });
        const disabled = i > 0 && !path[i - 1];
        const value = chosen ? current : lvl.optional && !disabled ? NONE : "";
        const id = `${idPrefix}-${lvl.name}`;
        return (
          <Field key={lvl.name} id={id} label={lvl.label} error={errors[lvl.name]} required={lvl.required}>
            <SelectField
              id={id}
              name={chosen ? lvl.name : `${lvl.name}__unused`}
              value={value}
              disabled={disabled}
              invalid={!!errors[lvl.name]}
              placeholder={disabled ? `เลือก${levels[i - 1].label}ก่อน` : list.length === 0 ? "ไม่มีรายการที่เปิดใช้งาน" : `เลือก${lvl.label}`}
              options={opts}
              onChange={(v) => {
                const next = [...path.slice(0, i), v === NONE ? "" : v];
                setPath(next);
                onChange?.(next);
              }}
            />
          </Field>
        );
      })}
    </>
  );
}
