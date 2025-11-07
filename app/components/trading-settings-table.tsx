import { Button } from "~/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import type React from "react";

interface TradingSetting {
  id: string;
  intervalType: "hours" | "minutes";
  intervalValue: string;
  // 판매/구매 설정에 따라 다른 필드가 올 수 있음
  percentBelow?: string; // 구매 설정용 (하위 호환성)
  percentValue?: string; // 판매 설정용 (+5 또는 -5 형식)
}

interface TradingSettingsTableProps<T extends TradingSetting> {
  settings: T[];
  settingName: string; // "판매설정" 또는 "구매설정"
  onRemove: (id: string) => void;
  renderThirdColumn: (setting: T) => React.ReactNode; // 코인 갯수 또는 금액
}

/**
 * 거래 설정 테이블 컴포넌트
 * 판매/구매 설정을 한눈에 볼 수 있는 테이블을 제공합니다
 */
export function TradingSettingsTable<T extends TradingSetting>({
  settings,
  settingName,
  onRemove,
  renderThirdColumn,
}: TradingSettingsTableProps<T>) {
  if (settings.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-gray-100">이름</TableHead>
            <TableHead className="bg-gray-100">시간</TableHead>
            <TableHead className="bg-gray-100">
              {settingName === "판매설정" ? "코인 갯수" : "금액"}
            </TableHead>
            <TableHead className="bg-gray-100">매수평균가 대비 %</TableHead>
            <TableHead className="bg-gray-100">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {settings.map((setting, index) => (
            <TableRow key={setting.id}>
              <TableCell className="font-medium">
                {settingName} {index + 1}
              </TableCell>
              <TableCell>
                {setting.intervalValue
                  ? setting.intervalType === "hours"
                    ? `매 ${setting.intervalValue}시간마다`
                    : `매 ${setting.intervalValue}분마다`
                  : "-"}
              </TableCell>
              <TableCell>{renderThirdColumn(setting)}</TableCell>
              <TableCell>
                {setting.percentValue
                  ? `${setting.percentValue}%`
                  : setting.percentBelow
                    ? `${setting.percentBelow}%`
                    : "-"}
              </TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(setting.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

