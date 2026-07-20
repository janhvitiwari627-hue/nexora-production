import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
  DEFAULT_NOTIF_MATRIX,
  NOTIF_CHANNELS,
  NOTIF_TYPES,
  type NotifChannel,
  type NotifKey,
} from "./mockSettings";
import { PanelShell } from "./PersonalInfoPanel";

export function NotificationsPanel() {
  const [matrix, setMatrix] = useState(DEFAULT_NOTIF_MATRIX);

  function toggle(k: NotifKey, c: NotifChannel) {
    setMatrix((prev) => ({ ...prev, [k]: { ...prev[k], [c]: !prev[k][c] } }));
  }

  return (
    <PanelShell title="Notifications" subtitle="Pick where you want to be notified for each event.">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="text-muted-foreground border-border border-b text-xs uppercase tracking-wide">
              <th className="py-3 pr-3 text-left font-bold">Notification type</th>
              {NOTIF_CHANNELS.map((c) => (
                <th key={c} className="py-3 px-2 text-center font-bold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NOTIF_TYPES.map((t) => (
              <tr key={t.key} className="border-border border-b last:border-0">
                <td className="py-3 pr-3 font-semibold">{t.label}</td>
                {NOTIF_CHANNELS.map((c) => (
                  <td key={c} className="py-3 px-2 text-center">
                    <div className="flex justify-center">
                      <Switch checked={matrix[t.key][c]} onCheckedChange={() => toggle(t.key, c)} />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PanelShell>
  );
}
