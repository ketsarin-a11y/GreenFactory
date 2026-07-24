import type {
  ChangeEventHandler,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";

type BaseProps = {
  label: string;
  hint?: string;
  icon?: ReactNode;
};

type InputProps = BaseProps & {
  kind?: "input";
  inputProps: InputHTMLAttributes<HTMLInputElement>;
};

type SelectProps = BaseProps & {
  kind: "select";
  selectProps: SelectHTMLAttributes<HTMLSelectElement>;
  options: Array<{ label: string; value: string }>;
};

type TextareaProps = BaseProps & {
  kind: "textarea";
  textareaProps: TextareaHTMLAttributes<HTMLTextAreaElement>;
};

type Props = InputProps | SelectProps | TextareaProps;

export default function FormField(props: Props) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-bold text-[#425249]">
        {props.label}
      </span>

      {props.kind === "select" ? (
        <div className="relative">
          <select
            {...props.selectProps}
            className={`h-11 w-full appearance-none rounded-[14px] border border-[#dce6df] bg-[#f9fbfa] px-3.5 pr-10 text-[13px] font-semibold text-[#33453a] outline-none transition focus:border-[#8fc9a8] focus:ring-4 focus:ring-[#dff4e7] ${props.selectProps.className ?? ""}`}
          >
            {props.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89968e]" />
        </div>
      ) : props.kind === "textarea" ? (
        <textarea
          {...props.textareaProps}
          className={`min-h-[100px] w-full resize-y rounded-[14px] border border-[#dce6df] bg-[#f9fbfa] px-3.5 py-3 text-[13px] font-medium text-[#33453a] outline-none transition placeholder:text-[#a0aba4] focus:border-[#8fc9a8] focus:ring-4 focus:ring-[#dff4e7] ${props.textareaProps.className ?? ""}`}
        />
      ) : (
        <div className="relative">
          {props.icon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8d9a92]">
              {props.icon}
            </span>
          )}
          <input
            {...props.inputProps}
            className={`h-11 w-full rounded-[14px] border border-[#dce6df] bg-[#f9fbfa] px-3.5 text-[13px] font-semibold text-[#33453a] outline-none transition placeholder:text-[#a0aba4] focus:border-[#8fc9a8] focus:ring-4 focus:ring-[#dff4e7] ${
              props.icon ? "pl-10" : ""
            } ${props.inputProps.className ?? ""}`}
          />
        </div>
      )}

      {props.hint && (
        <span className="mt-1.5 block text-[10px] text-[#8a9790]">
          {props.hint}
        </span>
      )}
    </label>
  );
}
