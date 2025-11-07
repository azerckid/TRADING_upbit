import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { IntervalType } from "~/types/trading";

interface IntervalSelectorProps {
  intervalType: IntervalType;
  intervalValue: string;
  onIntervalTypeChange: (value: IntervalType) => void;
  onIntervalValueChange: (value: string) => void;
}

/**
 * 실행 간격 선택 컴포넌트
 * 시간/분 단위로 실행 간격을 선택할 수 있습니다
 */
export function IntervalSelector({
  intervalType,
  intervalValue,
  onIntervalTypeChange,
  onIntervalValueChange,
}: IntervalSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">실행 간격</label>
      <div className="flex items-center gap-2">
        <Select value={intervalType} onValueChange={onIntervalTypeChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="간격 단위" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hours">시간마다</SelectItem>
            <SelectItem value="minutes">분마다</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="number"
          min="1"
          placeholder="간격"
          value={intervalValue}
          onChange={(e) => onIntervalValueChange(e.target.value)}
          className="w-24"
        />
        <span className="text-sm text-muted-foreground">
          {intervalType === "hours" ? "시간" : "분"}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        {intervalType === "hours"
          ? "예: 3시간마다 실행"
          : "예: 30분마다 실행"}
      </p>
    </div>
  );
}

